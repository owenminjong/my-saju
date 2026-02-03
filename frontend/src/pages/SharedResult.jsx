// frontend/src/pages/SharedResult.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';

function SharedResult() {
    const { encodedData } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                console.log('📥 공유 데이터 로드 시작');

                // ✅ 짧은 URL (/r/)인지 확인
                const isShortUrl = window.location.pathname.startsWith('/r/');

                let response;
                if (isShortUrl) {
                    // ✅ 짧은 URL: decode-hash POST 요청
                    response = await fetch('http://localhost:5000/api/share/decode-hash', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ encodedData })
                    });
                } else {
                    // 기존 URL: decode GET 요청
                    response = await fetch(
                        `http://localhost:5000/api/share/decode/${encodedData}`,
                        { credentials: 'include' }
                    );
                }

                const data = await response.json();

                if (data.success) {
                    setResultData(data.data);
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
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
                    <p className="text-white text-xl">운세를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 화면
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md text-center border border-white/20">
                    <div className="text-6xl mb-4">😢</div>
                    <h2 className="text-white text-2xl font-bold mb-4">앗!</h2>
                    <p className="text-white/80 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform w-full"
                    >
                        나도 운세 보러가기 →
                    </button>
                </div>
            </div>
        );
    }

    // 데이터 파싱
    const name = resultData?.user?.name || '익명';
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

    // 결과 화면
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] py-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-4">
                        <Share2 className="text-[#d4af37]" size={20} />
                        <span className="text-white font-semibold">공유받은 운세</span>
                    </div>
                </div>

                {/* 메인 카드 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">

                    {/* 이름 & 기본정보 */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-white mb-3">
                            {name}님의 2026년
                        </h1>
                        <div className="flex items-center justify-center gap-3 text-white/80 text-lg">
                            <span className="bg-white/10 px-4 py-2 rounded-full">{animal}띠</span>
                            <span>·</span>
                            <span className="bg-white/10 px-4 py-2 rounded-full">{season}</span>
                            <span>·</span>
                            <span className="bg-white/10 px-4 py-2 rounded-full">{timeOfDay}</span>
                        </div>
                    </div>

                    {/* 캐릭터 영역 */}
                    <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#f59e0b]/20 rounded-2xl p-12 mb-8 text-center border border-[#d4af37]/30">
                        <div className="text-9xl mb-4">
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
                        <p className="text-white text-2xl font-bold">
                            금빛 오라
                        </p>
                    </div>

                    {/* 운세 등급 */}
                    <div className="mb-8">
                        <h3 className="text-white text-xl font-bold text-center mb-6">
                            2026년 운세 등급
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                            {/* 재물 */}
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                <div className="text-white/70 text-sm mb-2">재물운</div>
                                <div className={`text-4xl font-bold ${getGradeColor(grades.wealth)}`}>
                                    {grades.wealth || 'A'}
                                </div>
                            </div>

                            {/* 직업 */}
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                <div className="text-white/70 text-sm mb-2">직업운</div>
                                <div className={`text-4xl font-bold ${getGradeColor(grades.career)}`}>
                                    {grades.career || 'B'}
                                </div>
                            </div>

                            {/* 연애 */}
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                <div className="text-white/70 text-sm mb-2">연애운</div>
                                <div className={`text-4xl font-bold ${getGradeColor(grades.love)}`}>
                                    {grades.love || 'B'}
                                </div>
                            </div>

                            {/* 건강 */}
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                <div className="text-white/70 text-sm mb-2">건강운</div>
                                <div className={`text-4xl font-bold ${getGradeColor(grades.health)}`}>
                                    {grades.health || 'B'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-6 border-t border-white/10">
                        <p className="text-white/80 mb-6 text-lg">
                            🔮 나도 2026년 운세가 궁금하다면?
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-12 py-4 rounded-2xl text-xl font-bold hover:scale-105 transition-transform w-full shadow-lg"
                        >
                            내 운세 보러가기 →
                        </button>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="text-center text-white/50 text-sm">
                    <p>MyLifeCode · 2026년 운세</p>
                </div>

            </div>
        </div>
    );
}

export default SharedResult;