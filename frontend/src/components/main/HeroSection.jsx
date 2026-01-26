import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-[#1e3a8a] via-[#1e40af] to-[#1e293b]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-6xl animate-pulse">✨</div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                    AI가 풀어주는<br/>나만의 인생 코드
                </h1>
                <p className="text-xl text-white/80 mb-4">
                    동양의 사주명리 × 서양의 심리학
                </p>
                <p className="text-lg text-white/70 mb-12">
                    72,000가지 조합으로 만나는 나만의 운세
                </p>

                <button
                    onClick={() => navigate('/saju-input')}
                    className="bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white px-12 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl"
                >
                    무료로 내 사주 확인하기 →
                </button>

                <p className="text-white/60 mt-6 text-sm">
                    🔮 이미 12,847명이 확인했어요
                </p>
            </div>
        </section>
    );
}

export default HeroSection;