// frontend/src/pages/PremiumPaymentSuccess.jsx

import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

function PremiumPaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isConfirming = useRef(false);

    useEffect(() => {
        if (isConfirming.current) return;
        confirmPayment();
    }, []);

    const confirmPayment = async () => {
        if (isConfirming.current) return;
        isConfirming.current = true;

        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        console.log('💳 결제 승인 시작:', { paymentKey, orderId, amount });

        try {
            // 1️⃣ 결제 승인
            const response = await paymentAPI.confirm({
                paymentKey,
                orderId,
            });

            console.log('✅ 결제 승인 완료:', response.data);

            // 2️⃣ sessionStorage에서 사주 데이터 가져오기
            const orderData = JSON.parse(sessionStorage.getItem('premiumOrderData'));

            if (!orderData) {
                alert('❌ 주문 데이터를 찾을 수 없습니다.');
                navigate('/');
                return;
            }

            console.log('📦 주문 데이터:', orderData);

            // 3️⃣ PremiumGeneratePage로 이동 (데이터 전달)
            navigate('/premium/generate', {
                state: {
                    orderId: orderId,  // 토스 orderId (UUID)
                    dbOrderId: response.data.order?.id,  // DB orders 테이블의 id
                    amount: amount,
                    sajuData: orderData.sajuData,
                    product: orderData.product
                }
            });

        } catch (error) {
            console.error('❌ 결제 승인 실패:', error);

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
                    animation: 'spin 1.2s linear infinite'
                }}></div>

                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50' }}>
                    결제 처리 중...
                </p>
                <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    잠시만 기다려주세요
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