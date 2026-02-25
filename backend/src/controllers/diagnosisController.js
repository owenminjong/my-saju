// backend/src/controllers/diagnosisController.js

const sajuService = require('../services/sajuService');
const { generateFreePrompt } = require('../services/promptService');
const { callClaudeAPIFree, callClaudeAPIPremium } = require('../services/claudeService');
const { generateCharacterImage } = require('../services/imageService');
const { User, Order, DiagnosisResult } = require('../../models');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const {
    getAllPremiumPrompts,
    generateStep1Prompt,
    generateStep2Prompt,
    generateStep3Prompt
} = require('../services/premiumPromptService');

/**
 * input_hash 생성 함수
 * ✅ 이름 제외 - 같은 사주면 이름 달라도 캐시 히트
 */
function generateInputHash(sajuData) {
    const hashString = `${sajuData.year}-${sajuData.month}-${sajuData.day}-${sajuData.hour || 0}-${sajuData.minute || 0}-${sajuData.gender}-${sajuData.mbti}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
}

/**
 * 무료 베이직 진단 생성
 * POST /api/diagnosis/free
 */
const generateFreeDiagnosis = async (req, res) => {
    try {
        const { name, year, month, day, hour, minute, isLunar, gender, mbti } = req.body;

        if (!name || !year || !month || !day || !mbti) {
            return res.status(400).json({
                success: false,
                message: '이름, 생년월일, MBTI는 필수입니다.'
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('📋 무료 베이직 진단');
        console.log('='.repeat(80) + '\n');

        // 1️⃣ 사주 계산
        console.log('🔮 사주 계산 중...');
        const sajuResult = await sajuService.analyzeBasicSaju({
            name,
            year,
            month,
            day,
            hour: hour || 0,
            minute: minute || 0,
            isLunar: isLunar || false
        });
        console.log('✅ 사주 계산 완료\n');

        // 2️⃣ 캐릭터 이미지 생성
        console.log('🎨 캐릭터 이미지 생성 중...');
        const imageResult = await generateCharacterImage({
            user: {
                ...sajuResult.user,
                gender: gender || 'M'
            },
            year: year,
            month: month,
            hour: hour || 0,
            saju: sajuResult.saju
        });
        console.log('✅ 이미지 생성 완료\n');

        // 3️⃣ 프롬프트 생성
        const promptData = {
            user: {
                ...sajuResult.user,
                gender: gender || 'M'
            },
            saju: sajuResult.saju,
            elements: sajuResult.elements,
            dayMaster: sajuResult.dayMaster,
            fields: sajuResult.fields,
            mbti
        };

        const prompt = await generateFreePrompt(promptData);

        console.log('🤖 Claude API 호출 중...');
        const diagnosis = await callClaudeAPIFree(
            prompt.systemPrompt,
            prompt.userPrompt,
            null
        );
        console.log('✅ 무료 진단 완료!\n');

        // 4️⃣ 세션에 저장
        const uniqueId = uuidv4();
        console.log('🔑 고유 ID 생성:', uniqueId);

        const resultData = {
            uniqueId,
            name,
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata,
            characterImage: imageResult.success ? imageResult.imagePath : null,
            imageMetadata: imageResult.metadata,
            createdAt: new Date(),
            isPaid: false,
            mbti,
            gender,
            birthInfo: { year, month, day, hour, minute }
        };

        req.session.freeResult = resultData;

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 5️⃣ 응답
        res.json({
            success: true,
            message: '무료 베이직 진단이 완료되었습니다.',
            uniqueId,
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata,
            characterImage: imageResult.success ? imageResult.imagePath : null,
            imageMetadata: imageResult.metadata
        });

    } catch (error) {
        console.error('무료 진단 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '진단 생성 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 프리미엄 진단 생성 (3단계) - SSE + 캐시
 * POST /api/diagnosis/premium
 * 인증 필수
 */
const generatePremiumDiagnosis = async (req, res) => {
    try {
        const userId = req.user.id;
        const userUuid = req.user.uuid;
        const { orderId, sajuData } = req.body;

        console.log('\n' + '='.repeat(80));
        console.log('💎 프리미엄 진단 생성');
        console.log('='.repeat(80));
        console.log('👤 사용자:', req.user.name, `(UUID: ${userUuid})`);
        console.log('📦 주문 ID:', orderId);
        console.log('\n');

        // ✅ SSE 헤더 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        const sendProgress = (progress, message, data = {}) => {
            res.write(`data: ${JSON.stringify({ progress, message, ...data })}\n\n`);
        };

        // 1️⃣ 결제 검증
        sendProgress(3, '결제 검증 중...');
        console.log('💳 결제 검증 중...');
        const order = await Order.findOne({
            where: {
                order_id: orderId,
                user_id: userId,
                status: 'completed'
            }
        });

        if (!order) {
            console.log('❌ 유효하지 않은 결제');
            res.write(`data: ${JSON.stringify({ error: '유효하지 않은 결제입니다.' })}\n\n`);
            return res.end();
        }
        console.log('✅ 결제 검증 완료\n');

        // 2️⃣ 캐시 확인
        sendProgress(5, '기존 데이터 확인 중...');
        const inputHash = generateInputHash(sajuData);
        console.log('🔍 캐시 확인 중... hash:', inputHash);

        const existing = await DiagnosisResult.findOne({
            where: {
                input_hash: inputHash,
                diagnosis_type: 'premium',
                is_cached: false
            }
        });

        if (existing) {
            console.log(`✅ 캐시 히트! 기존 결과 재사용 (기존 ID: ${existing.id})`);

            sendProgress(10, '기존 데이터를 확인하고 있습니다...');

            const copied = await DiagnosisResult.create({
                user_id: userId,
                order_id: order.id,
                input_hash: `${inputHash}_${order.id}`,
                is_cached: true,
                name: sajuData.name,
                birth_date: existing.birth_date,
                birth_time: existing.birth_time,
                gender: existing.gender,
                mbti: existing.mbti,
                saju_data: {
                    ...existing.saju_data,
                    user: {
                        ...existing.saju_data.user,
                        name: sajuData.name
                    }
                },
                premium_diagnosis: existing.premium_diagnosis,
                character_image: existing.character_image,
                image_metadata: existing.image_metadata,
                diagnosis_type: 'premium'
            });

            console.log(`✅ 복사 완료 (새 ID: ${copied.id})`);
            sendProgress(100, '완료되었습니다!', {
                diagnosisId: copied.id,
                isCached: true
            });
            return res.end();
        }

        console.log('💡 캐시 없음 - 새로 생성합니다\n');

        // 3️⃣ 사주 계산
        sendProgress(6, '사주 계산 중...');
        console.log('🔮 사주 계산 중...');
        const sajuResult = await sajuService.analyzeBasicSaju({
            name: sajuData.name,
            year: sajuData.year,
            month: sajuData.month,
            day: sajuData.day,
            hour: sajuData.hour || 0,
            minute: sajuData.minute || 0,
            isLunar: sajuData.isLunar || false
        });
        sajuResult.mbti = sajuData.mbti;
        sajuResult.user.gender = sajuData.gender;
        console.log('✅ 사주 계산 완료\n');

        // 4️⃣ 캐릭터 이미지 생성
        sendProgress(7, '캐릭터 이미지 생성 중...');
        console.log('🎨 캐릭터 이미지 생성 중...');
        let characterImage = null;
        let imageMetadata = null;

        try {
            const imageResult = await generateCharacterImage({
                user: {
                    ...sajuResult.user,
                    gender: sajuData.gender || 'M'
                },
                year: sajuData.year,
                month: sajuData.month,
                hour: sajuData.hour || 0,
                saju: sajuResult.saju
            });

            if (imageResult.success) {
                characterImage = imageResult.imagePath;
                imageMetadata = imageResult.metadata;
                console.log('✅ 이미지 생성 완료:', characterImage);
            }
        } catch (imageError) {
            console.error('⚠️ 이미지 생성 실패:', imageError.message);
        }

        // 5️⃣ 프롬프트 로딩
        sendProgress(9, '프롬프트 로딩 중...');
        console.log('📥 프리미엄 프롬프트 로딩 중...');
        const prompts = await getAllPremiumPrompts();
        console.log('✅ 프롬프트 로딩 완료');

        // 6️⃣ Step 1: 인생 로드맵
        sendProgress(10, '인생 로드맵을 생성 중입니다...');
        console.log('📝 Step 1: 인생 로드맵 생성 중...');
        const step1Prompt = generateStep1Prompt(sajuResult, prompts.step1);
        const step1Result = await callClaudeAPIPremium(
            step1Prompt.systemPrompt,
            step1Prompt.userPrompt,
            userId,
            order.id,
            step1Prompt.maxTokens
        );
        console.log('✅ Step 1 완료\n');
        sendProgress(33, '인생 로드맵 완료!');

        // 7️⃣ Step 2: 3대 핵심 분야
        sendProgress(35, '3대 핵심 분야를 분석 중입니다...');
        console.log('📝 Step 2: 3대 핵심 분야 분석 중...');
        const step2Prompt = generateStep2Prompt(sajuResult, prompts.step2, step1Result.text);
        const step2Result = await callClaudeAPIPremium(
            step2Prompt.systemPrompt,
            step2Prompt.userPrompt,
            userId,
            order.id,
            step2Prompt.maxTokens
        );
        console.log('✅ Step 2 완료\n');
        sendProgress(75, '3대 핵심 분야 완료!');

        // 8️⃣ Step 3: 월간 캘린더
        sendProgress(80, '월간 캘린더를 생성 중입니다...');
        console.log('📝 Step 3: 월간 캘린더 생성 중...');
        const step3Prompt = generateStep3Prompt(sajuResult, prompts.step3, step1Result.text, step2Result.text);
        const step3Result = await callClaudeAPIPremium(
            step3Prompt.systemPrompt,
            step3Prompt.userPrompt,
            userId,
            order.id,
            step3Prompt.maxTokens
        );
        console.log('✅ Step 3 완료\n');
        sendProgress(94, '월간 캘린더 완료!');

        // 9️⃣ 합치기
        const fullDiagnosis = `# Step 1: 인생 로드맵

${step1Result.text}

---

# Step 2: 3대 핵심 분야

${step2Result.text}

---

# Step 3: 월간 캘린더

${step3Result.text}`;

        // 🔟 DB 저장
        sendProgress(95, 'DB 저장 중...');
        console.log('💾 DB 저장 중...');
        const diagnosisResult = await DiagnosisResult.create({
            user_id: userId,
            order_id: order.id,
            input_hash: inputHash,
            is_cached: false,
            name: sajuData.name,
            birth_date: `${sajuData.year}-${sajuData.month}-${sajuData.day}`,
            birth_time: `${sajuData.hour || 0}:${sajuData.minute || 0}`,
            gender: sajuData.gender,
            mbti: sajuData.mbti,
            saju_data: {
                user: sajuResult.user,
                saju: sajuResult.saju,
                elements: sajuResult.elements,
                dayMaster: sajuResult.dayMaster,
                fields: sajuResult.fields,
                recommendation: sajuResult.recommendation,
                summary: sajuResult.summary,
                mbti: sajuData.mbti
            },
            premium_diagnosis: fullDiagnosis,
            character_image: characterImage,
            image_metadata: imageMetadata,
            diagnosis_type: 'premium'
        });

        console.log(`✅ DB 저장 완료 (ID: ${diagnosisResult.id})\n`);
        console.log('='.repeat(80));
        console.log('🎉 프리미엄 진단 생성 완료!');
        console.log('='.repeat(80) + '\n');

        sendProgress(100, '완료되었습니다!', { diagnosisId: diagnosisResult.id });
        res.end();

    } catch (error) {
        console.error('❌ 프리미엄 진단 생성 오류:', error);
        res.write(`data: ${JSON.stringify({ error: error.message || '진단 생성 중 오류가 발생했습니다.' })}\n\n`);
        res.end();
    }
};

/**
 * 프리미엄 진단 결과 조회
 * GET /api/diagnosis/premium/:diagnosisId
 * 인증 필수 + 소유자 검증
 */
const getPremiumResult = async (req, res) => {
    try {
        const userId = req.user.id;
        const { diagnosisId } = req.params;

        console.log(`🔍 프리미엄 결과 조회 (사용자: ${userId}, 진단: ${diagnosisId})`);

        const result = await DiagnosisResult.findOne({
            where: {
                id: diagnosisId,
                user_id: userId,
                diagnosis_type: 'premium'
            },
            include: [{
                model: Order,
                as: 'order',
                attributes: ['order_id', 'amount', 'created_at']
            }]
        });

        if (!result) {
            console.log('❌ 접근 권한 없음 또는 결과 없음');
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없거나 결과를 찾을 수 없습니다.'
            });
        }

        console.log('✅ 결과 조회 성공');

        res.json({
            success: true,
            result: {
                id: result.id,
                name: result.name,
                birthDate: result.birth_date,
                birthTime: result.birth_time,
                gender: result.gender,
                mbti: result.mbti,
                sajuData: result.saju_data,
                diagnosis: result.premium_diagnosis,
                characterImage: result.character_image,
                imageMetadata: result.image_metadata,
                order: result.order,
                createdAt: result.created_at
            }
        });

    } catch (error) {
        console.error('❌ 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '결과를 불러올 수 없습니다.'
        });
    }
};

/**
 * 나의 프리미엄 진단 목록 조회
 * GET /api/diagnosis/my-results
 * 인증 필수
 */
const getMyResults = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log(`📋 나의 진단 목록 조회 (사용자: ${userId})`);

        const results = await DiagnosisResult.findAll({
            where: {
                user_id: userId,
                diagnosis_type: 'premium'
            },
            include: [{
                model: Order,
                as: 'order',
                attributes: ['order_id', 'amount', 'created_at']
            }],
            order: [['created_at', 'DESC']],
            attributes: ['id', 'name', 'created_at', 'birth_date', 'mbti', 'character_image']
        });

        console.log(`✅ ${results.length}건 조회 완료`);

        res.json({
            success: true,
            count: results.length,
            results: results.map(r => ({
                id: r.id,
                name: r.name,
                birthDate: r.birth_date,
                mbti: r.mbti,
                characterImage: r.character_image,
                createdAt: r.created_at,
                amount: r.order?.amount || 0,
                orderDate: r.order?.created_at
            }))
        });

    } catch (error) {
        console.error('❌ 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '목록을 불러올 수 없습니다.'
        });
    }
};

module.exports = {
    generateFreeDiagnosis,
    generatePremiumDiagnosis,
    getPremiumResult,
    getMyResults
};