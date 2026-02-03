import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function PremiumGeneratePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, dbOrderId, amount } = location.state || {};

    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(1);
    const [stepMessage, setStepMessage] = useState('');

    useEffect(() => {
        if (!orderId) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }

        console.log('프리미엄 사주 생성 시작:', { orderId, dbOrderId, amount });
        generatePremiumSaju();
    }, []);

    const generatePremiumSaju = async () => {
        try {
            // 1단계: 주문 정보 조회
            setStep(1);
            setStepMessage('주문 정보를 확인하고 있습니다...');
            setProgress(10);
            await sleep(1000);

            // 2단계: 사주 데이터 조회
            setStep(2);
            setStepMessage('사주 정보를 불러오고 있습니다...');
            setProgress(30);
            await sleep(1000);

            // 3단계: AI 프리미엄 분석 (더미 API 호출)
            setStep(3);
            setStepMessage('AI가 당신의 운명을 상세히 분석하고 있습니다...');
            setProgress(50);

            console.log('🤖 AI 분석 시작 (더미)');

            // ✅ 더미 데이터로 무료 API 호출
            const dummyData = {
                name: '테스트',
                year: 1990,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                isLunar: false,
                gender: 'M',
                mbti: 'ISTJ'
            };

            const response = await axios.post('http://localhost:5000/api/diagnosis/free', dummyData);

            console.log('✅ AI 분석 완료:', response.data);

            setProgress(80);
            await sleep(1500);

            // 4단계: 리포트 생성
            setStep(4);
            setStepMessage('프리미엄 리포트를 생성하고 있습니다...');
            setProgress(95);
            await sleep(1000);

            setProgress(100);
            await sleep(500);

            // 완료 - 결과 페이지로
            console.log('🎉 프리미엄 사주 생성 완료!');
            alert('✅ 프리미엄 사주가 생성되었습니다!');

            navigate('/premium/result', {
                state: {
                    orderId: orderId,
                    result: response.data
                }
            });

        } catch (error) {
            console.error('❌ 프리미엄 사주 생성 오류:', error);
            alert('사주 생성에 실패했습니다.');
            navigate('/');
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #050810 0%, #0a1628 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Noto Sans KR', sans-serif"
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '50px 40px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%'
            }}>
                {/* 이중 스피너 */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 30px',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        border: '4px solid rgba(197, 160, 89, 0.2)',
                        borderTop: '4px solid #c5a059',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        position: 'absolute'
                    }}></div>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '3px solid rgba(197, 160, 89, 0.3)',
                        borderBottom: '3px solid #c5a059',
                        borderRadius: '50%',
                        animation: 'spin 1.5s linear infinite reverse',
                        position: 'absolute',
                        top: '10px',
                        left: '10px'
                    }}></div>
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
                    fontSize: '1rem',
                    color: '#7f8c8d',
                    marginBottom: '30px',
                    lineHeight: '1.6',
                    minHeight: '48px'
                }}>
                    {stepMessage}
                </p>

                {/* 진행률 바 */}
                <div style={{
                    width: '100%',
                    height: '8px',
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
                        transition: 'width 0.5s ease'
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
                    gap: '10px',
                    marginBottom: '30px'
                }}>
                    {[1, 2, 3, 4].map(num => (
                        <div key={num} style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: step >= num ? '#c5a059' : '#e0e0e0',
                            transition: 'background 0.3s'
                        }}></div>
                    ))}
                </div>

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
                        A4 5장 이상의 상세한 분석 결과를<br/>
                        제공합니다.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default PremiumGeneratePage;