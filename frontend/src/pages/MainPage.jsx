import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import SajuInput from "./SajuInput";

const MainPage = () => {
    const navigate = useNavigate();
    const [menuActive, setMenuActive] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const canvasRef = useRef(null);
    const countRef = useRef(null);
    const counted = useRef(false);
    const sajuInputRef = useRef(null);

    const toggleMenu = () => setMenuActive(true);
    const closeMenu = () => setMenuActive(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const scrollToSajuInput = () => {
        sajuInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Starfield canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        let shootingStars = [];
        let animId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = document.body.scrollHeight;
            stars = [];
            const count = Math.floor((canvas.width * canvas.height) / 8000);
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.2 + 0.3,
                    alpha: Math.random() * 0.6 + 0.2,
                    speed: Math.random() * 0.003 + 0.001,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        function draw(time) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                const a = s.alpha * (Math.sin(time * s.speed + s.phase) * 0.3 + 0.7);
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(232,213,163,${a})`;
                ctx.fill();
            });

            if (Math.random() < 0.002) {
                shootingStars.push({
                    x: Math.random() * canvas.width,
                    y: window.scrollY + Math.random() * window.innerHeight * 0.5,
                    vx: (Math.random() - 0.3) * 6,
                    vy: Math.random() * 3 + 2,
                    life: 1,
                    len: Math.random() * 40 + 30
                });
            }

            shootingStars = shootingStars.filter(ss => {
                ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.015;
                if (ss.life <= 0) return false;
                const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * (ss.len / 6), ss.y - ss.vy * (ss.len / 6));
                grad.addColorStop(0, `rgba(232,213,163,${ss.life * 0.8})`);
                grad.addColorStop(1, 'rgba(232,213,163,0)');
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - ss.vx * (ss.len / 6), ss.y - ss.vy * (ss.len / 6));
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                return true;
            });

            animId = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        animId = requestAnimationFrame(draw);

        let rt;
        const scrollHandler = () => {
            clearTimeout(rt);
            rt = setTimeout(() => {
                const h = document.body.scrollHeight;
                if (canvas.height !== h) { canvas.height = h; }
            }, 100);
        };
        window.addEventListener('scroll', scrollHandler);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', scrollHandler);
        };
    }, []);

    // Scroll reveal
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    // Counter animation
    useEffect(() => {
        if (!countRef.current) return;
        const target = 3847 + Math.floor(Math.random() * 200);
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !counted.current) {
                    counted.current = true;
                    let current = 0;
                    const step = target / (2000 / 16);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        setUserCount(Math.floor(current));
                    }, 16);
                }
            });
        }, { threshold: 0.3 });
        obs.observe(countRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div className="wolha-main">
            <canvas ref={canvasRef} id="starfield"></canvas>

            {/* Navigation */}
            <button className="nav-trigger" onClick={toggleMenu}>
                <span></span><span></span><span></span>
            </button>

            <div className={`menu-overlay ${menuActive ? 'active' : ''}`} onClick={closeMenu} />

            <div className={`side-menu ${menuActive ? 'active' : ''}`}>
                <button className="close-btn" onClick={closeMenu}>&times;</button>
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontFamily: "'Noto Serif KR', serif", color: 'var(--gold)', marginBottom: '5px' }}>月下神女</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>당신의 운명을 읽는 신비로운 달빛</p>
                </div>
                <nav>
                    <button className="menu-link" onClick={() => {
                        const token = localStorage.getItem('token');
                        if (!token) { alert('로그인이 필요합니다.'); navigate('/login', { state: { redirectTo: '/my-results' } }); }
                        else navigate('/my-results');
                    }} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                        내 사주 기록 보기
                    </button>
                    {!isLoggedIn && (
                        <button className="menu-link" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            로그인하기
                        </button>
                    )}
                    <button className="menu-link" onClick={() => navigate('/saju-input', { state: { mode: 'premium' } })} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                        유료 사주 보러 가기
                    </button>
                </nav>
            </div>

            {/* ===== 1. HERO ===== */}
            <section className="section hero-section">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <p className="hero-pretitle">월하신녀 성격사주</p>
                    <h1 className="hero-title">
                        내 사주를 알고 있는데<br />
                        <span className="highlight">내 인생은 왜 안 변할까</span>
                    </h1>
                    <div className="hero-doubts">
                        <p className="hero-doubts-label">한 번쯤은 이런 생각 들지 않았나요?</p>
                        <ul>
                            <li>분명 올해 운 좋다고 했는데... 뭐가 달라진 게 없어</li>
                            <li>적극적으로 다가가래서 해봤는데 오히려 어색해졌어</li>
                            <li>사주대로 했는데 왜 더 꼬이지?</li>
                            <li>결국 사주는 그냥 듣기 좋은 말만 하는 거 아닌가...</li>
                        </ul>
                    </div>
                </div>

                <div className="scroll-indicator" style={{ bottom: '80px' }}>
                    <span>Scroll</span>
                    <div className="line"></div>
                </div>

                <button className="cta-scroll-btn" onClick={scrollToSajuInput}>
                    지금 바로 확인하기 ↓
                </button>
            </section>

            {/* ===== 2. REASSURANCE ===== */}
            <section className="section reassurance">
                <h2 className="section-title reveal" style={{ color: 'var(--gold)' }}>당신의 잘못이 아닙니다</h2>
                <p className="reassurance-body reveal">
                    다가가라고 해서 다가갔는데 어색해진 것도,<br />
                    투자하라고 해서 했는데 불안해서 손절한 것도,<br />
                    당신이 못해서가 아니에요.
                </p>
            </section>

            {/* ===== 3. DIRECTION ===== */}
            <section className="section turn">
                <h2 className="section-title reveal">
                    <span style={{ color: 'var(--gold)' }}>사주가 알려준 길이<br />당신과 맞지 않았던 겁니다</span>
                </h2>
                <p className="turn-body reveal">
                    내성적인 사람에게 적극적으로 다가가라 하고,<br />
                    예민한 사람에게 공격적으로 투자하라 했어요.<br /><br />
                    <strong>당신의 성격을 모르는 사주는<br />모두에게 같은 길을 알려줄 수밖에 없습니다.</strong>
                </p>
            </section>

            {/* ===== 4. DENIAL ===== */}
            <section className="section denial">
                <h2 className="section-title reveal">
                    한날 한시에 태어난 사람은<br />같은 인생을 살까요?
                </h2>
                <p className="twin-answer reveal"><strong>성격이 다르면<br />쌍둥이도 인생이 달라집니다</strong></p>
                <div className="denial-cards reveal">
                    <div className="denial-card">
                        <p className="denial-label">쌍둥이 언니</p>
                        <p className="denial-text">외향적이라 소개팅에서 빛나고,<br />공격적 투자로 수익을 냈어요.</p>
                    </div>
                    <div className="denial-card">
                        <p className="denial-label">쌍둥이 동생</p>
                        <p className="denial-text">내성적이라 같은 소개팅에서 무너지고,<br />같은 투자에 불안해서 손절했어요.</p>
                    </div>
                </div>
                <p className="denial-conclusion reveal">
                    같은 사주, 같은 운, 같은 날 태어났지만<br />
                    <strong>목적지는 같아도 가는 길은 성격마다 다릅니다.</strong>
                </p>
            </section>

            {/* ===== 5. CORE MESSAGE ===== */}
            <section className="section core-message">
                <div className="core-bg"></div>
                <div className="moon-container">
                    <div className="moon-video-wrapper">
                        <video autoPlay muted loop playsInline className="moon-video">
                            <source src="/a.mp4" type="video/mp4" />
                        </video>
                        <div className="moon-glow"></div>
                    </div>
                </div>
                <div className="core-divider reveal"></div>
                <blockquote className="core-quote reveal">
                    운명이라는 목적지는 같아도<br />
                    거기까지 가는 길은<br />
                    성격마다 다릅니다
                </blockquote>
                <p className="core-desc reveal">
                    월하신녀는 당신의 사주에 성격을 더해<br />
                    <strong>당신만의 길</strong>을 알려드려요.<br />
                    그래야 진짜 인생이 바뀝니다.
                </p>
            </section>

            {/* ===== 6. COMPARISON ===== */}
            <section className="section comparison">
                <p className="comparison-label reveal">무엇이 다른가요</p>
                <h2 className="section-title reveal">
                    똑같은 사주<br /><span style={{ color: 'var(--gold)' }}>완전히 다른 길</span>
                </h2>

                <div className="compare-block reveal">
                    <p className="compare-topic">— 연애운 —</p>
                    <div className="compare-grid">
                        <div className="compare-card old">
                            <div className="compare-card-label"><span className="icon">✕</span> 기존 사주</div>
                            <p>하반기 좋은 인연이 올 것,<br />적극적으로 어필하세요.</p>
                        </div>
                        <div className="compare-card new">
                            <div className="compare-card-label"><span className="icon">🌙</span> 월하신녀</div>
                            <p>
                                7~9월이 연애 최적기예요.<br />
                                하지만 당신은 내성적인 INFP,<br />
                                소개팅에서 먼저 다가가면 오히려 어색해져요.<br /><br />
                                관심사 기반 모임에서 자연스럽게 스며들기,<br />
                                카톡보다 인스타 스토리 반응으로 시작하기.<br />
                                <strong>그게 당신이 사랑을 시작하는 방법이에요.</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="compare-block reveal">
                    <p className="compare-topic">— 재물운 —</p>
                    <div className="compare-grid">
                        <div className="compare-card old">
                            <div className="compare-card-label"><span className="icon">✕</span> 기존 사주</div>
                            <p>올해 재물운 상승,<br />적극적 투자를 권장합니다.</p>
                        </div>
                        <div className="compare-card new">
                            <div className="compare-card-label"><span className="icon">🌙</span> 월하신녀</div>
                            <p>
                                돈 벌 기회는 확실히 와요.<br />
                                근데 당신 성격에 공격적 투자는 스트레스만 쌓여요.<br /><br />
                                매달 자동이체 ETF 적립,<br />
                                통장 3개로 쪼개서 관리하기.<br />
                                <strong>이게 당신이 돈 버는 방법이에요.</strong><br /><br />
                                <span className="warn">⚠️ 8월, 나만 알려주는 투자 제안 오면?<br />99% 함정이에요. 거절하세요.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 7. TRUST ===== */}
            <section className="section trust">
                <div className="trust-counter reveal" ref={countRef}>
                    <p className="trust-counter-label">지금까지 결과를 받아본 사람</p>
                    <div className="trust-number">
                        <span id="userCount">{userCount.toLocaleString()}</span><span className="trust-unit">명</span>
                    </div>
                    <p className="trust-live"><span className="live-dot"></span> 실시간 업데이트 중</p>
                </div>
                <div className="trust-free reveal">
                    <p className="trust-free-title">아직 고민된다면</p>
                    <p className="trust-free-desc"><strong>기본 성격 사주분석은 무료</strong>예요.<br />직접 받아보고 판단하세요.</p>
                </div>
            </section>

            {/* ===== 8. RESULT PREVIEW ===== */}
            <section className="section teaser">
                <div className="teaser-bg"></div>
                <p className="teaser-pretitle reveal">이렇게 받아보게 됩니다</p>
                <h2 className="teaser-title reveal">
                    당신의 사주 결과에는<br />이런 것들이 담겨 있어요
                </h2>
                <div className="teaser-preview reveal">
                    <div className="teaser-overlay">
                        <span className="teaser-q">?</span>
                    </div>
                </div>
                <p className="teaser-desc reveal">
                    나만의 운명 아바타와 함께<br />
                    연애 스타일, 돈 버는 방식,<br />
                    위기 대처법까지 성격 맞춤 분석이 나와요.<br /><br />
                    1,920가지 조합 중 단 하나,<br />
                    <strong>세상에 나만 받을 수 있는 결과입니다.</strong>
                </p>
            </section>

            {/* ===== 9. CTA → SajuInput ===== */}
            <section className="section cta-section">
                <div className="cta-bg"></div>
                <h2 className="cta-title reveal">나만의 결과 받아보기</h2>
                <p className="cta-subtitle reveal">성격에 맞는 내 길을<br />지금 확인해보세요</p>
            </section>

            <div ref={sajuInputRef}>
                <SajuInput />
            </div>

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
                        <p>주소 : 서울특별시 마포구 양화로 19길 4</p>
                        <p>이메일: bethelife92@gmail.com | 고객센터: 070-8064-8846</p>
                        <p>사업자 등록번호 : 621-79-00496</p>
                        <p>통신판매업신고 번호 : 2025-서울마포-3141호</p>
                    </div>
                    <div className="footer-copyright">© 2026 비더라이프. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;