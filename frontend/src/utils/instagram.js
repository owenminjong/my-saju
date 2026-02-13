// frontend/src/utils/instagram.js

/**
 * 인스타그램 스토리 공유
 */
export async function shareInstagramStory(resultData) {
    try {
        // 모바일 체크
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isMobile) {
            throw new Error('DESKTOP');
        }

        // Web Share API 지원 확인
        if (!navigator.share) {
            throw new Error('NOT_SUPPORTED');
        }

        // 캐릭터 이미지 URL
        const imageUrl = resultData.characterImage
            ? `${window.location.origin}${resultData.characterImage}`
            : null;

        // 공유할 텍스트
        const userName = resultData.user?.name || resultData.name || '당신';
        const shareText = `${userName}님의 2026년 운세

월하(月下)에서 확인하세요!
${window.location.origin}`;

        // 이미지가 있으면 파일로 공유
        if (imageUrl) {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'saju-2026.jpg', { type: 'image/jpeg' });

            await navigator.share({
                title: '2026년 운세',
                text: shareText,
                files: [file]
            });
        } else {
            // 이미지 없으면 URL만
            await navigator.share({
                title: '2026년 운세',
                text: shareText,
                url: window.location.href
            });
        }

        console.log('✅ 공유 성공');
        return true;

    } catch (error) {
        if (error.name === 'AbortError') {
            // 사용자가 취소
            console.log('사용자가 공유를 취소했습니다.');
            return false;
        }

        throw error;
    }
}