// frontend/src/pages/PremiumResult.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SajuTable from '../components/SajuTable';
import ElementChart from '../components/ElementChart';
import ShareModal from '../components/ShareModal';
import { Home, Crown, Share2, AlertTriangle } from 'lucide-react';
import './SajuResult.css';

const API_BASE_URL = process.env.REACT_APP_API_URL ;

function PremiumResult() {
    const { diagnosisId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef(null);

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
                `${API_BASE_URL}/api/diagnosis/premium/${diagnosisId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('✅ 전체 응답:', response.data);
            console.log('📊 사주 데이터:', response.data.result.sajuData);

            setResult(response.data.result);
            setLoading(false);

        } catch (error) {
            console.error('❌ 결과 조회 실패:', error);

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

// ✅ sajuData 파싱 (문자열이면 JSON.parse)
    let sajuData = result.sajuData || {};

    if (typeof sajuData === 'string') {
        try {
            sajuData = JSON.parse(sajuData);
            console.log('✅ sajuData 파싱 완료:', sajuData);
        } catch (error) {
            console.error('❌ sajuData 파싱 실패:', error);
            sajuData = {};
        }
    }

    const { user, saju, elements } = sajuData;

    const formatBirthTime = (time) => {
        if (!time) return '';
        const hour = parseInt(time);
        const siMap = [
            { range: [23, 1],  name: '자시 (子時)' },
            { range: [1, 3],   name: '축시 (丑時)' },
            { range: [3, 5],   name: '인시 (寅時)' },
            { range: [5, 7],   name: '묘시 (卯時)' },
            { range: [7, 9],   name: '진시 (辰時)' },
            { range: [9, 11],  name: '사시 (巳時)' },
            { range: [11, 13], name: '오시 (午時)' },
            { range: [13, 15], name: '미시 (未時)' },
            { range: [15, 17], name: '신시 (申時)' },
            { range: [17, 19], name: '유시 (酉時)' },
            { range: [19, 21], name: '술시 (戌時)' },
            { range: [21, 23], name: '해시 (亥時)' },
        ];
        const found = siMap.find(s => hour >= s.range[0] && hour < s.range[1]);
        return found ? found.name : time;
    };


// ✅ ShareModal에 전달할 데이터 재구성
    const shareData = {
        user: sajuData.user,
        saju: sajuData.saju,
        elements: sajuData.elements,
        fields: sajuData.fields,
        metadata: {
            userName: result.name,
            mbti: result.mbti,
            grades: sajuData.fields
        },
        characterImage: result.characterImage,
        imageMetadata: result.imageMetadata,
        name: result.name,
        birthDate: result.birthDate,
        birthTime: result.birthTime,
        gender: result.gender
    };

// ✅ 프리미엄 진단을 3개 섹션으로 분리
    const sections = result.diagnosis.split('---').map(s => s.trim()).filter(Boolean);

// ✅ 캐릭터 이미지 경로
    const characterImage = result.characterImage || result.character_image;
    return (
        <div className="result-page">
            <div className="container">
                {/* 상단 네비게이션 */}
                <div className="top-header">
                    <div className="nav-bar">
                        <span className="nav-logo">
                            <Crown size={20} style={{
                                display: 'inline',
                                verticalAlign: 'middle',
                                marginRight: '4px',
                                color: '#ffd700'
                            }}/>
                            月令 PREMIUM
                        </span>
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
                        src={!imageError && characterImage
                            ? `${API_BASE_URL}${characterImage}`
                            : "https://images.unsplash.com/photo-1548712393-27c9b837267f?q=80&w=1000&auto=format&fit=crop"
                        }
                        className="char-img"
                        alt="운명 캐릭터"
                        crossOrigin="anonymous"
                        onError={() => setImageError(true)}
                    />
                    <div className="char-overlay">
                        <Crown size={32} style={{
                            color: '#ffd700',
                            margin: '0 auto 10px',
                            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                        }}/>
                        <span className="char-sub">Premium Full Course</span>
                        <h1 className="char-title">{result.name}님의 2026년</h1>
                        <p className="char-date">
                            {result.birthDate} {formatBirthTime(result.birthTime)} | {result.gender === 'M' ? '남성' : '여성'} | {result.mbti}
                        </p>
                        <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '8px'}}>
                            {process.env.REACT_APP_FRONTEND_URL}
                        </p>
                    </div>
                </div>

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    resultData={shareData}
                    cardRef={cardRef}
                />

                {/* 📋 사주팔자 표 */}
                {saju && (
                    <div className="result-box">
                        <div className="box-title">
                            <span className="title-icon">📋</span>
                            사주팔자
                        </div>
                        <SajuTable saju={saju}/>
                    </div>
                )}

                {/* 🔮 오행 분석 */}
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

                {/* 💎 프리미엄 진단 3단계 */}
                {sections.map((section, index) => {
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
                                            <h2 className="section-heading"
                                                style={{fontSize: '1.3rem', marginTop: '0'}} {...props} />
                                        ),
                                        h2: ({node, children, ...props}) => {
                                            const text = String(children);

                                            if (text.includes('위기') || text.includes('🚨')) {
                                                return (
                                                    <div className="crisis-box"
                                                         style={{marginTop: '24px', marginBottom: '0'}}>
                                                        <div className="crisis-header">
                                                            <AlertTriangle size={22} className="crisis-icon"/>
                                                            <span
                                                                className="crisis-title">{text.replace(/^\d+\.\s*/, '').replace('🚨', '').trim()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return <h2 className="section-heading" {...props}>{children}</h2>;
                                        },
                                        h3: ({node, ...props}) => (
                                            <h3 className="section-subheading" {...props} />
                                        ),
                                        p: ({node, children, ...props}) => {
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
                                            if (text.includes('월:') || text.includes('월 :')) {
                                                return <strong
                                                    className="crisis-highlight" {...props}>{children}</strong>;
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
                                    {section}
                                </ReactMarkdown>
                            </div>
                        </div>
                    );
                })}

                {/* 하단 여백 */}
                <div className="bottom-spacer"></div>
            </div>
            {/* 인스타 공유용 숨겨진 카드 - 화면 밖에 렌더링 */}
            <div
                ref={cardRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '0',
                    width: '390px',
                    backgroundColor: '#1e293b',
                    padding: '32px 24px',
                    borderRadius: '24px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* 상단 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ color: '#d4af37', fontSize: '13px', letterSpacing: '2px', marginBottom: '8px' }}>
                        月令사주 · 2026년 운세
                    </p>
                    <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                        {result.name}님의 2026년
                    </h1>
                </div>

                {/* 캐릭터 이미지 */}
                {characterImage && (
                    <img
                        src={`${API_BASE_URL}${characterImage}`}
                        alt="캐릭터"
                        crossOrigin="anonymous"
                        style={{
                            width: '100%',
                            borderRadius: '16px',
                            marginBottom: '20px',
                            display: 'block',
                        }}
                    />
                )}

                {/* 등급 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '20px',
                }}>
                    {[
                        { label: '재물운', key: 'wealth' },
                        { label: '직업운', key: 'career' },
                        { label: '연애운', key: 'love' },
                        { label: '건강운', key: 'health' },
                    ].map(({ label, key }) => {
                        const grade = typeof sajuData.fields?.[key] === 'object'
                            ? sajuData.fields?.[key]?.grade
                            : sajuData.fields?.[key] || 'C';
                        const color = grade === 'S' ? '#f87171' : grade === 'A' ? '#fbbf24' : grade === 'B' ? '#60a5fa' : '#9ca3af';
                        return (
                            <div key={key} style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '10px 4px',
                                textAlign: 'center',
                            }}>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '0 0 4px' }}>{label}</p>
                                <p style={{ color, fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{grade}</p>
                            </div>
                        );
                    })}
                </div>

                {/* 나도 보러가기 버튼 영역 */}
                <div style={{
                    backgroundColor: '#d4af37',
                    borderRadius: '14px',
                    padding: '14px',
                    textAlign: 'center',
                }}>
                    <p style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px' }}>
                        🔮 나도 2026년 운세 보러가기
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0 }}>
                        {process.env.REACT_APP_FRONTEND_URL}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PremiumResult;