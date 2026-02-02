import React, { useState, useEffect } from 'react';
import { paymentAPI, adminAPI } from '../services/api';
import { loadTossPayments } from '@tosspayments/payment-sdk';

function PaymentTestPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await adminAPI.getProducts();
            setProducts(response.data.data.filter(p => p.is_active));
        } catch (error) {
            console.error('상품 조회 실패:', error);
        }
    };

    const getPaymentAmount = (product) => {
        return product.discount_price || product.price;
    };

    const handlePayment = async (product) => {
        try {
            setLoading(true);
            const paymentAmount = getPaymentAmount(product);

            console.log('결제 시작:', { product, paymentAmount });

            // 1. 결제 준비
            const prepareResponse = await paymentAPI.prepare({
                product_id: product.id,
                user_id: 1,
            });

            console.log('결제 준비 응답 (전체):', prepareResponse);
            console.log('결제 준비 응답 (data):', prepareResponse.data);

            const responseData = prepareResponse.data.data;
            console.log('응답 데이터:', responseData);

            if (!responseData) {
                throw new Error('결제 준비 응답이 올바르지 않습니다.');
            }

            const { orderId, productName, clientKey } = responseData;

            console.log('추출된 값들:', { orderId, productName, clientKey });

            if (!clientKey) {
                throw new Error('클라이언트 키를 찾을 수 없습니다. DB의 api_keys 테이블을 확인해주세요.');
            }

            // 2. 토스페이먼츠 로드
            console.log('토스페이먼츠 SDK 로딩 시작...');
            const tossPayments = await loadTossPayments(clientKey);
            console.log('토스페이먼츠 SDK 로딩 완료:', tossPayments);

            // 3. 결제 요청
            console.log('결제 요청 파라미터:', {
                amount: paymentAmount,
                orderId,
                orderName: productName,
            });

            await tossPayments.requestPayment('카드', {
                amount: paymentAmount,
                orderId: orderId,
                orderName: productName,
                customerName: '테스트유저',
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });

        } catch (error) {
            console.error('결제 오류 (상세):', error);
            console.error('에러 스택:', error.stack);

            if (error.code === 'USER_CANCEL') {
                alert('결제를 취소하셨습니다.');
            } else {
                alert(`결제 오류: ${error.message || '알 수 없는 오류'}`);
            }

            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">결제 테스트 (토스페이먼츠)</h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-800">
                        ℹ️ <strong>토스페이먼츠 테스트 모드입니다.</strong>
                    </p>
                </div>

                {/* 상품 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                        const originalPrice = parseInt(product.price);
                        const paymentPrice = getPaymentAmount(product);
                        const hasDiscount = product.discount_price && product.discount_price < originalPrice;

                        return (
                            <div key={product.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-4 text-sm min-h-[40px]">{product.description}</p>

                                {/* 가격 표시 */}
                                <div className="mb-6">
                                    {hasDiscount ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg text-gray-400 line-through">
                                                    {originalPrice.toLocaleString()}원
                                                </span>
                                                {product.discount_rate > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        {product.discount_rate}% 할인
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-3xl font-bold text-red-600">
                                                {parseInt(paymentPrice).toLocaleString()}
                                                <span className="text-lg">원</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-600">
                                            {originalPrice.toLocaleString()}
                                            <span className="text-lg">원</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePayment(product)}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        loading
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    {loading ? '처리중...' : '결제하기'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {products.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        판매 중인 상품이 없습니다.
                        <br />
                        <span className="text-sm">관리자 페이지에서 상품을 추가해주세요.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentTestPage;