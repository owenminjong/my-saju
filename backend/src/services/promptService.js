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
 * MBTI 표현 변환
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
 * 캐릭터 정보 생성
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
 * 가장 강한 오행 이펙트
 */
/**
 * 가장 강한 오행 이펙트
 */
function getDominantElementEffect(elements) {
    const percentages = elements.percentage;
    const elementList = [];

    // 가장 높은 값 찾기
    let maxValue = 0;
    for (const [element, value] of Object.entries(percentages)) {
        const numValue = parseFloat(value);
        if (numValue > maxValue) {
            maxValue = numValue;
        }
    }

    // 가장 높은 값과 같은 오행들 모두 찾기
    for (const [element, value] of Object.entries(percentages)) {
        const numValue = parseFloat(value);
        if (numValue === maxValue) {
            elementList.push(element);
        }
    }

    // 동률이면 오행 상생 순서로 우선순위: 목 → 화 → 토 → 금 → 수
    const priority = ['목', '화', '토', '금', '수'];
    for (const element of priority) {
        if (elementList.includes(element)) {
            return ELEMENT_TO_EFFECT[element];
        }
    }

    return ELEMENT_TO_EFFECT[elementList[0]];
}
/**
 * 무료 베이직 진단 프롬프트 생성
 */
function generateFreePrompt(sajuData) {
    const { user, saju, elements, dayMaster, fields, mbti } = sajuData;

    const personalityExpression = convertMBTIToExpression(mbti);
    const birthMonth = parseInt(user.birthDate.match(/(\d+)월/)?.[1]);
    const birthHour = parseInt(saju.hour.branch.time.split('-')[0]);
    const character = generateCharacterInfo(saju, birthMonth, birthHour);
    const dominantEffect = getDominantElementEffect(elements);

    const systemPrompt = `당신은 사주명리학 전문가입니다.

**출력 구조:**
1. 🎭 당신의 사주 캐릭터

**[${character.color} ${character.animalName}띠] [${character.color} ${character.animalName}]**

${character.seasonBg} ${character.timeBg} 하늘 | ${dominantEffect}

"[한 줄 설명]"
${character.fullDescription}
2. 📊 운명 성적표 (표 형식)
3. ⚡ 2026년 키워드 1개
4. 📄 진단 소견서 (정확히 300자)
5. 🚨 위기 2가지 (각 월+상황, 질문으로 끝)

**규칙:**
- MBTI 용어 절대 금지
- 성향 표현: "${personalityExpression}"
- 키워드는 1개만
- 진단 소견서는 정확히 300자
- 위기는 해결책 없이 질문으로 끝
- 출력 금지: 월별 지침, 귀인 특징, 투자 종목`;

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

**오행:** 목${elements.percentage.목}% 화${elements.percentage.화}% 토${elements.percentage.토}% 금${elements.percentage.금}% 수${elements.percentage.수}%

**일간:** ${dayMaster.stem}(${dayMaster.element}) - ${dayMaster.strength}

**운세:** 재물${fields.wealth.score}점(${fields.wealth.grade}) 직업${fields.career.score}점(${fields.career.grade}) 연애${fields.love.score}점(${fields.love.grade}) 건강${fields.health.score}점(${fields.health.grade})

---

위 데이터로 무료 베이직 진단서 작성.`;

    return {
        systemPrompt,
        userPrompt,
        maxTokens: 1000,
        temperature: 0.4,
        character,
        metadata: {
            userName: user.name,
            mbti: mbti,
            mbtiExpression: personalityExpression,
            character: character.fullDescription,
            fortuneScores: {
                wealth: fields.wealth.score,
                career: fields.career.score,
                love: fields.love.score,
                health: fields.health.score
            },
            grades: {
                wealth: fields.wealth.grade,
                career: fields.career.grade,
                love: fields.love.grade,
                health: fields.health.grade
            }
        }
    };
}

module.exports = {
    generateFreePrompt,
    convertMBTIToExpression
};