import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

function UserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const fetchUserDetail = async () => {
        try {
            const response = await adminAPI.getUserDetail(id);
            setData(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('회원 상세 조회 실패:', error);
            alert('회원 정보를 불러올 수 없습니다.');
            navigate('/admin/users');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString() + '원';
    };

    if (loading) {
        return <div className="p-4 sm:p-6 lg:p-8">로딩중...</div>;
    }

    if (!data) {
        return <div className="p-4 sm:p-6 lg:p-8">데이터를 불러올 수 없습니다.</div>;
    }

    const { user, orders, tokens } = data;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-4 sm:mb-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                >
                    ← 목록으로
                </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">회원 상세</h1>

            {/* 회원 정보 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">기본 정보</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">이름</div>
                        <div className="font-medium text-sm sm:text-base">{user.name}</div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">이메일</div>
                        <div className="font-medium text-sm sm:text-base break-all">{user.email}</div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">전화번호</div>
                        <div className="font-medium text-sm sm:text-base">{user.phone || '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">성별</div>
                        <div className="font-medium text-sm sm:text-base">
                            {user.gender === 'male' ? '남성' : '여성'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">생년월일</div>
                        <div className="font-medium text-sm sm:text-base">
                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString('ko-KR') : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">출생시간</div>
                        <div className="font-medium text-sm sm:text-base">{user.birth_time || '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">상태</div>
                        <div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                            }`}>
                                {user.status === 'active' ? '활성' :
                                    user.status === 'inactive' ? '비활성' : '차단'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs sm:text-sm text-gray-500">가입일</div>
                        <div className="font-medium text-xs sm:text-sm">{formatDate(user.created_at)}</div>
                    </div>
                </div>
            </div>

            {/* 주문 내역 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">주문 내역</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm sm:text-base">주문 내역이 없습니다.</p>
                ) : (
                    <>
                        {/* 모바일: 카드 레이아웃 */}
                        <div className="block lg:hidden space-y-3">
                            {orders.map((order) => (
                                <div key={order.id} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500">주문번호 #{order.id}</div>
                                            <div className="font-medium text-sm truncate">{order.product_name}</div>
                                        </div>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                            {order.status === 'completed' ? '완료' :
                                                order.status === 'pending' ? '대기' : '취소'}
                                        </span>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-600 mb-1">
                                        {formatPrice(order.amount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(order.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 데스크톱: 테이블 레이아웃 */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">주문번호</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상품명</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">금액</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">주문일</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2 text-sm">{order.id}</td>
                                        <td className="px-4 py-2 text-sm">{order.product_name}</td>
                                        <td className="px-4 py-2 text-sm font-semibold">{formatPrice(order.amount)}</td>
                                        <td className="px-4 py-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.status === 'completed' ? '완료' :
                                                        order.status === 'pending' ? '대기' : '취소'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">{formatDate(order.created_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* AI 토큰 사용 내역 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">AI 토큰 사용 내역</h2>
                {tokens.length === 0 ? (
                    <p className="text-gray-500 text-sm sm:text-base">토큰 사용 내역이 없습니다.</p>
                ) : (
                    <>
                        {/* 모바일: 카드 레이아웃 */}
                        <div className="block lg:hidden space-y-3">
                            {tokens.map((token) => (
                                <div key={token.id} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-xs text-gray-500">ID #{token.id}</div>
                                            <div className="font-semibold text-sm">{token.tokens_used} tokens</div>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {token.api_type}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(token.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 데스크톱: 테이블 레이아웃 */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">사용량</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">API 타입</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">사용일시</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {tokens.map((token) => (
                                    <tr key={token.id}>
                                        <td className="px-4 py-2 text-sm">{token.id}</td>
                                        <td className="px-4 py-2 text-sm font-semibold">{token.tokens_used}</td>
                                        <td className="px-4 py-2 text-sm">{token.api_type}</td>
                                        <td className="px-4 py-2 text-sm">{formatDate(token.created_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default UserDetailPage;
