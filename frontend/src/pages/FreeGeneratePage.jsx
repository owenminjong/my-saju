// frontend/src/pages/FreeGeneratePage.jsx

import React, { useState, useEffect, useRef } from 'react'; // ✅ useRef 추가
import { useNavigate, useLocation } from 'react-router-dom';
import { getFreeDiagnosis } from '../services/sajuApi';
import characterImage from './월하 메인 캐릭터.png';

function FreeGeneratePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sajuData } = location.state || {};
    const hasCalledAPI = useRef(false); // ✅ 추가

    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('당신의 운명을 분석하고 있습니다...');

    useEffect(() => {
        if (!sajuData) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }

        // ✅ 중복 실행 방지
        if (hasCalledAPI.current) {
            console.log('⏭️ 이미 API 호출됨 - 스킵');
            return;
        }

        hasCalledAPI.current = true;
        console.log('🔮 무료 사주 생성 시작:', sajuData);
        generateFreeSaju();
    }, []);
    const generateFreeSaju = async () => {
        try {
            // 진행률 애니메이션 시작
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress = Math.min(currentProgress + 15, 100);  // ⭐ 100 제한

                if (currentProgress >= 50 && currentProgress < 65) {
                    setMessage('캐릭터를 생성하고 있습니다...');
                }
                if (currentProgress >= 80 && currentProgress < 95) {
                    setMessage('마지막 정리 중입니다...');
                }

                setProgress(currentProgress);

                if (currentProgress >= 100) {
                    clearInterval(interval);
                }
            }, 500);

            // API 호출
            const response = await getFreeDiagnosis(sajuData);
            console.log('✅ 무료 사주 응답:', response);

            // 100% 도달 후 결과 페이지로 이동
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        result: {
                            ...response.sajuData,
                            summary: response.sajuData.summary,
                            diagnosis: response.diagnosis,
                            usage: response.usage,
                            uniqueId: response.uniqueId,
                            characterImage: response.characterImage,
                            imageMetadata: response.imageMetadata,
                            metadata: response.metadata  // ✅ 추가!
                        }
                    }
                });
            }, 2000);

        } catch (error) {
            console.error('❌ 무료 사주 오류:', error);
            alert(error.message || '사주 생성에 실패했습니다.');
            navigate('/');
        }
    };

    const animateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 15;

            if (currentProgress >= 50) {
                setMessage('캐릭터를 생성하고 있습니다...');
            }
            if (currentProgress >= 80) {
                setMessage('마지막 정리 중입니다...');
            }

            setProgress(currentProgress);

            if (currentProgress >= 100) {
                clearInterval(interval);
            }
        }, 500);
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
                top: '10%',
                right: '10%',
                width: '150px',
                height: '150px',
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
                padding: '50px 40px',
                borderRadius: '30px',
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 80px rgba(197, 160, 89, 0.15)
                `,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* 캐릭터 + 말풍선 영역 */}
                <div style={{
                    position: 'relative',
                    width: '200px',
                    height: '250px',
                    margin: '0 auto 30px'
                }}>
                    {/* 캐릭터 이미지 (둥실둥실) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-120',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '300px',
                        height: '300px',
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

                    {/* 말풍선 (캐릭터 위쪽) */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '12px 24px',
                        borderRadius: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#c5a059',
                        animation: 'fadeIn 0.5s ease-in-out, bounce 2s ease-in-out infinite',
                        border: '2px solid rgba(197, 160, 89, 0.2)'
                    }}>
                        {message}
                        {/* 말풍선 꼬리 */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '12px solid transparent',
                            borderRight: '12px solid transparent',
                            borderTop: '12px solid rgba(255, 255, 255, 0.95)'
                        }}></div>
                    </div>
                </div>

                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '10px',
                    fontFamily: "'Noto Serif KR', serif",
                    textShadow: '0 2px 10px rgba(197, 160, 89, 0.5)'
                }}>
                    사주 분석 중
                </h2>

                <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '40px',
                    lineHeight: '1.6'
                }}>
                    AI가 당신의 운명을<br/>
                    분석하고 있습니다
                </p>

                {/* 진행률 바 */}
                <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #c5a059 0%, #f4d03f 50%, #c5a059 100%)',
                        backgroundSize: '200% 100%',
                        borderRadius: '10px',
                        width: `${progress}%`,
                        transition: 'width 0.5s ease',
                        animation: 'shimmer 2s ease-in-out infinite',
                        boxShadow: '0 0 20px rgba(197, 160, 89, 0.5)'
                    }}></div>
                </div>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#f4d03f',
                    fontWeight: '700',
                    marginBottom: '40px',
                    textShadow: '0 0 10px rgba(244, 208, 63, 0.5)'
                }}>
                    {progress}%
                </p>

                {/* 안내 문구 */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(197, 160, 89, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(197, 160, 89, 0.3)'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        ✨ 무료 베이직 진단<br/>
                        <span style={{ color: '#f4d03f', fontWeight: '600' }}>
                            잠시만 기다려주세요...
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
                        transform: translateX(-50%) translateY(-25px);
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
            `}</style>
        </div>
    );
}

export default FreeGeneratePage;