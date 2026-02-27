// frontend/src/pages/SharedResult.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';
import './SharedResult.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

function SharedResult() {
    const { encodedData } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const cardRef = useRef(null);
    const canvasRef = useRef(null);

    const maskName = (name) => {
        if (!name || name.length === 0) return '익명';
        if (name.length === 1) return name;
        if (name.length === 2) return name[0] + 'O';
        return name[0] + 'O'.repeat(name.length - 1);
    };

    // 별빛 캔버스
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        let animId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            const count = Math.floor((canvas.width * canvas.height) / 9000);
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
            animId = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        animId = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // 스크롤 reveal
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('sr-visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.sr-reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [resultData]);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const isShortUrl = window.location.pathname.startsWith('/r/');
                let response;
                if (isShortUrl) {
                    response = await fetch(`${API_BASE_URL}/api/share/decode-hash`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ encodedData })
                    });
                } else {
                    response = await fetch(`${API_BASE_URL}/api/share/decode/${encodedData}`, { credentials: 'include' });
                }
                const data = await response.json();
                if (data.success) {
                    setResultData(data.data);
                    setTimeout(() => setRevealed(true), 80);
                } else {
                    setError(data.message || '결과를 불러올 수 없습니다.');
                }
            } catch (err) {
                setError('결과를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        if (encodedData) fetchResult();
        else { setError('유효하지 않은 공유 링크입니다.'); setLoading(false); }
    }, [encodedData]);

    // ── Loading ──
    if (loading) return (
        <div className="sr-root">
            <canvas ref={canvasRef} className="sr-canvas" />
            <div className="sr-center">
                <div className="sr-moon-spinner"></div>
                <p className="sr-loading-text">운명을 불러오는 중...</p>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="sr-root">
            <canvas ref={canvasRef} className="sr-canvas" />
            <div className="sr-center">
                <div className="sr-error-card">
                    <div className="sr-error-icon">😢</div>
                    <h2 className="sr-error-title">앗!</h2>
                    <p className="sr-error-msg">{error}</p>
                    <button className="sr-cta-btn" onClick={() => navigate('/')}>나도 운세 보러가기 →</button>
                </div>
            </div>
        </div>
    );

    // ── Data ──
    let imageMetadata = resultData?.imageMetadata;
    if (typeof imageMetadata === 'string') { try { imageMetadata = JSON.parse(imageMetadata); } catch { imageMetadata = {}; } }

    const originalName = resultData?.user?.name || '익명';
    const maskedName = maskName(originalName);
    const characterString = resultData?.metadata?.character || '';
    const animalMatch = characterString.match(/([가-힣]+)띠/);
    const animal = animalMatch ? animalMatch[1] : (imageMetadata?.zodiac || '용');

    const normalizeFields = (fields) => {
        if (!fields) return { wealth: 'C', career: 'C', love: 'C', health: 'C' };
        const n = {};
        for (const [k, v] of Object.entries(fields)) n[k] = typeof v === 'object' ? (v.grade || 'C') : v;
        return n;
    };
    const grades = normalizeFields(resultData?.fields);

    const seasonMatch = characterString.match(/띠\s*·\s*([가-힣]+)\s*·/);
    const timeMatch = characterString.match(/·\s*([가-힣]+)$/);
    const season = seasonMatch ? seasonMatch[1] : (imageMetadata?.season || '');
    const timeOfDay = timeMatch ? timeMatch[1] : (imageMetadata?.timeOfDay || '');

    const gradeStyle = (grade) => {
        const map = {
            S: { color: '#e88080', bg: 'rgba(232,128,128,0.08)', border: 'rgba(232,128,128,0.2)' },
            A: { color: '#c9a84c', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.25)' },
            B: { color: '#7ab0d4', bg: 'rgba(122,176,212,0.08)', border: 'rgba(122,176,212,0.2)' },
            C: { color: '#7a7670', bg: 'rgba(122,118,112,0.08)', border: 'rgba(122,118,112,0.15)' },
        };
        return map[grade] || map.C;
    };

    const gradeColorHex = (grade) => gradeStyle(grade).color;

    const getAnimalEmoji = (a) => ({ '용':'🐉','뱀':'🐍','말':'🐴','양':'🐑','원숭이':'🐵','닭':'🐓','개':'🐕','돼지':'🐖','쥐':'🐭','소':'🐮','호랑이':'🐯','토끼':'🐰' }[a] || '🐉');

    // ── Main render ──
    return (
        <div className="sr-root" style={{fontFamily: "'CocochoiToon', serif"}}>
            <canvas ref={canvasRef} className="sr-canvas"/>

            {/* 노이즈 오버레이 */}
            <div className="sr-noise"/>

            <div className={`sr-page ${revealed ? 'sr-page--in' : ''}`}>

                {/* ── 헤더 ── */}
                <header className="sr-header sr-reveal">
                    <p className="sr-pretitle">月下神女</p>
                    <div className="sr-header-divider"/>
                    <p className="sr-header-sub">공유받은 운세</p>
                </header>

                {/* ── 이름 + 메타 ── */}
                <section className="sr-hero sr-reveal">
                    <h1 className="sr-name">{maskedName}님의 <span className="sr-gold">2026년</span></h1>
                    <div className="sr-tags">
                        <span className="sr-tag">{animal}띠</span>
                        <span className="sr-tag-sep">·</span>
                        <span className="sr-tag">{season}</span>
                        <span className="sr-tag-sep">·</span>
                        <span className="sr-tag">{timeOfDay}</span>
                    </div>
                </section>

                {/* ── 캐릭터 이미지 ── */}
                <section className="sr-character-wrap sr-reveal">
                    <div className="sr-character-glow"/>
                    {resultData?.characterImage ? (
                        <img
                            src={`${API_BASE_URL}${resultData.characterImage}`}
                            alt={`${animal}띠 캐릭터`}
                            className="sr-character-img"
                            crossOrigin="anonymous"
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="sr-character-fallback"
                         style={{display: resultData?.characterImage ? 'none' : 'flex'}}>
                        <span className="sr-animal-emoji">{getAnimalEmoji(animal)}</span>
                    </div>
                    <p className="sr-character-label">{season} {timeOfDay}의 {animal}</p>
                </section>

                {/* ── 구분선 ── */}
                <div className="sr-divider sr-reveal"/>

                {/* ── 운세 등급 ── */}
                <section className="sr-grades-wrap sr-reveal">
                    <p className="sr-section-pretitle">2026년 운세 등급</p>
                    <div className="sr-grades">
                        {[
                            {label: '재물운', key: 'wealth', icon: '💰'},
                            {label: '직업운', key: 'career', icon: '💼'},
                            {label: '연애운', key: 'love', icon: '🌙'},
                            {label: '건강운', key: 'health', icon: '✨'},
                        ].map(({label, key, icon}) => {
                            const gs = gradeStyle(grades[key]);
                            return (
                                <div key={key} className="sr-grade-card"
                                     style={{background: gs.bg, borderColor: gs.border}}>
                                    <span className="sr-grade-icon">{icon}</span>
                                    <span className="sr-grade-label">{label}</span>
                                    <span className="sr-grade-value" style={{color: gs.color}}>{grades[key]}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── 구분선 ── */}
                <div className="sr-divider sr-reveal"/>

                {/* ── CTA ── */}
                <section className="sr-cta sr-reveal">
                    <p className="sr-cta-question">당신의 사주도 궁금하신가요?</p>
                    <p className="sr-cta-desc">
                        1,920가지 조합 중 단 하나,<br/>
                        <strong>세상에 나만 받을 수 있는 결과</strong>를 확인해보세요
                    </p>
                    <button className="sr-cta-btn sr-reveal" onClick={() => navigate('/')}>
                        내 운세 보러가기 →
                    </button>
                </section>

                {/* ── 공유 ── */}
                <div className="sr-share-wrap sr-reveal">
                    <button className="sr-share-btn" onClick={() => setShareModalOpen(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        나도 공유하기
                    </button>
                </div>

                {/* ── 푸터 ── */}
                <footer className="sr-footer sr-reveal">
                    <p>月下神女 · 2026년 운세</p>
                </footer>
            </div>

            {/* ── 인스타 캡처용 숨김 카드 ── */}
            <div ref={cardRef} style={{
                position: 'fixed', left: '-9999px', top: 0,
                width: '390px', backgroundColor: '#06060c',
                padding: '32px 24px', borderRadius: '24px', fontFamily: "'Noto Serif KR', serif"
            }}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <p style={{color: '#c9a84c', fontSize: '12px', letterSpacing: '4px', margin: '0 0 8px'}}>月下神女 ·
                        2026년 운세</p>
                    <h1 style={{color: '#eae6de', fontSize: '24px', fontWeight: 'bold', margin: 0}}>{maskedName}님의
                        2026년</h1>
                    <p style={{color: '#9a9590', fontSize: '13px', margin: '8px 0 0'}}>{animal}띠
                        · {season} · {timeOfDay}</p>
                </div>
                {resultData?.characterImage && (
                    <img src={`${API_BASE_URL}${resultData.characterImage}`} alt="캐릭터" crossOrigin="anonymous"
                         style={{width: '100%', borderRadius: '16px', marginBottom: '20px', display: 'block'}}/>
                )}
                <div
                    style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px'}}>
                    {[{label: '재물운', key: 'wealth'}, {label: '직업운', key: 'career'}, {
                        label: '연애운',
                        key: 'love'
                    }, {label: '건강운', key: 'health'}].map(({label, key}) => (
                        <div key={key} style={{
                            backgroundColor: 'rgba(201,168,76,0.06)',
                            borderRadius: '12px',
                            padding: '10px 4px',
                            textAlign: 'center',
                            border: '1px solid rgba(201,168,76,0.12)'
                        }}>
                            <p style={{color: '#9a9590', fontSize: '10px', margin: '0 0 4px'}}>{label}</p>
                            <p style={{
                                color: gradeColorHex(grades[key]),
                                fontSize: '28px',
                                fontWeight: 'bold',
                                margin: 0
                            }}>{grades[key]}</p>
                        </div>
                    ))}
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(42,31,78,0.3))',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '14px',
                    padding: '14px',
                    textAlign: 'center'
                }}>
                    <p style={{color: '#c9a84c', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px'}}>🔮 나도 2026년 운세
                        보러가기</p>
                    <p style={{color: '#9a9590', fontSize: '11px', margin: 0}}>{FRONTEND_URL}</p>
                </div>
            </div>

            <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} resultData={resultData}
                        cardRef={cardRef}/>
        </div>
    );
}

export default SharedResult;