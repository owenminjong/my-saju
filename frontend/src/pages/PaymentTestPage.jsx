import React, { useState, useEffect } from 'react';
import { paymentAPI, adminAPI } from '../services/api';

function PaymentTestPage() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
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

    const handlePayment = async (product) => {
        try {
            setLoading(true);

            // 1. 결제 준비 (주문 생성)
            const prepareResponse = await paymentAPI.prepare({
                product_id: product.id,
                user_id: 1, // 테스트용
            });

            const { merchantUid, productName, amount, impCode } = prepareResponse.data.data;

            // 2. 아임포트 결제 요청
            const IMP = window.IMP;
            IMP.init(impCode);

            IMP.request_pay(
                {
                    channelKey: 'channel-key-bd980fd9-1085-4a03-a7db-086a8cc3724d', // 나이스페이 채널키
                    pay_method: 'card',
                    merchant_uid: merchantUid,
                    name: productName,
                    amount: amount,
                    buyer_email: 'test@test.com',
                    buyer_name: '테스트유저',
                    buyer_tel: '010-1234-5678',
                    buyer_addr: '서울특별시 강남구',
                    buyer_postcode: '06000',
                },
                async (response) => {
                    if (response.success) {
                        // 3. 결제 검증
                        try {
                            const verifyResponse = await paymentAPI.verify({
                                imp_uid: response.imp_uid,
                                merchant_uid: response.merchant_uid,
                            });

                            alert(`✅ 결제 성공!\n주문번호: ${verifyResponse.data.data.orderId}\n결제금액: ${amount.toLocaleString()}원`);
                            setLoading(false);
                        } catch (error) {
                            console.error('결제 검증 실패:', error);
                            alert('❌ 결제 검증에 실패했습니다.');
                            setLoading(false);
                        }
                    } else {
                        alert(`❌ 결제 실패: ${response.error_msg}`);
                        setLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('결제 오류:', error);
            alert('결제 준비에 실패했습니다.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">결제 테스트 (나이스페이)</h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-800">
                        ℹ️ <strong>나이스페이 테스트 모드입니다.</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                        <strong>테스트 카드번호:</strong> 5465-1234-5678-9012
                    </p>
                    <p className="text-sm text-blue-700">
                        <strong>유효기간:</strong> 12/25 / <strong>CVC:</strong> 123 / <strong>비밀번호:</strong> 00
                    </p>
                </div>

                {/* 상품 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-4 text-sm min-h-[40px]">{product.description}</p>
                            <div className="text-3xl font-bold text-blue-600 mb-6">
                                {parseInt(product.price).toLocaleString()}
                                <span className="text-lg">원</span>
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
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        판매 중인 상품이 없습니다.
                        <br />
                        <span className="text-sm">관리자 페이지에서 상품을 추가해주세요.</span>
                    </div>
                )}

                {/* 결제 테스트 가이드 */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">💳 결제 테스트 가이드</h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                            <span className="font-bold min-w-[20px]">1.</span>
                            <span>위 상품 중 하나를 선택하고 "결제하기" 클릭</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="font-bold min-w-[20px]">2.</span>
                            <div>
                                <div>결제창에서 테스트 카드 정보 입력:</div>
                                <div className="mt-2 bg-gray-50 p-3 rounded">
                                    <div>카드번호: <code className="bg-white px-2 py-1 rounded">5465-1234-5678-9012</code></div>
                                    <div>유효기간: <code className="bg-white px-2 py-1 rounded">12/25</code></div>
                                    <div>CVC: <code className="bg-white px-2 py-1 rounded">123</code></div>
                                    <div>비밀번호: <code className="bg-white px-2 py-1 rounded">00</code></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="font-bold min-w-[20px]">3.</span>
                            <span>결제 완료 후 관리자 페이지 → 회원 관리 → 회원 상세에서 주문 내역 확인</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentTestPage;