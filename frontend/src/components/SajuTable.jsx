import React from 'react';

function SajuTable({ saju }) {
    const pillars = [
        { name: '시주', data: saju.hour },
        { name: '일주', data: saju.day },
        { name: '월주', data: saju.month },
        { name: '년주', data: saju.year }
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                        구분
                    </th>
                    {pillars.map((pillar) => (
                        <th
                            key={pillar.name}
                            className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                        >
                            {pillar.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {/* 천간 */}
                <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium bg-gray-50">
                        천간
                    </td>
                    {pillars.map((pillar) => (
                        <td
                            key={`stem-${pillar.name}`}
                            className="border border-gray-300 px-4 py-3 text-center"
                        >
                            <div className="text-2xl font-bold text-gray-800">
                                {pillar.data.stem.char}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {pillar.data.stem.hanja}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {pillar.data.stem.element}
                            </div>
                        </td>
                    ))}
                </tr>

                {/* 지지 */}
                <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium bg-gray-50">
                        지지
                    </td>
                    {pillars.map((pillar) => (
                        <td
                            key={`branch-${pillar.name}`}
                            className="border border-gray-300 px-4 py-3 text-center"
                        >
                            <div className="text-2xl font-bold text-gray-800">
                                {pillar.data.branch.char}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {pillar.data.branch.hanja}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {pillar.data.branch.element}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {pillar.data.branch.animal}
                            </div>
                        </td>
                    ))}
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SajuTable;