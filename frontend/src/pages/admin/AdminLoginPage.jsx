import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== 🔐 로그인 시작 ===');
        console.log('username:', username);
        console.log('password:', password);

        setError('');
        setLoading(true);

        try {
            console.log('📤 POST 요청 전송...');

            const response = await api.post('/admin/auth/login', {
                username,
                password
            });

            console.log('📥 응답 받음:', response.data);

            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));

                console.log('✅ 로그인 성공, 페이지 이동');
                navigate('/admin');
            }
        } catch (err) {
            console.error('❌ 에러 발생:', err);
            console.error('❌ 에러 응답:', err.response);
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
            console.log('=== 🏁 로그인 종료 ===');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    관리자 로그인
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            아이디
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                            placeholder="1234"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    admin / 1234
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;