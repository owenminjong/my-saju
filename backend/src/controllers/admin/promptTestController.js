const sajuService = require('../../services/sajuService');
const { generateFreePrompt } = require('../../services/promptService');
const {
    getAllPremiumPrompts,
    generateStep1Prompt,
    generateStep2Prompt,
    generateStep3Prompt
} = require('../../services/premiumPromptService');
const { getClaudeApiKey } = require('../../services/claudeService');

/**
 * 토큰 저장 없이 Claude API 직접 호출
 */
async function callClaudeTest(systemPrompt, userPrompt, maxTokens = 3000) {
    const apiKey = await getClaudeApiKey();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API 오류: ${error.error.message}`);
    }

    const data = await response.json();
    return {
        text: data.content[0].text,
        usage: data.usage
    };
}

/**
 * POST /api/admin/prompt-test
 */
const runPromptTest = async (req, res) => {
    try {
        const {
            mode,
            name, year, month, day,
            hour = 0, minute = 0,
            isLunar = false,
            gender = 'M',
            mbti
        } = req.body;

        // 사주 계산
        const sajuResult = await sajuService.analyzeBasicSaju({
            name, year, month, day, hour, minute, isLunar
        });
        sajuResult.user.gender = gender;
        sajuResult.mbti = mbti;

        if (mode === 'free') {
            const promptData = {
                user: { ...sajuResult.user, gender },
                saju: sajuResult.saju,
                elements: sajuResult.elements,
                dayMaster: sajuResult.dayMaster,
                fields: sajuResult.fields,
                mbti
            };

            const prompt = await generateFreePrompt(promptData);
            const result = await callClaudeTest(
                prompt.systemPrompt,
                prompt.userPrompt,
                1000
            );

            return res.json({
                success: true,
                mode: 'free',
                prompts: {
                    systemPrompt: prompt.systemPrompt,
                    userPrompt: prompt.userPrompt
                },
                sajuData: sajuResult,
                diagnosis: result.text,
                usage: result.usage
            });

        } else if (mode === 'premium') {
            const prompts = await getAllPremiumPrompts();

            // Step 1
            const step1Prompt = generateStep1Prompt(sajuResult, prompts.step1);
            const step1Result = await callClaudeTest(
                step1Prompt.systemPrompt,
                step1Prompt.userPrompt,
                step1Prompt.maxTokens
            );

            // Step 2
            const step2Prompt = generateStep2Prompt(sajuResult, prompts.step2, step1Result.text);
            const step2Result = await callClaudeTest(
                step2Prompt.systemPrompt,
                step2Prompt.userPrompt,
                step2Prompt.maxTokens
            );

            // Step 3
            const step3Prompt = generateStep3Prompt(sajuResult, prompts.step3, step1Result.text, step2Result.text);
            const step3Result = await callClaudeTest(
                step3Prompt.systemPrompt,
                step3Prompt.userPrompt,
                step3Prompt.maxTokens
            );

            return res.json({
                success: true,
                mode: 'premium',
                sajuData: sajuResult,
                steps: {
                    step1: {
                        prompts: {
                            systemPrompt: step1Prompt.systemPrompt,
                            userPrompt: step1Prompt.userPrompt
                        },
                        result: step1Result.text,
                        usage: step1Result.usage
                    },
                    step2: {
                        prompts: {
                            systemPrompt: step2Prompt.systemPrompt,
                            userPrompt: step2Prompt.userPrompt
                        },
                        result: step2Result.text,
                        usage: step2Result.usage
                    },
                    step3: {
                        prompts: {
                            systemPrompt: step3Prompt.systemPrompt,
                            userPrompt: step3Prompt.userPrompt
                        },
                        result: step3Result.text,
                        usage: step3Result.usage
                    }
                }
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'mode는 free 또는 premium 이어야 합니다.'
            });
        }

    } catch (error) {
        console.error('❌ 프롬프트 테스트 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '프롬프트 테스트 중 오류가 발생했습니다.'
        });
    }
};

module.exports = { runPromptTest };