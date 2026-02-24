import { createShareUrl, createShareUrlWithData } from './kakao';

const maskName = (name) => {
    if (!name || name.length === 0) return '익명';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + 'O';
    return name[0] + 'O'.repeat(name.length - 1);
};

const shortenUrl = async (longUrl) => {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await response.text();
        return shortUrl;
    } catch (error) {
        console.error('URL 단축 실패:', error);
        return longUrl;
    }
};

const createTwitterShareData = (resultData) => {
    const rawName = resultData.user?.name || resultData.metadata?.userName || '익명';
    const name = maskName(rawName);
    const grades = resultData.fields || resultData.metadata?.grades || {};

    const wealthGrade = typeof grades.wealth === 'object' ? grades.wealth.grade : grades.wealth || 'A';
    const careerGrade = typeof grades.career === 'object' ? grades.career.grade : grades.career || 'B';
    const loveGrade = typeof grades.love === 'object' ? grades.love.grade : grades.love || 'B';

    const gradeText = `재물 ${wealthGrade} | 직업 ${careerGrade} | 연애 ${loveGrade}`;
    const text = `${name}님의 2026년 운세\n${gradeText}`;

    return { name, gradeText, text };
};

const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const shareTwitterWithIntent = async (text, longUrl) => {
    const shortUrl = await shortenUrl(longUrl);

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;

    if (isMobileDevice()) {
        window.location.href = twitterUrl;
    } else {
        window.open(twitterUrl, 'twitter-share', 'width=550,height=420');
    }

    console.log('✅ 트위터 공유 완료');
};

export const shareTwitter = async (resultData) => {
    try {
        const { shareUrl } = resultData
            ? await createShareUrlWithData(resultData)
            : await createShareUrl();
        const { text } = createTwitterShareData(resultData);

        await shareTwitterWithIntent(text, shareUrl);
        return true;

    } catch (error) {
        console.error('❌ 트위터 공유 실패:', error);
        alert('트위터 공유에 실패했습니다.');
        return false;
    }
};

export const shareNative = async (resultData) => {
    if (!navigator.share) {
        return await shareTwitter(resultData);
    }

    try {
        const { shareUrl } = resultData
            ? await createShareUrlWithData(resultData)
            : await createShareUrl();
        const { name, gradeText } = createTwitterShareData(resultData);

        const shortUrl = await shortenUrl(shareUrl);

        await navigator.share({
            title: `${name}님의 2026년 운세`,
            text: gradeText,
            url: shortUrl
        });

        console.log('✅ 네이티브 공유 완료');
        return true;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('공유 취소됨');
            return false;
        }
        return await shareTwitter(resultData);
    }
};

export default shareTwitter;