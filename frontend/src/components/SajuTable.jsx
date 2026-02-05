import React from 'react';
import './SajuTable.css'; // CSS 파일 임포트

function SajuTable({ saju }) {
    // 오행별 색상 매핑
    const elementColors = {
        '목': { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
        '화': { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
        '토': { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
        '금': { bg: 'bg-gray-300/20', border: 'border-gray-300', text: 'text-gray-300' },
        '수': { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' }
    };

    const pillars = [
        { name: '시주', data: saju?.hour },
        { name: '일주', data: saju?.day },
        { name: '월주', data: saju?.month },
        { name: '년주', data: saju?.year }
    ];

    return (
        <div className="saju-table-wrapper">
            {/* 모바일: 세로 레이아웃 */}
            <div className="saju-mobile-layout md:hidden">
                {pillars.map((pillar) => {
                    const stemElement = pillar.data?.stem?.element;
                    const branchElement = pillar.data?.branch?.element;
                    const stemColors = elementColors[stemElement] || elementColors['금'];
                    const branchColors = elementColors[branchElement] || elementColors['금'];

                    return (
                        <div key={pillar.name} className="saju-pillar-card">
                            {/* 주 이름 */}
                            <div className="pillar-header">
                                <span className="pillar-name">{pillar.name}</span>
                            </div>

                            {/* 천간 & 지지 */}
                            <div className="pillar-content">
                                {/* 천간 */}
                                <div className={`pillar-item ${stemColors.bg} border-2 ${stemColors.border}`}>
                                    <div className="item-label">천간</div>
                                    <div className={`item-char ${stemColors.text}`}>
                                        {pillar.data?.stem?.hanja}
                                    </div>
                                    <div className="item-hanja">
                                        {pillar.data?.stem?.char}
                                    </div>
                                    <div className={`item-element ${stemColors.text}`}>
                                        {pillar.data?.stem?.element}
                                    </div>
                                </div>

                                {/* 지지 */}
                                <div className={`pillar-item ${branchColors.bg} border-2 ${branchColors.border}`}>
                                    <div className="item-label">지지</div>
                                    <div className={`item-char ${branchColors.text}`}>
                                        {pillar.data?.branch?.hanja}
                                    </div>
                                    <div className="item-hanja">
                                        {pillar.data?.branch?.char}
                                    </div>
                                    <div className={`item-element ${branchColors.text}`}>
                                        {pillar.data?.branch?.element}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 태블릿+: 그리드 레이아웃 (기존) */}
            {/*<div className="hidden md:block overflow-x-auto">*/}
            {/*    <div className="grid grid-cols-5 gap-3 lg:gap-4 min-w-[600px]">*/}
            {/*         헤더 */}
            {/*        <div className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 flex items-center justify-center border border-white/10">*/}
            {/*            <span className="text-white/70 font-bold text-base lg:text-lg">구분</span>*/}
            {/*        </div>*/}
            {/*        {pillars.map((pillar) => (*/}
            {/*            <div*/}
            {/*                key={pillar.name}*/}
            {/*                className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 flex items-center justify-center border border-white/10"*/}
            {/*            >*/}
            {/*                <span className="text-white font-bold text-base lg:text-lg">{pillar.name}</span>*/}
            {/*            </div>*/}
            {/*        ))}*/}

            {/*         천간 */}
            {/*        <div className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 flex items-center justify-center border border-white/10">*/}
            {/*            <span className="text-white/70 font-bold text-sm lg:text-base">천간</span>*/}
            {/*        </div>*/}
            {/*        {pillars.map((pillar) => {*/}
            {/*            const element = pillar.data?.stem?.element;*/}
            {/*            const colors = elementColors[element] || elementColors['금'];*/}

            {/*            return (*/}
            {/*                <div*/}
            {/*                    key={`stem-${pillar.name}`}*/}
            {/*                    className={`${colors.bg} rounded-lg lg:rounded-xl p-3 lg:p-4 border-2 ${colors.border} flex flex-col items-center justify-center space-y-1 lg:space-y-2`}*/}
            {/*                >*/}
            {/*                    <div className={`text-3xl lg:text-4xl font-bold ${colors.text}`}>*/}
            {/*                        {pillar.data?.stem?.char}*/}
            {/*                    </div>*/}
            {/*                    <div className="text-xs text-white/50">*/}
            {/*                        {pillar.data?.stem?.hanja}*/}
            {/*                    </div>*/}
            {/*                    <div className={`text-xs lg:text-sm font-semibold ${colors.text}`}>*/}
            {/*                        {pillar.data?.stem?.element}*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            );*/}
            {/*        })}*/}

            {/*         지지 */}
            {/*        <div className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 flex items-center justify-center border border-white/10">*/}
            {/*            <span className="text-white/70 font-bold text-sm lg:text-base">지지</span>*/}
            {/*        </div>*/}
            {/*        {pillars.map((pillar) => {*/}
            {/*            const element = pillar.data?.branch?.element;*/}
            {/*            const colors = elementColors[element] || elementColors['금'];*/}

            {/*            return (*/}
            {/*                <div*/}
            {/*                    key={`branch-${pillar.name}`}*/}
            {/*                    className={`${colors.bg} rounded-lg lg:rounded-xl p-3 lg:p-4 border-2 ${colors.border} flex flex-col items-center justify-center space-y-1 lg:space-y-2`}*/}
            {/*                >*/}
            {/*                    <div className={`text-3xl lg:text-4xl font-bold ${colors.text}`}>*/}
            {/*                        {pillar.data?.branch?.char}*/}
            {/*                    </div>*/}
            {/*                    <div className="text-xs text-white/50">*/}
            {/*                        {pillar.data?.branch?.hanja}*/}
            {/*                    </div>*/}
            {/*                    <div className={`text-xs lg:text-sm font-semibold ${colors.text}`}>*/}
            {/*                        {pillar.data?.branch?.element}*/}
            {/*                    </div>*/}
            {/*                    <div className="text-xs text-white/40">*/}
            {/*                        {pillar.data?.branch?.animal}*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            );*/}
            {/*        })}*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}

export default SajuTable;
