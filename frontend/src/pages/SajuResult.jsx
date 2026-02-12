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

    const handlePremiumPayment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', {
                state: { redirectTo: '/saju-input', mode: 'premium', sajuData: user }
            });
            return;
        }

        // 1️⃣ birthDate 파싱
        const birthDateStr = user.birthDate;
        let year, month, day, isLunar = false;

        if (birthDateStr.includes('년')) {
            const parts = birthDateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
            if (parts) {
                year = parseInt(parts[1]);
                month = parseInt(parts[2]);
                day = parseInt(parts[3]);
            }
            // "음력" 체크
            if (birthDateStr.includes('음력')) {
                isLunar = true;
            }
        } else if (birthDateStr.includes('.')) {
            const parts = birthDateStr.split('.');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
            day = parseInt(parts[2]);
        }

        // 2️⃣ birthTime 파싱 (예: "묘시 (토끼, 05-07시)")
        let hour = 0, minute = 0;

        if (user.birthTime) {
            // "05-07시" 형식에서 시작 시간 추출
            const timeMatch = user.birthTime.match(/(\d+)-(\d+)시/);
            if (timeMatch) {
                hour = parseInt(timeMatch[1]);
            }
        }

        // 3️⃣ ✅ result에서 gender, mbti 가져오기!
        const gender = result.imageMetadata?.gender === '남' ? 'M' : 'F';
        const mbti = result.metadata?.mbti;

        const requestData = {
            name: user.name,
            year,
            month,
            day,
            hour,
            minute,
            isLunar,
            gender,
            mbti
        };

        console.log('✅ 프리미엄 결제로 전달:', requestData);

        // 검증
        if (!year || !month || !day) {
            alert('생년월일 정보가 올바르지 않습니다.');
            console.error('파싱 실패:', { user, requestData });
            return;
        }

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

                {/* ✅ AI 운세 풀이 */}
                {diagnosis && (
                    <div className="result-box">
                        <div className="box-title">
                            <span className="title-icon">🎭</span>
                            AI 운세 풀이
                        </div>
                        <div className="text-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({node, ...props}) => (
                                        <h2 className="section-heading" style={{fontSize: '1.3rem', marginTop: '0'}} {...props} />
                                    ),
                                    h2: ({node, children, ...props}) => {
                                        const text = String(children);

                                        // 🚨 "위기" 키워드가 있으면 빨간 박스
                                        if (text.includes('위기') || text.includes('🚨')) {
                                            return (
                                                <>
                                                    <div className="crisis-box" style={{marginTop: '24px', marginBottom: '0'}}>
                                                        <div className="crisis-header">
                                                            <AlertTriangle size={22} className="crisis-icon"/>
                                                            <span className="crisis-title">{text.replace(/^\d+\.\s*/, '').replace('🚨', '').trim()}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        }

                                        return <h2 className="section-heading" {...props}>{children}</h2>;
                                    },
                                    h3: ({node, ...props}) => (
                                        <h3 className="section-subheading" {...props} />
                                    ),
                                    p: ({node, children, ...props}) => {
                                        // 위기 박스 바로 다음 p 태그는 crisis-paragraph 스타일 적용
                                        const prevSibling = node?.position?.start?.line;
                                        const text = String(children);

                                        if (text.includes('**') && (text.includes('월:') || text.includes('월 :'))) {
                                            return <p className="crisis-paragraph" {...props}>{children}</p>;
                                        }

                                        return <p className="section-paragraph" {...props}>{children}</p>;
                                    },
                                    ul: ({node, ...props}) => (
                                        <ul className="section-list" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                        <ol className="section-ordered-list" {...props} />
                                    ),
                                    strong: ({node, children, ...props}) => {
                                        const text = String(children);
                                        // 월 표시는 crisis-highlight
                                        if (text.includes('월:') || text.includes('월 :')) {
                                            return <strong className="crisis-highlight" {...props}>{children}</strong>;
                                        }
                                        return <strong className="highlight-text" {...props}>{children}</strong>;
                                    },
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
                                {diagnosis}
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
                    sajuData={result}
                    productInfo={product}
                />
            )}
        </div>
    );
}

export default SajuResult;