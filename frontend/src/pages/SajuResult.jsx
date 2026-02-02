import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';
import ShareModal from '../components/ShareModal';
import { Share2 } from 'lucide-react';

function SajuResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};
    const [showShareModal, setShowShareModal] = useState(false);

    if (!result) {
        navigate('/');
        return null;
    }

    const { user, saju, elements, diagnosis, usage } = result;

    // 진단 결과를 "📊 운명 성적표" 기준으로 분리
    const diagnosisParts = diagnosis ? diagnosis.split('## 📊 운명 성적표') : ['', ''];
    const characterSection = diagnosisParts[0];  // 🎭 캐릭터 섹션
    const afterCharacter = diagnosisParts[1] ? `## 📊 운명 성적표${diagnosisParts[1]}` : '';  // 나머지

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] py-12 px-4">
            <div className="max-w-4xl mx-auto">

                <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl"
                >
                    <Share2 size={20}/> {/* 또는 그냥 텍스트만 */}
                    공유하기
                </button>

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    resultData={result}
                />

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        ✨ {user?.name}님의 인생 코드
                    </h1>
                    <p className="text-white/70">
                        {user?.birthDate} | {user?.birthTime}
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
                    <SajuTable saju={saju}/>
                </div>

                {/* 나머지 AI 진단 (운명 성적표 ~ 끝) */}
                {afterCharacter && (
                    <div
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
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
                                        <blockquote
                                            className="border-l-4 border-[#d4af37] pl-4 italic text-white/80 my-4 text-lg" {...props} />
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
                    <div
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            🔮 오행 분석
                        </h2>
                        <ElementChart elements={elements}/>

                        <div className="mt-6 space-y-3">
                            {elements?.chart?.map((element) => (
                                <div
                                    key={element.element}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{backgroundColor: element.color}}
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
                        <p>📊 분석 토큰: Input {usage.input_tokens} +
                            Output {usage.output_tokens} = {usage.input_tokens + usage.output_tokens} tokens</p>
                    </div>
                )}

                {/* 유료 업그레이드 CTA */}
                <div
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        💎 더 자세한 풀이가 궁금하신가요?
                    </h3>
                    <p className="text-white/80 mb-6">
                        3단계 심층 분석 + 대운 + 신살 + 월별 가이드까지
                        <br/>
                        프리미엄 풀코스로 업그레이드하세요
                    </p>
                    <button
                        className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform">
                        프리미엄으로 업그레이드 →
                    </button>
                </div>

                {/* 다시 하기 */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white transition-colors font-medium"
                    >
                        ← 다시 분석하기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default SajuResult;