// frontend/src/pages/SharedResult.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Sparkles } from 'lucide-react';
import ShareModal from '../components/ShareModal';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

function SharedResult() {
    const { encodedData } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const cardRef = useRef(null);

    const maskName = (name) => {
        if (!name || name.length === 0) return '익명';
        if (name.length === 1) return name;
        if (name.length === 2) return name[0] + 'O';
        return name[0] + 'O'.repeat(name.length - 1);
    };

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const isShortUrl = window.location.pathname.startsWith('/r/');
                let response;

                if (isShortUrl) {
                    response = await fetch(`${API_BASE_URL}/api/share/decode-hash`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ encodedData })
                    });
                } else {
                    response = await fetch(
                        `${API_BASE_URL}/api/share/decode/${encodedData}`,
                        { credentials: 'include' }
                    );
                }

                const data = await response.json();
                if (data.success) {
                    setResultData(data.data);
                } else {
                    setError(data.message || '결과를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.error('❌ 결과 조회 실패:', err);
                setError('결과를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (encodedData) {
            fetchResult();
        } else {
            setError('유효하지 않은 공유 링크입니다.');
            setLoading(false);
        }
    }, [encodedData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
                    <p className="text-white text-lg sm:text-xl">운세를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border border-white/20">
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">😢</div>
                    <h2 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4">앗!</h2>
                    <p className="text-white/80 text-sm sm:text-base mb-5 sm:mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:scale-105 active:scale-95 transition-transform w-full"
                    >
                        나도 운세 보러가기 →
                    </button>
                </div>
            </div>
        );
    }

    let imageMetadata = resultData?.imageMetadata;
    if (typeof imageMetadata === 'string') {
        try { imageMetadata = JSON.parse(imageMetadata); }
        catch (e) { imageMetadata = {}; }
    }

    const originalName = resultData?.user?.name || '익명';
    const maskedName = maskName(originalName);
    const characterString = resultData?.metadata?.character || '';
    const animalMatch = characterString.match(/([가-힣]+)띠/);
    const animal = animalMatch ? animalMatch[1] : (imageMetadata?.zodiac || '용');

    const normalizeFields = (fields) => {
        if (!fields) return { wealth: 'C', career: 'C', love: 'C', health: 'C' };
        const normalized = {};
        for (const [key, value] of Object.entries(fields)) {
            normalized[key] = typeof value === 'object' ? (value.grade || 'C') : value;
        }
        return normalized;
    };
    const grades = normalizeFields(resultData?.fields);

    const seasonMatch = characterString.match(/띠\s*·\s*([가-힣]+)\s*·/);
    const timeMatch = characterString.match(/·\s*([가-힣]+)$/);
    const season = seasonMatch ? seasonMatch[1] : (imageMetadata?.season || '');
    const timeOfDay = timeMatch ? timeMatch[1] : (imageMetadata?.timeOfDay || '');

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'S': return 'text-red-400';
            case 'A': return 'text-yellow-400';
            case 'B': return 'text-blue-400';
            case 'C': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const getGradeBg = (grade) => {
        switch (grade) {
            case 'S': return 'bg-red-500/20 border-red-500/30';
            case 'A': return 'bg-yellow-500/20 border-yellow-500/30';
            case 'B': return 'bg-blue-500/20 border-blue-500/30';
            case 'C': return 'bg-gray-500/20 border-gray-500/30';
            default: return 'bg-white/5 border-white/10';
        }
    };

    const getAnimalEmoji = (animalName) => {
        const emojiMap = {
            '용': '🐉', '뱀': '🐍', '말': '🐴', '양': '🐑',
            '원숭이': '🐵', '닭': '🐓', '개': '🐕', '돼지': '🐖',
            '쥐': '🐭', '소': '🐮', '호랑이': '🐯', '토끼': '🐰'
        };
        return emojiMap[animalName] || '🐉';
    };

    const gradeColor = (grade) => {
        return grade === 'S' ? '#f87171' : grade === 'A' ? '#fbbf24' : grade === 'B' ? '#60a5fa' : '#9ca3af';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] py-4 sm:py-8 md:py-12 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-3 sm:mb-4">
                        <Share2 className="text-[#d4af37]" size={16} />
                        <span className="text-white text-sm sm:text-base font-semibold">공유받은 운세</span>
                    </div>
                </div>

                {/* 메인 카드 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20 mb-4 sm:mb-6">

                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                            {maskedName}님의 2026년
                        </h1>
                        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-white/80 text-sm sm:text-base md:text-lg">
                            <span className="bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">{animal}띠</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">{season}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">{timeOfDay}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#f59e0b]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-center border border-[#d4af37]/30 relative overflow-hidden">
                        {resultData?.characterImage ? (
                            <img
                                src={`${API_BASE_URL}${resultData.characterImage}`}
                                alt={`${animal}띠 캐릭터`}
                                className="w-full max-w-xs sm:max-w-md mx-auto rounded-lg sm:rounded-xl shadow-lg"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <div style={{ display: resultData?.characterImage ? 'none' : 'block' }}>
                            <div className="text-7xl sm:text-8xl md:text-9xl mb-3 sm:mb-4">
                                {getAnimalEmoji(animal)}
                            </div>
                        </div>
                        <p className="text-white text-lg sm:text-xl md:text-2xl font-bold mt-3 sm:mt-4">
                            {season} {timeOfDay}의 {animal}
                        </p>
                    </div>

                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                            <Sparkles className="text-[#d4af37]" size={20} />
                            <h3 className="text-white text-lg sm:text-xl font-bold text-center">2026년 운세 등급</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {[
                                { label: '재물운', key: 'wealth' },
                                { label: '직업운', key: 'career' },
                                { label: '연애운', key: 'love' },
                                { label: '건강운', key: 'health' },
                            ].map(({ label, key }) => (
                                <div key={key} className={`${getGradeBg(grades[key])} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border`}>
                                    <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">{label}</div>
                                    <div className={`text-3xl sm:text-4xl font-bold ${getGradeColor(grades[key])}`}>{grades[key]}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center pt-5 sm:pt-6 border-t border-white/10">
                        <p className="text-white/80 mb-4 sm:mb-6 text-base sm:text-lg">🔮 나도 2026년 운세가 궁금하다면?</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold hover:scale-105 active:scale-95 transition-transform w-full shadow-lg"
                        >
                            내 운세 보러가기 →
                        </button>
                    </div>
                </div>

                {/* 공유 버튼 */}
                <div className="text-center mb-4">
                    <button
                        onClick={() => setShareModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all"
                    >
                        <Share2 size={18} />
                        <span>나도 공유하기</span>
                    </button>
                </div>

                {/* 푸터 */}
                <div className="text-center text-white/50 text-xs sm:text-sm pb-4">
                    <p>월하사주 · 2026년 운세</p>
                </div>
            </div>

            {/* ✅ 인스타 공유용 숨겨진 캡처 카드 */}
            <div
                ref={cardRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '0',
                    width: '390px',
                    backgroundColor: '#1e293b',
                    padding: '32px 24px',
                    borderRadius: '24px',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ color: '#d4af37', fontSize: '13px', letterSpacing: '2px', marginBottom: '8px', margin: '0 0 8px' }}>
                        月下사주 · 2026년 운세
                    </p>
                    <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                        {maskedName}님의 2026년
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '8px 0 0' }}>
                        {animal}띠 · {season} · {timeOfDay}
                    </p>
                </div>

                {resultData?.characterImage && (
                    <img
                        src={`${API_BASE_URL}${resultData.characterImage}`}
                        alt="캐릭터"
                        crossOrigin="anonymous"
                        style={{ width: '100%', borderRadius: '16px', marginBottom: '20px', display: 'block' }}
                    />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { label: '재물운', key: 'wealth' },
                        { label: '직업운', key: 'career' },
                        { label: '연애운', key: 'love' },
                        { label: '건강운', key: 'health' },
                    ].map(({ label, key }) => (
                        <div key={key} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 4px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '0 0 4px' }}>{label}</p>
                            <p style={{ color: gradeColor(grades[key]), fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{grades[key]}</p>
                        </div>
                    ))}
                </div>

                <div style={{ backgroundColor: '#d4af37', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px' }}>
                        🔮 나도 2026년 운세 보러가기
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0 }}>
                        {FRONTEND_URL}
                    </p>
                </div>
            </div>

            {/* ShareModal */}
            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                resultData={resultData}
                cardRef={cardRef}
            />
        </div>
    );
}

export default SharedResult;