// frontend/src/pages/MyResults.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Heart, ArrowRight, Home } from 'lucide-react';
import './MyResults.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyResults();
    }, []);

    const fetchMyResults = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login', { state: { redirectTo: '/my-results' } });
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/diagnosis/my-results`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ 내 결과 조회:', response.data);
            setResults(response.data.results);
            setLoading(false);

        } catch (error) {
            console.error('❌ 결과 조회 실패:', error);

            if (error.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('token');
                navigate('/login', { state: { redirectTo: '/my-results' } });
            } else {
                alert('결과를 불러올 수 없습니다.');
                setLoading(false);
            }
        }
    };

    const handleResultClick = (diagnosisId) => {
        navigate(`/premium/result/${diagnosisId}`);
    };

    if (loading) {
        return (
            <div className="my-results-page">
                <div className="loading-container">
                    <div className="spinner" />
                    <p className="loading-text">결과를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-results-page">
            <div className="mr-container">

                {/* 헤더 */}
                <div className="mr-top-header">
                    <div className="mr-nav-bar">
                        <span className="mr-nav-logo">📚 내 프리미엄 사주</span>
                        <button onClick={() => navigate('/')} className="mr-nav-link">
                            <Home size={18} />
                            <span className="mr-nav-text">홈</span>
                        </button>
                    </div>
                </div>

                {/* 결과 리스트 */}
                {results.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">🔮</p>
                        <h3 className="empty-title">아직 프리미엄 사주 결과가 없습니다</h3>
                        <p className="empty-desc">프리미엄 사주를 구매하고 더 자세한 운세를 확인해보세요!</p>
                        <button
                            onClick={() => navigate('/saju-input', { state: { mode: 'premium' } })}
                            className="empty-btn"
                        >
                            프리미엄 사주 시작하기
                        </button>
                    </div>
                ) : (
                    <div className="results-list">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="result-card"
                                onClick={() => handleResultClick(result.id)}
                            >
                                {/* 캐릭터 이미지 */}
                                <div className="card-image-wrap">
                                    {result.characterImage ? (
                                        <img
                                            src={`${API_BASE_URL}${result.characterImage}`}
                                            alt={`${result.name}님의 운세`}
                                            className="card-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.classList.add('no-image');
                                            }}
                                        />
                                    ) : (
                                        <div className="card-image-placeholder">🔮</div>
                                    )}
                                </div>

                                {/* 카드 내용 */}
                                <div className="card-content">
                                    <div className="card-meta">
                                        <Calendar size={13} className="meta-icon" />
                                        <span className="card-date">
                                            {new Date(result.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h3 className="card-name">
                                        {result.name}님
                                    </h3>

                                    <p className="card-info">
                                        {result.birthDate}
                                        {result.mbti && <span className="card-mbti">{result.mbti}</span>}
                                    </p>

                                    <div className="card-footer">
                                        <span className="card-price">
                                            <Heart size={13} className="meta-icon" />
                                            {result.amount?.toLocaleString()}원
                                        </span>
                                        <span className="card-view-btn">
                                            결과 보기
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyResults;