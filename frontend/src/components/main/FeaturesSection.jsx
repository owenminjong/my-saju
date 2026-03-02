import React from 'react';

function FeaturesSection() {
    const features = [
        {
            icon: '🎨',
            title: '72,000가지 조합',
            description: '띠 × 계절 × 시간대로 만드는\n세상에 하나뿐인 나만의 캐릭터'
        },
        {
            icon: '🤖',
            title: 'AI 맞춤 분석',
            description: '당신의 성향에 맞춘\n현실적이고 구체적인 솔루션'
        },
        {
            icon: '📊',
            title: '시각화 데이터',
            description: '오행 차트 × 4대 분야 점수로\n한눈에 보는 나의 운세'
        }
    ];

    return (
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-gray-800 px-2">
                    왜 월령사주인가요?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-100"
                        >
                            <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturesSection;