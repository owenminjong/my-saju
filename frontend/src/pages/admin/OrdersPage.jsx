// frontend/src/pages/admin/OrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, RefreshCw, X, DollarSign } from 'lucide-react';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: '',
        endDate: '',
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search, filters.status, filters.startDate, filters.endDate]);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const response = await adminAPI.getOrders({
                page,
                limit: 20,
                ...filters,
            });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
            setLoading(false);
        } catch (error) {
            console.error('주문 목록 조회 실패:', error);
            setLoading(false);
        }
    };

    const handleOrderDetail = async (orderId) => {
        try {
            const response = await adminAPI.getOrderDetail(orderId);
            setSelectedOrder(response.data.order);
            setShowDetailModal(true);
        } catch (error) {
            console.error('주문 상세 조회 실패:', error);
            alert('주문 정보를 불러올 수 없습니다.');
        }
    };

    const handleCancelOrder = async (orderId) => {
        const reason = prompt('취소 사유를 입력하세요', '관리자 취소');
        if (!reason) return;

        if (!window.confirm('정말 이 주문을 취소하시겠습니까?\n결제가 전액 취소되고 환불 처리됩니다.')) {
            return;
        }

        try {
            await adminAPI.cancelOrder(orderId, reason);
            alert('주문이 취소되었습니다.');
            fetchOrders();
            setShowDetailModal(false);
        } catch (error) {
            console.error('주문 취소 실패:', error);
            alert(error.response?.data?.message || '주문 취소에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString() + '원';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: '대기중', class: 'bg-yellow-100 text-yellow-800' },
            completed: { label: '완료', class: 'bg-blue-100 text-blue-800' },
            cancelled: { label: '환불', class: 'bg-red-100 text-red-800' },
            failed: { label: '실패', class: 'bg-gray-100 text-gray-800' },
        };
        const badge = statusMap[status] || statusMap.pending;
        return <span className={`px-2 py-1 text-xs rounded-full ${badge.class}`}>{badge.label}</span>;
    };

    const getPaymentMethod = (method) => {
        const methodMap = {
            card: '카드',
            trans: '실시간계좌이체',
            vbank: '가상계좌',
            phone: '휴대폰',
            kakaopay: '카카오페이',
            tosspay: '토스페이',
        };
        return methodMap[method] || method;
    };

    if (loading && orders.length === 0) {
        return <div className="p-4 sm:p-6 lg:p-8">로딩중...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">주문/결제 관리</h1>
                <button
                    onClick={() => fetchOrders(pagination.page)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                >
                    <RefreshCw size={18} />
                    새로고침
                </button>
            </div>

            {/* 필터 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">검색 (이름/이메일)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="이름 또는 이메일"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">상태</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                            <option value="">전체</option>
                            <option value="pending">대기중</option>
                            <option value="completed">결제완료</option>
                            <option value="cancelled">환불</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">결제일 (시작)</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">결제일 (종료)</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* 주문 목록 */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center text-gray-500">
                    주문 내역이 없습니다.
                </div>
            ) : (
                <>
                    {/* 모바일: 카드 레이아웃 */}
                    <div className="block lg:hidden space-y-3 sm:space-y-4">
                        {orders.map((order) => (
                            <div key={`order-mobile-${order.id}`} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-500">#{order.order_id}</div>
                                        <h3 className="font-bold text-base truncate">{order.Product?.name}</h3>
                                        <p className="text-sm text-gray-600 truncate">{order.User?.name} ({order.User.email ? order.User.email : '이메일 미제공'})</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">금액:</span>
                                        <span className="ml-1 font-semibold">{formatPrice(order.amount)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">결제:</span>
                                        <span className="ml-1">{getPaymentMethod(order.payment_method)}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 mb-3">
                                    {order.paid_at ? `결제: ${formatDate(order.paid_at)}` : formatDate(order.created_at)}
                                </div>

                                <button
                                    onClick={() => handleOrderDetail(order.id)}
                                    className="w-full px-3 py-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 text-sm"
                                >
                                    상세보기
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 데스크톱: 테이블 레이아웃 */}
                    <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회원</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제수단</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={`order-${order.id}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{order.order_id.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {order.Product?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.User?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatPrice(order.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getPaymentMethod(order.payment_method)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.paid_at ? formatDate(order.paid_at) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleOrderDetail(order.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                상세
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={`page-${page}`}
                                onClick={() => fetchOrders(page)}
                                className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
                                    page === pagination.page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 주문 상세 모달 */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">주문 상세</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* 주문 정보 */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">주문번호</div>
                                    <div className="font-medium text-sm sm:text-base break-all">{selectedOrder.order_id}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">상태</div>
                                    <div>{getStatusBadge(selectedOrder.status)}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">상품명</div>
                                    <div className="font-medium text-sm sm:text-base">{selectedOrder.Product?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">금액</div>
                                    <div className="font-semibold text-base sm:text-lg text-blue-600">
                                        {formatPrice(selectedOrder.amount)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">결제수단</div>
                                    <div className="font-medium text-sm sm:text-base">
                                        {getPaymentMethod(selectedOrder.payment_method)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">결제키</div>
                                    <div className="font-mono text-xs sm:text-sm break-all">
                                        {selectedOrder.payment_key || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">회원명</div>
                                    <div className="font-medium text-sm sm:text-base">{selectedOrder.User?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">이메일</div>
                                    <div className="text-sm sm:text-base break-all">{selectedOrder.User.email ? selectedOrder.User.email : '미제공'}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-gray-500">주문일시</div>
                                    <div className="text-xs sm:text-sm">{formatDate(selectedOrder.created_at)}</div>
                                </div>
                                {selectedOrder.cancelled_at && (
                                    <div>
                                        <div className="text-xs sm:text-sm text-gray-500">취소일시</div>
                                        <div className="text-xs sm:text-sm text-red-600 font-medium">
                                            {formatDate(selectedOrder.cancelled_at)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 환불 정보 */}
                            {selectedOrder.refunded_amount > 0 && (
                                <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign size={18} className="text-purple-600" />
                                        <span className="font-semibold text-purple-900 text-sm sm:text-base">환불 정보</span>
                                    </div>
                                    <div className="text-sm sm:text-base">
                                        환불금액: <span className="font-bold">{formatPrice(selectedOrder.refunded_amount)}</span>
                                    </div>
                                </div>
                            )}

                            {/* 관리 버튼 */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                                {selectedOrder.status === 'completed' ? (
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                    >
                                        결제 취소
                                    </button>
                                ) : (
                                    <div className="text-center text-gray-500 py-2 text-sm sm:text-base">
                                        {selectedOrder.status === 'cancelled' && '이미 취소된 주문입니다.'}
                                        {selectedOrder.status === 'refunded' && '이미 환불된 주문입니다.'}
                                        {selectedOrder.status === 'pending' && '결제 대기 중입니다.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrdersPage;