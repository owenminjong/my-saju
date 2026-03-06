// frontend/src/pages/PremiumResult.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';
import ShareModal from '../components/ShareModal';
import { Home, Crown, Share2 } from 'lucide-react';
import './SajuResult.css';
import './PremiumResult.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const EL_COLORS   = { 목:'#4a8c5c', 화:'#c75a3a', 토:'#b89a5a', 금:'#c9a84c', 수:'#4a7a9c' };
const STATUS_CLASS = { 과다:'excess', 발달:'develop', 적정:'normal', 부족:'lack', 없음:'none' };

const TIME_MAP = {
    '자시': '(쥐, 23-1시)', '축시': '(소, 1-3시)', '인시': '(호랑이, 3-5시)',
    '묘시': '(토끼, 5-7시)', '진시': '(용, 7-9시)', '사시': '(뱀, 9-11시)',
    '오시': '(말, 11-13시)', '미시': '(양, 13-15시)', '신시': '(원숭이, 15-17시)',
    '유시': '(닭, 17-19시)', '술시': '(개, 19-21시)', '해시': '(돼지, 21-23시)',
};
const formatBirthTime = (t) => {
    if (!t) return '';
    const match = Object.keys(TIME_MAP).find(k => t.includes(k));
    return match ? `${match} ${TIME_MAP[match]}` : t;
};

// ── 마크다운 + --- 제거 ──────────────────────────────────────────────
const cleanMd = (t = '') => t
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\s*---+\s*/g, '')
    .trim();

