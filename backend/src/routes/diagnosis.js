// 무료 베이직 진단 API 엔드포인트

const express = require('express');
const router = express.Router();
const { generateFreePrompt } = require('../services/prompt-service');
const { callClaudeAPIFree } = require('../services/claude-service');  // ⬅️ 무료 버전

/**
 * POST /api/diagnosis/free
 * 무료 베이직 진단 생성
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

        // 콘솔에 프롬프트 출력 (디버깅용)
        console.log('\n');
        console.log('='.repeat(80));
        console.log('📋 무료 베이직 진단 프롬프트');
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
        console.log('🤖 Claude API 호출 중...');
        console.log('='.repeat(80));
        console.log('\n');

        // Claude API 호출 (무료 버전)
        const result = await callClaudeAPIFree(
            prompt.systemPrompt,
            prompt.userPrompt,
            sajuData.user.id  // userId 추가
        );

        console.log('✅ 진단 완료!\n');

        // 응답
        res.json({
            success: true,
            message: '무료 베이직 진단이 완료되었습니다.',
            diagnosis: result.text,
            usage: result.usage,
            metadata: prompt.metadata
        });

    } catch (error) {
        console.error('진단 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '진단 생성 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;