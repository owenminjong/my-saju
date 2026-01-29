// 사주 계산 기본 데이터

// 천간 (天干) - 10개
const HEAVENLY_STEMS = {
    0: { char: '갑', hanja: '甲', element: '목', yin_yang: '양' },
    1: { char: '을', hanja: '乙', element: '목', yin_yang: '음' },
    2: { char: '병', hanja: '丙', element: '화', yin_yang: '양' },
    3: { char: '정', hanja: '丁', element: '화', yin_yang: '음' },
    4: { char: '무', hanja: '戊', element: '토', yin_yang: '양' },
    5: { char: '기', hanja: '己', element: '토', yin_yang: '음' },
    6: { char: '경', hanja: '庚', element: '금', yin_yang: '양' },
    7: { char: '신', hanja: '辛', element: '금', yin_yang: '음' },
    8: { char: '임', hanja: '壬', element: '수', yin_yang: '양' },
    9: { char: '계', hanja: '癸', element: '수', yin_yang: '음' }
};

// 지지 (地支) - 12개
const EARTHLY_BRANCHES = {
    0: { char: '자', hanja: '子', element: '수', animal: '쥐', yin_yang: '양', time: '23-01시' },
    1: { char: '축', hanja: '丑', element: '토', animal: '소', yin_yang: '음', time: '01-03시' },
    2: { char: '인', hanja: '寅', element: '목', animal: '호랑이', yin_yang: '양', time: '03-05시' },
    3: { char: '묘', hanja: '卯', element: '목', animal: '토끼', yin_yang: '음', time: '05-07시' },
    4: { char: '진', hanja: '辰', element: '토', animal: '용', yin_yang: '양', time: '07-09시' },
    5: { char: '사', hanja: '巳', element: '화', animal: '뱀', yin_yang: '음', time: '09-11시' },
    6: { char: '오', hanja: '午', element: '화', animal: '말', yin_yang: '양', time: '11-13시' },
    7: { char: '미', hanja: '未', element: '토', animal: '양', yin_yang: '음', time: '13-15시' },
    8: { char: '신', hanja: '申', element: '금', animal: '원숭이', yin_yang: '양', time: '15-17시' },
    9: { char: '유', hanja: '酉', element: '금', animal: '닭', yin_yang: '음', time: '17-19시' },
    10: { char: '술', hanja: '戌', element: '토', animal: '개', yin_yang: '양', time: '19-21시' },
    11: { char: '해', hanja: '亥', element: '수', animal: '돼지', yin_yang: '음', time: '21-23시' }
};

// 오행 (五行)
const FIVE_ELEMENTS = {
    목: {
        name: '木',
        color: '#228B22',
        description: '나무, 성장, 확장',
        season: '봄',
        direction: '동쪽'
    },
    화: {
        name: '火',
        color: '#DC143C',
        description: '불, 열정, 활동',
        season: '여름',
        direction: '남쪽'
    },
    토: {
        name: '土',
        color: '#D2691E',
        description: '흙, 안정, 중심',
        season: '환절기',
        direction: '중앙'
    },
    금: {
        name: '金',
        color: '#DAA520',
        description: '쇠, 강함, 결단',
        season: '가을',
        direction: '서쪽'
    },
    수: {
        name: '水',
        color: '#4682B4',
        description: '물, 지혜, 유연',
        season: '겨울',
        direction: '북쪽'
    }
};

// 오행 상생 (生) 관계
const ELEMENT_GENERATION = {
    목: '화', // 나무가 불을 생성
    화: '토', // 불이 흙을 생성
    토: '금', // 흙이 금을 생성
    금: '수', // 금이 물을 생성
    수: '목'  // 물이 나무를 생성
};

// 오행 상극 (剋) 관계
const ELEMENT_DESTRUCTION = {
    목: '토', // 나무가 흙을 극함
    화: '금', // 불이 금을 극함
    토: '수', // 흙이 물을 극함
    금: '목', // 금이 나무를 극함
    수: '화'  // 물이 불을 극함
};

// 시간대별 지지 매핑
const TIME_TO_BRANCH = [
    { start: 23, end: 1, branch: 0 },   // 자시
    { start: 1, end: 3, branch: 1 },    // 축시
    { start: 3, end: 5, branch: 2 },    // 인시
    { start: 5, end: 7, branch: 3 },    // 묘시
    { start: 7, end: 9, branch: 4 },    // 진시
    { start: 9, end: 11, branch: 5 },   // 사시
    { start: 11, end: 13, branch: 6 },  // 오시
    { start: 13, end: 15, branch: 7 },  // 미시
    { start: 15, end: 17, branch: 8 },  // 신시
    { start: 17, end: 19, branch: 9 },  // 유시
    { start: 19, end: 21, branch: 10 }, // 술시
    { start: 21, end: 23, branch: 11 }  // 해시
];

// 월별 지지 (절기 기준이 정확하지만, 간단하게 월로 매핑)
const MONTH_TO_BRANCH = {
    1: 2,   // 인월 (입춘~경칩)
    2: 3,   // 묘월 (경칩~청명)
    3: 4,   // 진월 (청명~입하)
    4: 5,   // 사월 (입하~망종)
    5: 6,   // 오월 (망종~소서)
    6: 7,   // 미월 (소서~입추)
    7: 8,   // 신월 (입추~백로)
    8: 9,   // 유월 (백로~한로)
    9: 10,  // 술월 (한로~입동)
    10: 11, // 해월 (입동~대설)
    11: 0,  // 자월 (대설~소한)
    12: 1   // 축월 (소한~입춘)
};

module.exports = {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    FIVE_ELEMENTS,
    ELEMENT_GENERATION,
    ELEMENT_DESTRUCTION,
    TIME_TO_BRANCH,
    MONTH_TO_BRANCH
};