// ── 파싱 유틸 ────────────────────────────────────────────────────────
const parseDiagnosis = (text = '') => {
    const s1 = text.match(/# Step 1[\s\S]*?(?=\n# Step 2|$)/)?.[0] || '';
    const s2 = text.match(/# Step 2[\s\S]*?(?=\n# Step 3|$)/)?.[0] || '';
    const s3 = text.match(/# Step 3[\s\S]*/)?.[0] || '';
    const strip = (s, pat) => s.replace(pat, '').trim();
    return {
        step1: strip(s1, /^# Step 1[^\n]*\n/),
        step2: strip(s2, /^# Step 2[^\n]*\n/),
        step3: strip(s3, /^# Step 3[^\n]*\n/),
    };
};

// step2 그대로 사용 (재물+직업+연애 모두 2026운세 탭에)
// step3를 PART 1 (월간 달력) / PART 2 (연애·결혼 궁합) 로 분리
const splitStep3 = (text = '') => {
    const part2Idx = text.search(/\n#+\s*PART\s*2/i);
    if (part2Idx !== -1) {
        return {
            calendar: text.slice(0, part2Idx).trim(),
            love2:    text.slice(part2Idx).trim(),
        };
    }
    // fallback
    const m = text.match(/\n(?=#{1,2}\s.*(건강|개운|🌟))/);
    if (m) return { calendar: text.slice(0, m.index).trim(), love2: '' };
    return { calendar: text, love2: '' };
};

// ── 공통 컴포넌트 ────────────────────────────────────────────────────
const StarDivider = () => (
    <div className="star-divider">
        <div className="star-line"/><span className="star-dots">✦ ✦ ✦</span><div className="star-line star-line-right"/>
    </div>
);
const InkDivider = () => <div className="ink-divider"><div className="ink-line"/></div>;
const MoonIcon = () => (
    <div className="sr-header-moon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="rgba(201,168,76,0.7)" stroke="#c9a84c" strokeWidth="1"/>
        </svg>
    </div>
);

const ElementBars = ({ elements }) => (
    <div className="sr-el-bars">
        {elements?.chart?.map(el => (
            <div key={el.element} className="el-row">
                <div className="el-label">
                    <div className="el-dot" style={{ background: EL_COLORS[el.element] || el.color }}/>
                    <span className="el-name">{el.element} ({el.name})</span>
                </div>
                <div className="el-bar-wrap">
                    <div className="el-bar-bg">
                        <div className="el-bar-fill" style={{ width:`${el.percentage}%`, background: EL_COLORS[el.element] || el.color }}/>
                    </div>
                    <span className="el-pct">{el.percentage}%</span>
                    <span className={`el-status el-status-${STATUS_CLASS[elements.status[el.element]]||'none'}`}>
                        {elements.status[el.element]}
                    </span>
                </div>
            </div>
        ))}
    </div>
);

const TABS = [
    { id:'saju',     label:'기본사주' },
    { id:'story',    label:'인생 이야기' },
    { id:'fortune',  label:'2026운세' },
    { id:'calendar', label:'월간 달력' },
    { id:'love',     label:'비밀 편지' },
];

// ── 인생이야기 렌더러 ────────────────────────────────────────────────
const ACT_KEYWORDS = ['서막','본막','종막','에필로그','프롤로그'];

const StoryRenderer = ({ text }) => {
    if (!text) return <p className="pr-md-p">내용을 불러오는 중...</p>;

    const sections = [];
    const lines = text.split('\n');
    let cur = { header: null, level: 0, body: [] };
    for (const line of lines) {
        const h2 = line.match(/^##\s+(.*)/);
        const h1 = line.match(/^#\s+(.*)/);
        if (h2) {
            if (cur.body.length || cur.header !== null) sections.push(cur);
            cur = { header: h2[1].trim(), level: 2, body: [] };
        } else if (h1) {
            if (cur.body.length || cur.header !== null) sections.push(cur);
            cur = { header: h1[1].trim(), level: 1, body: [] };
        } else {
            cur.body.push(line);
        }
    }
    if (cur.body.length || cur.header !== null) sections.push(cur);

    return (
        <div className="pr-story-wrap">
            {sections.map((sec, i) => {
                const rawBody = sec.body.join('\n').trim();

                // ✅ level:1 (# 제목) 제거 — 최상단 대제목 숨김
                if (sec.level === 1) return null;

                const isAct   = sec.header && ACT_KEYWORDS.some(k => sec.header.includes(k));
                const hasDash = sec.header?.includes('—') || sec.header?.includes(' - ');

                const guiMatch = rawBody.match(/([\s\S]*?)\*\*🔮\s*월령신녀의\s*귀띔[^*]*\*\*:?\s*([\s\S]*)/);
                const mainBody = guiMatch ? guiMatch[1].trim() : rawBody;
                const guiBody  = guiMatch ? cleanMd(guiMatch[2]) : null;

                let actLabel = '', actTitle = '';
                if (isAct && hasDash) {
                    const dashIdx = sec.header.includes('—') ? sec.header.indexOf('—') : sec.header.indexOf(' - ');
                    actLabel = sec.header.slice(0, dashIdx).trim();
                    actTitle = sec.header.slice(dashIdx + 1).trim().replace(/^—\s*/, '');
                } else if (isAct) {
                    actLabel = sec.header;
                }

                return (
                    <div key={i} className="pr-story-section">
                        {sec.header && (
                            isAct ? (
                                <div className="pr-act-header">
                                    <span className="pr-act-tag">{actLabel}</span>
                                    {actTitle && <p className="pr-act-subtitle">{actTitle}</p>}
                                </div>
                            ) : (
                                <h2 className="pr-md-h2">{sec.header}</h2>
                            )
                        )}
                        {mainBody && mainBody.split('\n\n').map((para, pi) => {
                            const clean = cleanMd(para.trim());
                            return clean ? <p key={pi} className="pr-md-p">{clean}</p> : null;
                        })}
                        {guiBody && (
                            <div className="pr-guitim-box">
                                <div className="pr-guitim-header">
                                    <span>🔮</span>
                                    <span className="pr-guitim-title">월령신녀의 귀띔</span>
                                </div>
                                <p className="pr-guitim-body">{guiBody}</p>
                            </div>
                        )}
                        {i < sections.length - 1 && <div className="pr-md-hr"/>}
                    </div>
                );
            })}
        </div>
    );
};

// ── 운세 렌더러 (재물+직업+연애 통합) ───────────────────────────────
const FortuneRenderer = ({ text }) => {
    if (!text) return <p className="pr-md-p">내용을 불러오는 중...</p>;

    const sections = [];
    const lines = text.split('\n');
    let cur = { header: null, body: [] };
    for (const line of lines) {
        const h2 = line.match(/^##\s+(.*)/);
        if (h2) {
            if (cur.header !== null || cur.body.length) sections.push(cur);
            cur = { header: h2[1].trim(), body: [] };
        } else {
            cur.body.push(line);
        }
    }
    if (cur.header !== null || cur.body.length) sections.push(cur);

    return (
        <div className="pr-fortune-wrap">
            {sections.map((sec, si) => {
                const bodyText = sec.body.join('\n').trim();
                if (!bodyText && sec.header) return null;

                const subSections = [];
                let bCur = { header: null, body: [] };
                for (const bl of bodyText.split('\n')) {
                    const h3m = bl.match(/^###\s+(.*)/);
                    if (h3m) {
                        if (bCur.header !== null || bCur.body.length) subSections.push(bCur);
                        bCur = { header: h3m[1].trim(), body: [] };
                    } else {
                        bCur.body.push(bl);
                    }
                }
                if (bCur.header !== null || bCur.body.length) subSections.push(bCur);

                const secTitle = sec.header?.replace(/^\(\d+\)\s*/, '').trim();
                const isTitleHeader = secTitle && (secTitle.includes('님의') && secTitle.includes('운세'));


                return (
                    <div key={si} className="pr-fortune-section">
                        {secTitle && !isTitleHeader && (
                            <div className="pr-fortune-h2-wrap">
                                <h2 className="pr-fortune-h2">{secTitle}</h2>
                            </div>
                        )}
                        {subSections.map((sub, ssi) => {
                            const subBody     = sub.body.join('\n').trim();
                            const numMatch    = sub.header?.match(/^([①②③④⑤⑥⑦⑧⑨])\s*(.*)/);
                            const isHighlight = sub.header && (sub.header.includes('핵심') || sub.header.includes('한마디'));
                            if (isHighlight) return null;
                            const soloIdx   = subBody.indexOf('**[솔로');
                            const coupleIdx = subBody.indexOf('**[커플');
                            const hasCards  = soloIdx !== -1 || coupleIdx !== -1;

                            let beforeCards = subBody;
                            let soloText = '', coupleText = '';
                            if (hasCards) {
                                const firstCard = Math.min(
                                    soloIdx   !== -1 ? soloIdx   : Infinity,
                                    coupleIdx !== -1 ? coupleIdx : Infinity
                                );
                                beforeCards = subBody.slice(0, firstCard).trim();
                                const soloMatch   = subBody.match(/\*\*\[솔로[^\]]*\]\*\*([\s\S]*?)(?=\*\*\[커플|\*\*\[|$)/);
                                const coupleMatch = subBody.match(/\*\*\[커플[^\]]*\]\*\*([\s\S]*?)(?=\*\*\[|$)/);
                                soloText   = soloMatch   ? cleanMd(soloMatch[1])   : '';
                                coupleText = coupleMatch ? cleanMd(coupleMatch[1]) : '';
                            }

                            return (
                                <div key={ssi} className="pr-fortune-sub">
                                    {sub.header && (
                                        numMatch ? (
                                            <div className="pr-num-header">
                                                <span className="pr-num-circle">{numMatch[1]}</span>
                                                <span className="pr-num-title">{numMatch[2]}</span>
                                            </div>
                                        ) : (
                                            <h3 className="pr-md-h3">{sub.header}</h3>
                                        )
                                    )}
                                    {beforeCards && beforeCards.split('\n\n').map((para, pi) => {
                                        const c = cleanMd(para.trim());
                                        return c ? <p key={pi} className="pr-md-p">{c}</p> : null;
                                    })}
                                    {soloText && (
                                        <div className="pr-love-card">
                                            <div className="pr-love-card-header"><span>🌙</span><span>솔로인 경우</span></div>
                                            <p className="pr-md-p">{soloText}</p>
                                        </div>
                                    )}
                                    {coupleText && (
                                        <div className="pr-love-card">
                                            <div className="pr-love-card-header"><span>💕</span><span>커플인 경우</span></div>
                                            <p className="pr-md-p">{coupleText}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {si < sections.length - 1 && <InkDivider/>}
                    </div>
                );
            })}
        </div>
    );
};

// ── 캘린더 렌더러 (⭐ 골드 / ⚡ 경고 카드) ──────────────────────────
const CalendarRenderer = ({ text }) => {
    if (!text) return null;

    const sections = [];
    const lines = text.split('\n');
    let cur = null;
    for (const line of lines) {
        const h3 = line.match(/^###\s+(.*)/);
        const h2 = line.match(/^##\s+(.*)/);
        const h1 = line.match(/^#\s+(.*)/);
        if (h3 || h2 || h1) {
            if (cur) sections.push(cur);
            cur = { header: (h3||h2||h1)[1].trim(), body: [] };
        } else if (cur) {
            cur.body.push(line);
        } else {
            cur = { header: null, body: [line] };
        }
    }
    if (cur) sections.push(cur);

    return (
        <div className="pr-cal-wrap">
            {sections.map((sec, i) => {
                const rawBody = sec.body.join('\n').trim();

                if (!sec.header) {
                    const t = cleanMd(rawBody);
                    return t ? <p key={i} className="pr-md-p pr-cal-intro">{t}</p> : null;
                }

                // ⭐ / ⚡ 감지
                const isGold = sec.header.includes('⭐');
                const isWarn = sec.header.includes('⚡');

                // 월 번호 파싱
                const headerClean = sec.header
                    .replace(/⭐/g, '').replace(/⚡/g, '')
                    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
                    .replace(/[\u2600-\u27FF]/g, '')
                    .trim();
                const monthMatch = headerClean.match(/(\d+)월/);
                const monthNum   = monthMatch ? `${monthMatch[1]}월` : '';

                // 제목 (— 이후)
                const dashIdx = headerClean.includes('—') ? headerClean.indexOf('—')
                    : headerClean.includes('-') ? headerClean.indexOf('-') : -1;
                const monthTitle = dashIdx !== -1 ? headerClean.slice(dashIdx + 1).trim() : '';

                // 부제 (첫 줄 따옴표)
                const quoteMatch = rawBody.match(/^"([^"]+)"/) ||
                    rawBody.match(/^"([^"]+)"/) ||
                    rawBody.match(/^\*?"([^"]+)"\*?/);
                const quote = quoteMatch ? quoteMatch[1] : null;

                let bodyNoquote = rawBody
                    .replace(/^"[^"]+"\s*\n?/, '')
                    .replace(/^"[^"]+"\s*\n?/, '')
                    .trim();

                // 팁 라인 분리 (💰 ❤️ 🎯 등)
                const tipLines  = [];
                const mainLines = [];
                for (const bl of bodyNoquote.split('\n')) {
                    if (bl.match(/^(💰|❤️|🎯|💡|🌙|⚡|💪)/)) {
                        tipLines.push(bl.replace(/\*\*/g, '').trim());
                    } else {
                        mainLines.push(bl);
                    }
                }

                const mainText = cleanMd(mainLines.join('\n').trim());

                const cardClass = [
                    'pr-cal-card',
                    isGold ? 'pr-cal-card--gold' : '',
                    isWarn ? 'pr-cal-card--warn' : '',
                ].filter(Boolean).join(' ');

                return (
                    <div key={i} className={cardClass}>
                        <div className="pr-cal-header">
                            <div className="pr-cal-month-row">
                                {isGold && <span className="pr-cal-badge pr-cal-badge--gold">⭐</span>}
                                {isWarn && <span className="pr-cal-badge pr-cal-badge--warn">⚡</span>}
                                <span className="pr-cal-month">{monthNum}</span>
                                {monthTitle && <span className="pr-cal-alias">{monthTitle}</span>}
                            </div>
                            {quote && <p className="pr-cal-quote">"{quote}"</p>}
                        </div>
                        {mainText && <p className="pr-cal-body">{mainText}</p>}
                        {tipLines.length > 0 && (
                            <div className="pr-cal-tips">
                                {tipLines.map((tip, ti) => (
                                    <p key={ti} className="pr-cal-tip">{tip}</p>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── 연애·결혼 궁합 렌더러 (PART 2) ──────────────────────────────────
const LoveCompatRenderer = ({ text, name  }) => {
    console.log('=== [LOVE2 TEXT] ===\n', text?.slice(0, 500));
    if (!text) return <p className="pr-md-p">내용을 불러오는 중...</p>;

    const sections = [];
    const lines = text.split('\n');
    let cur = { header: null, level: 0, body: [] };
    for (const line of lines) {
        const h1 = line.match(/^#\s+(.*)/);
        const h2 = line.match(/^##\s+(.*)/);
        const h3 = line.match(/^###\s+(.*)/);
        if (h1) {
            if (cur.body.length || cur.header !== null) sections.push(cur);
            cur = { header: h1[1].trim(), level: 1, body: [] };
        } else if (h2) {
            if (cur.body.length || cur.header !== null) sections.push(cur);
            cur = { header: h2[1].trim(), level: 2, body: [] };
        } else if (h3) {
            if (cur.body.length || cur.header !== null) sections.push(cur);
            cur = { header: h3[1].trim(), level: 3, body: [] };
        } else {
            cur.body.push(line);
        }
    }
    if (cur.body.length || cur.header !== null) sections.push(cur);

    return (
        <div className="pr-love2-wrap">
            {sections.map((sec, i) => {
                const rawBody = sec.body.join('\n').trim();

                // ### 섹션
                if (sec.level === 3) {
                    const isTi  = sec.header.includes('띠 궁합');
                    const isPer = sec.header.includes('성격 궁합');
                    const bodyText = rawBody;

                    // 띠 궁합: **💛 OO띠** / **⚡ OO띠** 파싱
                    if (isTi) {
                        const items = [];
                        const zodiacRe = /\*\*(💛|⚡)\s*([^*]+)\*\*\s*(\([^)]*\))?\s*\n?([\s\S]*?)(?=\*\*(💛|⚡)|$)/g;
                        let m;
                        while ((m = zodiacRe.exec(bodyText)) !== null) {
                            items.push({
                                isGood: m[1] === '💛',
                                label:  m[2].trim(),
                                years:  m[3] ? m[3].trim() : '',
                                desc:   cleanMd(m[4].trim()),
                            });
                        }
                        return (
                            <div key={i} className="pr-love2-section">
                                <h3 className="pr-love2-h3">🐾 {sec.header}</h3>
                                {items.length > 0 ? items.map((z, zi) => (
                                    <div key={zi} className={`pr-zodiac-card${z.isGood ? ' pr-zodiac-card--good' : ' pr-zodiac-card--warn'}`}>
                                        <div className="pr-zodiac-top">
                                            <div className="pr-zodiac-left">
                                                <span className="pr-zodiac-emoji">{z.isGood ? '💛' : '⚡'}</span>
                                                <span className="pr-zodiac-label">{z.label}</span>
                                            </div>
                                            {z.years && <span className="pr-zodiac-years">{z.years}</span>}
                                        </div>
                                        {z.desc && <p className="pr-zodiac-desc">{z.desc}</p>}
                                    </div>
                                )) : (
                                    // fallback: 파싱 실패 시 텍스트 그대로
                                    <p className="pr-md-p">{cleanMd(bodyText)}</p>
                                )}
                            </div>
                        );
                    }

                    // 성격 궁합: **💛 인연 유형 N: ...** / **⚡ 주의할 성격** 파싱
                    if (isPer) {
                        const items = [];
                        const perRe = /\*\*(💛|⚡)\s*([^*\n]+)\*\*\s*\n?([\s\S]*?)(?=\*\*(💛|⚡)|$)/g;
                        let m;
                        while ((m = perRe.exec(bodyText)) !== null) {
                            items.push({
                                isGood: m[1] === '💛',
                                title:  m[2].trim(),
                                desc:   cleanMd(m[3].trim()),
                            });
                        }
                        return (
                            <div key={i} className="pr-love2-section">
                                <h3 className="pr-love2-h3">💛 {sec.header}</h3>
                                {items.length > 0 ? items.map((p, pi) => (
                                    <div key={pi} className={`pr-compat-card${p.isGood ? '' : ' pr-compat-card--warn'}`}>
                                        <div className="pr-compat-badge">{p.isGood ? '💛' : '⚡'}</div>
                                        <div className="pr-compat-body">
                                            <p className="pr-compat-title">{p.title.replace(/^인연\s*유형\s*\d+:\s*/i, '').replace(/^주의할\s*성격\s*/i, '⚡ 주의할 성격')}</p>
                                            {p.desc && <p className="pr-compat-desc">{p.desc}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="pr-md-p">{cleanMd(bodyText)}</p>
                                )}
                            </div>
                        );
                    }

                    // 그 외 ### 섹션 (연애·결혼 이야기, 나에게 맞는 사람, 실전 체크리스트 등)
                    return (
                        <div key={i} className="pr-love2-section">
                            <h3 className="pr-love2-h3">{sec.header}</h3>
                            {rawBody.split('\n\n').map((para, pi) => {
                                const clean = cleanMd(para.trim());
                                return clean ? <p key={pi} className="pr-md-p">{clean}</p> : null;
                            })}
                            {sec.header.includes('궁합 안내') && (
                                <div className="pr-compat-promo-card">
                                    <p className="pr-compat-promo-text">
                                        다만 여기까지는 {name}님의 사주만으로 그려본 인연의 지도예요. 띠도, 성격도, 결국 상대의 생년월일시를 나란히 펼쳐놓아야 진짜 궁합이
                                        보이는 법이지요. 마치 퍼즐 한 조각만으로는 전체 그림을 알 수 없는 것처럼요.
                                    </p>
                                    <div className="pr-compat-promo-btn">
                                        🌙 궁합 풀이 · 곧 열려요
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // ## 섹션 (일반)
                if (sec.level === 2) {
                    const isPart = /^PART\s*\d+/i.test(sec.header);
                    if (isPart) {
                        return null;
                    }
                    return (
                        <div key={i} className="pr-love2-section">
                            <h2 className="pr-love2-h2">{sec.header}</h2>
                            {rawBody.split('\n\n').map((para, pi) => {
                                return null;
                            })}
                        </div>
                    );
                }

                // 헤더 없는 본문
                return rawBody ? (
                    <div key={i}>
                        {rawBody.split('\n\n').map((para, pi) => {
                            const clean = cleanMd(para.trim());
                            return clean ? <p key={pi} className="pr-md-p">{clean}</p> : null;
                        })}
                    </div>
                ) : null;
            })}
        </div>
    );
};

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
function PremiumResult() {
    const { diagnosisId } = useParams();
    const navigate = useNavigate();
    const [result, setResult]                 = useState(null);
    const [activeTab, setActiveTab]           = useState('saju');
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading]               = useState(true);
    const [imageError, setImageError]         = useState(false);
    const [scrollPct, setScrollPct]           = useState(0);
    const cardRef   = useRef(null);
    const tabBarRef = useRef(null);
    const tabBarBottomRef = useRef(null); // 추가

    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            setScrollPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { loadResult(); }, [diagnosisId]);

    const loadResult = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login', { state: { redirectTo: `/premium/result/${diagnosisId}` } });
                return;
            }

            // ── 새 API 구조: steps.step1/step2/step3 ─────────────────
            const response = await axios.get(
                `${API_BASE_URL}/api/diagnosis/premium/${diagnosisId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const raw = response.data.result || response.data;

            let step1Text = '', step2Text = '', step3Text = '';

            // 새 구조 우선 (steps.step1.result 등)
            if (raw.steps) {
                step1Text = raw.steps.step1?.result || '';
                step2Text = raw.steps.step2?.result || '';
                step3Text = raw.steps.step3?.result || '';
            } else {
                // 구 구조 fallback
                const diagText = raw.diagnosis || raw.premium_diagnosis || '';
                const parsed   = parseDiagnosis(diagText);
                step1Text = parsed.step1;
                step2Text = parsed.step2;
                step3Text = parsed.step3;
            }

            const { calendar, love2 } = splitStep3(step3Text);
            console.log('=== [STEP3 RAW] ===\n', step3Text.slice(0, 500));
            console.log('=== [CALENDAR] ===\n', calendar.slice(0, 300));
            console.log('=== [LOVE2] ===\n', love2.slice(0, 500));
            setResult({
                ...raw,
                _p: {
                    step1:    step1Text,
                    fortune:  step2Text,   // 재물+직업+연애 전체
                    calendar: calendar,
                    love2:    love2,        // PART 2 연애·궁합
                },
            });
        } catch (error) {
            console.error('[PremiumResult 오류]', error);
            if (error.response?.status === 403) { alert('접근 권한이 없습니다.'); navigate('/'); }
            else if (error.response?.status === 401) { alert('로그인이 필요합니다.'); navigate('/login'); }
            else { alert('결과를 불러올 수 없습니다.'); navigate('/'); }
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        if (tabBarRef.current) {
            const y = tabBarRef.current.getBoundingClientRect().top + window.scrollY - 44;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }

        // 클릭한 탭 버튼을 탭 스크롤 영역 안에서 보이도록
        setTimeout(() => {
            // 상단 탭바
            const tabScroll = tabBarRef.current?.querySelector('.pr-tab-scroll');
            const activeBtn = tabBarRef.current?.querySelector('.pr-tab-btn--active');
            if (tabScroll && activeBtn) {
                const scrollLeft = activeBtn.offsetLeft - (tabScroll.clientWidth / 2) + (activeBtn.clientWidth / 2);
                tabScroll.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
            // 하단 탭바
            const tabScrollBottom = tabBarBottomRef.current?.querySelector('.pr-tab-scroll');
            const activeBtnBottom = tabBarBottomRef.current?.querySelector('.pr-tab-btn--active');
            if (tabScrollBottom && activeBtnBottom) {
                const scrollLeft = activeBtnBottom.offsetLeft - (tabScrollBottom.clientWidth / 2) + (activeBtnBottom.clientWidth / 2);
                tabScrollBottom.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }, 50);
    }, []);

    if (loading) return (
        <div className="sr-root">
            <div className="pr-loading"><div className="pr-spinner"/><p>월령신녀가 사주를 펼치는 중...</p></div>
        </div>
    );
    if (!result) return null;

    let sajuData = result.sajuData || result.saju_data || {};
    if (typeof sajuData === 'string') { try { sajuData = JSON.parse(sajuData); } catch { sajuData = {}; } }
    const { saju, elements } = sajuData;
    const { step1, fortune, calendar, love2 } = result._p || {};
    const characterImage = result.characterImage || result.character_image;

    const shareData = {
        user: sajuData.user, saju: sajuData.saju, elements: sajuData.elements, fields: sajuData.fields,
        metadata: { userName: result.name, mbti: result.mbti },
        characterImage: result.characterImage, imageMetadata: result.imageMetadata,
        name: result.name,
        birthDate: result.birthDate || result.birth_date,
        birthTime: result.birthTime || result.birth_time,
        gender: result.gender,
    };

    const renderTab = () => {
        switch (activeTab) {

            case 'saju': return (
                <div className="pr-tab-content">
                    {saju && (
                        <section className="pr-section">
                            <h2 className="sr-section-title"><span className="pr-sec-icon">📋</span> 사주팔자</h2>
                            <SajuTable saju={saju}/>
                        </section>
                    )}
                    <InkDivider/>
                    {elements && (
                        <section className="pr-section">
                            <h2 className="sr-section-title"><span className="pr-sec-icon">🔮</span> 오행 분석</h2>
                            <div className="sr-element-chart-wrap"><ElementChart elements={elements}/></div>
                            <ElementBars elements={elements}/>
                            {sajuData.dayMaster && (
                                <div className="pr-daymaster-box">
                                    <p className="pr-daymaster-text">{sajuData.dayMaster.description}</p>
                                </div>
                            )}
                            {sajuData.recommendation && (
                                <div className="pr-rec-box">
                                    <div className="pr-rec-row">
                                        <span className="pr-rec-label">보충 오행</span>
                                        <div className="pr-rec-tags">
                                            {sajuData.recommendation.useful?.map(el => (
                                                <span key={el} className="pr-rec-tag pr-rec-tag-good"
                                                      style={{ borderColor: EL_COLORS[el], color: EL_COLORS[el] }}>{el}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pr-rec-row">
                                        <span className="pr-rec-label">주의 오행</span>
                                        <div className="pr-rec-tags">
                                            {sajuData.recommendation.avoid?.map(el => (
                                                <span key={el} className="pr-rec-tag pr-rec-tag-bad"
                                                      style={{ borderColor: EL_COLORS[el], color: EL_COLORS[el] }}>{el}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                    {sajuData.fields && (
                        <>
                            <InkDivider/>
                            <section className="pr-section">
                                <h2 className="sr-section-title"><span className="pr-sec-icon">📊</span> 2026년 운세 등급</h2>
                                <div className="pr-fields-grid">
                                    {[{key:'wealth',label:'재물운'},{key:'career',label:'직업운'},{key:'love',label:'연애운'},{key:'health',label:'건강운'}].map(({key,label}) => {
                                        const f = sajuData.fields[key];
                                        const grade = typeof f==='object' ? f.grade : f;
                                        const score = typeof f==='object' ? f.score : null;
                                        const gc = grade==='S'?'#f87171':grade==='A'?'#c9a84c':grade==='B'?'#60a5fa':'#8b7355';
                                        return (
                                            <div key={key} className="pr-field-card">
                                                <p className="pr-field-label">{label}</p>
                                                <p className="pr-field-grade" style={{color:gc}}>{grade}</p>
                                                {score !== null && <p className="pr-field-score">{score}점</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            );

            case 'story': return (
                <div className="pr-tab-content">
                    <StoryRenderer text={step1}/>
                </div>
            );

            case 'fortune': return (
                <div className="pr-tab-content">
                    <FortuneRenderer text={fortune}/>
                </div>
            );

            case 'calendar': return (
                <div className="pr-tab-content">
                    <CalendarRenderer text={calendar}/>
                </div>
            );

            case 'love':
                return (
                    <div className="pr-tab-content">
                        <LoveCompatRenderer text={love2} name={result.name}/>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="sr-root">
            <div className="sr-progress" style={{ width:`${scrollPct}%` }}/>
            <div className="sr-container">
                <div className="sr-top-edge">
                    <span className="sr-logo">
                        <Crown size={14} style={{display:'inline',verticalAlign:'middle',marginRight:'4px',color:'#ffd700'}}/>
                        月令 PREMIUM
                    </span>
                    <div className="sr-nav-btns">
                        <button className="sr-btn-share" onClick={()=>setShowShareModal(true)}><Share2 size={14}/> 공유</button>
                        <button className="sr-btn-home"  onClick={()=>navigate('/')}><Home size={14}/> 홈</button>
                    </div>
                </div>

                <div className="sr-char-card">
                    <img
                        src={!imageError && characterImage
                            ? `${API_BASE_URL}${characterImage}`
                            : 'https://images.unsplash.com/photo-1548712393-27c9b837267f?q=80&w=1000&auto=format&fit=crop'}
                        className="sr-char-img" alt="운명 캐릭터" crossOrigin="anonymous"
                        onError={()=>setImageError(true)}
                    />
                    <div className="sr-char-overlay"/>
                </div>

                <div className="sr-parchment">
                    <div className="sr-edge-left"/><div className="sr-edge-right"/>
                    <div className="sr-header">
                        <p className="sr-header-brand">月令神女 · PREMIUM</p>
                        <MoonIcon/>
                        <h1 className="sr-header-name">{result.name}님의 2026년</h1>
                        {result.mbti && <span className="sr-header-mbti">{result.mbti}</span>}
                        <p className="sr-header-birth">
                            {sajuData?.user?.birthDate || result.birthDate || result.birth_date}
                        </p>
                        <p className="sr-header-time">
                            {sajuData?.user?.birthTime || formatBirthTime(result.birthTime || result.birth_time)} · {result.gender === 'M' ? '남성' : '여성'}
                        </p>
                    </div>
                    <StarDivider/>

                    <div className="pr-tab-bar" ref={tabBarRef}>
                        <div className="pr-tab-scroll">
                            {TABS.map(tab => (
                                <button key={tab.id}
                                        className={`pr-tab-btn${activeTab === tab.id?' pr-tab-btn--active':''}`}
                                        onClick={()=>handleTabChange(tab.id)}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderTab()}

                    {/* ── 하단 탭바 ── */}
                    <div className="pr-tab-bar-bottom" ref={tabBarBottomRef}>
                        <div className="pr-tab-scroll">
                            {TABS.map(tab => (
                                <button key={tab.id}
                                        className={`pr-tab-btn${activeTab===tab.id?' pr-tab-btn--active':''}`}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            // 상단 탭바도 해당 탭 중앙으로
                                            setTimeout(() => {
                                                const tabScroll = tabBarRef.current?.querySelector('.pr-tab-scroll');
                                                const activeBtn = tabBarRef.current?.querySelector('.pr-tab-btn--active');
                                                if (tabScroll && activeBtn) {
                                                    const scrollLeft = activeBtn.offsetLeft - (tabScroll.clientWidth / 2) + (activeBtn.clientWidth / 2);
                                                    tabScroll.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                                                }
                                            }, 50);
                                        }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <InkDivider/>
                    <p className="sr-closing">달빛 아래 펼쳐진 {result.name}님의 이야기<br/>월령신녀가 늘 곁에서 함께하겠어요 🌙</p>
                    <StarDivider/>
                    <p className="sr-footer-brand">月令神女 · PREMIUM</p>
                    <div className="sr-bottom-spacer"/>
                </div>

                <div className="sr-bottom-edge"><div className="sr-bottom-edge-inner"/></div>
            </div>

            <ShareModal isOpen={showShareModal} onClose={()=>setShowShareModal(false)} resultData={shareData} cardRef={cardRef}/>

            <div ref={cardRef} style={{position:'fixed',left:'-9999px',top:'0',width:'390px',backgroundColor:'#1e293b',padding:'32px 24px',borderRadius:'24px',fontFamily:'sans-serif'}}>
                <div style={{textAlign:'center',marginBottom:'20px'}}>
                    <p style={{color:'#d4af37',fontSize:'13px',letterSpacing:'2px',marginBottom:'8px'}}>月令사주 · 2026년 운세</p>
                    <h1 style={{color:'white',fontSize:'26px',fontWeight:'bold',margin:0}}>{result.name}님의 2026년</h1>
                </div>
                {characterImage && <img src={`${API_BASE_URL}${characterImage}`} alt="캐릭터" crossOrigin="anonymous" style={{width:'100%',borderRadius:'16px',marginBottom:'20px',display:'block'}}/>}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px',marginBottom:'20px'}}>
                    {[{label:'재물운',key:'wealth'},{label:'직업운',key:'career'},{label:'연애운',key:'love'},{label:'건강운',key:'health'}].map(({label,key})=>{
                        const f=sajuData.fields?.[key];
                        const grade=typeof f==='object'?f?.grade:f||'C';
                        const color=grade==='S'?'#f87171':grade==='A'?'#fbbf24':grade==='B'?'#60a5fa':'#9ca3af';
                        return(
                            <div key={key} style={{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:'12px',padding:'10px 4px',textAlign:'center'}}>
                                <p style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',margin:'0 0 4px'}}>{label}</p>
                                <p style={{color,fontSize:'28px',fontWeight:'bold',margin:0}}>{grade}</p>
                            </div>
                        );
                    })}
                </div>
                <div style={{backgroundColor:'#d4af37',borderRadius:'14px',padding:'14px',textAlign:'center'}}>
                    <p style={{color:'white',fontSize:'15px',fontWeight:'bold',margin:'0 0 4px'}}>🔮 나도 2026년 운세 보러가기</p>
                    <p style={{color:'rgba(255,255,255,0.85)',fontSize:'12px',margin:0}}>{process.env.REACT_APP_FRONTEND_URL}</p>
                </div>
            </div>
        </div>
    );
}

export default PremiumResult;