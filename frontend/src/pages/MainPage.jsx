import React, { useState } from 'react';
import './MainPage.css';
import SajuInput from "./SajuInput";

const MainPage = () => {
    const [menuActive, setMenuActive] = useState(false);

    const toggleMenu = () => {
        setMenuActive(true);
    };

    const closeMenu = () => {
        setMenuActive(false);
    };

    const handleLoginAlert = () => {
        alert('로그인이 필요합니다.');
    };

    return (
        <div className="wolha-main">
            {/* Navigation */}
            <button className="nav-trigger" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div
                className={`menu-overlay ${menuActive ? 'active' : ''}`}
                onClick={closeMenu}
            />

            <div className={`side-menu ${menuActive ? 'active' : ''}`}>
                <button className="close-btn" onClick={closeMenu}>&times;</button>
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontFamily: "'Noto Serif KR', serif", color: 'var(--gold)', marginBottom: '5px' }}>
                        月下
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>당신의 운명을 읽다</p>
                </div>
                <nav>
                    <button
                        className="menu-link"
                        onClick={(e) => {
                            e.preventDefault();
                            handleLoginAlert();
                        }}
                        style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
                    >
                        내 사주 기록 보기
                    </button>
                    <button
                        className="menu-link"
                        style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
                    >
                        <a href={'/login'}>로그인하기</a>
                    </button>
                    <button
                        className="menu-link"
                        style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
                    >
                        가입하기
                    </button>
                    <button
                        onClick={() => navigate('/saju-input', { state: { mode: 'premium' } })}
                        className="menu-link"
                        style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
                    >
                        유료 사주 보러 가기
                    </button>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="bg-layer bg-sky"></div>
                <div className="bg-layer bg-stars"></div>
                <div className="moon-orb"></div>
                <div className="fog-layer"></div>

                <div className="hero-content">
                    <h1 className="main-title">
                        <span>운명의 길을 비추는 달빛</span>
                        月下
                    </h1>
                    <p className="sub-text">
                        동양의 사주명리와 서양의 심리학을 결합한<br />
                        당신만을 위한 인생 코드를 해석해 드립니다.
                    </p>

                    <div className="social-proof">
                        🔮 이미 <strong>12,847명</strong>이 본인의 운명을 확인했습니다
                    </div>
                    <br />
                    <a href="#features" className="cta-button">
                        월하에 대해 알아보기 ↓
                    </a>
                </div>

                <div className="scroll-indicator">
                    <div>스크롤하여 더 알아보기</div>
                    <div style={{ marginTop: '5px' }}>↓</div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="sec-title">왜 월하(月下)인가요?</h2>
                <p className="sec-desc">72,000가지 조합으로 만나는 나만의 운세</p>

                <div className="feature-grid">
                    <div className="feature-card">
                        <span className="f-icon">🎨</span>
                        <h3 className="f-title">72,000가지 운명 조합</h3>
                        <p className="f-text">
                            단순한 띠별 운세가 아닙니다.<br />
                            띠 × 계절 × 시간대로 조합하여 세상에 하나뿐인 당신만의 캐릭터를 찾아냅니다.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="f-icon">🤖</span>
                        <h3 className="f-title">AI 맞춤 분석 알고리즘</h3>
                        <p className="f-text">
                            고전 명리학 데이터를 학습한 AI가<br />
                            당신의 성향을 분석하여, 모호하지 않고 현실적이며 구체적인 솔루션을 제공합니다.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="f-icon">📊</span>
                        <h3 className="f-title">시각화된 운명 데이터</h3>
                        <p className="f-text">
                            어려운 한자 대신 그래프로 확인하세요.<br />
                            오행 차트와 4대 분야 점수로 나의 운세 흐름을 한눈에 파악할 수 있습니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="process-section">
                <h2 className="sec-title">운명을 읽는 과정</h2>
                <p className="sec-desc">복잡한 절차 없이, 단 3단계로 확인하세요.</p>

                <div className="step-list">
                    <div className="step-item">
                        <div className="step-num">1</div>
                        <div className="step-content">
                            <div className="step-head">생년월일시 입력</div>
                            <div className="step-sub">이름, 생년월일, 태어난 시간을 입력해주세요.</div>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-num">2</div>
                        <div className="step-content">
                            <div className="step-head">월하 AI 분석</div>
                            <div className="step-sub">동서양 전략을 결합한 AI가 당신의 사주를 정밀 분석합니다.</div>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-num">3</div>
                        <div className="step-content">
                            <div className="step-head">맞춤형 리포트 확인</div>
                            <div className="step-sub">당신만의 수호신 캐릭터와 2026년 전략을 확인하세요.</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <a href="#saju-form" className="cta-button">
                        내 사주 무료 확인하기
                    </a>
                </div>
            </section>
            <SajuInput />
        </div>
    );
};

export default MainPage;