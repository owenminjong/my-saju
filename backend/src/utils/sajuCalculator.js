const Lunar = require('lunar-javascript');
const {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    FIVE_ELEMENTS,
    TIME_TO_BRANCH,
    MONTH_TO_BRANCH
} = require('../data/sajuData');

/**
 * 양력을 음력으로 변환
 */
function solarToLunar(year, month, day) {
    const solar = Lunar.Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    return {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay()
    };
}

/**
 * 년주 계산 (Year Pillar)
 * 기준: 1984년 = 갑자년 (천간0, 지지0)
 */
/**
 * 년주 계산 (Year Pillar)
 * lunar-javascript 사용 (입춘 자동 처리)
 */
function calculateYearPillar(year, month, day) {
    const solar = Lunar.Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const stemIndex = lunar.getYearGanIndex();
    const branchIndex = lunar.getYearZhiIndex();

    return {
        stem: HEAVENLY_STEMS[stemIndex],
        branch: EARTHLY_BRANCHES[branchIndex],
        stemIndex,
        branchIndex
    };
}

/**
 * 월주 계산 (Month Pillar)
 * lunar-javascript 사용
 */
function calculateMonthPillar(year, month, day, isLunar = false) {
    const solar = Lunar.Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const stemIndex = lunar.getMonthGanIndex();
    const branchIndex = lunar.getMonthZhiIndex();

    return {
        stem: HEAVENLY_STEMS[stemIndex],
        branch: EARTHLY_BRANCHES[branchIndex],
        stemIndex,
        branchIndex
    };
}

/**
 * 일주 계산 (Day Pillar)
 * lunar-javascript 라이브러리 사용
 * 항상 양력 기준으로 계산
 */
function calculateDayPillar(year, month, day) {
    // lunar-javascript로 일주 계산
    const solar = Lunar.Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const dayGan = lunar.getDayGan();    // 일간 한자
    const dayZhi = lunar.getDayZhi();    // 일지 한자
    const dayGanIndex = lunar.getDayGanIndex();    // 일간 인덱스
    const dayZhiIndex = lunar.getDayZhiIndex();    // 일지 인덱스

    return {
        stem: HEAVENLY_STEMS[dayGanIndex],
        branch: EARTHLY_BRANCHES[dayZhiIndex],
        stemIndex: dayGanIndex,
        branchIndex: dayZhiIndex
    };
}

/**
 * 시주 계산 (Hour Pillar)
 * 오서십법(五鼠十法)
 */
function calculateHourPillar(dayStemIndex, hour) {
    // 시간으로 지지 찾기
    let branchIndex;

    if (hour >= 23 || hour < 1) branchIndex = 0;      // 자시
    else if (hour >= 1 && hour < 3) branchIndex = 1;  // 축시
    else if (hour >= 3 && hour < 5) branchIndex = 2;  // 인시
    else if (hour >= 5 && hour < 7) branchIndex = 3;  // 묘시
    else if (hour >= 7 && hour < 9) branchIndex = 4;  // 진시
    else if (hour >= 9 && hour < 11) branchIndex = 5; // 사시
    else if (hour >= 11 && hour < 13) branchIndex = 6;// 오시
    else if (hour >= 13 && hour < 15) branchIndex = 7;// 미시
    else if (hour >= 15 && hour < 17) branchIndex = 8;// 신시
    else if (hour >= 17 && hour < 19) branchIndex = 9;// 유시
    else if (hour >= 19 && hour < 21) branchIndex = 10;// 술시
    else branchIndex = 11; // 해시

    // 오서십법 시간 천간 계산
    const firstHourStem = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const stemIndex = (firstHourStem + branchIndex) % 10;

    return {
        stem: HEAVENLY_STEMS[stemIndex],
        branch: EARTHLY_BRANCHES[branchIndex],
        stemIndex,
        branchIndex
    };
}

/**
 * 4대 분야 점수 계산 (오행 기반)
 */
function calculate4Fields(elements) {
    const { percentage } = elements;

    // 숫자로 변환
    const 목 = parseFloat(percentage.목);
    const 화 = parseFloat(percentage.화);
    const 토 = parseFloat(percentage.토);
    const 금 = parseFloat(percentage.금);
    const 수 = parseFloat(percentage.수);

    // 1. 재물운: 토(土) + 금(金) 비중
    let wealth = 50 + (토 + 금) / 2;
    wealth = Math.min(100, Math.max(40, wealth));

    // 2. 직업운: 목(木) + 화(火) 비중
    let career = 50 + (목 + 화) / 2;
    career = Math.min(100, Math.max(40, career));

    // 3. 연애운: 수(水) + 목(木) 비중
    let love = 50 + (수 + 목) / 2;
    love = Math.min(100, Math.max(40, love));

    // 4. 건강운: 오행 균형도 (표준편차 역수)
    const values = [목, 화, 토, 금, 수];
    const avg = 20; // 완벽한 균형 = 각 20%
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / 5;
    const stdDev = Math.sqrt(variance);
    let health = 100 - (stdDev * 3);
    health = Math.min(100, Math.max(40, health));

    // 점수를 등급으로 변환
    const getGrade = (score) => {
        if (score >= 90) return 'S';
        if (score >= 75) return 'A';
        if (score >= 60) return 'B';
        return 'C';
    };

    return {
        wealth: { score: Math.round(wealth), grade: getGrade(wealth) },
        career: { score: Math.round(career), grade: getGrade(career) },
        love: { score: Math.round(love), grade: getGrade(love) },
        health: { score: Math.round(health), grade: getGrade(health) }
    };
}

