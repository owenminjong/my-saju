// frontend/src/pages/PremiumGeneratePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import characterImage from './월하 메인 캐릭터.png';

function PremiumGeneratePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, sajuData } = location.state || {};

    const [step, setStep] = useState(1);
    const [stepMessage, setStepMessage] = useState('');
    const [progress, setProgress] = useState(0);

    // 🎭 단계별 메시지
    const stepMessages = {
        1: '인생 로드맵을 생성 중입니다...',
        2: '3대 핵심 분야를 분석 중입니다...',
        3: '월간 캘린더를 생성 중입니다...'
    };

    useEffect(() => {
        if (!orderId || !sajuData) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }

        console.log('🎨 프리미엄 사주 생성 시작:', { orderId, sajuData });
        generatePremiumSaju();
    }, []);

    const generatePremiumSaju = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login');
                return;
            }

            // 1️⃣ Step 1 시작
            setStep(1);
            setStepMessage(stepMessages[1]);
            setProgress(10);

            console.log('📝 Step 1: 인생 로드맵 생성 시작...');

            // ⭐ 실제 API 호출
            const response = await axios.post(
                'http://localhost:5000/api/diagnosis/premium',
                {
                    orderId: orderId,
                    sajuData: sajuData
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ 프리미엄 진단 생성 완료:', response.data);

            // 진행률 애니메이션 (백엔드 처리 시간 동안)
            animateProgress();

            // 완료 후 결과 페이지로 이동
            setTimeout(() => {
                navigate(`/premium/result/${response.data.diagnosisId}`);
            }, 8000); // 8초 후 이동

        } catch (error) {
            console.error('❌ 프리미엄 사주 생성 오류:', error);

            if (error.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                alert('유효하지 않은 결제입니다.');
                navigate('/');
            } else {
                alert('사주 생성에 실패했습니다.');
                navigate('/');
            }
        }
    };

    // 진행률 애니메이션
    const animateProgress = () => {
        let currentProgress = 10;
        const interval = setInterval(() => {
            currentProgress += 10;

            if (currentProgress === 40) {
                setStep(2);
                setStepMessage(stepMessages[2]);
            } else if (currentProgress === 70) {
                setStep(3);
                setStepMessage(stepMessages[3]);
            }

            setProgress(currentProgress);

            if (currentProgress >= 100) {
                clearInterval(interval);
            }
        }, 800); // 0.8초마다 10%씩 증가
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #050810 0%, #0a1628 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Noto Sans KR', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 배경 별 효과 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 30%, rgba(197, 160, 89, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(197, 160, 89, 0.08) 0%, transparent 50%)',
                pointerEvents: 'none'
            }}></div>

            {/* 메인 컨텐츠 */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '50px 40px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* 캐릭터 이미지 (둥실둥실) */}
                <div style={{
                    width: '150px',
                    height: '150px',
                    margin: '0 auto 30px',
                    position: 'relative',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    <img
                        src={characterImage}
                        alt="월하 캐릭터"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}
                    />

                    {/* 말풍선 */}
                    <div style={{
                        position: 'absolute',
                        top: '-80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#fff',
                        padding: '12px 20px',
                        borderRadius: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#c5a059',
                        animation: 'fadeIn 0.5s ease-in-out'
                    }}>
                        {stepMessage}
                        {/* 말풍선 꼬리 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '10px solid #fff'
                        }}></div>
                    </div>
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#2c3e50',
                    marginBottom: '10px',
                    fontFamily: "'Noto Serif KR', serif"
                }}>
                    프리미엄 사주 분석 중
                </h2>

                <p style={{
                    fontSize: '0.95rem',
                    color: '#7f8c8d',
                    marginBottom: '30px',
                    lineHeight: '1.6'
                }}>
                    AI가 당신의 운명을<br/>
                    상세하게 분석하고 있습니다
                </p>

                {/* 진행률 바 */}
                <div style={{
                    width: '100%',
                    height: '10px',
                    background: '#e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #c5a059 0%, #9a7b3a 100%)',
                        borderRadius: '10px',
                        width: `${progress}%`,
                        transition: 'width 0.8s ease'
                    }}></div>
                </div>

                <p style={{
                    fontSize: '0.9rem',
                    color: '#c5a059',
                    fontWeight: '600',
                    marginBottom: '30px'
                }}>
                    {progress}%
                </p>

                {/* 단계 표시 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    {[1, 2, 3].map(num => (
                        <div key={num} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step >= num ? 'linear-gradient(135deg, #c5a059 0%, #9a7b3a 100%)' : '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                transition: 'all 0.5s',
                                boxShadow: step >= num ? '0 4px 12px rgba(197, 160, 89, 0.4)' : 'none'
                            }}>
                                {num}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: step >= num ? '#c5a059' : '#999',
                                fontWeight: step >= num ? '600' : '400'
                            }}>
                                Step {num}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 안내 문구 */}
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, rgba(197, 160, 89, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(197, 160, 89, 0.2)'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        💎 프리미엄 풀코스 진단은<br/>
                        <strong>A4 5장 이상</strong>의 상세한 분석 결과를 제공합니다.<br/>
                        <span style={{ color: '#c5a059', fontWeight: '600' }}>
                            예상 소요 시간: 1~2분
                        </span>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default PremiumGeneratePage;