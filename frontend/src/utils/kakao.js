const API_BASE_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

let kakaoInitialized = false;

const maskName = (name) => {
    if (!name || name.length === 0) return '익명';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + 'O';
    return name[0] + 'O'.repeat(name.length - 1);
};

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
        const response = await fetch(`${API_BASE_URL}/api/share/kakao-key`, {
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

export const createShareUrl = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/share/encode-hash`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            const encodedData = data.data.encodedData;
            const shareUrl = `${FRONTEND_URL}/r/${encodedData}`;
            return { encodedData, shareUrl };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('공유 URL 생성 실패:', error);
        throw error;
    }
};

export const createShareUrlWithData = async (resultData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/share/encode-hash`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resultData })
        });
        const data = await response.json();
        if (data.success) {
            const encodedData = data.data.encodedData;
            const shareUrl = `${FRONTEND_URL}/r/${encodedData}`;
            return { encodedData, shareUrl };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('공유 URL 생성 실패:', error);
        throw error;
    }
};

// 클릭 시 fetch 없이 즉시 실행
export const shareKakao = (shareUrl, resultData = null) => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
        alert('카카오톡 공유 기능을 사용할 수 없습니다.');
        return;
    }

    const rawName = resultData?.user?.name || resultData?.metadata?.userName || '익명';
    const name = maskName(rawName);

    // ✅ metadata.character에서 파싱: "흰 용띠 · 가을 · 저녁"
    const characterString = resultData?.metadata?.character || '';
    const animalMatch = characterString.match(/([가-힣]+)띠/);
    const seasonMatch = characterString.match(/띠\s*·\s*([가-힣]+)\s*·/);
    const timeMatch   = characterString.match(/·\s*([가-힣]+)$/);

    const animal    = animalMatch ? animalMatch[1] : (resultData?.imageMetadata?.zodiac || '용');
    const season    = seasonMatch ? seasonMatch[1] : (resultData?.imageMetadata?.season || '');
    const timeOfDay = timeMatch   ? timeMatch[1]   : (resultData?.imageMetadata?.timeOfDay || '');

    const grades = resultData?.fields || {};
    const wealthGrade = typeof grades.wealth === 'object' ? grades.wealth.grade : grades.wealth || 'A';
    const careerGrade = typeof grades.career === 'object' ? grades.career.grade : grades.career || 'B';
    const loveGrade   = typeof grades.love   === 'object' ? grades.love.grade   : grades.love   || 'B';
    const healthGrade = typeof grades.health === 'object' ? grades.health.grade : grades.health || 'B';
    const gradeText = `재물 ${wealthGrade} | 직업 ${careerGrade} | 연애 ${loveGrade} | 건강 ${healthGrade}`;

    const rawImage = resultData?.characterImage || '';
    const imageUrl = rawImage
        ? `${API_BASE_URL}${encodeURI(rawImage)}`
        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTgCywlqiWA_6TsPwaWr4rPccdjjCUH-Y9UQ&s';

    const title = season && timeOfDay
        ? `${name}님의 ${season} ${timeOfDay}에 태어난 ${animal}띠 운세`
        : `${name}님의 ${animal}띠 2026년 운세`;

    // ✅ 여기서 실제로 어떤 값이 들어가는지 확인
    console.log('💬 [shareKakao] rawImage:', rawImage);
    console.log('💬 [shareKakao] imageUrl:', imageUrl);
    console.log('💬 [shareKakao] title:', `${name}님의 ${season} ${timeOfDay}에 태어난 ${animal}띠 운세`);
    console.log('💬 [shareKakao] description:', gradeText);
    console.log('💬 [shareKakao] shareUrl:', shareUrl);
    console.log('💬 [shareKakao] shareUrl 길이:', shareUrl.length);

    try {
        console.log('💬 [shareKakao] sendDefault 호출 직전');
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
        console.log('✅ [shareKakao] sendDefault 호출 완료');
    } catch (error) {
        console.error('❌ [shareKakao] sendDefault 실패:', error);
        console.error('❌ [shareKakao] error.message:', error.message);
        alert('카카오 공유 실패: ' + error.message);
    }
};


// 미리 만들어진 URL로 복사 (fetch 없이 즉시 실행)
export const copyUrlDirect = (shareUrl) => {
    // iOS Safari는 clipboard API를 사용자 제스처 직후에만 허용
    // 가장 확실한 방법은 prompt로 보여주기
    const isIOS = /ipad|iphone/i.test(navigator.userAgent);

    if (isIOS) {
        // iOS는 prompt 창에서 직접 복사하게 안내
        window.prompt('아래 링크를 길게 눌러 복사하세요', shareUrl);
        return true;
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => alert('링크가 복사되었습니다!'))
                .catch(() => {
                    const input = document.createElement('input');
                    input.value = shareUrl;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    alert('링크가 복사되었습니다!');
                });
        } else {
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('링크가 복사되었습니다!');
        }
        return true;
    } catch (err) {
        console.error('❌ URL 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
        return false;
    }
};

// 기존 copyUrl은 웹 호환성 위해 유지
export const copyUrl = async (resultData = null) => {
    try {
        const { shareUrl } = resultData
            ? await createShareUrlWithData(resultData)
            : await createShareUrl();
        return copyUrlDirect(shareUrl);
    } catch (err) {
        console.error('❌ URL 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
        return false;
    }
};