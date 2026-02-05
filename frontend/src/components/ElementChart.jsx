// components/ElementChart.jsx

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import './ElementChart.css';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

function ElementChart({ elements }) {
    if (!elements || !elements.distribution) {
        return null;
    }

    // ⭐ 한자 포함 레이블
    const elementLabels = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];

    // ⭐ distribution 키는 한글만 사용
    const elementKeys = ['목', '화', '토', '금', '수'];

    const counts = elementKeys.map(el => elements.distribution[el] || 0);

    const chartData = {
        labels: elementLabels,  // ⭐ 한자 포함 레이블 사용
        datasets: [
            {
                label: '오행 분포',
                data: counts,
                backgroundColor: 'rgba(197, 160, 89, 0.2)',
                borderColor: '#c5a059',
                borderWidth: 2,
                pointBackgroundColor: counts.map(count =>
                    count > 4 ? '#ff5e57' : '#c5a059'
                ),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: counts.map(count =>
                    count > 4 ? '#ff3838' : '#d4af37'
                ),
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
            padding: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            },
        },
        scales: {
            r: {
                min: 0,
                max: 4,
                ticks: {
                    stepSize: 1,
                    display: true,
                    backdropColor: 'transparent',
                    color: 'rgba(148, 163, 184, 0.5)',
                    font: {
                        size: 9,
                        family: "'Noto Sans KR', sans-serif",
                    },
                    z: 1,
                    padding: 2,
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.12)',
                    lineWidth: 1,
                    circular: false,
                },
                angleLines: {
                    color: 'rgba(148, 163, 184, 0.15)',
                    lineWidth: 1,
                },
                pointLabels: {
                    color: '#c5a059',
                    font: {
                        size: 14,  // ⭐ 한자 때문에 약간 작게
                        weight: '700',
                        family: "'Noto Serif KR', serif",
                    },
                    padding: 10,  // ⭐ 패딩 약간 증가
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(5, 8, 16, 0.95)',
                titleColor: '#c5a059',
                bodyColor: '#fff',
                borderColor: function(context) {
                    const count = context.tooltip.dataPoints[0].raw;
                    return count > 4 ? '#ff5e57' : '#c5a059';
                },
                borderWidth: 1.5,
                padding: 10,
                displayColors: false,
                titleFont: {
                    size: 13,
                    weight: '700',
                    family: "'Noto Serif KR', serif",
                },
                bodyFont: {
                    size: 12,
                    family: "'Noto Sans KR', sans-serif",
                },
                callbacks: {
                    title: function(context) {
                        // ⭐ 툴팁 타이틀에 한자 표시
                        return context[0].label;
                    },
                    label: function(context) {
                        const count = context.parsed.r;
                        if (count > 4) {
                            return `${count}개 (⚠️ 과다)`;
                        }
                        return `${count}개`;
                    }
                }
            },
        },
        animation: {
            duration: 800,
            easing: 'easeInOutQuart',
        },
        elements: {
            line: {
                tension: 0,
            },
        },
    };

    return (
        <div className="radar-chart-wrapper">
            <Radar data={chartData} options={chartOptions} />

            {counts.some(count => count > 4) && (
                <div className="overflow-warning">
                    ⚠️ 일부 오행이 과다합니다
                </div>
            )}
        </div>
    );
}

export default ElementChart;
