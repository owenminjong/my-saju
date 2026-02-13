// frontend/src/utils/kakao.js

let kakaoInitialized = false;

/**
 * 카카오 SDK 초기화
 */
export const initKakao = async () => {
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
 * 공유 URL 생성 (세션 데이터 인코딩)
 */
export const createShareUrl = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/share/encode-hash', {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const encodedData = data.data.encodedData;
            const shareUrl = `http://localhost:3000/r/${encodedData}`;
            return { encodedData, shareUrl };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('공유 URL 생성 실패:', error);
        throw error;
    }
};

/**
 * ✅ 공유 URL 생성 (프리미엄: 데이터 직접 전달)
 */
export const createShareUrlWithData = async (resultData) => {
    try {
        const response = await fetch('http://localhost:5000/api/share/encode-hash', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resultData })
        });

        const data = await response.json();

        if (data.success) {
            const encodedData = data.data.encodedData;
            const shareUrl = `http://localhost:3000/r/${encodedData}`;
            return { encodedData, shareUrl };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('공유 URL 생성 실패:', error);
        throw error;
    }
};

/**
 * 카카오톡 공유 (무료 & 프리미엄 통합)
 */
export const shareKakao = async (resultData = null) => {
    await initKakao();

    if (!window.Kakao || !window.Kakao.isInitialized()) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    try {
        // ✅ resultData가 있으면 프리미엄, 없으면 무료
        const { shareUrl } = resultData
            ? await createShareUrlWithData(resultData)
            : await createShareUrl();

        const name = resultData?.user?.name || resultData?.metadata?.userName || resultData?.name || '익명';
        const animal = resultData?.saju?.year?.branch?.animal || '용';
        const birthDate = resultData?.user?.birthDate || resultData?.birthDate || '';
        const monthMatch = birthDate.match(/(\d+)월/);
        const month = monthMatch ? parseInt(monthMatch[1]) : 9;
        const season = month >= 3 && month <= 5 ? '봄' :
            month >= 6 && month <= 8 ? '여름' :
                month >= 9 && month <= 11 ? '가을' : '겨울';

        const birthTime = resultData?.user?.birthTime || resultData?.birthTime || '';
        let timeOfDay = '낮';
        if (birthTime.includes('자시') || birthTime.includes('축시') || birthTime.includes('인시')) {
            timeOfDay = '새벽';
        } else if (birthTime.includes('오시') || birthTime.includes('미시') || birthTime.includes('신시')) {
            timeOfDay = '오후';
        } else if (birthTime.includes('술시') || birthTime.includes('해시')) {
            timeOfDay = '저녁';
        }

        const grades = resultData?.fields || resultData?.metadata?.grades || {};
        const wealthGrade = typeof grades.wealth === 'object' ? grades.wealth.grade : grades.wealth || 'A';
        const careerGrade = typeof grades.career === 'object' ? grades.career.grade : grades.career || 'B';
        const loveGrade = typeof grades.love === 'object' ? grades.love.grade : grades.love || 'B';
        const healthGrade = typeof grades.health === 'object' ? grades.health.grade : grades.health || 'B';

        const gradeText = `재물 ${wealthGrade} | 직업 ${careerGrade} | 연애 ${loveGrade} | 건강 ${healthGrade}`;

        const imageUrl = resultData?.characterImage || resultData?.character_image
            ? `http://localhost:5000${resultData.characterImage || resultData.character_image}`
            : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTgCywlqiWA_6TsPwaWr4rPccdjjCUH-Y9UQ&s';

        console.log('📤 카카오 공유 데이터:', {
            이름: name,
            띠: animal,
            등급: gradeText,
            이미지: imageUrl,
            공유URL: shareUrl
        });

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `${name}님의 ${season} ${timeOfDay}에 태어난 ${animal}띠 운세`,
                description: gradeText,
                imageUrl: imageUrl,
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                },
            },
            buttons: [
                {
                    title: `${name}님의 운세 보러가기`,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
            ],
        });

        console.log('✅ 카카오 공유 완료');

    } catch (error) {
        console.error('❌ 카카오 공유 실패:', error);
        alert('공유에 실패했습니다: ' + error.message);
    }
};

/**
 * URL 복사 (무료 & 프리미엄 통합)
 */
export const copyUrl = async (resultData = null) => {
    try {
        const { shareUrl } = resultData
            ? await createShareUrlWithData(resultData)
            : await createShareUrl();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert('링크가 복사되었습니다!');
            console.log('✅ URL 복사 완료:', shareUrl);
            return true;
        }

        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, 999999);

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (success) {
            alert('링크가 복사되었습니다!');
            console.log('✅ URL 복사 완료 (Fallback):', shareUrl);
            return true;
        } else {
            throw new Error('복사 실패');
        }

    } catch (err) {
        console.error('❌ URL 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
        return false;
    }
};