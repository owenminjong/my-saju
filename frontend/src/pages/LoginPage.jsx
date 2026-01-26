// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const navigate = useNavigate();
    const [socialLogins, setSocialLogins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSocialLogins();
    }, []);

    const fetchSocialLogins = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/social-logins');
            setSocialLogins(response.data.data);
        } catch (error) {
            console.error('소셜 로그인 목록 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/kakao';
    };

    const handleNaverLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/naver';
    };

    const socialLoginButtons = {
        kakao: (
            <button
                key="kakao"
                onClick={handleKakaoLogin}
                className="w-full bg-[#FEE500] text-[#000000] py-4 rounded-2xl font-bold hover:bg-[#FDD835] transition-all flex items-center justify-center gap-3 hover:scale-105"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.253 2 10.253c0 2.625 1.768 4.929 4.432 6.238-.183.676-.674 2.5-.777 2.899-.12.464.171.458.36.333.143-.095 2.186-1.453 3.111-2.071.594.082 1.207.124 1.874.124 5.523 0 10-3.253 10-7.253S17.523 3 12 3z"/>
                </svg>
                카카오로 시작하기
            </button>
        ),
        naver: (
            <button
                key="naver"
                onClick={handleNaverLogin}
                className="w-full bg-[#03C75A] text-white py-4 rounded-2xl font-bold hover:bg-[#02B350] transition-all flex items-center justify-center gap-3 hover:scale-105"
            >
                <span className="text-2xl font-bold">N</span>
                네이버로 시작하기
            </button>
        )
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">

                {/* 로고 & 타이틀 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">✨</div>
                    <h1 className="text-3xl font-bold text-white mb-2">MyLifeCode</h1>
                    <p className="text-white/70">AI 사주 × MBTI 웹서비스</p>
                </div>

                {/* 소셜 로그인 버튼 */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center text-white">로딩 중...</div>
                    ) : (
                        socialLogins.map(provider => socialLoginButtons[provider])
                    )}
                </div>

                {/* 구분선 */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-white/20"></div>
                    <span className="px-4 text-white/50 text-sm">또는</span>
                    <div className="flex-1 border-t border-white/20"></div>
                </div>

                {/* 비회원 시작 */}
                <button
                    onClick={() => navigate('/saju-input')}
                    className="w-full bg-white/20 text-white py-4 rounded-2xl font-bold hover:bg-white/30 transition-all"
                >
                    로그인 없이 시작하기
                </button>

                {/* 안내 문구 */}
                <p className="text-center text-white/50 text-sm mt-6">
                    로그인하면 내 분석 결과를 저장하고<br/>
                    언제든 다시 볼 수 있어요
                </p>
            </div>
        </div>
    );
}

export default LoginPage;