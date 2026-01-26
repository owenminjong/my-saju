import React from 'react';
import { useNavigate } from 'react-router-dom';

function PricingSection() {
    const navigate = useNavigate();

    const plans = [
        {
            name: '무료 베이직',
            price: '0원',
            features: [
                '개인화 캐릭터',
                '오행 에너지 차트',
                '4대 분야 등급',
                '2026년 키워드',
                '진단 소견서 (300자)',
                '위기 예고 2가지'
            ],
            buttonText: '무료로 시작하기',
            buttonClass: 'bg-gray-800 hover:bg-gray-900',
            isPremium: false
        },
        {
            name: '프리미엄 풀코스',
            originalPrice: '29,800원',
            price: '19,800원',
            badge: '인기',
            features: [
                '베이직 전체 포함',
                '인생 3막 로드맵',
                '재물/직업/연애 심층 전략',
                '12개월 월간 캘린더',
                '건강 & 개운 아이템'
            ],
            buttonText: '프리미엄 구매하기',
            buttonClass: 'bg-[#d4af37] hover:bg-[#f59e0b]',
            isPremium: true
        }
    ];

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                    요금제 안내
                </h2>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl p-8 relative hover:shadow-xl transition-shadow ${
                                plan.isPremium
                                    ? 'bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white border-4 border-[#d4af37]'
                                    : 'bg-white border-2 border-gray-200'
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white px-4 py-1 rounded-full text-sm font-bold">
                                    {plan.badge}
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-4 ${plan.isPremium ? 'text-white' : 'text-gray-800'}`}>
                                {plan.name}
                            </h3>

                            {plan.originalPrice && (
                                <div className="mb-2">
                  <span className="text-2xl line-through opacity-60">
                    {plan.originalPrice}
                  </span>
                                </div>
                            )}

                            <div className={`text-4xl font-bold mb-6 ${plan.isPremium ? 'text-[#d4af37]' : 'text-gray-800'}`}>
                                {plan.price}
                            </div>

                            <ul className={`space-y-3 mb-8 ${plan.isPremium ? 'opacity-90' : 'text-gray-600'}`}>
                                {plan.features.map((feature, i) => (
                                    <li key={i}>✓ {feature}</li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/saju-input')}
                                className={`w-full text-white py-3 rounded-full font-bold transition-colors ${plan.buttonClass}`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PricingSection;