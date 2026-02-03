import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { loadTossPayments } from '@tosspayments/payment-sdk';

function PremiumPaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sajuData, product } = location.state || {};
    const isProcessing = useRef(false); // ✅ 중복 방지

    useEffect(() => {
        console.log('=== PremiumPaymentPage 마운트 ===');

        if (!sajuData || !product) {
            alert('잘못된 접근입니다.');
            navigate('/');
            return;
        }

        // ✅ 이미 처리 중이면 무시
        if (isProcessing.current) {
            console.log('이미 결제 처리 중...');
            return;
        }

        isProcessing.current = true;
        handlePayment();
    }, []);

    const getPaymentAmount = (product) => {
        if (product.promotion_active === 1 && product.discount_price) {
            return product.discount_price;
        }
        return product.price;
    };

    const handlePayment = async () => {
        try {
            const paymentAmount = getPaymentAmount(product);

            console.log('결제 시작:', { product, paymentAmount });

            const prepareResponse = await paymentAPI.prepare({
                product_id: product.id,
                user_id: 1,
            });

            console.log('결제 준비 완료:', prepareResponse.data);

            const responseData = prepareResponse.data.data;
            const { orderId, productName, clientKey } = responseData;

            if (!clientKey) {
                throw new Error('클라이언트 키를 찾을 수 없습니다.');
            }

            console.log('토스페이먼츠 SDK 로딩...');
            const tossPayments = await loadTossPayments(clientKey);

            await tossPayments.requestPayment('카드', {
                amount: paymentAmount,
                orderId: orderId,
                orderName: productName,
                customerName: sajuData.name || '테스트유저',
                successUrl: `${window.location.origin}/payment/premium/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });

        } catch (error) {
            console.error('결제 오류:', error);

            if (error.code === 'USER_CANCEL') {
                alert('결제를 취소하셨습니다.');
            } else {
                alert(`결제 오류: ${error.message || '알 수 없는 오류'}`);
            }

            isProcessing.current = false;
            navigate(-1);
        }
    };

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
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(197, 160, 89, 0.2)',
                    borderTop: '4px solid #c5a059',
                    borderRadius: '50%',
                    margin: '0 auto 25px',
                    animation: 'spin 1s linear infinite'
                }}></div>

                <h2 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#2c3e50',
                    marginBottom: '15px',
                    fontFamily: "'Noto Serif KR', serif"
                }}>
                    결제창을 불러오는 중...
                </h2>

                {product && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, rgba(197, 160, 89, 0.05) 100%)',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        margin: '20px 0',
                        border: '1px solid rgba(197, 160, 89, 0.2)'
                    }}>
                        <p style={{
                            fontSize: '1rem',
                            color: '#34495e',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            {product.name}
                        </p>
                        <p style={{
                            fontSize: '1.8rem',
                            fontWeight: '700',
                            color: '#c5a059',
                            fontFamily: "'Noto Serif KR', serif"
                        }}>
                            {getPaymentAmount(product).toLocaleString()}원
                        </p>
                    </div>
                )}

                <p style={{
                    fontSize: '0.9rem',
                    color: '#7f8c8d',
                    marginTop: '10px'
                }}>
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

export default PremiumPaymentPage;