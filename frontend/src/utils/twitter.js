// frontend/src/utils/twitter.js

import { createShareUrl } from './kakao';

/**
 * URL 단축 (TinyURL 무료 API 사용)
 */
const shortenUrl = async (longUrl) => {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await response.text();
        return shortUrl;
    } catch (error) {
        console.error('URL 단축 실패:', error);
        return longUrl; // 실패 시 원본 URL
    }
};

/**
 * 트위터 공유 데이터 생성
 */
const createTwitterShareData = (resultData) => {
    const name = resultData.user?.name || resultData.metadata?.userName || '익명';
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

/**
 * 트위터 Intent로 공유 (URL 단축 버전)
 */
const shareTwitterWithIntent = async (text, longUrl) => {
    // ✅ URL 단축
    const shortUrl = await shortenUrl(longUrl);

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;

    if (isMobileDevice()) {
        // 모바일: 직접 이동
        window.location.href = twitterUrl;
    } else {
        // 데스크톱: 팝업
        window.open(
            twitterUrl,
            'twitter-share',
            'width=550,height=420'
        );
    }

    console.log('✅ 트위터 공유 완료');
};

/**
 * 트위터 공유 메인 함수
 */
export const shareTwitter = async (resultData) => {
    try {
        const { shareUrl } = await createShareUrl();
        const { text } = createTwitterShareData(resultData);

        // ✅ Intent 방식으로 실제 공유
        await shareTwitterWithIntent(text, shareUrl);

        return true;

    } catch (error) {
        console.error('❌ 트위터 공유 실패:', error);
        alert('트위터 공유에 실패했습니다.');
        return false;
    }
};

/**
 * 네이티브 공유 (Web Share API)
 */
export const shareNative = async (resultData) => {
    if (!navigator.share) {
        return await shareTwitter(resultData);
    }

    try {
        const { shareUrl } = await createShareUrl();
        const { name, gradeText } = createTwitterShareData(resultData);

        // ✅ URL 단축
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

        console.error('❌ 네이티브 공유 실패:', error);
        return await shareTwitter(resultData);
    }
};

export default shareTwitter;