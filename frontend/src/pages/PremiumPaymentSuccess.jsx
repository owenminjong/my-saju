import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import axios from 'axios';

function PremiumPaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isConfirming = useRef(false);

    useEffect(() => {
        if (isConfirming.current) {
            return;
        }
        confirmPayment();
    }, []);

    const confirmPayment = async () => {
        if (isConfirming.current) {
            return;
        }
        isConfirming.current = true;

        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');

        console.log('결제 승인 시작:', { paymentKey, orderId });

        try {
            // 1. 결제 승인
            const response = await paymentAPI.confirm({
                paymentKey,
                orderId,
            });

            console.log('결제 승인 완료:', response.data);

            // 2. 더미 데이터로 무료 사주 API 호출 (테스트)
            console.log('🤖 AI 프리미엄 분석 시작 (더미)');

            const dummyData = {
                name: '프리미엄 테스트',
                year: 1990,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                isLunar: false,
                gender: 'M',
                mbti: 'ISTJ'
            };

            const sajuResponse = await axios.post('http://localhost:5000/api/diagnosis/free', dummyData);

            console.log('✅ AI 분석 완료:', sajuResponse.data);

            // 3. 결과 페이지로 이동
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        result: {
                            ...sajuResponse.data.sajuData,
                            diagnosis: sajuResponse.data.diagnosis,
                            usage: sajuResponse.data.usage,
                            uniqueId: sajuResponse.data.uniqueId,
                            isPremium: true, // ✅ 프리미엄 표시
                            orderId: orderId
                        }
                    }
                });
            }, 1000);

        } catch (error) {
            console.error('결제 승인 실패:', error);

            if (error.response?.data?.message?.includes('기존 요청')) {
                alert('✅ 결제가 이미 완료되었습니다!');
                navigate('/');
            } else {
                alert('❌ 결제 승인에 실패했습니다.');
                navigate('/');
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #050810 0%, #0a1628 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(197, 160, 89, 0.2)',
                    borderTop: '4px solid #c5a059',
                    borderRadius: '50%',
                    margin: '0 auto 25px',
                    animation: 'spin 1.2s linear infinite',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(197, 160, 89, 0.3)',
                        borderBottom: '3px solid #c5a059',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        animation: 'spin 1.5s linear infinite reverse'
                    }}></div>
                </div>

                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50', marginBottom: '10px' }}>
                    프리미엄 사주 생성 중...
                </p>
                <p style={{ fontSize: '0.95rem', color: '#7f8c8d', marginBottom: '5px' }}>
                    결제가 완료되었습니다!
                </p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    AI가 상세한 분석을 진행하고 있습니다
                </p>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default PremiumPaymentSuccess;