// services/premiumPromptService.js

const { Prompt } = require('../../models');
const {
    MBTI_EXPRESSIONS,
    STEM_TO_COLOR,
    BRANCH_TO_ANIMAL_EMOJI,
    BRANCH_TO_ANIMAL_NAME,
    MONTH_TO_SEASON,
    SEASON_TO_BACKGROUND,
    HOUR_TO_TIME_OF_DAY,
    TIME_OF_DAY_TO_ATMOSPHERE,
    ELEMENT_TO_EFFECT
} = require('./sajuMappings');

/**
 * 프롬프트 템플릿의 변수 치환 (무료와 동일)
 */
function replaceVariables(template, variables) {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
}

/**
 * MBTI 표현 변환 (무료와 동일)
 */
function convertMBTIToExpression(mbti) {
    if (!mbti || mbti.length !== 4) return '독특한 개성을 가진';

    const traits = mbti.split('');
    const expressions = [];

    if (MBTI_EXPRESSIONS[traits[0]]) {
        const options = MBTI_EXPRESSIONS[traits[0]];
        expressions.push(options[Math.floor(Math.random() * options.length)]);
    }
    if (MBTI_EXPRESSIONS[traits[2]]) {
        const options = MBTI_EXPRESSIONS[traits[2]];
        expressions.push(options[Math.floor(Math.random() * options.length)]);
    }

    return expressions.join(', ');
}

/**
 * 캐릭터 정보 생성 (무료와 동일)
 */
function generateCharacterInfo(saju, birthMonth, birthHour) {
    const yearStem = saju.year.stem.char;
    const yearBranch = saju.year.branch.char;

    const color = STEM_TO_COLOR[yearStem];
    const animalName = BRANCH_TO_ANIMAL_NAME[yearBranch];
    const animalEmoji = BRANCH_TO_ANIMAL_EMOJI[yearBranch];
    const season = MONTH_TO_SEASON[birthMonth];
    const seasonBg = SEASON_TO_BACKGROUND[season];
    const timeOfDay = HOUR_TO_TIME_OF_DAY[birthHour];
    const timeBg = TIME_OF_DAY_TO_ATMOSPHERE[timeOfDay];

    return {
        color,
        animalName,
        animalEmoji,
        season,
        seasonBg,
        timeOfDay,
        timeBg,
        fullDescription: `${color} ${animalName}띠 · ${season} · ${timeOfDay}`,
        characterSummary: `**[${color} ${animalName}띠] [${color} ${animalName}]**\n\n${seasonBg} + ${timeBg} 하늘\n\n`
    };
}

/**
 * 가장 강한 오행 이펙트 (무료와 동일)
 */
function getDominantElementEffect(elements) {
    const percentages = elements.percentage;
    const elementList = [];

    let maxValue = 0;
    for (const [element, value] of Object.entries(percentages)) {
        const numValue = parseFloat(value);
        if (numValue > maxValue) {
            maxValue = numValue;
        }
    }

    for (const [element, value] of Object.entries(percentages)) {
        const numValue = parseFloat(value);
        if (numValue === maxValue) {
            elementList.push(element);
        }
    }

    const priority = ['목', '화', '토', '금', '수'];
    for (const element of priority) {
        if (elementList.includes(element)) {
            return ELEMENT_TO_EFFECT[element];
        }
    }

    return ELEMENT_TO_EFFECT[elementList[0]];
}

/**
 * 프리미엄 프롬프트 3개 한 번에 가져오기
 */
async function getAllPremiumPrompts() {
    const prompts = await Prompt.findAll({
        where: {
            category: 'premium',
            is_active: 1
        },
        order: [['step', 'ASC']]
    });

    if (prompts.length !== 3) {
        throw new Error(`프리미엄 프롬프트가 ${prompts.length}개만 활성화되어 있습니다. 3개가 필요합니다.`);
    }

    return {
        step1: prompts.find(p => p.step === 1),
        step2: prompts.find(p => p.step === 2),
        step3: prompts.find(p => p.step === 3)
    };
}

/**
 * Step 1: 인생 로드맵 프롬프트 생성
 */
