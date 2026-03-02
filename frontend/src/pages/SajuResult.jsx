// frontend/src/pages/SajuResult.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

const API_BASE_URL = process.env.REACT_APP_API_URL ;

function SajuResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};
    const [showShareModal, setShowShareModal] = useState(false);
    const [product, setProduct] = useState(null);
    const [imageError, setImageError] = useState(false);

    console.log('진단 결과 데이터:', result);
    console.log('결과 캐릭터:', result?.characterImage);

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

    useEffect(() => {
        fetchPremiumProduct();
    }, [fetchPremiumProduct]);

    if (!result) {
        navigate('/');
        return null;
    }

    const { user, saju, elements, diagnosis, usage } = result;

    const handlePremiumPayment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', {
                state: { redirectTo: '/saju-input', mode: 'premium', sajuData: user }
            });
            return;
        }

        const birthDateStr = user.birthDate;
        let year, month, day, isLunar = false;

        if (birthDateStr.includes('년')) {
            const parts = birthDateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
            if (parts) {
                year = parseInt(parts[1]);
                month = parseInt(parts[2]);
                day = parseInt(parts[3]);
            }
            if (birthDateStr.includes('음력')) isLunar = true;
        } else if (birthDateStr.includes('.')) {
            const parts = birthDateStr.split('.');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
        }

        let hour = 0;
        if (user.birthTime) {
            const timeMatch = user.birthTime.match(/(\d+)-(\d+)시/);
            if (timeMatch) hour = parseInt(timeMatch[1]);
        }

        const gender = result.imageMetadata?.gender === '남' ? 'M' : 'F';
        const mbti = result.metadata?.mbti;
        const requestData = { name: user.name, year, month, day, hour, minute: 0, isLunar, gender, mbti };

        if (!year || !month || !day) {
            alert('생년월일 정보가 올바르지 않습니다.');
            return;
        }

        navigate('/payment/premium', { state: { sajuData: requestData, product } });
    };

    // ✅ 마크다운 공통 컴포넌트
    const mdComponents = {
        h1: ({ node, ...props }) => <h2 className="section-heading" style={{ fontSize: '1.3rem', marginTop: '0' }} {...props} />,
        h2: ({ node, ...props }) => <h2 className="section-heading" {...props} />,
        h3: ({ node, ...props }) => <h3 className="section-subheading" {...props} />,
        p:  ({ node, ...props }) => <p className="section-paragraph" {...props} />,
        ul: ({ node, ...props }) => <ul className="section-list" {...props} />,
        ol: ({ node, ...props }) => <ol className="section-ordered-list" {...props} />,
        strong: ({ node, ...props }) => <strong className="highlight-text" {...props} />,
        table: ({ node, ...props }) => (
            <div className="table-wrapper"><table className="content-table" {...props} /></div>
        ),
        thead:     ({ node, ...props }) => <thead className="table-head" {...props} />,
        tbody:     ({ node, ...props }) => <tbody className="table-body" {...props} />,
        tr:        ({ node, ...props }) => <tr className="table-row" {...props} />,
        th:        ({ node, ...props }) => <th className="table-header" {...props} />,
        td:        ({ node, ...props }) => <td className="table-cell" {...props} />,
        blockquote:({ node, ...props }) => <blockquote className="quote-block" {...props} />,
    };

    // ✅ 위기 섹션 파싱
    const parseDiagnosis = (text) => {
        if (!text) return { beforeCrisis: '', crisisItems: [] };

        const lines = text.split('\n');
        const crisisLineIndex = lines.findIndex(line => /[🚨⚠️]/.test(line) && /위기/.test(line));

        if (crisisLineIndex === -1) return { beforeCrisis: text, crisisItems: [] };

        const beforeCrisis = lines.slice(0, crisisLineIndex).join('\n').trimEnd();
        const crisisSection = lines.slice(crisisLineIndex + 1).join('\n').trim();

        const crisisItems = [];

        // 빈 줄 기준으로 항목 분리
        const blocks = crisisSection.split(/\n\n+/).filter(b => b.trim());

        blocks.forEach(block => {
            const trimmed = block.trim();
            if (!trimmed) return;

            // 제목: **내용** 또는 **내용**: 또는 **내용** - 패턴
            const titleMatch = trimmed.match(/\*\*([^*]+)\*\*/);
            const title = titleMatch ? titleMatch[1].replace(/:$/, '').trim() : '위기';

            // 본문: bold 제목과 구분자(: 또는 -) 이후 내용
            const content = trimmed
                .replace(/^[•\d.]+\s*/, '')
                .replace(/\*\*[^*]+\*\*\s*[-:]\s*/, '')
                .replace(/\*\*[^*]+\*\*/, '')
                .trim();

            if (content) {
                crisisItems.push({ title, content });
            }
        });

        return { beforeCrisis, crisisItems };
    };

    const { beforeCrisis, crisisItems } = parseDiagnosis(diagnosis);

    return (
        <div className="result-page">
            <div className="container">

                {/* 상단 헤더 */}
                <div className="top-header">
                    <div className="nav-bar">
                        <span className="nav-logo">月令</span>
                        <div className="nav-actions">
                            <button onClick={() => setShowShareModal(true)} className="share-btn-top">
                                <Share2 size={18} />
                                <span className="share-text">공유</span>
                            </button>
                            <button onClick={() => navigate('/')} className="nav-link">
                                <Home size={18} className="nav-icon" />
                                <span className="nav-text">홈</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 캐릭터 카드 */}
                <div className="char-card">
                    <img
                        src={
                            !imageError && result?.characterImage
                                ? `${API_BASE_URL}${result.characterImage}`
                                : 'https://images.unsplash.com/photo-1548712393-27c9b837267f?q=80&w=1000&auto=format&fit=crop'
                        }
                        className="char-img"
                        alt="운명 캐릭터"
                        onError={() => setImageError(true)}
                    />
                    <div className="char-overlay">
                        <span className="char-sub">Your Destiny</span>
                        <h1 className="char-title">{user?.name}님의 운명</h1>
                        <p className="char-date">{user?.birthDate} | {user?.birthTime}</p>
                    </div>
                </div>

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    resultData={result}
                />

                {/* 사주팔자 */}
                <div className="result-box">
                    <div className="box-title">
                        <span className="title-icon">📋</span>
                        사주팔자
                    </div>
                    <SajuTable saju={saju} />
                </div>

                {/* 오행 분석 */}
                {elements && (
                    <div className="result-box">
                        <div className="box-title">
                            <span className="title-icon">🔮</span>
                            오행 분석
                        </div>
                        <ElementChart elements={elements} />
                        <div className="element-list">
                            {elements?.chart?.map((element) => (
                                <div key={element.element} className="element-item">
                                    <div className="element-info">
                                        <div className="element-dot" style={{ backgroundColor: element.color }} />
                                        <span className="element-name">
                                            {element.element}
                                            <span className="element-subname">({element.name})</span>
                                        </span>
                                    </div>
                                    <div className="element-stats">
                                        <span className="element-count">{elements.distribution[element.element]}개</span>
                                        <span className="element-percentage">{element.percentage}%</span>
                                        <span className={`element-status status-${
                                            elements.status[element.element] === '과다' ? 'excess' :
                                                elements.status[element.element] === '발달' ? 'develop' :
                                                    elements.status[element.element] === '적정' ? 'normal' :
                                                        elements.status[element.element] === '부족' ? 'lack' : 'none'
                                        }`}>
                                            {elements.status[element.element]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI 운세 풀이 */}
                {diagnosis && (
                    <>
                        {/* 위기 이전 내용 */}
                        <div className="result-box">
                            <div className="box-title">
                                <span className="title-icon">🎭</span>
                                AI 운세 풀이
                            </div>
                            <div className="text-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                    {beforeCrisis}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* 위기 카드 */}
                        {crisisItems.length > 0 && (
                            <div className="crisis-card">
                                <div className="crisis-card-header">
                                    <AlertTriangle size={22} className="crisis-card-icon" />
                                    <span className="crisis-card-title">위기 상황</span>
                                </div>
                                <div className="crisis-card-body">
                                    {crisisItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`crisis-item${idx < crisisItems.length - 1 ? ' crisis-item-divider' : ''}`}
                                        >
                                            <div className="crisis-item-title">
                                                <span className="crisis-item-icon">⚠️</span>
                                                <span>{item.title}</span>
                                            </div>
                                            <p className="crisis-item-content">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className="bottom-spacer" />
            </div>

            {product && (
                <PremiumPromoCard sajuData={result} productInfo={product} />
            )}
        </div>
    );
}

export default SajuResult;