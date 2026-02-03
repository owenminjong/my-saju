import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, status]);

    const fetchUsers = async (page = 1) => {
        try {
            const response = await adminAPI.getUsers({
                page,
                limit: 10,
                search,
                status,
            });
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
            setInitialLoading(false);
        } catch (error) {
            console.error('회원 목록 조회 실패:', error);
            setInitialLoading(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`회원 상태를 "${newStatus}"로 변경하시겠습니까?`)) {
            return;
        }

        try {
            await adminAPI.updateUserStatus(userId, newStatus);
            alert('상태가 변경되었습니다.');
            fetchUsers();
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('정말 이 회원을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            alert('회원이 삭제되었습니다.');
            fetchUsers();
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert('회원 삭제에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    if (initialLoading) {
        return <div className="p-8 text-gray-900">로딩중...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">회원 관리</h1>

            {/* 검색 및 필터 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">검색</label>
                        <input
                            type="text"
                            placeholder="이름, 이메일, 전화번호"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">상태</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            <option value="">전체</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="banned">차단</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 회원 목록 테이블 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">검색 결과가 없습니다.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.status}
                                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                        className={`px-2 py-1 text-xs rounded-full border-0 ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        <option value="active">활성</option>
                                        <option value="inactive">비활성</option>
                                        <option value="banned">차단</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        상세
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchUsers(page)}
                                className={`px-4 py-2 rounded ${
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
        </div>
    );
}

export default UsersPage;
