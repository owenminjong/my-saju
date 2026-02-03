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

            // ✅ 훨씬 짧아진 URL
            const shareUrl = `http://localhost:3000/r/${encodedData}`;

            return {
                encodedData: encodedData,
                shareUrl: shareUrl
            };
        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        console.error('공유 URL 생성 실패:', error);
        throw error;
    }
};

/**
 * 카카오톡 공유 (모바일 최적화)
 */
export const shareKakao = async (resultData) => {
    await initKakao();

    if (!window.Kakao || !window.Kakao.isInitialized()) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    try {
        const { shareUrl } = await createShareUrl();

        const name = resultData.user?.name || resultData.metadata?.userName || '익명';
        const animal = resultData.saju?.year?.branch?.animal || '용';

        const birthDate = resultData.user?.birthDate || '';
        const monthMatch = birthDate.match(/(\d+)월/);
        const month = monthMatch ? parseInt(monthMatch[1]) : 9;
        const season = month >= 3 && month <= 5 ? '봄' :
            month >= 6 && month <= 8 ? '여름' :
                month >= 9 && month <= 11 ? '가을' : '겨울';

        const birthTime = resultData.user?.birthTime || '';
        let timeOfDay = '낮';
        if (birthTime.includes('자시') || birthTime.includes('축시') || birthTime.includes('인시')) {
            timeOfDay = '새벽';
        } else if (birthTime.includes('오시') || birthTime.includes('미시') || birthTime.includes('신시')) {
            timeOfDay = '오후';
        } else if (birthTime.includes('술시') || birthTime.includes('해시')) {
            timeOfDay = '저녁';
        }

        // 등급 데이터 추출
        const grades = resultData.fields || resultData.metadata?.grades || {};
        const wealthGrade = typeof grades.wealth === 'object' ? grades.wealth.grade : grades.wealth || 'A';
        const careerGrade = typeof grades.career === 'object' ? grades.career.grade : grades.career || 'B';
        const loveGrade = typeof grades.love === 'object' ? grades.love.grade : grades.love || 'B';
        const healthGrade = typeof grades.health === 'object' ? grades.health.grade : grades.health || 'B';

        const gradeText = `재물 ${wealthGrade} | 직업 ${careerGrade} | 연애 ${loveGrade} | 건강 ${healthGrade}`;

        console.log('📤 카카오 공유 데이터:', {
            이름: name,
            띠: animal,
            등급: gradeText,
            공유URL: shareUrl
        });

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `${name}님의 ${season} ${timeOfDay}에 태어난 ${animal}띠 운세`,
                description: gradeText,
                imageUrl: 'https://mud-kage.kakao.com/dn/Q2iNx/btqgeRgV54P/VLdBs9cvyn8BJXB3o7N8UK/kakaolink40_original.png',
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                },
            },
            buttons: [
                {
                    title: '내 운세 보기',
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
 * URL 복사 (모바일 최적화)
 */
export const copyUrl = async () => {
    try {
        const { shareUrl } = await createShareUrl();

        // 모바일에서 navigator.clipboard가 더 안정적
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert('링크가 복사되었습니다!');
            console.log('✅ URL 복사 완료:', shareUrl);
            return true;
        }

        // Fallback: 모바일에서도 작동
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        // iOS Safari 지원
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