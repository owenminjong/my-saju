// frontend/src/components/ShareModal.jsx (개선 버전)

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { shareKakao, copyUrl } from '../utils/kakao';
import { shareTwitter, shareNative } from '../utils/twitter'; // ✅ shareNative 추가

function ShareModal({ isOpen, onClose, resultData }) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // 모바일 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // Web Share API 지원 확인
    const supportsWebShare = navigator.share !== undefined;

    if (!isOpen) return null;

    const handleKakaoShare = async () => {
        try {
            setLoading(true);
            await shareKakao(resultData);
        } catch (error) {
            console.error('카카오 공유 실패:', error);
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyUrl = async () => {
        try {
            setLoading(true);
            const success = await copyUrl();
            if (success) {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }
        } catch (error) {
            console.error('URL 복사 실패:', error);
            alert('URL 복사에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleTwitterShare = async () => {
        try {
            setLoading(true);
            await shareTwitter(resultData);
        } catch (error) {
            console.error('트위터 공유 실패:', error);
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ 네이티브 공유 추가
    const handleNativeShare = async () => {
        try {
            setLoading(true);
            await shareNative(resultData);
        } catch (error) {
            console.error('공유 실패:', error);
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
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
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 로딩 상태 */}
                {loading && (
                    <div className="mb-4 text-center text-sm text-gray-600">
                        공유 링크 생성 중...
                    </div>
                )}

                {/* ✅ 모바일 전용: 네이티브 공유 버튼 */}
                {isMobile && supportsWebShare && (
                    <button
                        onClick={handleNativeShare}
                        disabled={loading}
                        className="w-full mb-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">📤</span>
                        다른 앱으로 공유하기
                    </button>
                )}

                {/* 공유 버튼들 */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {/* 카카오톡 */}
                    <button
                        onClick={handleKakaoShare}
                        disabled={loading}
                        className="flex flex-col items-center gap-2 disabled:opacity-50"
                    >
                        <div className="w-14 h-14 bg-[#FEE500] rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">💬</span>
                        </div>
                        <span className="text-xs text-gray-600">카카오톡</span>
                    </button>

                    {/* 트위터 */}
                    <button
                        onClick={handleTwitterShare}
                        disabled={loading}
                        className="flex flex-col items-center gap-2 disabled:opacity-50"
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
                        disabled={loading}
                        className="flex flex-col items-center gap-2 disabled:opacity-50"
                    >
                        <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">🔗</span>
                        </div>
                        <span className="text-xs text-gray-600">
                            {copySuccess ? '복사됨!' : 'URL 복사'}
                        </span>
                    </button>
                </div>

                {/* 안내 메시지 */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 text-center">
                        링크를 통해 누구나 결과를 볼 수 있습니다
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;