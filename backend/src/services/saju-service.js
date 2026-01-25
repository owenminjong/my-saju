const { getBasicSajuAnalysis } = require('../utils/saju-calculator');

/**
 * 무료 사주 분석 서비스
 */
class SajuService {
    /**
     * 기본 사주 분석
     */
    async analyzeBasicSaju(userData) {
        const { name, year, month, day, hour = 0, minute = 0, isLunar = false, selectedTime = '' } = userData;

        // 유효성 검사
        this.validateBirthData({ year, month, day, hour, minute });

        // 사주 분석
        const analysis = getBasicSajuAnalysis({
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            hour: parseInt(hour),
            isLunar: isLunar
        });

        // 결과 포맷팅 (사용자 입력 정보 전달)
        return this.formatAnalysisResult(name, analysis, {
            year,
            month,
            day,
            hour,
            isLunar,
            selectedTime
        });
    }

    /**
     * 생년월일 유효성 검사
     */
    validateBirthData(birthData) {
        const { year, month, day, hour, minute } = birthData;

        // 연도 검사 (1900 ~ 현재년도)
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            throw new Error('올바른 생년월일을 입력해주세요. (1900년 이후)');
        }

        // 월 검사
        if (month < 1 || month > 12) {
            throw new Error('월은 1~12 사이의 값이어야 합니다.');
        }

        // 일 검사
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            throw new Error(`${month}월은 1~${daysInMonth}일까지 있습니다.`);
        }

        // 시간 검사
        if (hour < 0 || hour > 23) {
            throw new Error('시간은 0~23 사이의 값이어야 합니다.');
        }

        // 분 검사
        if (minute < 0 || minute > 59) {
            throw new Error('분은 0~59 사이의 값이어야 합니다.');
        }
    }

    /**
     * 분석 결과 포맷팅
     */
    formatAnalysisResult(name, analysis, userInput) {
        const { saju, elements, dayMaster, usefulGod } = analysis;
        const { year, month, day, isLunar, selectedTime } = userInput;

        // 시간 표시
        let timeDisplay = selectedTime || `${userInput.hour}시`;
        if (selectedTime === '시간 모름') {
            timeDisplay = '시간 모름 (자시 기준)';
        }

        return {
            user: {
                name,
                birthDate: `${year}년 ${month}월 ${day}일 (${isLunar ? '음력' : '양력'})`,
                birthTime: timeDisplay
            },
            saju: {
                year: this.formatPillar(saju.year, '년주'),
                month: this.formatPillar(saju.month, '월주'),
                day: this.formatPillar(saju.day, '일주'),
                hour: this.formatPillar(saju.hour, '시주')
            },
            elements: {
                distribution: elements.count,
                percentage: elements.percentage,
                status: elements.status,
                chart: this.createElementChart(elements.percentage)
            },
            dayMaster: {
                stem: saju.day.stem.char,
                element: dayMaster.element,
                strength: dayMaster.strength,
                description: dayMaster.description
            },
            recommendation: {
                useful: usefulGod.useful,
                avoid: usefulGod.avoid,
                description: usefulGod.description
            },
            summary: this.generateSummary(name, saju, elements, dayMaster)
        };
    }

    /**
     * 기둥 포맷팅
     */
    formatPillar(pillar, position) {
        return {
            position,
            stem: {
                char: pillar.stem.char,
                hanja: pillar.stem.hanja,
                element: pillar.stem.element,
                yinYang: pillar.stem.yin_yang
            },
            branch: {
                char: pillar.branch.char,
                hanja: pillar.branch.hanja,
                element: pillar.branch.element,
                animal: pillar.branch.animal,
                yinYang: pillar.branch.yin_yang,
                time: pillar.branch.time
            }
        };
    }

    /**
     * 오행 차트 데이터 생성
     */
    createElementChart(percentage) {
        return [
            { element: '목', name: '木', percentage: percentage.목, color: '#228B22' },
            { element: '화', name: '火', percentage: percentage.화, color: '#DC143C' },
            { element: '토', name: '土', percentage: percentage.토, color: '#D2691E' },
            { element: '금', name: '金', percentage: percentage.금, color: '#DAA520' },
            { element: '수', name: '水', percentage: percentage.수, color: '#4682B4' }
        ];
    }

    /**
     * 요약 생성
     */
    generateSummary(name, saju, elements, dayMaster) {
        const dominant = Object.entries(elements.count)
            .sort((a, b) => b[1] - a[1])[0];

        const lacking = Object.entries(elements.count)
            .filter(([_, count]) => count <= 1)
            .map(([element]) => element);

        return {
            intro: `${name}님의 사주를 분석했습니다.`,
            dayMaster: `일간은 '${saju.day.stem.char}(${dayMaster.element})'이며, ${dayMaster.strength}한 사주입니다.`,
            dominant: `${dominant[0]} 기운이 가장 강합니다. (${dominant[1]}개)`,
            lacking: lacking.length > 0
                ? `${lacking.join(', ')} 기운이 부족합니다.`
                : '오행이 고르게 분포되어 있습니다.',
            advice: '더 자세한 풀이는 유료 서비스를 이용해주세요.'
        };
    }
}

module.exports = new SajuService();