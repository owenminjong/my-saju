import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SideMenu from '../components/layout/SideMenu';

function MainPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen">
            <Header onMenuOpen={() => setMenuOpen(true)} />

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px 40px'
            }}>
                <div style={{ maxWidth: '900px', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 5rem)',
                        fontWeight: '900',
                        color: 'white',
                        marginBottom: '30px',
                        lineHeight: '1.2'
                    }}>
                        AI 사주 × MBTI
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        color: '#ffd700',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}>
                        72,000가지 개인화 캐릭터 분석
                    </p>
                    <p style={{
                        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                        color: 'rgba(255,255,255,0.9)',
                        marginBottom: '50px',
                        lineHeight: '1.6'
                    }}>
                        동양 사주 + 서양 MBTI로<br />
                        당신만의 인생 전략을 찾아드립니다
                    </p>
                    <button
                        onClick={() => navigate('/input')}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            padding: '20px 60px',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-5px)';
                            e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                        }}
                    >
                        무료 진단 시작 →
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '100px 20px', background: '#f9fafb' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '80px',
                        color: '#1f2937'
                    }}>
                        왜 월령사주인가요?
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '40px'
                    }}>
                        {[
                            { icon: '🎨', title: '72,000가지 조합', desc: '띠 × 계절 × 시간대로 만드는\n세상에 하나뿐인 나만의 캐릭터' },
                            { icon: '🤖', title: 'AI 맞춤 분석', desc: '당신의 성향에 맞춘\n현실적이고 구체적인 솔루션' },
                            { icon: '📊', title: '시각화 데이터', desc: '오행 차트 × 4대 분야 점수로\n한눈에 보는 나의 운세' }
                        ].map((feature, i) => (
                            <div key={i} style={{
                                background: 'white',
                                padding: '40px',
                                borderRadius: '20px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                textAlign: 'center',
                                transition: 'all 0.3s'
                            }}
                                 onMouseOver={(e) => {
                                     e.currentTarget.style.transform = 'translateY(-10px)';
                                     e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                                 }}
                                 onMouseOut={(e) => {
                                     e.currentTarget.style.transform = 'translateY(0)';
                                     e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                 }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{feature.icon}</div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: '1.1rem', color: '#6b7280', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section style={{ padding: '100px 20px', background: 'white' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 'bold',
                        marginBottom: '80px',
                        color: '#1f2937'
                    }}>
                        어떻게 진행되나요?
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {[
                            { num: 1, title: '생년월일시 입력', desc: '이름, 생년월일, 태어난 시간을 입력해주세요' },
                            { num: 2, title: 'AI가 사주 분석', desc: '동서양 철학을 결합한 AI가 당신을 분석합니다' },
                            { num: 3, title: '맞춤형 리포트 확인', desc: '2026년 당신만의 운세와 전략을 확인하세요' }
                        ].map((step, i) => (
                            <React.Fragment key={i}>
                                <div style={{
                                    background: 'white',
                                    padding: '30px',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '30px',
                                    textAlign: 'left'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                                            {step.title}
                                        </h3>
                                        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                                {i < 2 && (
                                    <div style={{ fontSize: '2rem', color: '#d1d5db' }}>↓</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate('/input')}
                        style={{
                            marginTop: '60px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            padding: '18px 50px',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }}
                    >
                        지금 바로 시작하기 →
                    </button>
                </div>
            </section>

            {/* Pricing Section */}
            <section style={{ padding: '100px 20px', background: '#f9fafb' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '80px',
                        color: '#1f2937'
                    }}>
                        요금제 안내
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '40px',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        {/* 무료 베이직 */}
                        <div style={{
                            background: 'white',
                            borderRadius: '30px',
                            padding: '50px 40px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            border: '3px solid #e5e7eb'
                        }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
                                무료 베이직
                            </h3>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>
                                0원
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', color: '#6b7280', fontSize: '1.1rem' }}>
                                {['개인화 캐릭터', '오행 에너지 차트', '4대 분야 등급', '2026년 키워드', '진단 소견서 (300자)', '위기 예고 2가지'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '12px' }}>✓ {item}</li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/input')}
                                style={{
                                    width: '100%',
                                    background: '#374151',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    padding: '18px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer'
                                }}
                            >
                                무료로 시작하기
                            </button>
                        </div>

                        {/* 프리미엄 풀코스 */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '30px',
                            padding: '50px 40px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            border: '5px solid #ffd700',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#dc2626',
                                color: 'white',
                                padding: '8px 25px',
                                borderRadius: '20px',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}>
                                인기
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>
                                프리미엄 풀코스
                            </h3>
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.8rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.6)' }}>
                                    29,800원
                                </span>
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '30px', color: '#ffd700' }}>
                                19,800원
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                                {['베이직 전체 포함', '인생 3막 로드맵', '재물/직업/연애 심층 전략', '12개월 월간 캘린더', '건강 & 개운 아이템'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '12px' }}>✓ {item}</li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/input')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    padding: '18px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                }}
                            >
                                프리미엄 구매하기
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
    );
}

export default MainPage;