import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import SajuInput from "./SajuInput";

const MainPage = () => {
    const navigate = useNavigate();
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
                        月下神女
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>당신의 운명을 읽는 신비로운 달빛</p>
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
                        onClick={() => navigate('/login')}
                        style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}
                    >
                        로그인하기
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

                {/* 중앙 달 영상 */}
                <div className="moon-container">
                    <div className="moon-video-wrapper">
                        <video autoPlay muted loop playsInline className="moon-video">
                            <source src="/a.mp4" type="video/mp4" />
                            브라우저가 비디오를 지원하지 않습니다.
                        </video>
                        <div className="moon-glow"></div>
                    </div>
                </div>

                <div className="fog-layer"></div>

                <div className="hero-content">
                    <h1 className="main-title">
                        <span>운명의 길을 비추는 달빛</span>
                        월하신녀
                    </h1>
                    <p className="sub-text">
                        영험한 기운의 명리학과 현대적 해석의 만남<br />
                        월하신녀가 당신만을 위한 인생 코드를 풀이해 드립니다.
                    </p>

                    <div className="social-proof">
                        🔮 이미 <strong>12,847명</strong>이 신녀의 계시를 확인했습니다
                    </div>
                    <br />
                    <a href="#features" className="cta-button">
                        월하신녀의 영험함 알아보기 ↓
                    </a>
                </div>

                <div className="scroll-indicator">
                    <div>스크롤하여 더 알아보기</div>
                    <div style={{ marginTop: '5px' }}>↓</div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="sec-title">왜 월하신녀(月下神女)인가요?</h2>
                <p className="sec-desc">72,000가지 조합으로 만나는 나만의 영험한 수호신</p>

                <div className="feature-grid">
                    <div className="feature-card">
                        <span className="f-icon">🎨</span>
                        <h3 className="f-title">수호신 캐릭터 시스템</h3>
                        <p className="f-text">
                            단순한 텍스트 풀이가 아닙니다.<br />
                            당신의 사주 오행을 형상화한 독창적인 수호신 캐릭터 리포트를 제공합니다.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="f-icon">🤖</span>
                        <h3 className="f-title">정밀 분석 알고리즘</h3>
                        <p className="f-text">
                            명리학 빅데이터를 학습한 AI 신녀가<br />
                            당신의 과거와 현재를 짚어보고, 구체적인 미래 전략을 제시합니다.
                        </p>
                    </div>
                    <div className="feature-card">
                        <span className="f-icon">📊</span>
                        <h3 className="f-title">직관적인 운명 데이터</h3>
                        <p className="f-text">
                            어려운 전문 용어는 걷어냈습니다.<br />
                            그래프와 점수로 표현된 운세 흐름을 통해 내일의 길운을 준비하세요.
                        </p>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="process-section">
                <h2 className="sec-title">운명을 읽는 과정</h2>
                <p className="sec-desc">월하신녀가 당신의 길을 안내하는 3단계</p>

                <div className="step-list">
                    <div className="step-item">
                        <div className="step-num">1</div>
                        <div className="step-content">
                            <div className="step-head">사주 정보 입력</div>
                            <div className="step-sub">정확한 분석을 위해 태어난 일시를 정성껏 입력합니다.</div>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-num">2</div>
                        <div className="step-content">
                            <div className="step-head">영험한 AI 분석</div>
                            <div className="step-sub">월하신녀의 엔진이 72,000개의 운명 중 당신의 것을 찾아냅니다.</div>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-num">3</div>
                        <div className="step-content">
                            <div className="step-head">수호신 리포트 발행</div>
                            <div className="step-sub">당신을 지켜주는 수호신과 2026년 전략을 확인하세요.</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <a href="#saju-form" className="cta-button">
                        무료 사주 분석 시작하기
                    </a>
                </div>
            </section>

            <SajuInput />

            {/* Footer */}
            <footer className="wolha-footer">
                <div className="footer-content">
                    <div className="footer-links">
                        <a href="/privacy.html" className="footer-link highlight-privacy">개인정보 처리방침</a>
                        <span className="footer-divider">|</span>
                        <a href="/userrule.html" className="footer-link">이용약관</a>
                    </div>
                    
                    <div className="footer-info">
                        <p className="company-name">비더라이프 | 대표자 : 조홍경</p>
                        <p>주소 : 서울특별시 마포구 양화로 19길 4 </p>
                        <p>이메일: bethelife92@gmail.com | 고객센터: 070-8064-8846</p>
                    </div>
                    
                    <div className="footer-copyright">
                        © 2026 비더라이프. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;