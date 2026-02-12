// frontend/src/pages/PremiumResult.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Home, Crown, Share2} from 'lucide-react';
import './SajuResult.css';
import ShareModal from "../components/ShareModal";

function PremiumResult() {
    const { diagnosisId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false); // ✅ 추가

    useEffect(() => {
        loadResult();
    }, [diagnosisId]);

    const loadResult = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login', {
                    state: { redirectTo: `/premium/result/${diagnosisId}` }
                });
                return;
            }

            console.log('📥 프리미엄 결과 조회 중...', diagnosisId);

            const response = await axios.get(
                `http://localhost:5000/api/diagnosis/premium/${diagnosisId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('✅ 전체 응답:', response.data);
            console.log('📊 결과 데이터:', response.data.result);
            console.log('📝 진단 내용:', response.data.result.diagnosis);
            console.log('🎨 캐릭터 이미지:', response.data.result.characterImage); // ✅ 추가

            setResult(response.data.result);
            setLoading(false);

        } catch (error) {
            console.error('❌ 결과 조회 실패:', error);
            console.error('❌ 에러 응답:', error.response?.data);

            if (error.response?.status === 403) {
                alert('접근 권한이 없습니다.');
                navigate('/');
            } else if (error.response?.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            } else {
                alert('결과를 불러올 수 없습니다.');
                navigate('/');
            }

            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="result-page">
                <div className="container" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid rgba(255, 255, 255, 0.1)',
                            borderTop: '4px solid var(--primary-gold)',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ color: 'var(--text-sub)' }}>결과를 불러오는 중...</p>
                    </div>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    // ⭐ 진단 내용을 3개 섹션으로 분리
    const sections = result.diagnosis.split('---').map(s => s.trim()).filter(Boolean);

    // ✅ 캐릭터 이미지 경로
    const characterImage = result.characterImage || result.character_image;

    return (
        <div className="result-page">
            <div className="container">
                {/* 상단 네비게이션 */}
                <div className="top-header">
                    <div className="nav-bar">
                        <span className="nav-logo">月下 PREMIUM</span>
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

                {/* ✅ 프리미엄 캐릭터 카드 (이미지 추가) */}
                <div className="char-card" style={{
                    background: characterImage && !imageError
                        ? 'transparent'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    {/* ✅ 캐릭터 이미지 */}
                    {characterImage && !imageError && (
                        <img
                            src={`http://localhost:5000${characterImage}`}
                            className="char-img"
                            alt="운명 캐릭터"
                            onError={() => {
                                console.error('❌ 이미지 로드 실패:', characterImage);
                                setImageError(true);
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    <div className="char-overlay">
                        <Crown size={32} style={{
                            color: '#ffd700',
                            margin: '0 auto 10px',
                            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                        }}/>
                        <span className="char-sub">Premium Full Course</span>
                        <h1 className="char-title">{result.name}님의 2026년</h1>
                        <p className="char-date">
                            {result.birthDate} {result.birthTime} | {result.gender === 'M' ? '남성' : '여성'} | {result.mbti}
                        </p>
                    </div>
                </div>

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    resultData={result}
                />

                {/* 진단 내용 (3개 섹션) */}
                {sections.map((section, index) => {
                    // 섹션 제목 추출
                    const titleMatch = section.match(/^#\s+(.+)/m);
                    const sectionTitle = titleMatch ? titleMatch[1] : `Step ${index + 1}`;

                    return (
                        <div key={index} className="result-box" style={{
                            borderLeft: index === 0 ? '4px solid #667eea' :
                                index === 1 ? '4px solid #764ba2' :
                                    '4px solid #c5a059'
                        }}>
                            <div className="box-title">
                                <span className="title-icon">
                                    {index === 0 ? '🌱' : index === 1 ? '💎' : '📅'}
                                </span>
                                {sectionTitle}
                            </div>
                            <div className="text-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => (
                                            <h2 className="section-heading" {...props} />
                                        ),
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
                                    {section}
                                </ReactMarkdown>
                            </div>
                        </div>
                    );
                })}

                {/* 결제 정보 */}
                {result.order && (
                    <div className="usage-info">
                        <p>
                            💎 프리미엄 풀코스 진단 <br/>
                            결제 금액: {result.order.amount?.toLocaleString()}원 <br/>
                            생성 일시: {new Date(result.createdAt).toLocaleString('ko-KR')}
                        </p>
                    </div>
                )}

                {/* 하단 여백 */}
                <div style={{ height: '60px' }}></div>
            </div>
        </div>
    );
}

export default PremiumResult;