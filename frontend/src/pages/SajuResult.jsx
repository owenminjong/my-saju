// frontend/src/pages/SajuResult.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';
import ShareModal from '../components/ShareModal';
import PremiumPromoCard from '../components/PremiumPromoCard';
import { Share2, Home, AlertTriangle } from 'lucide-react';
import { userAPI } from '../services/api';
import './SajuResult.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// ── 서브 컴포넌트 ──────────────────────────────────────────

const MoonIcon = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

const StarDivider = () => (
    <div className="star-divider">
        <div className="star-line" />
        <span className="star-dots">✦ ✦ ✦</span>
        <div className="star-line star-line-right" />
    </div>
);

const InkDivider = () => (
    <div className="ink-divider">
        <div className="ink-line" />
    </div>
);

const ElementBar = ({ label, percentage, status, color }) => {
    const statusColorMap = {
        '없음': '#5a4a3a',
        '부족': '#7a6540',
        '적정': '#8b7355',
        '과다': '#c9a84c',
        '발달': '#c9a84c',
    };
    const sColor = statusColorMap[status] || '#5a4a3a';
    const isHighlight = status === '과다' || status === '발달';
    const pct = parseFloat(percentage) || 0;

    return (
        <div className="el-row">
            <div className="el-label">
                <span className="el-dot" style={{ background: color }} />
                <span className="el-name">{label}</span>
            </div>
            <div className="el-bar-wrap">
                <div className="el-bar-bg">
                    <div
                        className="el-bar-fill"
                        style={{
                            width: `${pct}%`,
                            background: `linear-gradient(to right, ${color}88, ${color})`,
                        }}
                    />
                </div>
                <span className="el-pct">{percentage}%</span>
                <span
                    className="el-status"
                    style={{
                        background: sColor + '33',
                        color: isHighlight ? '#c9a84c' : '#b8a88299',
                        border: `1px solid ${sColor}44`,
                    }}
                >
                    {status}
                </span>
            </div>
        </div>
    );
};

// ── diagnosis 파싱 ──────────────────────────────────────────

