import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';

function SajuResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    // 결과 데이터 없으면 입력 페이지로 리다이렉트
    if (!result) {
        navigate('/');
        return null;
    }

    const { user, saju, elements, dayMaster, recommendation, fields, summary } = result;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* 헤더 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {user.name}님의 사주 분석 결과
                    </h1>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                            생년월일: {user.birthDate}
                        </p>
                        <p className="text-sm text-gray-600">
                            태어난 시간: {user.birthTime}
                        </p>
                    </div>
                </div>

                {/* 요약 */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-blue-900 mb-3">
                        📋 종합 요약
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>• {summary.intro}</p>
                        <p>• {summary.dayMaster}</p>
                        <p>• {summary.dominant}</p>
                        <p>• {summary.lacking}</p>
                        <p>• {summary.fields}</p>
                    </div>
                </div>



                {/* 사주팔자 표 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        사주팔자
                    </h2>
                    <SajuTable saju={saju} />
                </div>

                {/* 오행 분석 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        오행 분석
                    </h2>

                    {/* 오행 차트 */}
                    <ElementChart elements={elements} />

                    {/* 오행 상세 */}
                    <div className="mt-6 space-y-3">
                        {elements.chart.map((element) => (
                            <div
                                key={element.element}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: element.color }}
                                    ></div>
                                    <span className="font-medium text-gray-800">
                    {element.element} ({element.name})
                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {elements.distribution[element.element]}개
                  </span>
                                    <span className="font-semibold text-gray-800">
                    {element.percentage}%
                  </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        elements.status[element.element] === '과다' ? 'bg-red-100 text-red-700' :
                                            elements.status[element.element] === '발달' ? 'bg-orange-100 text-orange-700' :
                                                elements.status[element.element] === '적정' ? 'bg-green-100 text-green-700' :
                                                    elements.status[element.element] === '부족' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                    }`}>
                    {elements.status[element.element]}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 일간 분석 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        일간 분석
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">일간:</span>
                            <span className="text-2xl font-bold text-blue-600">
                {dayMaster.stem} ({dayMaster.element})
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">강약:</span>
                            <span className={`px-4 py-2 rounded-lg font-semibold ${
                                dayMaster.strength === '태강' || dayMaster.strength === '신강'
                                    ? 'bg-red-100 text-red-700'
                                    : dayMaster.strength === '중화'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                            }`}>
                {dayMaster.strength}
              </span>
                        </div>
                        <p className="text-gray-700 mt-4 p-4 bg-gray-50 rounded-lg">
                            {dayMaster.description}
                        </p>
                    </div>
                </div>

                {/* 용신 추천 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        용신 추천
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                보충이 필요한 오행
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {recommendation.useful.map((element) => (
                                    <span
                                        key={element}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium"
                                    >
                    {element}
                  </span>
                                ))}
                            </div>
                        </div>

                        {recommendation.avoid.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                    피해야 할 오행
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {recommendation.avoid.map((element) => (
                                        <span
                                            key={element}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium"
                                        >
                      {element}
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-gray-700 mt-4 p-4 bg-gray-50 rounded-lg">
                            {recommendation.description}
                        </p>
                    </div>
                </div>

                {/* ✨ 4대 분야 점수 섹션 추가 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        🎯 4대 분야 운세
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* 재물운 */}
                        <div className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💰</span>
                                    <h3 className="text-lg font-bold text-gray-800">재물운</h3>
                                </div>
                                <div className={`text-3xl font-bold ${
                                    fields.wealth.grade === 'S' ? 'text-red-500' :
                                        fields.wealth.grade === 'A' ? 'text-orange-500' :
                                            fields.wealth.grade === 'B' ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                    {fields.wealth.grade}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all"
                                    style={{ width: `${fields.wealth.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-right">{fields.wealth.score}점</p>
                        </div>

                        {/* 직업운 */}
                        <div className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💼</span>
                                    <h3 className="text-lg font-bold text-gray-800">직업운</h3>
                                </div>
                                <div className={`text-3xl font-bold ${
                                    fields.career.grade === 'S' ? 'text-red-500' :
                                        fields.career.grade === 'A' ? 'text-orange-500' :
                                            fields.career.grade === 'B' ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                    {fields.career.grade}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${fields.career.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-right">{fields.career.score}점</p>
                        </div>

                        {/* 연애운 */}
                        <div className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">💕</span>
                                    <h3 className="text-lg font-bold text-gray-800">연애운</h3>
                                </div>
                                <div className={`text-3xl font-bold ${
                                    fields.love.grade === 'S' ? 'text-red-500' :
                                        fields.love.grade === 'A' ? 'text-orange-500' :
                                            fields.love.grade === 'B' ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                    {fields.love.grade}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-pink-400 to-pink-600 h-3 rounded-full transition-all"
                                    style={{ width: `${fields.love.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-right">{fields.love.score}점</p>
                        </div>

                        {/* 건강운 */}
                        <div className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🏥</span>
                                    <h3 className="text-lg font-bold text-gray-800">건강운</h3>
                                </div>
                                <div className={`text-3xl font-bold ${
                                    fields.health.grade === 'S' ? 'text-red-500' :
                                        fields.health.grade === 'A' ? 'text-orange-500' :
                                            fields.health.grade === 'B' ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                    {fields.health.grade}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                                    style={{ width: `${fields.health.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-right">{fields.health.score}점</p>
                        </div>
                    </div>

                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            💡 <strong>더 자세한 분석이 궁금하신가요?</strong> 프리미엄 풀코스에서 각 분야별 맞춤 전략을 확인하세요!
                        </p>
                        <button className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg font-bold hover:scale-105 transition-transform">
                            프리미엄으로 업그레이드 →
                        </button>
                    </div>
                </div>

                {/* 유료 안내 */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">
                        더 자세한 사주 풀이가 궁금하신가요?
                    </h3>
                    <p className="mb-4 text-purple-100">
                        대운, 십성, 신살 등 상세한 분석과 AI 맞춤 해석을 받아보세요
                    </p>
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                        유료 서비스 보기
                    </button>
                </div>

                {/* 다시 하기 버튼 */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                    >
                        ← 다시 분석하기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default SajuResult;