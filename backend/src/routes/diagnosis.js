// 무료 베이직 진단 API 엔드포인트

const express = require('express');
const router = express.Router();
const { generateFreePrompt } = require('../services/prompt-service');

/**
 * POST /api/diagnosis/free
 * 무료 베이직 진단 생성 (프롬프트만 출력, Claude API 미연동)
 */
router.post('/free', async (req, res) => {
    try {
        const { sajuData, mbti } = req.body;

        if (!sajuData || !mbti) {
            return res.status(400).json({
                success: false,
                message: '사주 데이터와 MBTI가 필요합니다.'
            });
        }

        // 프롬프트 생성
        const prompt = generateFreePrompt({ ...sajuData, mbti });

        // 콘솔에 프롬프트 출력 (테스트용)
        console.log('\n');
        console.log('='.repeat(80));
        console.log('📋 무료 베이직 진단 프롬프트 (Claude API 전송 직전)');
        console.log('='.repeat(80));
        console.log('\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 SYSTEM PROMPT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(prompt.systemPrompt);
        console.log('\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 USER PROMPT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(prompt.userPrompt);
        console.log('\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📌 메타데이터');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(JSON.stringify(prompt.metadata, null, 2));
        console.log('\n');

        console.log('='.repeat(80));
        console.log('💡 위 프롬프트를 복사해서 Claude.ai에 붙여넣으세요!');
        console.log('='.repeat(80));
        console.log('\n');

        // 응답
        res.json({
            success: true,
            message: '프롬프트가 콘솔에 출력되었습니다.',
            prompt: {
                system: prompt.systemPrompt,
                user: prompt.userPrompt
            },
            metadata: prompt.metadata
        });

    } catch (error) {
        console.error('프롬프트 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;