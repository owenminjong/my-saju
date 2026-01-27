const sajuService = require('../services/saju-service');  // ⬅️ 추가
const { generateFreePrompt } = require('../services/prompt-service');
const { callClaudeAPIFree } = require('../services/claude-service');

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

        const prompt = generateFreePrompt(promptData);

        console.log('🤖 SYSTEM PROMPT');
        console.log('─'.repeat(80));
        console.log(prompt.systemPrompt);
        console.log('\n');

        console.log('👤 USER PROMPT');
        console.log('─'.repeat(80));
        console.log(prompt.userPrompt);
        console.log('\n');

        console.log('📌 메타데이터');
        console.log('─'.repeat(80));
        console.log(JSON.stringify(prompt.metadata, null, 2));
        console.log('\n');
        console.log(prompt);
        // 3️⃣ Claude API 호출
        console.log('='.repeat(80));
        console.log('🤖 Claude API 호출 중...');
        console.log('='.repeat(80));
        console.log('\n');

        const diagnosis = await callClaudeAPIFree(
            prompt.systemPrompt,
            prompt.userPrompt,
            null  // 0 → null (비회원)
        );

        console.log('✅ 무료 진단 완료!\n');

        // 4️⃣ 응답
        res.json({
            success: true,
            message: '무료 베이직 진단이 완료되었습니다.',
            sajuData: sajuResult,      // ⬅️ 사주 데이터도 포함
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

        // TODO: 결제 확인 로직 추가
        // const paymentVerified = await verifyPayment(orderId);
        // if (!paymentVerified) { throw new Error('결제 확인 실패'); }

        console.log('\n' + '='.repeat(80));
        console.log('💎 프리미엄 풀코스 진단');
        console.log('='.repeat(80) + '\n');

        // TODO: 프리미엄 프롬프트 생성
        // const prompt = generatePremiumPrompt({ ...sajuData, mbti });

        // Claude API 호출 (일단 무료 프롬프트로 테스트)
        const prompt = generateFreePrompt({ ...sajuData, mbti });

        const diagnosis = await callClaudeAPIPremium(
            prompt.systemPrompt,
            prompt.userPrompt,
            userId,
            3000  // 프리미엄은 3000 토큰
        );

        // ⬇️ DB 저장 추가
        await saveDiagnosisResult({
            userId,
            inputHash: generateInputHash(sajuData, mbti),
            sajuData,
            premiumDiagnosis: diagnosis.text,
            diagnosisType: 'premium',
            orderId
        });

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

module.exports = {
    generateFreeDiagnosis,
    generatePremiumDiagnosis
};