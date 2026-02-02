// frontend/src/pages/SharedResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SharedResult() {
    const { uniqueId } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/share/free/${uniqueId}`,
                    { credentials: 'include' }
                );

                const data = await response.json();

                if (data.success) {
                    setResultData(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error('결과 조회 실패:', err);
                setError('결과를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [uniqueId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center">
                <div className="text-white text-xl">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md text-center">
                    <p className="text-white text-xl mb-6">😢 {error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
                    >
                        나도 분석 받기
                    </button>
                </div>
            </div>
        );
    }

    // 데이터 추출
    const name = resultData.name || '익명';
    const animal = resultData.sajuData?.saju?.year?.branch?.animal || '용';
    const grades = resultData.sajuData?.fields || {};

    // 계절
    const birthDate = resultData.sajuData?.user?.birthDate || '';
    const monthMatch = birthDate.match(/(\d+)월/);
    const month = monthMatch ? parseInt(monthMatch[1]) : 9;
    const season = month >= 3 && month <= 5 ? '봄' :
        month >= 6 && month <= 8 ? '여름' :
            month >= 9 && month <= 11 ? '가을' : '겨울';

    // 시간대
    const birthTime = resultData.sajuData?.user?.birthTime || '';
    let timeOfDay = '낮';
    if (birthTime.includes('오시') || birthTime.includes('미시') || birthTime.includes('신시')) {
        timeOfDay = '오후';
    } else if (birthTime.includes('자시') || birthTime.includes('축시') || birthTime.includes('인시')) {
        timeOfDay = '새벽';
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] py-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* 티저 카드 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">

                    {/* 이름 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {name}님의 2026년
                        </h1>
                        <p className="text-white/70 text-lg">
                            {animal}띠 · {season} · {timeOfDay}
                        </p>
                    </div>

                    {/* 캐릭터 영역 (임시) */}
                    <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#f59e0b]/20 rounded-2xl p-12 mb-8 text-center">
                        <div className="text-8xl mb-4">🐉</div>
                        <p className="text-white text-xl font-bold">
                            금빛 오라
                        </p>
                    </div>

                    {/* 운세 등급 */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="text-center">
                            <div className="text-white/70 text-sm mb-2">재물</div>
                            <div className={`text-3xl font-bold ${
                                grades.wealth?.grade === 'S' ? 'text-red-400' :
                                    grades.wealth?.grade === 'A' ? 'text-yellow-400' :
                                        grades.wealth?.grade === 'B' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                                {grades.wealth?.grade || 'A'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-sm mb-2">직업</div>
                            <div className={`text-3xl font-bold ${
                                grades.career?.grade === 'S' ? 'text-red-400' :
                                    grades.career?.grade === 'A' ? 'text-yellow-400' :
                                        grades.career?.grade === 'B' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                                {grades.career?.grade || 'B'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-sm mb-2">연애</div>
                            <div className={`text-3xl font-bold ${
                                grades.love?.grade === 'S' ? 'text-red-400' :
                                    grades.love?.grade === 'A' ? 'text-yellow-400' :
                                        grades.love?.grade === 'B' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                                {grades.love?.grade || 'B'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-sm mb-2">건강</div>
                            <div className={`text-3xl font-bold ${
                                grades.health?.grade === 'S' ? 'text-red-400' :
                                    grades.health?.grade === 'A' ? 'text-yellow-400' :
                                        grades.health?.grade === 'B' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                                {grades.health?.grade || 'B'}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <p className="text-white/80 mb-6 text-lg">
                            🔮 더 자세한 분석이 궁금하신가요?
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-12 py-4 rounded-2xl text-xl font-bold hover:scale-105 transition-transform w-full"
                        >
                            나도 보러가기 →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SharedResult;