// frontend/src/pages/AuthFail.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthFail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
                <div className="text-6xl mb-4">😢</div>
                <h1 className="text-2xl font-bold text-white mb-4">로그인 실패</h1>
                <p className="text-white/70 mb-6">
                    {error || '로그인 중 오류가 발생했습니다.'}
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
                >
                    다시 시도하기
                </button>
            </div>
        </div>
    );
}

export default AuthFail;