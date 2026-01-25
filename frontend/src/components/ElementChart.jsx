import React from 'react';

function ElementChart({ elements }) {
    return (
        <div className="space-y-4">
            {elements.chart.map((element) => {
                const percentage = parseFloat(element.percentage);

                return (
                    <div key={element.element} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: element.color }}
                                ></div>
                                <span className="font-medium text-gray-700">
                  {element.element} ({element.name})
                </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">
                {element.percentage}%
              </span>
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: element.color
                                }}
                            >
                                {percentage > 10 && (
                                    <span className="text-xs font-semibold text-white">
                    {elements.distribution[element.element]}개
                  </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ElementChart;