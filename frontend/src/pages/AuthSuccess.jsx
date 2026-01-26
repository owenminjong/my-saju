// frontend/src/pages/AuthSuccess.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // 토큰 저장
            localStorage.setItem('token', token);

            // 메인 페이지로 이동
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]">
            <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">✨</div>
                <h1 className="text-2xl font-bold text-white mb-2">로그인 성공!</h1>
                <p className="text-white/70">잠시 후 메인 페이지로 이동합니다...</p>
            </div>
        </div>
    );
}

export default AuthSuccess;