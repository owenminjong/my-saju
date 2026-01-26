import React from 'react';

function SideMenu({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />
            <div className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform">
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="text-3xl mb-8"
                    >
                        ✕
                    </button>
                    <nav className="space-y-6">
                        <a href="/" className="block text-xl font-bold text-gray-800 hover:text-[#1e3a8a]">
                            🏠 홈
                        </a>
                        <a href="/saju-input" className="block text-xl font-bold text-gray-800 hover:text-[#1e3a8a]">
                            🔮 사주 분석
                        </a>
                        <a href="#" className="block text-xl font-bold text-gray-800 hover:text-[#1e3a8a]">
                            ℹ️ 이용 안내
                        </a>
                        <div className="border-t pt-6">
                            <a href="/login" className="block text-lg text-gray-600 hover:text-gray-800">
                                👤 로그인
                            </a>
                            {/*<a href="#" className="block text-lg text-gray-600 hover:text-gray-800 mt-4">
                                ✍️ 회원가입
                            </a>*/}
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default SideMenu;