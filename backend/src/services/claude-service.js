const { pool } = require('../config/database');
const { decrypt } = require('../utils/encryption');

/**
 * DB에서 Claude API 키 가져오기
 */
async function getClaudeApiKey() {
    try {
        const [rows] = await pool.query(
            'SELECT api_key FROM api_keys WHERE service_name = ? AND category = ? AND is_active = true',
            ['claude', 'ai']
        );

        if (rows.length === 0) {
            throw new Error('Claude API 키가 설정되지 않았습니다. 관리자 페이지에서 등록해주세요.');
        }

        // 복호화
        const encryptedKey = rows[0].api_key;
        const apiKey = decrypt(encryptedKey);

        return apiKey;
    } catch (error) {
        console.error('❌ Claude API 키 조회 오류:', error);
        throw error;
    }
}

/**
 * 무료 베이직 진단 - Claude API 호출
 */
async function callClaudeAPIFree(systemPrompt, userPrompt, userId) {
    try {
        const apiKey = await getClaudeApiKey();

        console.log('🚀 Claude API 호출 시작 (무료 버전)...');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,  // ⬅️ 무료 버전 고정
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API 오류: ${error.error.message || response.statusText}`);
        }

        const data = await response.json();

        console.log('✅ Claude API 호출 성공!');
        console.log(`📊 토큰 사용: input=${data.usage.input_tokens}, output=${data.usage.output_tokens}`);

        // 토큰 사용량 저장
        await saveTokenUsage(
            userId,
            data.usage.input_tokens + data.usage.output_tokens,
            'claude-free'
        );

        return {
            text: data.content[0].text,
            usage: data.usage
        };

    } catch (error) {
        console.error('❌ Claude API 호출 오류:', error);
        throw error;
    }
}

/**
 * 프리미엄 풀코스 - Claude API 호출
 */
async function callClaudeAPIPremium(systemPrompt, userPrompt, userId, maxTokens = 3000) {
    try {
        const apiKey = await getClaudeApiKey();

        console.log('🚀 Claude API 호출 시작 (프리미엄 버전)...');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: maxTokens,  // ⬅️ 유료 버전 가변
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API 오류: ${error.error.message || response.statusText}`);
        }

        const data = await response.json();

        console.log('✅ Claude API 호출 성공!');
        console.log(`📊 토큰 사용: input=${data.usage.input_tokens}, output=${data.usage.output_tokens}`);

        await saveTokenUsage(
            userId,  // null 또는 실제 userId
            data.usage.input_tokens + data.usage.output_tokens,
            'claude-free'
        );

        return {
            text: data.content[0].text,
            usage: data.usage
        };

    } catch (error) {
        console.error('❌ Claude API 호출 오류:', error);
        throw error;
    }
}

async function saveTokenUsage(userId, tokensUsed, apiType) {
    try {
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO token_usage (user_id, tokens_used, api_type) VALUES (?, ?, ?)',
            [userId, tokensUsed, apiType]
        );

        connection.release();
        console.log(`💾 토큰 저장: ${tokensUsed} (${apiType})`);

    } catch (error) {
        console.error('❌ 토큰 저장 오류:', error);
        // 저장 실패해도 진단은 계속 진행
    }
}


module.exports = {
    getClaudeApiKey,
    callClaudeAPIFree,      // ⬅️ 무료 버전
    callClaudeAPIPremium,    // ⬅️ 유료 버전
    saveTokenUsage
};