/**
 * 사주팔자 전체 계산
 */
function calculateSaju(birthInfo) {
    const { year, month, day, hour = 0, isLunar = false } = birthInfo;

    // 음력이면 양력으로 변환 (일주 계산용)
    let solarYear = year;
    let solarMonth = month;
    let solarDay = day;

    if (isLunar) {
        const lunar = Lunar.Lunar.fromYmd(year, month, day);
        const solar = lunar.getSolar();
        solarYear = solar.getYear();
        solarMonth = solar.getMonth();
        solarDay = solar.getDay();
    }

    const yearPillar = calculateYearPillar(solarYear, solarMonth, solarDay);
    const monthPillar = calculateMonthPillar(solarYear, solarMonth, solarDay, false); // 항상 false
    const dayPillar = calculateDayPillar(solarYear, solarMonth, solarDay);
    const hourPillar = calculateHourPillar(dayPillar.stemIndex, hour);

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
    };
}

/**
 * 오행 분석
 */
function analyzeElements(saju) {
    const elementCount = {
        목: 0,
        화: 0,
        토: 0,
        금: 0,
        수: 0
    };

    const pillars = [saju.year, saju.month, saju.day, saju.hour];

    pillars.forEach(pillar => {
        elementCount[pillar.stem.element]++;
        elementCount[pillar.branch.element]++;
    });

    const total = 8;
    const elementPercentage = {};
    const elementStatus = {};

    Object.keys(elementCount).forEach(element => {
        const count = elementCount[element];
        const percentage = ((count / total) * 100).toFixed(1);
        elementPercentage[element] = percentage;

        if (count === 0) elementStatus[element] = '없음';
        else if (count === 1) elementStatus[element] = '부족';
        else if (count === 2) elementStatus[element] = '적정';
        else if (count === 3) elementStatus[element] = '발달';
        else elementStatus[element] = '과다';
    });

    return {
        count: elementCount,
        percentage: elementPercentage,
        status: elementStatus
    };
}

/**
 * 일간 강약 판단
 */
function analyzeDayMasterStrength(saju, elements) {
    const dayMasterElement = saju.day.stem.element;
    const dayMasterCount = elements.count[dayMasterElement];

    let strength = '중화';

    if (dayMasterCount >= 4) {
        strength = '태강';
    } else if (dayMasterCount === 3) {
        strength = '신강';
    } else if (dayMasterCount === 1) {
        strength = '신약';
    } else if (dayMasterCount === 0) {
        strength = '극약';
    }

    return {
        element: dayMasterElement,
        count: dayMasterCount,
        strength,
        description: `일간 '${saju.day.stem.char}'(${dayMasterElement})이(가) ${strength}한 사주입니다.`
    };
}

/**
 * 용신 추천
 */
function recommendUsefulGod(elements) {
    const { status } = elements;

    const lackingElements = Object.keys(status).filter(el =>
        status[el] === '부족' || status[el] === '없음'
    );

    const excessiveElements = Object.keys(status).filter(el =>
        status[el] === '과다'
    );

    return {
        useful: lackingElements.length > 0 ? lackingElements : ['균형잡힌 오행'],
        avoid: excessiveElements,
        description: lackingElements.length > 0
            ? `${lackingElements.join(', ')} 오행을 보충하면 좋습니다.`
            : '오행이 비교적 균형잡힌 사주입니다.'
    };
}

/**
 * 전체 사주 분석 (무료 버전)
 */
function getBasicSajuAnalysis(birthInfo) {
    // 1. 사주 계산
    const saju = calculateSaju(birthInfo);

    // 2. 오행 분석
    const elements = analyzeElements(saju);

    // 3. 일간 강약
    const dayMaster = analyzeDayMasterStrength(saju, elements);

    // 4. 용신 추천
    const usefulGod = recommendUsefulGod(elements);

    // 5. 4대 분야 점수 계산 ← 추가
    const fields = calculate4Fields(elements);

    return {
        saju,
        elements,
        dayMaster,
        usefulGod,
        fields,
        birthInfo
    };
}

module.exports = {
    calculateSaju,
    analyzeElements,
    analyzeDayMasterStrength,
    recommendUsefulGod,
    getBasicSajuAnalysis,
    solarToLunar,
    calculate4Fields
};