import React from 'react';
import './SajuTable.css';

const elTextColor = {
    '목': '#4a8c5c',
    '화': '#c75a3a',
    '토': '#b89a5a',
    '금': '#c9a84c',
    '수': '#4a7a9c',
};

function SajuTable({ saju }) {
    const pillars = [
        { name: '시주', data: saju?.hour },
        { name: '일주', data: saju?.day },
        { name: '월주', data: saju?.month },
        { name: '년주', data: saju?.year },
    ];

    return (
        <div className="st-wrapper">
            {/* 라벨 행 */}
            <div className="st-labels-row">
                {pillars.map((p) => (
                    <div key={p.name} className="st-label">{p.name}</div>
                ))}
            </div>

            {/* 카드 행 */}
            <div className="st-cards-row">
                {pillars.map((pillar) => {
                    const stemEl   = pillar.data?.stem?.element;
                    const branchEl = pillar.data?.branch?.element;
                    const stemColor   = elTextColor[stemEl]   || '#d4c5a0';
                    const branchColor = elTextColor[branchEl] || '#d4c5a0';

                    return (
                        <div key={pillar.name} className="st-card">
                            {/* 천간 */}
                            <div className="st-cell">
                                <div className="st-cell-sub">천간</div>
                                <div className="st-hanja" style={{ color: stemColor }}>
                                    {pillar.data?.stem?.hanja}
                                </div>
                                <div className="st-kr" style={{ color: stemColor }}>
                                    {pillar.data?.stem?.char} · {pillar.data?.stem?.element}
                                </div>
                            </div>

                            <div className="st-divider" />

                            {/* 지지 */}
                            <div className="st-cell">
                                <div className="st-cell-sub">지지</div>
                                <div className="st-hanja" style={{ color: branchColor }}>
                                    {pillar.data?.branch?.hanja}
                                </div>
                                <div className="st-kr" style={{ color: branchColor }}>
                                    {pillar.data?.branch?.char} · {pillar.data?.branch?.element}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SajuTable;