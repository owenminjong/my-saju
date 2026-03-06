import React, { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { initKakao, createShareUrlWithData, shareKakao } from '../utils/kakao';
import { shareTwitter } from '../utils/twitter';
import { shareInstagramStory } from '../utils/instagram';
import './ShareModal.css';

function ShareModal({ isOpen, onClose, resultData, cardRef }) {
    const [loading, setLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState(null);
    const [showUrlBox, setShowUrlBox] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!isOpen || !resultData) return;

        setShareUrl(null);
        setShowUrlBox(false);

        const prepare = async () => {
            try {
                await initKakao();

                const minimalData = {
                    user: {
                        name: resultData.user?.name,
                        birthDate: resultData.user?.birthDate,
                        birthTime: resultData.user?.birthTime,
                    },
                    fields: {
                        wealth: { grade: resultData.fields?.wealth?.grade ?? resultData.fields?.wealth },
                        career: { grade: resultData.fields?.career?.grade ?? resultData.fields?.career },
                        love:   { grade: resultData.fields?.love?.grade   ?? resultData.fields?.love },
                        health: { grade: resultData.fields?.health?.grade ?? resultData.fields?.health },
                    },
                    elements: {
                        distribution: resultData.elements?.distribution || null,
                        status:       resultData.elements?.status       || null,
                        chart:        resultData.elements?.chart        || null,
                    },
                    metadata: {
                        character: resultData.metadata?.character,
                        mbti:      resultData.metadata?.mbti,
                    },
                    characterImage: resultData.characterImage,
                    imageMetadata:  resultData.imageMetadata,
                };

                const { shareUrl: generatedUrl } = await createShareUrlWithData(minimalData);
                setShareUrl(generatedUrl);

            } catch (error) {
                // silent
            }
        };

        prepare();
    }, [isOpen, resultData]);

    if (!isOpen) return null;

    const handleKakaoShare = () => {
        if (!shareUrl) {
            alert('공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        shareKakao(shareUrl, resultData);
    };

    const handleCopyUrl = () => {
        if (!shareUrl) {
            alert('공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const isIOS = /ipad|iphone/i.test(navigator.userAgent);

        if (isIOS) {
            setShowUrlBox(true);
            return;
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                    })
                    .catch(() => legacyCopy());
            } else {
                legacyCopy();
            }
        } catch (err) {
            legacyCopy();
        }
    };

    const legacyCopy = () => {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleTwitterShare = async () => {
        try {
            setLoading(true);
            await shareTwitter(resultData);
        } catch (error) {
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleInstagramShare = async () => {
        try {
            setLoading(true);
            await shareInstagramStory(resultData, cardRef?.current || null);
        } catch (error) {
            if (error.message === 'DESKTOP') {
                alert('📱 인스타그램 스토리 공유는 모바일에서만 가능합니다.');
            } else if (error.message === 'NOT_SUPPORTED') {
                alert('😅 이 브라우저는 공유 기능을 지원하지 않습니다.');
            } else {
                alert('공유에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="share-overlay" onClick={onClose} />
            <div className="share-dropdown">
                <div className="share-header">
                    <h3 className="share-title">공유하기</h3>
                    <button onClick={onClose} className="share-close" disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                {!shareUrl && (
                    <div className="share-loading">공유 준비 중...</div>
                )}

                <div className="share-grid">
                    <button onClick={handleKakaoShare} disabled={!shareUrl} className="share-item">
                        <div className="share-icon-box kakao">💬</div>
                        <span>{shareUrl ? '카카오톡' : '준비 중...'}</span>
                    </button>

                    <button onClick={handleTwitterShare} disabled={loading} className="share-item">
                        <div className="share-icon-box twitter">𝕏</div>
                        <span>X</span>
                    </button>

                    <button onClick={handleInstagramShare} disabled={loading} className="share-item">
                        <div className="share-icon-box instagram">📸</div>
                        <span>인스타</span>
                    </button>

                    <button onClick={handleCopyUrl} disabled={!shareUrl} className="share-item">
                        <div className="share-icon-box copy">🔗</div>
                        <span>{copySuccess ? '복사됨!' : 'URL 복사'}</span>
                    </button>
                </div>

                {showUrlBox && (
                    <div style={{ padding: '0 16px 16px' }}>
                        <p style={{ color: 'black', fontSize: '12px', marginBottom: '8px' }}>
                            아래 링크를 꾹 눌러서 복사하세요
                        </p>
                        <div
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '12px',
                                fontSize: '13px',
                                color: 'black',
                                wordBreak: 'break-all',
                                userSelect: 'all',
                                WebkitUserSelect: 'all',
                                cursor: 'text',
                            }}
                            onClick={(e) => {
                                const range = document.createRange();
                                range.selectNodeContents(e.currentTarget);
                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }}
                        >
                            {shareUrl}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ShareModal;