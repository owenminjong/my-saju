const sajuService = require('../services/saju-service');
const { generateFreePrompt } = require('../services/prompt-service');

/**
 * 무료 사주 분석
 * POST /api/saju/analyze
 */
const analyzeFreeSaju = async (req, res) => {
    try {
        const { name, year, month, day, hour, minute, isLunar, gender, mbti } = req.body;

        // 필수 입력값 검증
        if (!name || !year || !month || !day) {
            return res.status(400).json({
                success: false,
                message: '이름, 생년월일은 필수 입력값입니다.'
            });
        }

        // 사주 분석
        const result = await sajuService.analyzeBasicSaju({
            name,
            year,
            month,
            day,
            hour: hour || 0,
            minute: minute || 0,
            isLunar: isLunar || false
        });

        // 프롬프트 생성 (항상 실행)
        const promptData = {
            user: {
                ...result.user,
                gender: gender || 'M'
            },
            saju: result.saju,
            elements: result.elements,  // ✅ 전체 객체 전달
            dayMaster: result.dayMaster,
            fields: result.fields,      // ✅ fields도 추가
            mbti: mbti
        };

        const prompt = generateFreePrompt(promptData);

        // 콘솔에 프롬프트 출력
        console.log('\n' + '='.repeat(80));
        console.log('📋 무료 베이직 진단 프롬프트');
        console.log('='.repeat(80) + '\n');

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
        console.log('\n' + '='.repeat(80) + '\n');

        res.status(200).json({
            success: true,
            message: '사주 분석이 완료되었습니다.',
            data: result
        });

    } catch (error) {
        console.error('사주 분석 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '사주 분석 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 시간대별 지지 정보 조회
 * GET /api/saju/time-info
 */
const getTimeInfo = async (req, res) => {
    try {
        const timeInfo = [
            { hour: '23-01시', branch: '자(子)', animal: '쥐' },
            { hour: '01-03시', branch: '축(丑)', animal: '소' },
            { hour: '03-05시', branch: '인(寅)', animal: '호랑이' },
            { hour: '05-07시', branch: '묘(卯)', animal: '토끼' },
            { hour: '07-09시', branch: '진(辰)', animal: '용' },
            { hour: '09-11시', branch: '사(巳)', animal: '뱀' },
            { hour: '11-13시', branch: '오(午)', animal: '말' },
            { hour: '13-15시', branch: '미(未)', animal: '양' },
            { hour: '15-17시', branch: '신(申)', animal: '원숭이' },
            { hour: '17-19시', branch: '유(酉)', animal: '닭' },
            { hour: '19-21시', branch: '술(戌)', animal: '개' },
            { hour: '21-23시', branch: '해(亥)', animal: '돼지' }
        ];

        res.status(200).json({
            success: true,
            data: timeInfo
        });

    } catch (error) {
        console.error('시간 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시간 정보를 불러오는데 실패했습니다.'
        });
    }
};

module.exports = {
    analyzeFreeSaju,
    getTimeInfo
};