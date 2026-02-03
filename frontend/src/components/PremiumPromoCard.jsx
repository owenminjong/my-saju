import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PremiumPromoCard.css';

function PremiumPromoCard({ sajuData, productInfo }) {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        // ✅ promotion_active가 1일 때만 타이머 작동
        if (productInfo?.promotion_active === 1) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [productInfo]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handlePaymentClick = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', {
                state: {
                    redirectTo: '/result',
                    sajuData: sajuData,
                    productInfo: productInfo
                }
            });
            return;
        }

        let processedSajuData = { ...sajuData };

        if (sajuData.birthDate && !sajuData.year) {
            const parts = sajuData.birthDate.split('.');
            processedSajuData = {
                ...sajuData,
                year: parseInt(parts[0]),
                month: parseInt(parts[1]),
                day: parseInt(parts[2]),
                hour: parseInt(sajuData.hour || 0),
                minute: parseInt(sajuData.minute || 0)
            };
            delete processedSajuData.birthDate;
        }

        console.log('결제 페이지로 이동:', { processedSajuData, productInfo });

        navigate('/payment/premium', {
            state: {
                sajuData: processedSajuData,
                product: productInfo
            }
        });
    };

    const originalPrice = productInfo?.price || 50000;
    const salePrice = productInfo?.discount_price || originalPrice;
    const discountRate = productInfo?.discount_rate || 0;
    const isPromotionActive = productInfo?.promotion_active === 1;

    return (
        <div className="promo-section">
            <div className="promo-card">
                {/* ✅ promotion_active가 1일 때만 타이머 표시 */}
                {isPromotionActive && (
                    <div className="timer-badge">
                        ⏳ 마감 임박 : <span id="timer">{formatTime(timeLeft)}</span>
                    </div>
                )}

                <h3 className="promo-title">종합 운세 전체 풀이</h3>
                <p className="promo-desc">재물운, 연애운, 월별 흐름 완벽 분석</p>

                {/* ✅ promotion_active가 1이고 할인가가 있을 때만 할인 표시 */}
                {isPromotionActive && productInfo.discount_price ? (
                    <div className="price-row">
                        <span className="price-old">{originalPrice.toLocaleString()}원</span>
                        <span className="price-new">{salePrice.toLocaleString()}원</span>
                        {discountRate > 0 && (
                            <span className="discount-label">-{discountRate}%</span>
                        )}
                    </div>
                ) : (
                    <div className="price-row">
                        <span className="price-new">{originalPrice.toLocaleString()}원</span>
                    </div>
                )}

                <button className="pay-btn" onClick={handlePaymentClick}>
                    전체 풀이 확인하기 🔓
                </button>
            </div>
        </div>
    );
}

export default PremiumPromoCard;