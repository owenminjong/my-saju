// frontend/src/pages/FreeGeneratePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFreeDiagnosis } from '../services/sajuApi';
import characterImage from './월하 메인 캐릭터.png';

function FreeGeneratePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sajuData } = location.state || {};
    const hasCalledAPI = useRef(false);

    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('당신의 운명을 분석하고 있습니다...');

    useEffect(() => {
        if (!sajuData) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }
        if (hasCalledAPI.current) return;
        hasCalledAPI.current = true;
        generateFreeSaju();
    }, []);

    const generateFreeSaju = async () => {
        try {
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress = Math.min(currentProgress + 15, 100);
                if (currentProgress >= 50 && currentProgress < 65) setMessage('캐릭터를 생성하고 있습니다...');
                if (currentProgress >= 80 && currentProgress < 95) setMessage('마지막 정리 중입니다...');
                setProgress(currentProgress);
                if (currentProgress >= 100) clearInterval(interval);
            }, 500);

            const response = await getFreeDiagnosis(sajuData);

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
                            metadata: response.metadata
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

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            fontFamily: "'Noto Sans KR', sans-serif",
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            {/* 별빛 배경 */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `
                    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 1%),
                    radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08) 0%, transparent 1%),
                    radial-gradient(circle at 60% 80%, rgba(255,255,255,0.1) 0%, transparent 1%)
                `,
                backgroundSize: '50px 50px, 80px 80px, 70px 70px',
                animation: 'twinkle 3s ease-in-out infinite',
                pointerEvents: 'none'
            }} />

            {/* 달빛 */}
            <div style={{
                position: 'absolute', top: '5%', right: '5%',
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
                animation: 'pulse 4s ease-in-out infinite',
                pointerEvents: 'none'
            }} />

            {/* 메인 카드 */}
            <div style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                padding: '20px 24px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 60px rgba(197,160,89,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                maxWidth: '420px',
                width: '100%',
                position: 'relative',
                zIndex: 1,
                boxSizing: 'border-box'
            }}>
                {/* 캐릭터 + 말풍선 */}
                <div style={{
                    position: 'relative',
                    height: '140px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                }}>
                    {/* 말풍선 */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255,255,255,0.95)',
                        padding: '8px 18px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#c5a059',
                        border: '2px solid rgba(197,160,89,0.2)',
                        zIndex: 2
                    }}>
                        {message}
                        <div style={{
                            position: 'absolute',
                            bottom: '-10px', left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '10px solid rgba(255,255,255,0.95)'
                        }} />
                    </div>

                    {/* 캐릭터 */}
                    <div style={{
                        width: '110px', height: '110px',
                        animation: 'float 3s ease-in-out infinite',
                        flexShrink: 0
                    }}>
                        <img
                            src={characterImage}
                            alt="월하 캐릭터"
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 6px 12px rgba(197,160,89,0.3))'
                            }}
                        />
                    </div>
                </div>

                {/* 타이틀 */}
                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '6px',
                    fontFamily: "'Noto Serif KR', serif",
                    textShadow: '0 2px 10px rgba(197,160,89,0.5)'
                }}>
                    사주 분석 중
                </h2>

                <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>
                    AI가 당신의 운명을 분석하고 있습니다
                </p>

                {/* 진행률 바 */}
                <div style={{
                    width: '100%', height: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px', overflow: 'hidden',
                    marginBottom: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #c5a059 0%, #f4d03f 50%, #c5a059 100%)',
                        backgroundSize: '200% 100%',
                        borderRadius: '10px',
                        width: `${progress}%`,
                        transition: 'width 0.5s ease',
                        animation: 'shimmer 2s ease-in-out infinite',
                        boxShadow: '0 0 16px rgba(197,160,89,0.5)'
                    }} />
                </div>

                <p style={{
                    fontSize: '1rem',
                    color: '#f4d03f',
                    fontWeight: '700',
                    marginBottom: '16px',
                    textShadow: '0 0 10px rgba(244,208,63,0.5)'
                }}>
                    {progress}%
                </p>

                {/* 안내 문구 */}
                <div style={{
                    padding: '14px 16px',
                    background: 'rgba(197,160,89,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(197,160,89,0.3)'
                }}>
                    <p style={{
                        fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.9)',
                        lineHeight: '1.5',
                        margin: 0
                    }}>
                        ✨ 무료 베이직 진단&nbsp;&nbsp;
                        <span style={{ color: '#f4d03f', fontWeight: '600' }}>
                            잠시만 기다려주세요...
                        </span>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}

export default FreeGeneratePage;