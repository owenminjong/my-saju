// frontend/src/pages/SharedResult.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Sparkles } from 'lucide-react';

function SharedResult() {
    const { encodedData } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 이름 마스킹 함수
    const maskName = (name) => {
        if (!name || name.length === 0) return '익명';

        // 1글자: 그대로 표시
        if (name.length === 1) return name;

        // 2글자: 첫글자 + O (예: 김철 -> 김O)
        if (name.length === 2) {
            return name[0] + 'O';
        }

        // 3글자 이상: 첫글자 + OO (예: 신재규 -> 신OO, 김철수 -> 김OO)
        return name[0] + 'O'.repeat(name.length - 1);
    };

    useEffect(() => {
        const fetchResult = async () => {
            try {
                console.log('📥 공유 데이터 로드 시작');

                const isShortUrl = window.location.pathname.startsWith('/r/');

                let response;
                if (isShortUrl) {
                    response = await fetch('http://localhost:5000/api/share/decode-hash', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ encodedData })
                    });
                } else {
                    response = await fetch(
                        `http://localhost:5000/api/share/decode/${encodedData}`,
                        { credentials: 'include' }
                    );
                }

                const data = await response.json();

                if (data.success) {
                    setResultData(data.data);
                    console.log('전체 데이터', data);
                    console.log('✅ 데이터 로드 완료:', data.data.user?.name);
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

    // 로딩 화면
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

    // 에러 화면
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

    // ✅ 데이터 파싱 - 마스킹된 이름 사용
    const originalName = resultData?.user?.name || '익명';
    const maskedName = maskName(originalName);
    const animal = resultData?.saju?.year?.branch?.animal || '용';
    const grades = resultData?.fields || {};

    // 계절 계산
    const birthDate = resultData?.user?.birthDate || '';
    const monthMatch = birthDate.match(/(\d+)월/);
    const month = monthMatch ? parseInt(monthMatch[1]) : 9;
    const season = month >= 3 && month <= 5 ? '봄' :
        month >= 6 && month <= 8 ? '여름' :
            month >= 9 && month <= 11 ? '가을' : '겨울';

    // 시간대 계산
    const birthTime = resultData?.user?.birthTime || '';
    let timeOfDay = '낮';
    if (birthTime.includes('자시') || birthTime.includes('축시') || birthTime.includes('인시')) {
        timeOfDay = '새벽';
    } else if (birthTime.includes('오시') || birthTime.includes('미시') || birthTime.includes('신시')) {
        timeOfDay = '오후';
    } else if (birthTime.includes('술시') || birthTime.includes('해시')) {
        timeOfDay = '저녁';
    }

    // 등급별 색상
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'S': return 'text-red-400';
            case 'A': return 'text-yellow-400';
            case 'B': return 'text-blue-400';
            case 'C': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    // 등급별 배경색
    const getGradeBg = (grade) => {
        switch (grade) {
            case 'S': return 'bg-red-500/20 border-red-500/30';
            case 'A': return 'bg-yellow-500/20 border-yellow-500/30';
            case 'B': return 'bg-blue-500/20 border-blue-500/30';
            case 'C': return 'bg-gray-500/20 border-gray-500/30';
            default: return 'bg-white/5 border-white/10';
        }
    };

    // 결과 화면
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

                    {/* ✅ 이름 & 기본정보 - 마스킹된 이름 표시 */}
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

                    {/* 캐릭터 영역 */}
                    <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#f59e0b]/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-center border border-[#d4af37]/30 relative overflow-hidden">
                        {resultData?.characterImage ? (
                            <img
                                src={`http://localhost:5000${resultData.characterImage}`}
                                alt={`${animal}띠 캐릭터`}
                                className="w-full max-w-xs sm:max-w-md mx-auto rounded-lg sm:rounded-xl shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'block';
                                }}
                            />
                        ) : null}

                        {/* 폴백 이모지 */}
                        <div style={{ display: resultData?.characterImage ? 'none' : 'block' }}>
                            <div className="text-7xl sm:text-8xl md:text-9xl mb-3 sm:mb-4">
                                {animal === '용' ? '🐉' :
                                    animal === '뱀' ? '🐍' :
                                        animal === '말' ? '🐴' :
                                            animal === '양' ? '🐑' :
                                                animal === '원숭이' ? '🐵' :
                                                    animal === '닭' ? '🐓' :
                                                        animal === '개' ? '🐕' :
                                                            animal === '돼지' ? '🐖' :
                                                                animal === '쥐' ? '🐭' :
                                                                    animal === '소' ? '🐮' :
                                                                        animal === '호랑이' ? '🐯' :
                                                                            animal === '토끼' ? '🐰' : '🐉'}
                            </div>
                        </div>

                        <p className="text-white text-lg sm:text-xl md:text-2xl font-bold mt-3 sm:mt-4">
                            {resultData?.imageMetadata?.season || season} {resultData?.imageMetadata?.timeOfDay || timeOfDay}의 {animal}
                        </p>
                    </div>

                    {/* 운세 등급 */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                            <Sparkles className="text-[#d4af37]" size={20} />
                            <h3 className="text-white text-lg sm:text-xl font-bold text-center">
                                2026년 운세 등급
                            </h3>
                        </div>

                        {/* 모바일: 2x2 그리드, 태블릿+: 4열 그리드 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {/* 재물 */}
                            <div className={`${getGradeBg(grades.wealth)} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border transition-all hover:scale-105 active:scale-95`}>
                                <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">재물운</div>
                                <div className={`text-3xl sm:text-4xl font-bold ${getGradeColor(grades.wealth)}`}>
                                    {grades.wealth}
                                </div>
                            </div>

                            {/* 직업 */}
                            <div className={`${getGradeBg(grades.career)} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border transition-all hover:scale-105 active:scale-95`}>
                                <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">직업운</div>
                                <div className={`text-3xl sm:text-4xl font-bold ${getGradeColor(grades.career)}`}>
                                    {grades.career}
                                </div>
                            </div>

                            {/* 연애 */}
                            <div className={`${getGradeBg(grades.love)} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border transition-all hover:scale-105 active:scale-95`}>
                                <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">연애운</div>
                                <div className={`text-3xl sm:text-4xl font-bold ${getGradeColor(grades.love)}`}>
                                    {grades.love}
                                </div>
                            </div>

                            {/* 건강 */}
                            <div className={`${getGradeBg(grades.health)} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border transition-all hover:scale-105 active:scale-95`}>
                                <div className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">건강운</div>
                                <div className={`text-3xl sm:text-4xl font-bold ${getGradeColor(grades.health)}`}>
                                    {grades.health}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-5 sm:pt-6 border-t border-white/10">
                        <p className="text-white/80 mb-4 sm:mb-6 text-base sm:text-lg">
                            🔮 나도 2026년 운세가 궁금하다면?
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold hover:scale-105 active:scale-95 transition-transform w-full shadow-lg"
                        >
                            내 운세 보러가기 →
                        </button>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="text-center text-white/50 text-xs sm:text-sm pb-4">
                    <p>MyLifeCode · 2026년 운세</p>
                </div>

            </div>
        </div>
    );
}

export default SharedResult;
