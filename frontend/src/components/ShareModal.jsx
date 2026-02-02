// frontend/src/components/ShareModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { shareKakao, copyUrl, shareTwitter } from '../utils/kakao';

function ShareModal({ isOpen, onClose, resultData }) {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isOpen) return null;

    const handleKakaoShare = async () => {
        await shareKakao(resultData);
    };

    const handleCopyUrl = async () => {
        const success = await copyUrl(resultData.uniqueId);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleTwitterShare = () => {
        shareTwitter(resultData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* 배경 오버레이 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 animate-slide-up">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">공유하기</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 공유 버튼들 */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* 카카오톡 */}
                    <button
                        onClick={handleKakaoShare}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 bg-[#FEE500] rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">💬</span>
                        </div>
                        <span className="text-xs text-gray-600">카카오톡</span>
                    </button>

                    {/* 트위터 */}
                    <button
                        onClick={handleTwitterShare}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">𝕏</span>
                        </div>
                        <span className="text-xs text-gray-600">X</span>
                    </button>

                    {/* 인스타그램 (준비중) */}
                    <button
                        className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
                        disabled
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">📸</span>
                        </div>
                        <span className="text-xs text-gray-600">인스타</span>
                    </button>

                    {/* URL 복사 */}
                    <button
                        onClick={handleCopyUrl}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">🔗</span>
                        </div>
                        <span className="text-xs text-gray-600">
                            {copySuccess ? '복사됨!' : 'URL 복사'}
                        </span>
                    </button>
                </div>

                {/* 링크 표시 */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 truncate">
                        http://localhost:3000/result/{resultData.uniqueId}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;