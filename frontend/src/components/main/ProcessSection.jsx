import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProcessSection() {
    const navigate = useNavigate();

    const steps = [
        {
            number: 1,
            title: '생년월일시 입력',
            description: '이름, 생년월일, 태어난 시간을 입력해주세요'
        },
        {
            number: 2,
            title: 'AI가 사주 분석',
            description: '동서양 철학을 결합한 AI가 당신을 분석합니다'
        },
        {
            number: 3,
            title: '맞춤형 리포트 확인',
            description: '2026년 당신만의 운세와 전략을 확인하세요'
        }
    ];

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-16 text-gray-800">
                    어떻게 진행되나요?
                </h2>

                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-lg">
                                <div className="bg-[#1e3a8a] text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                                    {step.number}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="text-3xl text-gray-400">↓</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/saju-input')}
                    className="mt-12 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform"
                >
                    지금 바로 시작하기 →
                </button>
            </div>
        </section>
    );
}

export default ProcessSection;