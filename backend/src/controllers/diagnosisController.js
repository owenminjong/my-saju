const sajuService = require('../services/sajuService');
const { generateFreePrompt } = require('../services/promptService');
const { callClaudeAPIFree, callClaudeAPIPremium } = require('../services/claudeService');
const { User, Order } = require('../../models');
const crypto = require('crypto');

/**
 * POST /api/diagnosis/free
 * 무료 베이직 진단
 */
const generateFreeDiagnosis = async (req, res) => {
    try {
        const { name, year, month, day, hour, minute, isLunar, gender, mbti } = req.body;

        // 필수 입력값 검증
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

        // 2️⃣ 프롬프트 생성
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

        const diagnosis = await callClaudeAPIFree(
            prompt.systemPrompt,
            prompt.userPrompt,
            null  // 비회원
        );

        console.log('✅ 무료 진단 완료!\n');

        // 🆕 unique_id 생성
        const { v4: uuidv4 } = require('uuid');
        console.log('🔑 생성된 UUID:', uuidv4());
        const uniqueId = uuidv4();
        console.log('🔑 고유 ID 생성:', uniqueId);

        // 🆕 세션에 결과 저장
        const resultData = {
            uniqueId,
            name,           // 실명 그대로 저장
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata,
            createdAt: new Date(),
            isPaid: false,
            mbti
        };

        // 세션에 저장 (81번째 줄 앞에 추가)
        console.log('🔍 세션 확인:', req.session);
        console.log('🔍 세션 ID:', req.sessionID);

        // 세션에 저장
        req.session.freeResult = resultData;

        // 세션 저장 완료 대기
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });


        // 4️⃣ 응답
        res.json({
            success: true,
            message: '무료 베이직 진단이 완료되었습니다.',
            uniqueId,
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata
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
 * POST /api/diagnosis/premium
 * 프리미엄 풀코스 진단
 */
const generatePremiumDiagnosis = async (req, res) => {
    try {
        const { sajuData, mbti, userId, orderId } = req.body;

        // 필수 입력값 검증
        if (!sajuData || !mbti || !userId || !orderId) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 사용자 확인
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 주문 확인
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId,
                status: 'completed'
            }
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message: '결제 확인에 실패했습니다.'
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('💎 프리미엄 풀코스 진단');
        console.log('='.repeat(80) + '\n');

        // TODO: 프리미엄 프롬프트 생성
        const prompt = generateFreePrompt({ ...sajuData, mbti });

        const diagnosis = await callClaudeAPIPremium(
            prompt.systemPrompt,
            prompt.userPrompt,
            userId,
            3000  // 프리미엄은 3000 토큰
        );

        // DB 저장 (Analysis 모델 사용)
        // TODO: Analysis 모델 만들고 저장 로직 추가
        // await Analysis.create({
        //     user_id: userId,
        //     analysis_type: 'premium',
        //     input_hash: generateInputHash(sajuData, mbti),
        //     saju_data: sajuData,
        //     ai_result: diagnosis.text
        // });

        console.log('✅ 프리미엄 진단 완료!\n');

        res.json({
            success: true,
            message: '프리미엄 진단이 완료되었습니다.',
            diagnosis: diagnosis.text,
            usage: diagnosis.usage
        });

    } catch (error) {
        console.error('프리미엄 진단 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '진단 생성 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 입력 해시 생성 헬퍼 함수
 */
function generateInputHash(sajuData, mbti) {
    const input = JSON.stringify({ sajuData, mbti });
    return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = {
    generateFreeDiagnosis,
    generatePremiumDiagnosis
};