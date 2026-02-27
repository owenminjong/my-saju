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

        console.log('📦 [ShareModal] 모달 열림');
        console.log('📦 [ShareModal] characterImage:', resultData.characterImage?.substring(0, 50));

        const prepare = async () => {
            try {
                // 1. 카카오 초기화
                console.log('🔑 [ShareModal] 카카오 SDK 초기화 시작');
                await initKakao();
                console.log('✅ [ShareModal] 카카오 SDK 초기화 완료');

                // 2. minimalData - grade 값만 추출해서 URL 길이 최소화
                const minimalData = {
                    user: {
                        name: resultData.user?.name,
                    },
                    fields: {
                        wealth: { grade: resultData.fields?.wealth?.grade ?? resultData.fields?.wealth },
                        career: { grade: resultData.fields?.career?.grade ?? resultData.fields?.career },
                        love:   { grade: resultData.fields?.love?.grade   ?? resultData.fields?.love },
                        health: { grade: resultData.fields?.health?.grade ?? resultData.fields?.health },
                    },
                    // ✅ elements 전체 추가
                    elements: {
                        distribution: resultData.elements?.distribution || null,
                        status:       resultData.elements?.status       || null,
                        chart:        resultData.elements?.chart        || null,
                    },
                    metadata: {
                        character: resultData.metadata?.character,
                    },
                    characterImage: resultData.characterImage,
                    imageMetadata:  resultData.imageMetadata,
                };

                console.log('📊 [ShareModal] minimalData 구성 완료');
                console.log('📊 [ShareModal] minimalData JSON 크기:', JSON.stringify(minimalData).length, 'bytes');

                // 3. shareUrl 생성
                console.log('🔗 [ShareModal] shareUrl 생성 요청 중...');
                const { shareUrl: generatedUrl } = await createShareUrlWithData(minimalData);

                console.log('✅ [ShareModal] shareUrl 생성 완료');
                console.log('🔗 [ShareModal] shareUrl 길이:', generatedUrl.length, '자');
                console.log('🔗 [ShareModal] shareUrl:', generatedUrl);

                if (generatedUrl.length > 2000) {
                    console.warn('⚠️ [ShareModal] shareUrl이 2000자 초과 → 모바일 딥링크 실패 가능성 있음');
                } else {
                    console.log('✅ [ShareModal] shareUrl 길이 정상 (2000자 이하)');
                }

                setShareUrl(generatedUrl);

            } catch (error) {
                console.error('❌ [ShareModal] 공유 사전 준비 실패:', error);
            }
        };

        prepare();
    }, [isOpen, resultData]);

    if (!isOpen) return null;

    const handleKakaoShare = () => {
        console.log('💬 [ShareModal] 카카오 공유 버튼 클릭');

        if (!shareUrl) {
            console.warn('⚠️ [ShareModal] shareUrl 미준비 상태');
            alert('공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('💬 [ShareModal] shareKakao 호출');
        shareKakao(shareUrl, resultData);
    };

    const handleCopyUrl = () => {
        console.log('🔗 [ShareModal] URL 복사 버튼 클릭');

        if (!shareUrl) {
            console.warn('⚠️ [ShareModal] shareUrl 미준비 상태');
            alert('공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const isIOS = /ipad|iphone/i.test(navigator.userAgent);
        console.log('📱 [ShareModal] iOS 여부:', isIOS);

        if (isIOS) {
            setShowUrlBox(true);
            return;
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                        console.log('✅ [ShareModal] 클립보드 복사 성공');
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                    })
                    .catch(() => {
                        console.warn('⚠️ [ShareModal] clipboard API 실패 → legacy 복사 시도');
                        legacyCopy();
                    });
            } else {
                console.log('⚠️ [ShareModal] clipboard API 없음 → legacy 복사');
                legacyCopy();
            }
        } catch (err) {
            console.error('❌ [ShareModal] 복사 실패:', err);
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
        console.log('✅ [ShareModal] legacy 복사 완료');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleTwitterShare = async () => {
        console.log('🐦 [ShareModal] 트위터 공유 버튼 클릭');
        try {
            setLoading(true);
            await shareTwitter(resultData);
            console.log('✅ [ShareModal] 트위터 공유 완료');
        } catch (error) {
            console.error('❌ [ShareModal] 트위터 공유 실패:', error);
            alert('공유에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleInstagramShare = async () => {
        console.log('📸 [ShareModal] 인스타그램 공유 버튼 클릭');
        console.log('📸 [ShareModal] cardRef:', cardRef);
        console.log('📸 [ShareModal] cardRef.current:', cardRef?.current);
        try {
            setLoading(true);
            await shareInstagramStory(resultData, cardRef?.current || null);
            console.log('✅ [ShareModal] 인스타그램 공유 완료');
        } catch (error) {
            console.error('❌ [ShareModal] 인스타그램 공유 실패:', error);
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