const parseDiagnosis = (text) => {
    if (!text) return { greeting: '', oneLiner: '', tableText: '', readingText: '', crisisItems: [] };

    const lines = text.split('\n');

    // 1. 인사말 — 첫 줄
    const greeting = lines[0].replace(/^#+\s*/, '').trim();

    // 2. 한마디 — ⚡ 섹션 다음 줄, bold 유무 모두 대응
    const oneLinerIdx = lines.findIndex(l => /⚡/.test(l));
    let oneLiner = '';
    if (oneLinerIdx !== -1) {
        for (let i = oneLinerIdx + 1; i < lines.length; i++) {
            const l = lines[i].trim();
            if (!l) continue;
            // bold 있으면 제거, 없으면 그대로
            oneLiner = l.replace(/^\*\*(.+)\*\*$/, '$1').trim();
            break;
        }
    }

    // 3. 📊 성적표 — 마크다운 테이블 블록
    const tableStart = lines.findIndex(l => /📊/.test(l));
    const readingStart = lines.findIndex(l => /📄/.test(l));
    const crisisStart = lines.findIndex(l => /🚨/.test(l));

    let tableText = '';
    if (tableStart !== -1 && readingStart !== -1) {
        tableText = lines.slice(tableStart + 1, readingStart).join('\n').trim();
    }

    // 4. 📄 사주 읽기 본문
    let readingText = '';
    if (readingStart !== -1) {
        const end = crisisStart !== -1 ? crisisStart : lines.length;
        readingText = lines
            .slice(readingStart + 1, end)
            .join('\n')
            .trim();
    }

    // 5. 🚨 위기 파싱
    const crisisItems = [];
    if (crisisStart !== -1) {
        const crisisLines = lines.slice(crisisStart + 1);

        let currentTitle = null;
        let currentContent = [];

        const flush = () => {
            if (currentTitle && currentContent.length > 0) {
                crisisItems.push({
                    title: currentTitle,
                    content: currentContent.join('\n').trim(),
                });
            }
            currentTitle = null;
            currentContent = [];
        };

        for (const line of crisisLines) {
            const trimmed = line.trim();

            // "자세히 보니~" 줄 스킵
            if (trimmed.includes('자세히 보니')) continue;
            if (!trimmed) continue;

            // bold 제목 패턴: **...**
            const isBoldTitle = /^\*\*[^*]+\*\*/.test(trimmed);
            if (isBoldTitle) {
                flush();
                currentTitle = trimmed.replace(/^\*\*(.+?)\*\*.*$/, '$1').replace(/:$/, '').trim();
                // 같은 줄에 내용이 있는 경우 (제목 - 내용)
                const afterTitle = trimmed.replace(/^\*\*[^*]+\*\*\s*[-:：]?\s*/, '').trim();
                if (afterTitle) currentContent.push(afterTitle);
            } else {
                if (currentTitle !== null) currentContent.push(trimmed);
            }
        }
        flush();
    }

    return { greeting, oneLiner, tableText, readingText, crisisItems };
};

// ── 메인 컴포넌트 ──────────────────────────────────────────

function SajuResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};

    const [showShareModal, setShowShareModal] = useState(false);
    const [product, setProduct] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [showPromoCard, setShowPromoCard] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [visibleSections, setVisibleSections] = useState(new Set());

    const sectionRefs = useRef([]);

    const fetchPremiumProduct = useCallback(async () => {
        try {
            const response = await userAPI.getActiveProducts();
            const premiumProduct = response.data.data.find(
                p => p.name.includes('프리미엄') && p.is_active
            );
            if (premiumProduct) setProduct(premiumProduct);
        } catch (error) {
            console.error('상품 조회 실패:', error);
            setProduct(null);
        }
    }, []);

    useEffect(() => { fetchPremiumProduct(); }, [fetchPremiumProduct]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docH = document.documentElement.scrollHeight;
            const winH = window.innerHeight;
            const progress = (scrollTop + winH) / docH;
            setScrollProgress(Math.min(progress, 1));
            setShowPromoCard(progress >= 0.95);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting)
                        setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
                });
            },
            { threshold: 0.08 }
        );
        sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
        return () => observer.disconnect();
    }, []);

    if (!result) { navigate('/'); return null; }

    const { user, saju, elements, diagnosis } = result;
    const mbti = result?.sajuData?.mbti || result?.metadata?.mbti || null;

    const { greeting, oneLiner, tableText, readingText, crisisItems } = parseDiagnosis(diagnosis);

    const handlePremiumPayment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', { state: { redirectTo: '/saju-input', mode: 'premium', sajuData: user } });
            return;
        }
        const birthDateStr = user.birthDate;
        let year, month, day, isLunar = false;
        if (birthDateStr.includes('년')) {
            const parts = birthDateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
            if (parts) { year = parseInt(parts[1]); month = parseInt(parts[2]); day = parseInt(parts[3]); }
            if (birthDateStr.includes('음력')) isLunar = true;
        } else if (birthDateStr.includes('.')) {
            const parts = birthDateStr.split('.');
            year = parseInt(parts[0]); month = parseInt(parts[1]); day = parseInt(parts[2]);
        }
        let hour = 0;
        if (user.birthTime) {
            const timeMatch = user.birthTime.match(/(\d+)-(\d+)시/);
            if (timeMatch) hour = parseInt(timeMatch[1]);
        }
        const gender = result.imageMetadata?.gender === '남' ? 'M' : 'F';
        const mbtiVal = result?.sajuData?.mbti || result?.metadata?.mbti;
        const requestData = { name: user.name, year, month, day, hour, minute: 0, isLunar, gender, mbti: mbtiVal };
        if (!year || !month || !day) { alert('생년월일 정보가 올바르지 않습니다.'); return; }
        navigate('/payment/premium', { state: { sajuData: requestData, product } });
    };

    const fadeIn = (id) => ({
        opacity: visibleSections.has(id) ? 1 : 0,
        transform: visibleSections.has(id) ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
    });

    // 마크다운 컴포넌트 — 성적표 테이블 전용
    const tableMdComponents = {
        p: ({ node, ...props }) => <p className="md-p" {...props} />,
        table: ({ node, ...props }) => (
            <div className="md-table-wrap">
                <table className="md-table" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => <thead className="md-thead" {...props} />,
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => <tr className="md-tr" {...props} />,
        th: ({ node, ...props }) => <th className="md-th" {...props} />,
        td: ({ node, ...props }) => <td className="md-td" {...props} />,
    };

    return (
        <div className="sr-root">

            {/* 스크롤 프로그레스 */}
            <div className="sr-progress" style={{ width: `${scrollProgress * 100}%` }} />

            <div className="sr-container">

                {/* ── Top edge ── */}
                <div className="sr-top-edge">
                    <span className="sr-logo">月令</span>
                    <div className="sr-nav-btns">
                        <button className="sr-btn-share" onClick={() => setShowShareModal(true)}>
                            <Share2 size={14} /> 공유
                        </button>
                        <button className="sr-btn-home" onClick={() => navigate('/')}>
                            <Home size={14} /> 홈
                        </button>
                    </div>
                </div>

                {/* ── 캐릭터 카드 ── */}
                <div className="sr-char-card">
                    <img
                        src={
                            !imageError && result?.characterImage
                                ? `${API_BASE_URL}${result.characterImage}`
                                : 'https://images.unsplash.com/photo-1548712393-27c9b837267f?q=80&w=1000&auto=format&fit=crop'
                        }
                        className="sr-char-img"
                        alt="운명 캐릭터"
                        onError={() => setImageError(true)}
                    />
                    <div className="sr-char-overlay" />
                </div>

                {/* ── 양피지 본문 ── */}
                <div className="sr-parchment">
                    <div className="sr-edge-left" />
                    <div className="sr-edge-right" />

                    {/* 헤더: 브랜드 > 달 > 이름 > MBTI > 생년월일 > 생시 */}
                    <div className="sr-header">
                        <div className="sr-header-brand">월 령 신 녀</div>
                        <div className="sr-header-moon">
                            <MoonIcon size={22} />
                        </div>
                        <h1 className="sr-header-name">{user?.name}님의 운명</h1>
                        {mbti && <div className="sr-header-mbti">{mbti}</div>}
                        <div className="sr-header-birth">{user?.birthDate}</div>
                        <div className="sr-header-time">{user?.birthTime}</div>
                    </div>

                    <StarDivider />

                    {/* ── 사주팔자 ── */}
                    <div
                        ref={el => sectionRefs.current[0] = el}
                        data-section="pillars"
                        style={fadeIn('pillars')}
                    >
                        <div className="sr-section-title">📋 사주팔자</div>
                        <div className="sr-pillars-wrap">
                            <SajuTable saju={saju} />
                        </div>
                    </div>

                    <InkDivider />

                    {/* ── 오행 분석 ── */}
                    {elements && (
                        <div
                            ref={el => sectionRefs.current[1] = el}
                            data-section="elements"
                            style={fadeIn('elements')}
                        >
                            <div className="sr-section-title">🔮 오행 분석</div>
                            <div className="sr-element-chart-wrap">
                                <ElementChart elements={elements} />
                            </div>
                            <div className="sr-el-bars">
                                {elements?.chart?.map((el) => (
                                    <ElementBar
                                        key={el.element}
                                        label={`${el.element}(${el.name})`}
                                        percentage={el.percentage}
                                        status={elements.status[el.element]}
                                        color={el.color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <InkDivider />

                    {/* ── 운세 풀이 ── */}
                    {diagnosis && (
                        <div
                            ref={el => sectionRefs.current[2] = el}
                            data-section="fortune"
                            style={fadeIn('fortune')}
                        >
                            {/* 인사말 */}
                            {greeting && (
                                <div className="sr-greeting">{greeting}</div>
                            )}

                            {/* ⚡ 한마디 */}
                            {oneLiner && (
                                <div className="sr-oneliner-wrap">
                                    <div className="sr-section-title">⚡ 2026년, 한마디로 말하자면</div>
                                    <div className="sr-oneliner-box">{oneLiner}</div>
                                </div>
                            )}

                            {/* 📊 성적표 — 마크다운 테이블 그대로 렌더 */}
                            {tableText && (
                                <div className="sr-table-wrap">
                                    <div className="sr-section-title">📊 올해의 운명 성적표</div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={tableMdComponents}>
                                        {tableText}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* 📄 사주 읽기 */}
                            {readingText && (
                                <div className="sr-reading-wrap">
                                    <div className="sr-section-title">📄 월령신녀가 본 {user?.name}님의 사주</div>
                                    <p className="sr-reading-text">{readingText}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 위기 ── */}
                    {crisisItems.length > 0 && (
                        <div
                            ref={el => sectionRefs.current[3] = el}
                            data-section="crisis"
                            style={fadeIn('crisis')}
                        >
                            <InkDivider />
                            <div className="sr-section-title sr-crisis-title">🚨 월령신녀가 발견한 위기</div>
                            <div className="sr-crisis-sub">자세히 보니 두 번의 위기가 보이네요🔎</div>
                            {crisisItems.map((item, idx) => (
                                <div key={idx} className="sr-crisis-item">
                                    <div className="sr-crisis-item-title">
                                        <AlertTriangle size={13} />
                                        <span>{item.title}</span>
                                    </div>
                                    <p className="sr-crisis-item-body">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <InkDivider />

                    {/* 신녀 멘트 */}
                    <div className="sr-closing">
                        비밀을 많이 꺼내어 신녀의 신력이 약해졌습니다.<br />
                        복채를 올려주시면 남은 이야기를 이어갈 수 있어요.
                    </div>

                    <StarDivider />

                    <div className="sr-footer-brand">월 령 신 녀</div>
                    <div className="sr-bottom-spacer" />
                </div>

                {/* Bottom edge */}
                <div className="sr-bottom-edge">
                    <div className="sr-bottom-edge-inner" />
                </div>

            </div>

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                resultData={result}
            />

            {product && showPromoCard && (
                <PremiumPromoCard sajuData={result} productInfo={product} />
            )}
        </div>
    );
}

export default SajuResult;