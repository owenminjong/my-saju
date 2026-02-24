import React from 'react';

function Footer() {
    return (
        <footer className="bg-[#1e293b] text-white/60 py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-white mb-4">월하사주</h3>
                <p className="mb-6">AI 사주 × MBTI 웹서비스</p>
                <div className="flex justify-center gap-6 mb-6 text-sm">
                    <a href="#" className="hover:text-white">이용약관</a>
                    <a href="#" className="hover:text-white">개인정보처리방침</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;