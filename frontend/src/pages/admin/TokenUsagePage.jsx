import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

function TokenUsagePage() {
    const [usages, setUsages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchType, setSearchType] = useState('user');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);

    useEffect(() => {
        fetchTokenUsages();
    }, [filter, pagination.page]);

    const fetchTokenUsages = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getTokenUsages({
                type: filter,
                page: pagination.page,
                limit: pagination.limit,
                search: search,
                searchType: searchType
            });

            if (response.data.success) {
                setUsages(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('토큰 사용 내역 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchTokenUsages();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await adminAPI.getTokenUsageByOrder(orderId);

            if (response.data.success) {
                setOrderDetail(response.data.data);
                setSelectedOrder(orderId);
            }
        } catch (error) {
            console.error('주문 상세 조회 실패:', error);
        }
    };

    const goToPage = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    if (loading && usages.length === 0) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">🪙 토큰 사용 내역</h1>

            {/* 필터 & 검색 */}
            <div className="mb-6 space-y-4">
                {/* 타입 필터 */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setFilter('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        전체
                    </button>
                    <button
                        onClick={() => { setFilter('paid'); setPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        유료
                    </button>
                    <button
                        onClick={() => { setFilter('free'); setPagination(prev => ({ ...prev, page: 1 })); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'free' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        무료
                    </button>
                </div>

                {/* 검색 */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="user">사용자</option>
                        <option value="order">주문ID</option>
                    </select>
                    <div className="flex-1 flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="검색어 입력..."
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); handleSearch(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Search size={16} />
                            <span className="hidden sm:inline">검색</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">토큰</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {usages.map((usage, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            usage.type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {usage.type === 'paid' ? '유료' : '무료'}
                                        </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {usage.user ? (
                                        <div>
                                            <div className="font-medium">{usage.user.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{usage.user.email || '-'}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">비회원</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="font-bold text-blue-600">
                                        {usage.type === 'paid'
                                            ? usage.total_tokens.toLocaleString()
                                            : usage.tokens_used.toLocaleString()
                                        }
                                    </div>
                                    {usage.type === 'paid' && (
                                        <div className="text-xs text-gray-500">{usage.usage_count}회 호출</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {usage.order?.order_id ? (
                                        <div className="font-mono text-xs text-gray-700 truncate max-w-[150px]" title={usage.order.order_id}>
                                            {usage.order.order_id}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                    {new Date(usage.last_used_at || usage.created_at).toLocaleDateString('ko-KR')}
                                </td>
                                <td className="px-4 py-3">
                                    {usage.type === 'paid' && (
                                        <button
                                            onClick={() => fetchOrderDetail(usage.order_id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            상세보기
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 모바일 카드 리스트 */}
            <div className="lg:hidden space-y-3">
                {usages.map((usage, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4">
                        {/* 첫 번째 줄: 타입, 날짜 */}
                        <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    usage.type === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {usage.type === 'paid' ? '유료' : '무료'}
                </span>
                            <span className="text-xs text-gray-500">
                    {new Date(usage.last_used_at || usage.created_at).toLocaleDateString('ko-KR')}
                </span>
                        </div>

                        {/* 두 번째 줄: 사용자 */}
                        <div className="mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16 flex-shrink-0">사용자</span>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {usage.user ? (
                                        <span>{usage.user.name || usage.user.email || '-'}</span>
                                    ) : (
                                        <span className="text-gray-400">비회원</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 세 번째 줄: 토큰 */}
                        <div className="mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16 flex-shrink-0">토큰 사용량</span>
                                <div className="font-bold text-blue-600">
                                    {usage.type === 'paid'
                                        ? `${usage.total_tokens.toLocaleString()} (${usage.usage_count}회)`
                                        : usage.tokens_used.toLocaleString()
                                    }
                                </div>
                            </div>
                        </div>

                        {/* 네 번째 줄: 주문ID (있을 경우만) */}
                        {usage.order?.order_id && (
                            <div className="mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">주문 ID</span>
                                    <div className="text-xs font-mono text-gray-700 truncate flex-1">
                                        {usage.order.order_id}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 상세보기 버튼 */}
                        {usage.type === 'paid' && (
                            <button
                                onClick={() => fetchOrderDetail(usage.order_id)}
                                className="w-full mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                상세 보기
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const page = i + 1;
                            // 첫 페이지, 마지막 페이지, 현재 페이지 주변만 표시
                            if (
                                page === 1 ||
                                page === pagination.totalPages ||
                                (page >= pagination.page - 1 && page <= pagination.page + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                            pagination.page === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === pagination.page - 2 ||
                                page === pagination.page + 2
                            ) {
                                return <span key={page} className="px-2">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* 상세 모달 */}
            {orderDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setOrderDetail(null)}>
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">주문 토큰 상세</h2>
                            <button
                                onClick={() => setOrderDetail(null)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">주문 ID</div>
                            <div className="text-xs font-mono text-gray-800 mb-3 break-all">#{selectedOrder}</div>
                            <div className="text-sm text-gray-600">총 사용 토큰</div>
                            <div className="text-2xl font-bold text-blue-600">{orderDetail.total_tokens.toLocaleString()}</div>
                            <div className="text-sm text-gray-500 mt-1">{orderDetail.count}회 호출</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">호출 시각</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">토큰</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">API 타입</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {orderDetail.usages.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                            {new Date(item.created_at).toLocaleString('ko-KR')}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono font-medium text-gray-900">
                                            {item.tokens_used.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                            {item.api_type || '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 데이터 없음 */}
            {!loading && usages.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">토큰 사용 내역이 없습니다.</p>
                </div>
            )}
        </div>
    );
}

export default TokenUsagePage;