// backend/src/controllers/diagnosisController.js

const sajuService = require('../services/sajuService');
const { generateFreePrompt, generatePremiumPrompt } = require('../services/promptService');
const { callClaudeAPIFree, callClaudeAPIPremium } = require('../services/claudeService');
const { generateCharacterImage } = require('../services/imageService');
const { User, Order, DiagnosisResult } = require('../../models');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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
 * 프리미엄 진단 생성
 * POST /api/diagnosis/premium
 * 인증 필수
 */
const generatePremiumDiagnosis = async (req, res) => {
    try {
        const userId = req.user.id;
        const userUuid = req.user.uuid;
        const { orderId, sajuData, sessionData } = req.body;

        console.log('\n' + '='.repeat(80));
        console.log('💎 프리미엄 진단 생성');
        console.log('='.repeat(80));
        console.log('👤 사용자:', req.user.name, `(UUID: ${userUuid})`);
        console.log('📦 주문 ID:', orderId);
        console.log('\n');

        // 1️⃣ 결제 검증
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
            return res.status(403).json({
                success: false,
                message: '유효하지 않은 결제입니다.'
            });
        }
        console.log('✅ 결제 검증 완료\n');

        // 2️⃣ 사주 계산
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
        console.log('✅ 사주 계산 완료\n');

        // 3️⃣ 프리미엄 프롬프트 생성
        console.log('📝 프리미엄 프롬프트 생성 중...');
        const promptData = {
            user: {
                ...sajuResult.user,
                gender: sajuData.gender
            },
            saju: sajuResult.saju,
            elements: sajuResult.elements,
            dayMaster: sajuResult.dayMaster,
            fields: sajuResult.fields,
            mbti: sajuData.mbti
        };

        const prompt = await generatePremiumPrompt(promptData);
        console.log('✅ 프롬프트 생성 완료\n');

        // 4️⃣ Claude API 호출 (Sonnet 4)
        console.log('🤖 Claude Sonnet 4 API 호출 중...');
        const diagnosis = await callClaudeAPIPremium(
            prompt.systemPrompt,
            prompt.userPrompt,
            userId
        );
        console.log('✅ AI 진단 완료\n');

        // 5️⃣ input_hash 생성
        const inputHash = generateInputHash(sajuResult, sajuData.mbti);

        // 6️⃣ DB 저장
        console.log('💾 DB 저장 중...');
        const diagnosisResult = await DiagnosisResult.create({
            user_id: userId,
            order_id: order.id,
            input_hash: inputHash,
            name: sajuData.name,
            birth_date: `${sajuData.year}-${sajuData.month}-${sajuData.day}`,
            birth_time: `${sajuData.hour || 0}:${sajuData.minute || 0}`,
            gender: sajuData.gender,
            mbti: sajuData.mbti,
            saju_data: sajuResult,
            premium_diagnosis: diagnosis.text,
            diagnosis_type: 'premium'
        });

        console.log(`✅ DB 저장 완료 (ID: ${diagnosisResult.id})\n`);
        console.log('='.repeat(80));
        console.log('🎉 프리미엄 진단 생성 완료!');
        console.log('='.repeat(80) + '\n');

        // 7️⃣ 응답
        res.json({
            success: true,
            message: '프리미엄 진단이 완료되었습니다.',
            diagnosisId: diagnosisResult.id,
            usage: diagnosis.usage
        });

    } catch (error) {
        console.error('❌ 프리미엄 진단 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '프리미엄 진단 생성 중 오류가 발생했습니다.'
        });
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

        // 소유자 검증
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
            attributes: ['id', 'name', 'created_at', 'birth_date', 'mbti']
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

/**
 * input_hash 생성 함수
 */
function generateInputHash(sajuData, mbti) {
    const { user } = sajuData;
    const hashString = `${user.birthDate}-${user.birthTime}-${user.gender}-${user.name}-${mbti}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
}

module.exports = {
    generateFreeDiagnosis,
    generatePremiumDiagnosis,
    getPremiumResult,
    getMyResults
};