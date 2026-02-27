// frontend/src/utils/instagram.js
const API_BASE_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

const GRADE_COLORS = {
    S: '#f87171',
    A: '#fbbf24',
    B: '#60a5fa',
    C: '#9ca3af',
    D: '#6b7280',
};

const maskName = (name) => {
    if (!name || name.length === 0) return '익명';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + 'O';
    return name[0] + 'O'.repeat(name.length - 1);
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
            const img2 = new Image();
            img2.onload = () => resolve(img2);
            img2.onerror = () => reject(new Error('이미지 로드 실패'));
            img2.src = src;
        };
        img.src = src;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawRadarChart(ctx, cx, cy, radius, data, labels, maxVal = 8) {
    const sides = 5;
    const angleOffset = -Math.PI / 2;
    const angleStep = (Math.PI * 2) / sides;

    const getPoint = (i, r) => ({
        x: cx + r * Math.cos(angleOffset + angleStep * i),
        y: cy + r * Math.sin(angleOffset + angleStep * i),
    });

    // 격자 (4단계)
    for (let level = 1; level <= 4; level++) {
        const r = (radius * level) / 4;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const p = getPoint(i, r);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(148,163,184,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // 축선
    for (let i = 0; i < sides; i++) {
        const p = getPoint(i, radius);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(148,163,184,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // 데이터 영역
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const r = (data[i] / maxVal) * radius;
        const p = getPoint(i, r);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(197,160,89,0.25)';
    ctx.fill();
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 포인트
    for (let i = 0; i < sides; i++) {
        const r = (data[i] / maxVal) * radius;
        const p = getPoint(i, r);
        const isOver = data[i] > 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = isOver ? '#ff5e57' : '#c5a059';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }

    // ✅ 라벨: 한자 + 한글 (목(木) 형식) + 배경 박스
    const labelRadius = radius + 95;
    labels.forEach((label, i) => {
        const p = getPoint(i, labelRadius);

        ctx.save();
        ctx.font = 'bold 28px serif';
        const tw = ctx.measureText(label).width;
        roundRect(ctx, p.x - tw / 2 - 14, p.y - 24, tw + 28, 48, 10);
        ctx.fillStyle = 'rgba(11,16,26,0.75)';
        ctx.fill();
        ctx.restore();

        ctx.font = 'bold 28px serif';
        ctx.fillStyle = '#c5a059';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, p.x, p.y);
    });

    // 수치
    for (let i = 0; i < sides; i++) {
        const r = (data[i] / maxVal) * radius;
        const p = getPoint(i, r);
        const isOver = data[i] > 4;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = isOver ? '#ff5e57' : 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(data[i]), p.x, p.y - 20);
    }

    ctx.textBaseline = 'alphabetic';
}

function normalizeData(resultData) {
    const name =
        resultData?.user?.name ||
        resultData?.name ||
        '';

    const birthDate =
        resultData?.birthDate ||
        resultData?.user?.birthDate ||
        '';

    const gender =
        resultData?.gender ||
        (resultData?.imageMetadata?.gender === '남' ? 'M' :
            resultData?.imageMetadata?.gender === '여' ? 'F' : '') ||
        '';

    const characterImage =
        resultData?.characterImage ||
        resultData?.character_image ||
        '';

    const elements = resultData?.elements || null;
    const fields   = resultData?.fields   || null;

    return { name, birthDate, gender, characterImage, elements, fields };
}

async function createShareCanvas(resultData) {
    const W = 1080;
    const H = 1920;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const { name, birthDate, gender, characterImage, elements, fields } = normalizeData(resultData);
    const maskedName = maskName(name);

    // ── 배경 ──────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0,   '#0b101a');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1,   '#0d1117');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── 별빛 ──────────────────────────────────────────
    for (let i = 0; i < 150; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * H * 0.6;
        const sr = Math.random() * 2 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.5 + 0.15).toFixed(2)})`;
        ctx.fill();
    }

    // ── 상단 황금 장식선 ──────────────────────────────
    const topLine = ctx.createLinearGradient(0, 0, W, 0);
    topLine.addColorStop(0,   'transparent');
    topLine.addColorStop(0.3, '#d4af37');
    topLine.addColorStop(0.7, '#f0c040');
    topLine.addColorStop(1,   'transparent');
    ctx.fillStyle = topLine;
    ctx.fillRect(0, 0, W, 4);

    // ── 브랜드명 ──────────────────────────────────────
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('月下사주', W / 2, 105);

    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'rgba(212,175,55,0.65)';
    ctx.fillText('2026년 운세 리포트', W / 2, 158);

    ctx.beginPath();
    ctx.moveTo(W / 2 - 140, 182);
    ctx.lineTo(W / 2 + 140, 182);
    ctx.strokeStyle = 'rgba(212,175,55,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── 캐릭터 이미지 ─────────────────────────────────
    const IMG_X = 120, IMG_Y = 210, IMG_W = 840, IMG_H = 640;

    if (characterImage) {
        const imageUrl = characterImage.startsWith('http')
            ? characterImage
            : `${API_BASE_URL}${characterImage}`;
        try {
            const charImg = await loadImage(imageUrl);

            ctx.save();
            roundRect(ctx, IMG_X, IMG_Y, IMG_W, IMG_H, 36);
            ctx.clip();

            const scale = Math.max(IMG_W / charImg.width, IMG_H / charImg.height);
            const dw = charImg.width * scale;
            const dh = charImg.height * scale;

            const dx = IMG_X + (IMG_W - dw) / 2;
            // ✅ 이미지 하단 기준 정렬 → 캐릭터(하단) 중심으로 보임
            const dy = IMG_Y + IMG_H - dh;

            ctx.drawImage(charImg, dx, dy, dw, dh);

            // 상단 페이드
            const fadeTop = ctx.createLinearGradient(0, IMG_Y, 0, IMG_Y + IMG_H * 0.3);
            fadeTop.addColorStop(0, 'rgba(11,16,26,0.6)');
            fadeTop.addColorStop(1, 'rgba(11,16,26,0)');
            ctx.fillStyle = fadeTop;
            ctx.fillRect(IMG_X, IMG_Y, IMG_W, IMG_H);

            // 하단 페이드
            const fadeBot = ctx.createLinearGradient(0, IMG_Y + IMG_H * 0.65, 0, IMG_Y + IMG_H);
            fadeBot.addColorStop(0, 'rgba(11,16,26,0)');
            fadeBot.addColorStop(1, 'rgba(11,16,26,0.85)');
            ctx.fillStyle = fadeBot;
            ctx.fillRect(IMG_X, IMG_Y, IMG_W, IMG_H);

            ctx.restore();

            // 테두리
            ctx.save();
            roundRect(ctx, IMG_X, IMG_Y, IMG_W, IMG_H, 36);
            ctx.strokeStyle = 'rgba(212,175,55,0.45)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

        } catch (e) {
            ctx.save();
            roundRect(ctx, IMG_X, IMG_Y, IMG_W, IMG_H, 36);
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fill();
            ctx.font = '120px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.textAlign = 'center';
            ctx.fillText('🔮', W / 2, IMG_Y + IMG_H / 2 + 40);
            ctx.restore();
        }
    }

    // ── 이름 (마스킹) - 이미지와 간격 확보 ───────────
    const nameY = IMG_Y + IMG_H + 90; // ✅ 65 → 90으로 여백 증가

    ctx.textAlign = 'center';
    ctx.font = 'bold 72px serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${maskedName}님의 2026년`, W / 2, nameY);

    if (birthDate) {
        const genderText = gender === 'M' ? '남성' : gender === 'F' ? '여성' : '';
        ctx.font = '28px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`${birthDate}${genderText ? '  ·  ' + genderText : ''}`, W / 2, nameY + 48);
    }

    // ── 운세 등급 카드 4개 ────────────────────────────
    const CARD_W = 185;
    const CARD_H = 175;
    const CARD_GAP = 18;
    const CARDS_TOTAL_W = CARD_W * 4 + CARD_GAP * 3;
    const CARD_START_X = (W - CARDS_TOTAL_W) / 2;
    const CARD_Y = nameY + 80;

    const fieldDefs = [
        { label: '재물운', key: 'wealth' },
        { label: '직업운', key: 'career' },
        { label: '연애운', key: 'love' },
        { label: '건강운', key: 'health' },
    ];

    fieldDefs.forEach(({ label, key }, i) => {
        const rawGrade = fields?.[key];
        const grade = (typeof rawGrade === 'object' ? rawGrade?.grade : rawGrade) || 'C';
        const color = GRADE_COLORS[grade] || GRADE_COLORS['C'];
        const cx = CARD_START_X + i * (CARD_W + CARD_GAP);

        ctx.save();
        roundRect(ctx, cx, CARD_Y, CARD_W, CARD_H, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        ctx.strokeStyle = `${color}55`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 60px sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(grade, cx + CARD_W / 2, CARD_Y + CARD_H * 0.63);
        ctx.restore();

        ctx.font = '22px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx + CARD_W / 2, CARD_Y + CARD_H - 18);
    });

    // ── 오각형 레이더 차트 ────────────────────────────
    const elementKeys = ['목', '화', '토', '금', '수'];
    // ✅ 한글 + 한자 복원
    const elementLabels = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
    const distribution = elements?.distribution || {};
    const counts = elementKeys.map(k => distribution[k] || 0);
    const maxVal = Math.max(...counts, 4);

    const RADAR_R = 200;
    const RADAR_CX = W / 2;
    // ✅ 카드 하단 + 반경 + 라벨 공간 확보 → 상단 꼭짓점이 카드와 절대 안 겹침
    const RADAR_CY = CARD_Y + CARD_H + RADAR_R + 95 + 60;

    drawRadarChart(ctx, RADAR_CX, RADAR_CY, RADAR_R, counts, elementLabels, maxVal);

    // ── 하단 장식선 ───────────────────────────────────
    const botLine = ctx.createLinearGradient(0, 0, W, 0);
    botLine.addColorStop(0,   'transparent');
    botLine.addColorStop(0.3, '#d4af37');
    botLine.addColorStop(0.7, '#f0c040');
    botLine.addColorStop(1,   'transparent');
    ctx.fillStyle = botLine;
    ctx.fillRect(0, H - 4, W, 4);

    return canvas;
}

export async function shareInstagramStory(resultData, cardElement = null) {
    console.log('📸 [Instagram] 공유 시작');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) throw new Error('DESKTOP');
    if (!navigator.share) throw new Error('NOT_SUPPORTED');

    try {
        console.log('🎨 [Instagram] Canvas 카드 생성 중...');
        const canvas = await createShareCanvas(resultData);

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                (b) => b ? resolve(b) : reject(new Error('blob 생성 실패')),
                'image/jpeg',
                0.92
            );
        });

        console.log('✅ [Instagram] 이미지 생성 완료, blob size:', blob.size);

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