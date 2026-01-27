import React from 'react';

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
        <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-4">

                {/* 헤더 */}
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center border border-white/10">
                    <span className="text-white/70 font-bold text-lg">구분</span>
                </div>
                {pillars.map((pillar) => (
                    <div
                        key={pillar.name}
                        className="bg-white/5 rounded-xl p-4 flex items-center justify-center border border-white/10"
                    >
                        <span className="text-white font-bold text-lg">{pillar.name}</span>
                    </div>
                ))}

                {/* 천간 */}
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center border border-white/10">
                    <span className="text-white/70 font-bold">천간</span>
                </div>
                {pillars.map((pillar) => {
                    const element = pillar.data?.stem?.element;
                    const colors = elementColors[element] || elementColors['금'];

                    return (
                        <div
                            key={`stem-${pillar.name}`}
                            className={`${colors.bg} rounded-xl p-4 border-2 ${colors.border} flex flex-col items-center justify-center space-y-2`}
                        >
                            <div className={`text-4xl font-bold ${colors.text}`}>
                                {pillar.data?.stem?.char}
                            </div>
                            <div className="text-xs text-white/50">
                                {pillar.data?.stem?.hanja}
                            </div>
                            <div className={`text-sm font-semibold ${colors.text}`}>
                                {pillar.data?.stem?.element}
                            </div>
                        </div>
                    );
                })}

                {/* 지지 */}
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center border border-white/10">
                    <span className="text-white/70 font-bold">지지</span>
                </div>
                {pillars.map((pillar) => {
                    const element = pillar.data?.branch?.element;
                    const colors = elementColors[element] || elementColors['금'];

                    return (
                        <div
                            key={`branch-${pillar.name}`}
                            className={`${colors.bg} rounded-xl p-4 border-2 ${colors.border} flex flex-col items-center justify-center space-y-2`}
                        >
                            <div className={`text-4xl font-bold ${colors.text}`}>
                                {pillar.data?.branch?.char}
                            </div>
                            <div className="text-xs text-white/50">
                                {pillar.data?.branch?.hanja}
                            </div>
                            <div className={`text-sm font-semibold ${colors.text}`}>
                                {pillar.data?.branch?.element}
                            </div>
                            <div className="text-xs text-white/40">
                                {pillar.data?.branch?.animal}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default SajuTable;