// frontend/src/pages/MyResults.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, Heart, ArrowRight, Home } from 'lucide-react';
import './MyResults.css';

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
                navigate('/login', {
                    state: { redirectTo: '/my-results' }
                });
                return;
            }

            const response = await axios.get(
                'http://localhost:5000/api/diagnosis/my-results',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('✅ 내 결과 조회:', response.data);
            setResults(response.data.results);
            setLoading(false);

        } catch (error) {
            console.error('❌ 결과 조회 실패:', error);

            if (error.response?.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('token');
                navigate('/login', {
                    state: { redirectTo: '/my-results' }
                });
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
                    <div className="spinner"></div>
                    <p>결과를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-results-page">
            <div className="container">
                {/* 헤더 */}
                <div className="top-header">
                    <div className="nav-bar">
                        <span className="nav-logo">📚 내 프리미엄 사주</span>
                        <button onClick={() => navigate('/')} className="nav-link">
                            <Home size={18} className="nav-icon"/>
                            <span className="nav-text">홈</span>
                        </button>
                    </div>
                </div>

                {/* 결과 리스트 */}
                {results.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">🔮</p>
                        <h3>아직 프리미엄 사주 결과가 없습니다</h3>
                        <p>프리미엄 사주를 구매하고 더 자세한 운세를 확인해보세요!</p>
                        <button
                            onClick={() => navigate('/saju-input', { state: { mode: 'premium' }})}
                            className="empty-btn"
                        >
                            프리미엄 사주 시작하기
                        </button>
                    </div>
                ) : (
                    <div className="results-grid">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="result-card"
                                onClick={() => handleResultClick(result.id)}
                            >
                                {/* 캐릭터 이미지 */}
                                {result.characterImage && (
                                    <div className="card-image">
                                        <img
                                            src={`http://localhost:5000${result.characterImage}`}
                                            alt={`${result.name}님의 운세`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* 카드 내용 */}
                                <div className="card-content">
                                    <div className="card-header">
                                        <Calendar size={16} className="icon" />
                                        <span className="date">
                                            {new Date(result.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h3 className="card-title">
                                        <User size={18} className="icon" />
                                        {result.name}님
                                    </h3>

                                    <p className="card-subtitle">
                                        {result.birthDate} · {result.mbti}
                                    </p>

                                    <div className="card-footer">
                                        <div className="price">
                                            <Heart size={16} className="icon" />
                                            {result.amount?.toLocaleString()}원
                                        </div>
                                        <div className="view-btn">
                                            결과 보기
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top: 4px solid var(--primary-gold);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default MyResults;