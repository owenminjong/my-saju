// frontend/src/components/PremiumPromoCard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PremiumPromoCard.css';

function PremiumPromoCard({ sajuData, productInfo }) {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
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

    // frontend/src/components/PremiumPromoCard.jsx

    const handlePaymentClick = () => {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 프리미엄 결제 시작');
        console.log('='.repeat(60));

        // 1️⃣ 받은 데이터 확인
        console.log('\n📦 받은 sajuData:', sajuData);
        console.log('📦 받은 productInfo:', productInfo);

        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login', {
                state: {
                    redirectTo: window.location.pathname,
                    sajuData: sajuData,
                    productInfo: productInfo
                }
            });
            return;
        }

        let processedSajuData = {};

        // 2️⃣ 시나리오 구분
        const isResultObject = sajuData.user && sajuData.saju && sajuData.elements;
        const isFormData = sajuData.name && sajuData.birthDate && !sajuData.user;

        console.log('\n🔍 데이터 타입 분석:');
        console.log('  - sajuData.user 존재:', !!sajuData.user);
        console.log('  - sajuData.saju 존재:', !!sajuData.saju);
        console.log('  - sajuData.elements 존재:', !!sajuData.elements);
        console.log('  - sajuData.metadata 존재:', !!sajuData.metadata);
        console.log('  - sajuData.name 존재:', !!sajuData.name);
        console.log('  - sajuData.birthDate 존재:', !!sajuData.birthDate);
        console.log('  - isResultObject:', isResultObject);
        console.log('  - isFormData:', isFormData);

        if (isResultObject) {
            // 📋 시나리오 1: 무료 결과 → 프리미엄
            console.log('\n✅ 시나리오 1: 무료 결과 → 프리미엄');
            console.log('─'.repeat(60));

            const { user } = sajuData;
            console.log('👤 user 객체:', user);

            let year, month, day, isLunar = false;

            // birthDate 파싱
            console.log('\n📅 birthDate 파싱 시작:', user.birthDate);
            if (user.birthDate.includes('년')) {
                const match = user.birthDate.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
                if (match) {
                    year = parseInt(match[1]);
                    month = parseInt(match[2]);
                    day = parseInt(match[3]);
                    console.log('  ✅ 파싱 성공:', { year, month, day });
                } else {
                    console.error('  ❌ 파싱 실패');
                }
                if (user.birthDate.includes('음력')) {
                    isLunar = true;
                    console.log('  🌙 음력 확인됨');
                }
            }

            // birthTime 파싱
            console.log('\n⏰ birthTime 파싱 시작:', user.birthTime);
            let hour = 0, minute = 0;
            if (user.birthTime) {
                const timeMatch = user.birthTime.match(/(\d+)-(\d+)시/);
                if (timeMatch) {
                    hour = parseInt(timeMatch[1]);
                    console.log('  ✅ 시간 파싱 성공:', hour);
                } else {
                    console.error('  ❌ 시간 파싱 실패');
                }
            }

            // gender 추출
            console.log('\n👫 gender 추출:');
            console.log('  - imageMetadata:', sajuData.imageMetadata);
            console.log('  - imageMetadata.gender:', sajuData.imageMetadata?.gender);
            const gender = sajuData.imageMetadata?.gender === '남' ? 'M' : 'F';
            console.log('  ✅ 변환 결과:', gender);

            // mbti 추출
            console.log('\n🧠 MBTI 추출:');
            console.log('  - metadata:', sajuData.metadata);
            console.log('  - metadata.mbti:', sajuData.metadata?.mbti);
            const mbti = sajuData.metadata?.mbti;
            console.log('  ✅ 최종 MBTI:', mbti);

            processedSajuData = {
                name: user.name,
                year,
                month,
                day,
                hour,
                minute,
                isLunar,
                gender,
                mbti
            };

            console.log('\n✅ [시나리오 1] 파싱 완료:', processedSajuData);

        } else if (isFormData) {
            // 📋 시나리오 2: 사주 입력 → 바로 프리미엄
            console.log('\n✅ 시나리오 2: 사주 입력 → 프리미엄');
            console.log('─'.repeat(60));

            // 입력 검증
            console.log('\n🔐 입력 검증:');
            console.log('  - name:', sajuData.name);
            console.log('  - birthDate:', sajuData.birthDate);
            console.log('  - gender:', sajuData.gender);
            console.log('  - mbti:', sajuData.mbti);
            console.log('  - hour:', sajuData.hour);
            console.log('  - minute:', sajuData.minute);
            console.log('  - isLunar:', sajuData.isLunar);

            if (!sajuData.name || !sajuData.birthDate || !sajuData.gender || !sajuData.mbti) {
                console.error('❌ 필수 정보 누락!');
                alert('모든 필수 정보를 입력해주세요.');
                return;
            }

            // birthDate 파싱
            console.log('\n📅 birthDate 파싱:', sajuData.birthDate);
            const dateParts = sajuData.birthDate.split('.');
            console.log('  - split 결과:', dateParts);

            if (dateParts.length !== 3) {
                console.error('  ❌ 형식 오류');
                alert('생년월일 형식이 올바르지 않습니다.');
                return;
            }

            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]);
            const day = parseInt(dateParts[2]);
            console.log('  ✅ 파싱 성공:', { year, month, day });

            if (!year || !month || !day) {
                console.error('  ❌ 숫자 변환 실패');
                alert('올바른 생년월일을 입력해주세요.');
                return;
            }

            processedSajuData = {
                name: sajuData.name,
                year,
                month,
                day,
                hour: parseInt(sajuData.hour || 0),
                minute: parseInt(sajuData.minute || 0),
                isLunar: sajuData.isLunar || false,
                gender: sajuData.gender,
                mbti: sajuData.mbti
            };

            console.log('\n✅ [시나리오 2] 파싱 완료:', processedSajuData);

        } else {
            console.error('\n❌ 알 수 없는 데이터 형식!');
            console.error('받은 데이터:', sajuData);
            alert('데이터 형식이 올바르지 않습니다.');
            return;
        }

        // 3️⃣ 최종 검증
        console.log('\n🔍 최종 검증:');
        console.log('  - year:', processedSajuData.year);
        console.log('  - month:', processedSajuData.month);
        console.log('  - day:', processedSajuData.day);
        console.log('  - gender:', processedSajuData.gender);
        console.log('  - mbti:', processedSajuData.mbti);

        if (!processedSajuData.year || !processedSajuData.month || !processedSajuData.day) {
            console.error('❌ 생년월일 정보 누락');
            alert('생년월일 정보가 올바르지 않습니다.');
            return;
        }

        if (!processedSajuData.gender || !processedSajuData.mbti) {
            console.error('❌ 성별 또는 MBTI 누락');
            alert('성별과 MBTI 정보가 필요합니다.');
            return;
        }

        console.log('\n✅ 검증 통과!');
        console.log('\n📤 최종 전달 데이터:');
        console.log(JSON.stringify(processedSajuData, null, 2));
        console.log('\n' + '='.repeat(60));
        console.log('🚀 결제 페이지로 이동');
        console.log('='.repeat(60) + '\n');

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
                {isPromotionActive && (
                    <div className="timer-badge">
                        ⏳ 마감 임박 : <span id="timer">{formatTime(timeLeft)}</span>
                    </div>
                )}

                <h3 className="promo-title">종합 운세 전체 풀이</h3>
                <p className="promo-desc">재물운, 연애운, 월별 흐름 완벽 분석</p>

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