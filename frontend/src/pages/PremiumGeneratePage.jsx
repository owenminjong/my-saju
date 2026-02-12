// frontend/src/pages/PremiumGeneratePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import characterImage from './월하 메인 캐릭터.png';

function PremiumGeneratePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, sajuData } = location.state || {};
    const hasStarted = useRef(false); // ✅ 중복 실행 방지

    const [step, setStep] = useState(1);
    const [stepMessage, setStepMessage] = useState('인생 로드맵을 생성 중입니다...');
    const [progress, setProgress] = useState(0);

    // 🎭 단계별 메시지
    const stepMessages = {
        1: '인생 로드맵을 생성 중입니다...',
        2: '3대 핵심 분야를 분석 중입니다...',
        3: '월간 캘린더를 생성 중입니다...'
    };

    useEffect(() => {
        console.log('=== PremiumGeneratePage 데이터 확인 ===');
        console.log('location.state:', location.state);
        console.log('orderId:', orderId);
        console.log('sajuData:', sajuData);

        if (!orderId || !sajuData) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }

        // ✅ 중복 실행 방지
        if (hasStarted.current) {
            console.log('⏭️ 이미 생성 시작됨 - 스킵');
            return;
        }

        hasStarted.current = true;
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

            console.log('📝 프리미엄 사주 생성 API 호출...');

            // ✅ 진행률 애니메이션 시작 (30초 동안 90%까지)
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }

                    const newProgress = prev + 3; // 3%씩 증가

                    // 단계 업데이트
                    if (newProgress >= 30 && newProgress < 60) {
                        setStep(2);
                        setStepMessage(stepMessages[2]);
                    } else if (newProgress >= 60) {
                        setStep(3);
                        setStepMessage(stepMessages[3]);
                    }

                    return newProgress;
                });
            }, 1000); // 1초마다 3%씩 증가

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
                    },
                    withCredentials: true
                }
            );

            console.log('✅ 프리미엄 진단 생성 완료:', response.data);

            // ✅ API 완료 후 100%로 즉시 변경
            clearInterval(progressInterval);
            setProgress(100);
            setStepMessage('완료되었습니다!');

            // 잠시 대기 후 결과 페이지로 이동
            setTimeout(() => {
                // ✅ sessionStorage 정리
                sessionStorage.removeItem('premiumOrderData');
                navigate(`/premium/result/${response.data.diagnosisId}`);
            }, 1500);

        } catch (error) {
            console.error('❌ 프리미엄 사주 생성 오류:', error);

            if (error.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                alert('유효하지 않은 결제입니다.');
                navigate('/');
            } else {
                alert(error.response?.data?.message || '사주 생성에 실패했습니다.');
                navigate('/');
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Noto Sans KR', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 🌟 별빛 배경 효과 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 1%),
                    radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 1%),
                    radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.06) 0%, transparent 1%),
                    radial-gradient(circle at 60% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 1%),
                    radial-gradient(circle at 90% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 1%)
                `,
                backgroundSize: '50px 50px, 80px 80px, 60px 60px, 70px 70px, 90px 90px',
                animation: 'twinkle 3s ease-in-out infinite',
                pointerEvents: 'none'
            }}></div>

            {/* 🌙 달빛 효과 */}
            <div style={{
                position: 'absolute',
                top: '5%',
                right: '5%',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                filter: 'blur(30px)',
                animation: 'pulse 4s ease-in-out infinite',
                pointerEvents: 'none'
            }}></div>

            {/* 메인 컨텐츠 */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                padding: '30px 25px',
                borderRadius: '25px',
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 80px rgba(197, 160, 89, 0.15)
                `,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                maxWidth: '420px',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* 캐릭터 + 말풍선 영역 */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '180px',
                    margin: '0 auto 25px'
                }}>
                    {/* 캐릭터 이미지 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '220px',
                        height: '220px',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <img
                            src={characterImage}
                            alt="월하 캐릭터"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 8px 16px rgba(197, 160, 89, 0.3))'
                            }}
                        />
                    </div>

                    {/* 말풍선 */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '10px 20px',
                        borderRadius: '18px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#c5a059',
                        animation: 'fadeIn 0.5s ease-in-out, bounce 2s ease-in-out infinite',
                        border: '2px solid rgba(197, 160, 89, 0.2)',
                        maxWidth: '90%'
                    }}>
                        {stepMessage}
                        {/* 말풍선 꼬리 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '10px solid rgba(255, 255, 255, 0.95)'
                        }}></div>
                    </div>
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '8px',
                    fontFamily: "'Noto Serif KR', serif",
                    textShadow: '0 2px 10px rgba(197, 160, 89, 0.5)'
                }}>
                    프리미엄 사주 분석 중
                </h2>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '30px',
                    lineHeight: '1.5'
                }}>
                    AI가 당신의 운명을<br/>
                    상세하게 분석하고 있습니다
                </p>

                {/* 진행률 바 */}
                <div style={{
                    width: '100%',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #c5a059 0%, #f4d03f 50%, #c5a059 100%)',
                        backgroundSize: '200% 100%',
                        borderRadius: '10px',
                        width: `${progress}%`,
                        transition: 'width 1s ease',
                        animation: 'shimmer 2s ease-in-out infinite',
                        boxShadow: '0 0 20px rgba(197, 160, 89, 0.5)'
                    }}></div>
                </div>

                <p style={{
                    fontSize: '1rem',
                    color: '#f4d03f',
                    fontWeight: '700',
                    marginBottom: '25px',
                    textShadow: '0 0 10px rgba(244, 208, 63, 0.5)'
                }}>
                    {progress}%
                </p>

                {/* 단계 표시 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '25px'
                }}>
                    {[1, 2, 3].map(num => (
                        <div key={num} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step >= num
                                    ? 'linear-gradient(135deg, #f4d03f 0%, #c5a059 100%)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: step >= num ? '#1a1a2e' : 'rgba(255, 255, 255, 0.3)',
                                fontWeight: '700',
                                fontSize: '1rem',
                                transition: 'all 0.5s',
                                boxShadow: step >= num ? '0 4px 20px rgba(244, 208, 63, 0.4)' : 'none',
                                border: step >= num ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                {num}
                            </div>
                            <span style={{
                                fontSize: '0.7rem',
                                color: step >= num ? '#f4d03f' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: step >= num ? '600' : '400',
                                textShadow: step >= num ? '0 0 10px rgba(244, 208, 63, 0.3)' : 'none'
                            }}>
                                Step {num}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 안내 문구 */}
                <div style={{
                    padding: '18px',
                    background: 'rgba(197, 160, 89, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(197, 160, 89, 0.3)'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        💎 프리미엄 풀코스 진단<br/>
                        <strong style={{ color: '#f4d03f' }}>A4 5장 이상</strong>의 상세한 분석<br/>
                        <span style={{ color: '#f4d03f', fontWeight: '600' }}>
                            예상 소요 시간: 1~2분
                        </span>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateX(-50%) translateY(0px);
                    }
                    50% {
                        transform: translateX(-50%) translateY(-20px);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) scale(1);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateX(-50%) translateY(0px);
                    }
                    50% {
                        transform: translateX(-50%) translateY(-5px);
                    }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.1);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }

                /* ✅ 모바일 최적화 */
                @media (max-height: 667px) {
                    /* 작은 화면에서 컴팩트하게 */
                }

                @media (max-width: 360px) {
                    /* 초소형 화면 대응 */
                }
            `}</style>
        </div>
    );
}

export default PremiumGeneratePage;