function generateStep1Prompt(sajuData, promptTemplate) {
    const { user, saju, elements, mbti } = sajuData;

    // 변수 준비
    const personalityExpression = convertMBTIToExpression(mbti);
    const birthMonth = parseInt(user.birthDate.match(/(\d+)월/)?.[1]);
    const birthHour = parseInt(saju.hour.branch.time.split('-')[0]);
    const character = generateCharacterInfo(saju, birthMonth, birthHour);
    const dominantEffect = getDominantElementEffect(elements);

    const variables = {
        color: character.color,
        animalName: character.animalName,
        animalEmoji: character.animalEmoji,
        seasonBg: character.seasonBg,
        timeBg: character.timeBg,
        dominantEffect: dominantEffect,
        fullDescription: character.fullDescription,
        personalityExpression: personalityExpression
    };

    // 변수 치환
    const systemPrompt = replaceVariables(promptTemplate.content, variables);

    // User Prompt 생성
    const userPrompt = `## 입력 데이터

**사용자:** ${user.name} (${user.gender === 'M' ? '남성' : '여성'})
**생년월일:** ${user.birthDate}
**생시:** ${user.birthTime}
**성향:** ${personalityExpression}

**사주:**
년주: ${saju.year.stem.char}(${saju.year.stem.element}) ${saju.year.branch.char}(${saju.year.branch.element}, ${character.animalEmoji}${character.animalName}띠)
월주: ${saju.month.stem.char}(${saju.month.stem.element}) ${saju.month.branch.char}(${saju.month.branch.element})
일주: ${saju.day.stem.char}(${saju.day.stem.element}) ${saju.day.branch.char}(${saju.day.branch.element})
시주: ${saju.hour.stem.char}(${saju.hour.stem.element}) ${saju.hour.branch.char}(${saju.hour.branch.element})

위 사주 데이터로 인생 3막 로드맵을 작성해주세요.`;

    return {
        systemPrompt,
        userPrompt,
        maxTokens: promptTemplate.estimated_tokens || 1500
    };
}

/**
 * Step 2: 3대 핵심 분야 프롬프트 생성
 */
function generateStep2Prompt(sajuData, promptTemplate, step1Result) {
    const { user, saju, elements, mbti } = sajuData;

    // 변수 준비 (Step 1과 동일)
    const personalityExpression = convertMBTIToExpression(mbti);
    const birthMonth = parseInt(user.birthDate.match(/(\d+)월/)?.[1]);
    const birthHour = parseInt(saju.hour.branch.time.split('-')[0]);
    const character = generateCharacterInfo(saju, birthMonth, birthHour);
    const dominantEffect = getDominantElementEffect(elements);

    const variables = {
        color: character.color,
        animalName: character.animalName,
        personalityExpression: personalityExpression,
        dominantEffect: dominantEffect
    };

    // 변수 치환
    const systemPrompt = replaceVariables(promptTemplate.content, variables);

    // User Prompt (Step 1 결과 참고)
    const userPrompt = `## 입력 데이터

**사용자:** ${user.name} (${user.gender === 'M' ? '남성' : '여성'})
**성향:** ${personalityExpression}

**사주:**
년주: ${saju.year.stem.char}${saju.year.branch.char}
월주: ${saju.month.stem.char}${saju.month.branch.char}
일주: ${saju.day.stem.char}${saju.day.branch.char}
시주: ${saju.hour.stem.char}${saju.hour.branch.char}

**참고: Step 1 인생 로드맵 결과**
${step1Result}

---

위 데이터로 2026년 [재물/직업/연애] 3대 핵심 분야를 각 1,000자 이상 상세 분석해주세요.`;

    return {
        systemPrompt,
        userPrompt,
        maxTokens: promptTemplate.estimated_tokens || 3000
    };
}

/**
 * Step 3: 월간 캘린더 프롬프트 생성
 */
function generateStep3Prompt(sajuData, promptTemplate, step1Result, step2Result) {
    const { user, saju, mbti } = sajuData;

    // 변수 준비
    const personalityExpression = convertMBTIToExpression(mbti);
    const birthMonth = parseInt(user.birthDate.match(/(\d+)월/)?.[1]);
    const birthHour = parseInt(saju.hour.branch.time.split('-')[0]);
    const character = generateCharacterInfo(saju, birthMonth, birthHour);
    const dominantEffect = getDominantElementEffect(sajuData.elements);

    const variables = {
        color: character.color,
        animalName: character.animalName,
        personalityExpression: personalityExpression,
        dominantEffect: dominantEffect
    };

    // 변수 치환
    const systemPrompt = replaceVariables(promptTemplate.content, variables);

    // User Prompt
    const userPrompt = `## 입력 데이터

**사용자:** ${user.name}
**성향:** ${personalityExpression}

**참고: Step 1 인생 로드맵**
${step1Result.substring(0, 500)}... (요약)

**참고: Step 2 3대 핵심 분야**
${step2Result.substring(0, 500)}... (요약)

---

위 내용을 바탕으로 2026년 12개월 월간 캘린더 + 건강/개운 보너스를 작성해주세요.`;

    return {
        systemPrompt,
        userPrompt,
        maxTokens: promptTemplate.estimated_tokens || 2000
    };
}

module.exports = {
    getAllPremiumPrompts,
    generateStep1Prompt,
    generateStep2Prompt,
    generateStep3Prompt
};