const Lunar = require('lunar-javascript');
const Solar = require('lunar-javascript').Solar;

class SajuCalculator {

    // 천간
    static CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

    // 지지
    static JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

    // 오행
    static OHAENG = {
        '갑': '목', '을': '목',
        '병': '화', '정': '화',
        '무': '토', '기': '토',
        '경': '금', '신': '금',
        '임': '수', '계': '수'
    };

    /**
     * 사주팔자 계산
     */
    static calculate(year, month, day, hour, isLunar = false) {
        try {
            let lunar;

            if (isLunar) {
                // 음력 입력
                lunar = Lunar.fromYmd(year, month, day);
            } else {
                // 양력 입력
                const solar = Solar.fromYmd(year, month, day);
                lunar = solar.getLunar();
            }

            // 사주팔자 생성
            const saju = {
                year: this.getYearPillar(lunar),
                month: this.getMonthPillar(lunar),
                day: this.getDayPillar(lunar),
                hour: this.getHourPillar(lunar, hour)
            };

            return saju;

        } catch (error) {
            console.error('사주 계산 오류:', error);
            throw new Error('사주 계산에 실패했습니다.');
        }
    }

    /**
     * 년주 계산
     */
    static getYearPillar(lunar) {
        const ganIndex = lunar.getYearGanIndex();
        const jiIndex = lunar.getYearZhiIndex();

        return {
            cheongan: this.CHEONGAN[ganIndex],
            jiji: this.JIJI[jiIndex]
        };
    }

    /**
     * 월주 계산
     */
    static getMonthPillar(lunar) {
        const ganIndex = lunar.getMonthGanIndex();
        const jiIndex = lunar.getMonthZhiIndex();

        return {
            cheongan: this.CHEONGAN[ganIndex],
            jiji: this.JIJI[jiIndex]
        };
    }

    /**
     * 일주 계산
     */
    static getDayPillar(lunar) {
        const ganIndex = lunar.getDayGanIndex();
        const jiIndex = lunar.getDayZhiIndex();

        return {
            cheongan: this.CHEONGAN[ganIndex],
            jiji: this.JIJI[jiIndex]
        };
    }

    /**
     * 시주 계산
     */
    static getHourPillar(lunar, hour) {
        // 시간을 지지 인덱스로 변환
        const jiIndex = Math.floor((hour + 1) / 2) % 12;

        // 일간에 따른 시간 천간 계산
        const dayGanIndex = lunar.getDayGanIndex();
        const ganIndex = (dayGanIndex * 2 + jiIndex) % 10;

        return {
            cheongan: this.CHEONGAN[ganIndex],
            jiji: this.JIJI[jiIndex]
        };
    }
}

module.exports = SajuCalculator;