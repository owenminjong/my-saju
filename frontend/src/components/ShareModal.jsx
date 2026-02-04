// frontend/src/components/ShareModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { shareKakao, copyUrl } from '../utils/kakao';
import { shareTwitter } from '../utils/twitter';
import './ShareModal.css';

function ShareModal({ isOpen, onClose, resultData }) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleInstagramShare = () => {
        alert('인스타그램 스토리 공유는 준비 중입니다.\nURL을 복사해서 직접 공유해주세요! 😊');
        // 자동으로 URL 복사
        handleCopyUrl();
    };

    return (
        <>
            {/* 배경 오버레이 */}
            <div className="share-overlay" onClick={onClose} />

            {/* 드롭다운 모달 */}
            <div className="share-dropdown">
                {/* 헤더 */}
                <div className="share-header">
                    <h3 className="share-title">공유하기</h3>
                    <button onClick={onClose} className="share-close" disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                {/* 로딩 */}
                {loading && (
                    <div className="share-loading">링크 생성 중...</div>
                )}

                {/* 공유 버튼 */}
                <div className="share-grid">
                    {/* 카카오톡 */}
                    <button onClick={handleKakaoShare} disabled={loading} className="share-item">
                        <div className="share-icon-box kakao">💬</div>
                        <span>카카오톡</span>
                    </button>

                    {/* X (트위터) */}
                    <button onClick={handleTwitterShare} disabled={loading} className="share-item">
                        <div className="share-icon-box twitter">𝕏</div>
                        <span>X</span>
                    </button>

                    {/* 인스타그램 */}
                    <button onClick={handleInstagramShare} disabled={loading} className="share-item">
                        <div className="share-icon-box instagram">📸</div>
                        <span>인스타</span>
                    </button>

                    {/* URL 복사 */}
                    <button onClick={handleCopyUrl} disabled={loading} className="share-item">
                        <div className="share-icon-box copy">🔗</div>
                        <span>{copySuccess ? '복사됨!' : 'URL 복사'}</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default ShareModal;
