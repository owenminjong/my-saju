// frontend/src/utils/instagram.js

const API_BASE_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

export async function shareInstagramStory(resultData, cardElement = null) {
    console.log('📸 cardElement:', cardElement); // ← 추가
    console.log('📸 cardElement null?', cardElement === null);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) throw new Error('DESKTOP');
    if (!navigator.share) throw new Error('NOT_SUPPORTED');

    try {
        let blob;

        if (cardElement) {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#1e293b',
                scale: 2,
                logging: false,
            });
            blob = await new Promise((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.92)
            );
        } else {
            const rawImage = resultData?.characterImage || resultData?.character_image || '';
            const imageUrl = rawImage.startsWith('http')
                ? rawImage
                : `${API_BASE_URL}${rawImage}`;
            const response = await fetch(imageUrl, { mode: 'cors' });
            blob = await response.blob();
        }

        const file = new File([blob], 'wolhasaju-2026.jpg', { type: 'image/jpeg' });
        const canShareFile = navigator.canShare && navigator.canShare({ files: [file] });

        if (canShareFile) {
            await navigator.share({
                files: [file],
                title: '2026년 운세',
                text: `나의 2026년 운세\n월하사주에서 확인하세요!\n${FRONTEND_URL}`,
            });
            return { success: true };
        }

        return await fallbackDownload(blob);

    } catch (error) {
        if (error.name === 'AbortError') return { success: false, cancelled: true };
        throw error;
    }
}

async function fallbackDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wolhasaju-2026.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('이미지가 저장되었습니다!\n인스타그램 앱에서 스토리에 올려주세요 📸');
    return { success: true, method: 'download' };
}