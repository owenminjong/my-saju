// SajuResult.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';
import ShareModal from '../components/ShareModal';
import PremiumPromoCard from '../components/PremiumPromoCard';
import { Share2, Home, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../services/api';
import './SajuResult.css';

function SajuResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};
    const [showShareModal, setShowShareModal] = useState(false);
    const [product, setProduct] = useState(null);
    const [imageError, setImageError] = useState(false);

    console.log('진단 결과 데이터:', result);
    console.log('결과 캐릭터:', result?.characterImage);

    // ✅ useCallback으로 메모이제이션
    const fetchPremiumProduct = useCallback(async () => {
        try {
            const response = await adminAPI.getProducts();
            const premiumProduct = response.data.data.find(
                p => p.name.includes('프리미엄') && p.is_active
            );
            if (premiumProduct) {
                setProduct(premiumProduct);
            }
        } catch (error) {
            console.error('상품 조회 실패:', error);
            setProduct({
                price: 50000,
                discount_price: 29900,
                discount_rate: 40,
                promotion_active: 1
            });
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

    // ✅ 진단 결과를 3개 섹션으로 분리
    const diagnosisParts = diagnosis ? diagnosis.split('## 📊 운명 성적표') : ['', ''];
    const characterSection = diagnosisParts[0];

    const remainingText = diagnosisParts[1] || '';
    const crisisParts = remainingText.split('## 🚨 위기 상황');

    const scoreTableSection = crisisParts[0] ? `## 📊 운명 성적표${crisisParts[0]}` : '';
    const crisisSection = crisisParts[1] ? `## 🚨 위기 상황${crisisParts[1]}` : '';

    // ✅ 프리미엄 결제 버튼 클릭 핸들러
    const handlePremiumPayment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', {
                state: { redirectTo: '/saju-input', mode: 'premium', sajuData: user }
            });
            return;
        }

        const dateParts = user.birthDate.split('.');
        const requestData = {
            name: user.name,
            year: parseInt(dateParts[0]),
            month: parseInt(dateParts[1]),
            day: parseInt(dateParts[2]),
            hour: parseInt(user.hour || 0),
            minute: parseInt(user.minute || 0),
            isLunar: user.isLunar || false,
            gender: user.gender,
            mbti: user.mbti
        };

        navigate('/payment/premium', {
            state: { sajuData: requestData, product: product }
        });
    };

    return (
        <div className="result-page">
            <div className="container">
                {/* 상단 네비게이션 + 공유 버튼 통합 */}
                <div className="top-header">
                    <div className="nav-bar">
                        <span className="nav-logo">月下</span>
                        <div className="nav-actions">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="share-btn-top"
                            >
                                <Share2 size={18}/>
                                <span className="share-text">공유</span>
                            </button>
                            <button onClick={() => navigate('/')} className="nav-link">
                                <Home size={18} className="nav-icon"/>
                                <span className="nav-text">홈</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 캐릭터 카드 */}
                <div className="char-card">
                    <img
                        src={!imageError && result?.characterImage
                            ? `http://localhost:5000${result.characterImage}`
                            : "https://images.unsplash.com/photo-1548712393-27c9b837267f?q=80&w=1000&auto=format&fit=crop"
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

                {/* 🎭 캐릭터 섹션 */}
                {characterSection && (
                    <div className="result-box">
                        <div className="box-title">
                            <span className="title-icon">🎭</span>
                            운명 이평
                        </div>
                        <div className="text-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({node, ...props}) => (
                                        <h2 className="section-heading" {...props} />
                                    ),
                                    p: ({node, ...props}) => (
                                        <p className="section-paragraph" {...props} />
                                    ),
                                    strong: ({node, ...props}) => (
                                        <strong className="highlight-text" {...props} />
                                    ),
                                }}
                            >
                                {characterSection}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* 📋 사주팔자 표 */}
                <div className="result-box">
                    <div className="box-title">
                        <span className="title-icon">📋</span>
                        사주팔자
                    </div>
                    <SajuTable saju={saju}/>
                </div>

                {/* 오행 분석 */}
                {elements && (
                    <div className="result-box">
                        <div className="box-title">
                            <span className="title-icon">🔮</span>
                            오행 분석
                        </div>
                        <ElementChart elements={elements}/>
                        <div className="element-list">
                            {elements?.chart?.map((element) => (
                                <div key={element.element} className="element-item">
                                    <div className="element-info">
                                        <div
                                            className="element-dot"
                                            style={{backgroundColor: element.color}}
                                        ></div>
                                        <span className="element-name">
                      {element.element}
                                            <span className="element-subname">({element.name})</span>
                    </span>
                                    </div>
                                    <div className="element-stats">
                    <span className="element-count">
                      {elements.distribution[element.element]}개
                    </span>
                                        <span className="element-percentage">
                      {element.percentage}%
                    </span>
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

                {/* 📊 운명 성적표 + 기타 섹션 */}
                {scoreTableSection && (
                    <div className="result-box">
                        <div className="text-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({node, ...props}) => (
                                        <h2 className="section-heading" {...props} />
                                    ),
                                    h3: ({node, ...props}) => (
                                        <h3 className="section-subheading" {...props} />
                                    ),
                                    p: ({node, ...props}) => (
                                        <p className="section-paragraph" {...props} />
                                    ),
                                    ul: ({node, ...props}) => (
                                        <ul className="section-list" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                        <ol className="section-ordered-list" {...props} />
                                    ),
                                    strong: ({node, ...props}) => (
                                        <strong className="highlight-text" {...props} />
                                    ),
                                    table: ({node, ...props}) => (
                                        <div className="table-wrapper">
                                            <table className="content-table" {...props} />
                                        </div>
                                    ),
                                    thead: ({node, ...props}) => (
                                        <thead className="table-head" {...props} />
                                    ),
                                    tbody: ({node, ...props}) => (
                                        <tbody className="table-body" {...props} />
                                    ),
                                    tr: ({node, ...props}) => (
                                        <tr className="table-row" {...props} />
                                    ),
                                    th: ({node, ...props}) => (
                                        <th className="table-header" {...props} />
                                    ),
                                    td: ({node, ...props}) => (
                                        <td className="table-cell" {...props} />
                                    ),
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="quote-block" {...props} />
                                    )
                                }}
                            >
                                {scoreTableSection}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* 🚨 위기 상황 섹션 (특별 디자인) */}
                {crisisSection && (
                    <div className="crisis-box">
                        <div className="crisis-header">
                            <AlertTriangle size={24} className="crisis-icon"/>
                            <span className="crisis-title">위기 상황</span>
                        </div>
                        <div className="crisis-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({node, ...props}) => null, // 제목 숨김 (이미 헤더에 있음)
                                    h3: ({node, ...props}) => (
                                        <h3 className="crisis-subheading" {...props} />
                                    ),
                                    p: ({node, ...props}) => (
                                        <p className="crisis-paragraph" {...props} />
                                    ),
                                    strong: ({node, ...props}) => (
                                        <strong className="crisis-highlight" {...props} />
                                    ),
                                }}
                            >
                                {crisisSection}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* 토큰 사용량 */}
                {usage && (
                    <div className="usage-info">
                        <p>📊 분석 토큰: Input {usage.input_tokens} + Output {usage.output_tokens} = {usage.input_tokens + usage.output_tokens} tokens</p>
                    </div>
                )}

                {/* 하단 여백 */}
                <div className="bottom-spacer"></div>
            </div>

            {/* ✅ 프리미엄 프로모션 카드 */}
            {product && (
                <PremiumPromoCard
                    sajuData={user}
                    productInfo={product}
                    onPaymentClick={handlePremiumPayment}
                />
            )}
        </div>
    );
}

export default SajuResult;
