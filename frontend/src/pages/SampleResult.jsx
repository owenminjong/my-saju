import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';

function SampleResult() {
    const navigate = useNavigate();

    // 샘플 데이터 (하드코딩)
    const sampleData = {
        user: {
            name: "정민종",
            birthDate: "2000년 9월 19일 (양력)",
            birthTime: "오시 (말, 11-13시)"
        },
        saju: {
            hour: {
                stem: { char: "임", hanja: "壬", element: "수" },
                branch: { char: "오", hanja: "午", element: "화", animal: "말" }
            },
            day: {
                stem: { char: "경", hanja: "庚", element: "금" },
                branch: { char: "진", hanja: "辰", element: "토", animal: "용" }
            },
            month: {
                stem: { char: "을", hanja: "乙", element: "목" },
                branch: { char: "유", hanja: "酉", element: "금", animal: "닭" }
            },
            year: {
                stem: { char: "경", hanja: "庚", element: "금" },
                branch: { char: "진", hanja: "辰", element: "토", animal: "용" }
            }
        },
        elements: {
            chart: [
                { element: "목", name: "木", percentage: "12.5", color: "#228B22" },
                { element: "화", name: "火", percentage: "12.5", color: "#DC143C" },
                { element: "토", name: "土", percentage: "25.0", color: "#D2691E" },
                { element: "금", name: "金", percentage: "37.5", color: "#DAA520" },
                { element: "수", name: "水", percentage: "12.5", color: "#4682B4" }
            ],
            distribution: { "목": 1, "화": 1, "토": 2, "금": 3, "수": 1 },
            status: { "목": "부족", "화": "부족", "토": "적정", "금": "발달", "수": "부족" }
        },
        diagnosis: `## 🎭 당신의 사주 캐릭터

**[흰 용띠] [흰 용]**

단풍이 물든 정오의 태양이 빛나는 하늘 | 금빛 오라

"굳건한 의지로 세상을 바라보는 현실주의자"
흰 용띠 · 가을 · 낮

---

## 📊 운명 성적표

| 영역 | 점수 | 등급 |
|------|------|------|
| 재물운 | 81점 | A |
| 직업운 | 63점 | B |
| 연애운 | 63점 | B |
| 건강운 | 70점 | B |

---

## ⚡ 2026년 키워드
**변화**

---

## 📄 진단 소견서
정민종님은 흰 용띠의 강인한 금기운을 타고난 신강한 명식입니다. 37.5%의 금오행이 주도하며 토오행 25%가 뒷받침하여 현실적 판단력과 추진력이 뛰어납니다. 조용하지만 깊은 내면을 가진 성향으로 객관적 사실을 우선시하며 신중한 결정을 내립니다. 재물운이 81점으로 가장 강하여 경제적 안정과 축적 능력이 우수합니다. 목과 화 오행이 각각 12.5%로 균형잡혀 있어 창의성과 열정도 적절히 갖추었습니다. 전체적으로 안정적이고 실용적인 삶을 추구하는 현실주의자형 인물입니다.

---

## 🚨 위기

1. **3월** - 직장에서의 인간관계 갈등이 심화될 때, 당신은 어떻게 객관성을 유지하며 해결할 것인가?

2. **8월** - 중요한 투자 기회 앞에서 보수적 성향과 욕심 사이에서 갈등할 때, 진정한 선택 기준은 무엇인가?`,
        usage: {
            input_tokens: 643,
            output_tokens: 658
        }
    };

    const { user, saju, elements, diagnosis, usage } = sampleData;

    // 진단 결과를 "📊 운명 성적표" 기준으로 분리
    const diagnosisParts = diagnosis ? diagnosis.split('## 📊 운명 성적표') : ['', ''];
    const characterSection = diagnosisParts[0];
    const afterCharacter = diagnosisParts[1] ? `## 📊 운명 성적표${diagnosisParts[1]}` : '';

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] py-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        ✨ {user?.name}님의 인생 코드
                    </h1>
                    <p className="text-white/70">
                        {user?.birthDate} | {user?.birthTime}
                    </p>
                    <p className="text-[#d4af37] text-sm mt-2">
                        📌 이것은 샘플 결과 페이지입니다
                    </p>
                </div>

                {/* 🎭 캐릭터 섹션 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({node, ...props}) => (
                                    <h2 className="text-2xl font-bold text-white mb-6 first:mt-0" {...props} />
                                ),
                                p: ({node, ...props}) => (
                                    <p className="text-white/90 text-lg leading-relaxed mb-4" {...props} />
                                ),
                                strong: ({node, ...props}) => (
                                    <strong className="text-[#d4af37] font-bold" {...props} />
                                ),
                            }}
                        >
                            {characterSection}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* 📋 사주팔자 표 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        📋 사주팔자
                    </h2>
                    <SajuTable saju={saju} />
                </div>

                {/* 나머지 AI 진단 */}
                {afterCharacter && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({node, ...props}) => (
                                        <h2 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0" {...props} />
                                    ),
                                    h3: ({node, ...props}) => (
                                        <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />
                                    ),
                                    p: ({node, ...props}) => (
                                        <p className="text-white/90 text-lg leading-relaxed mb-4" {...props} />
                                    ),
                                    ul: ({node, ...props}) => (
                                        <ul className="list-disc list-inside text-white/90 space-y-2 mb-4" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                        <ol className="list-decimal list-inside text-white/90 space-y-3 mb-4 text-lg" {...props} />
                                    ),
                                    strong: ({node, ...props}) => (
                                        <strong className="text-[#d4af37] font-bold" {...props} />
                                    ),
                                    table: ({node, ...props}) => (
                                        <div className="overflow-x-auto my-6">
                                            <table className="w-full border-collapse bg-white/5" {...props} />
                                        </div>
                                    ),
                                    thead: ({node, ...props}) => (
                                        <thead className="bg-white/10" {...props} />
                                    ),
                                    tbody: ({node, ...props}) => (
                                        <tbody {...props} />
                                    ),
                                    tr: ({node, ...props}) => (
                                        <tr className="border-b border-white/10" {...props} />
                                    ),
                                    th: ({node, ...props}) => (
                                        <th className="px-6 py-4 text-left text-white font-bold text-lg" {...props} />
                                    ),
                                    td: ({node, ...props}) => (
                                        <td className="px-6 py-4 text-white/90 text-lg" {...props} />
                                    ),
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-l-4 border-[#d4af37] pl-4 italic text-white/80 my-4 text-lg" {...props} />
                                    )
                                }}
                            >
                                {afterCharacter}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* 오행 분석 */}
                {elements && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            🔮 오행 분석
                        </h2>
                        <ElementChart elements={elements} />

                        <div className="mt-6 space-y-3">
                            {elements?.chart?.map((element) => (
                                <div
                                    key={element.element}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: element.color }}
                                        ></div>
                                        <span className="font-medium text-white">
                                            {element.element} ({element.name})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/70">
                                            {elements.distribution[element.element]}개
                                        </span>
                                        <span className="font-semibold text-white">
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
                )}

                {/* 토큰 사용량 */}
                {usage && (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mb-6 text-white/60 text-sm">
                        <p>📊 분석 토큰: Input {usage.input_tokens} + Output {usage.output_tokens} = {usage.input_tokens + usage.output_tokens} tokens</p>
                    </div>
                )}

                {/* 유료 업그레이드 CTA */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        💎 더 자세한 풀이가 궁금하신가요?
                    </h3>
                    <p className="text-white/80 mb-6">
                        3단계 심층 분석 + 대운 + 신살 + 월별 가이드까지
                        <br/>
                        프리미엄 풀코스로 업그레이드하세요
                    </p>
                    <button className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform">
                        프리미엄으로 업그레이드 →
                    </button>
                </div>

                {/* 다시 하기 */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white transition-colors font-medium"
                    >
                        ← 메인으로 돌아가기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default SampleResult;