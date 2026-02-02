// frontend/src/utils/kakao.js
let kakaoInitialized = false;

/**
 * 카카오 SDK 초기화
 */
export const initKakao = async () => {
    // 이미 초기화됐으면 스킵
    if (kakaoInitialized || (window.Kakao && window.Kakao.isInitialized())) {
        console.log('✅ 카카오 SDK 이미 초기화됨');
        return true;
    }

    if (!window.Kakao) {
        console.error('카카오 SDK가 로드되지 않았습니다.');
        return false;
    }

    try {
        const response = await fetch('http://localhost:5000/api/share/kakao-key', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.data.kakaoJsKey) {
            window.Kakao.init(data.data.kakaoJsKey);
            kakaoInitialized = true;
            console.log('✅ 카카오 SDK 초기화 완료');
            return true;
        }
    } catch (error) {
        console.error('카카오 SDK 초기화 실패:', error);
        return false;
    }
};

/**
 * 카카오톡 공유
 */
export const shareKakao = async (resultData) => {
    await initKakao();

    if (!window.Kakao || !window.Kakao.isInitialized()) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    const name = resultData.user?.name || '익명';
    const uniqueId = resultData.uniqueId;

    if (!uniqueId) {
        alert('공유 링크 생성에 실패했습니다.');
        return;
    }

    const animal = resultData.saju?.year?.branch?.animal || '용';

    const birthDate = resultData.user?.birthDate || '';
    const monthMatch = birthDate.match(/(\d+)월/);
    const month = monthMatch ? parseInt(monthMatch[1]) : 9;
    const season = month >= 3 && month <= 5 ? '봄' :
        month >= 6 && month <= 8 ? '여름' :
            month >= 9 && month <= 11 ? '가을' : '겨울';

    const birthTime = resultData.user?.birthTime || '';
    let timeOfDay = '낮';
    if (birthTime.includes('오시') || birthTime.includes('미시') || birthTime.includes('신시')) {
        timeOfDay = '오후';
    } else if (birthTime.includes('자시') || birthTime.includes('축시') || birthTime.includes('인시')) {
        timeOfDay = '새벽';
    }

    const grades = resultData.fields;
    const gradeText = `재물 ${grades?.wealth?.grade || 'A'} | 직업 ${grades?.career?.grade || 'B'} | 연애 ${grades?.love?.grade || 'B'}`;

    window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `${name}님의 2026년 운세`,
            description: `${animal}띠 · ${season} · ${timeOfDay}\n${gradeText}`,
            imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=400&fit=crop', // 🆕 변경
            link: {
                mobileWebUrl: `http://localhost:3000/result/${uniqueId}`,
                webUrl: `http://localhost:3000/result/${uniqueId}`,
            },
        },
    });
};

/**
 * URL 복사
 */
export const copyUrl = async (uniqueId) => {
    const shareUrl = `http://localhost:3000/result/${uniqueId}`;

    try {
        await navigator.clipboard.writeText(shareUrl);
        return true;
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    }
};

/**
 * 트위터 공유
 */
export const shareTwitter = (resultData) => {
    const name = resultData.user?.name || '익명';
    const uniqueId = resultData.uniqueId;

    if (!uniqueId) {
        alert('공유 링크 생성에 실패했습니다.');
        return;
    }

    const grades = resultData.fields;
    const gradeText = `재물 ${grades?.wealth?.grade} | 직업 ${grades?.career?.grade} | 연애 ${grades?.love?.grade}`;
    const text = `${name}님의 2026년 운세\n${gradeText}`;
    const url = `http://localhost:3000/result/${uniqueId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, '_blank', 'width=600,height=400');
};