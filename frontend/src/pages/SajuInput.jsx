import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFreeDiagnosis } from '../services/sajuApi';
import { adminAPI } from '../services/api';
import PremiumPromoCard from '../components/PremiumPromoCard';
import './SajuInput.css';

const SajuInput = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'free';
    const hasAlerted = useRef(false)

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        isLunar: false,
        gender: '',
        mbti: '',
        selectedTime: '',
        hour: '0',
        minute: '0'
    });

    const mbtiOptions = [
        'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
        'ISTP', 'ISFP', 'INFP', 'INTP',
        'ESTP', 'ESFP', 'ENFP', 'ENTP',
        'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
    ];

    const timeOptions = [
        { label: '시간 모름', hour: 0, isUnknown: true },
        { label: '子시 (자시) - 쥐 (23:30~01:29)', hour: 0 },
        { label: '丑시 (축시) - 소 (01:30~03:29)', hour: 1 },
        { label: '寅시 (인시) - 호랑이 (03:30~05:29)', hour: 3 },
        { label: '卯시 (묘시) - 토끼 (05:30~07:29)', hour: 5 },
        { label: '辰시 (진시) - 용 (07:30~09:29)', hour: 7 },
        { label: '巳시 (사시) - 뱀 (09:30~11:29)', hour: 9 },
        { label: '午시 (오시) - 말 (11:30~13:29)', hour: 11 },
        { label: '未시 (미시) - 양 (13:30~15:29)', hour: 13 },
        { label: '申시 (신시) - 원숭이 (15:30~17:29)', hour: 15 },
        { label: '酉시 (유시) - 닭 (17:30~19:29)', hour: 17 },
        { label: '戌시 (술시) - 개 (19:30~21:29)', hour: 19 },
        { label: '亥시 (해시) - 돼지 (21:30~23:29)', hour: 21 }
    ];

    useEffect(() => {
        if (mode === 'premium') {
            const token = localStorage.getItem('token');
            if (!token) {
                if (!hasAlerted.current) {  // ✅ 한 번만 실행
                    hasAlerted.current = true;
                    alert('로그인이 필요합니다.');
                }
                navigate('/login', {
                    state: {
                        redirectTo: '/saju-input',
                        mode: 'premium'
                    }
                });
                return;
            }
            fetchPremiumProduct();
        }
    }, [mode]);

    const fetchPremiumProduct = async () => {
        try {
            const response = await adminAPI.getProducts();
            const premiumProduct = response.data.data.find(
                p => p.name.includes('프리미엄') && p.is_active
            );
            if (premiumProduct) {
                setProduct(premiumProduct);
            }
        } catch (error) {
            console.error('상품 조회 실패:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBirthDateChange = (e) => {
        let value = e.target.value;
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length >= 5) {
            formatted = numbers.slice(0, 4) + '.' + numbers.slice(4);
        }
        if (numbers.length >= 7) {
            formatted = numbers.slice(0, 4) + '.' + numbers.slice(4, 6) + '.' + numbers.slice(6);
        }
        if (numbers.length > 8) {
            formatted = numbers.slice(0, 4) + '.' + numbers.slice(4, 6) + '.' + numbers.slice(6, 8);
        }
        setFormData(prev => ({ ...prev, birthDate: formatted }));
    };

    const handleTimeSelect = (e) => {
        const value = e.target.value;
        const selected = timeOptions.find(opt => opt.label === value);
        if (!selected) return;

        if (selected.isUnknown) {
            setFormData(prev => ({
                ...prev,
                selectedTime: value,
                hour: '0',
                minute: '0'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedTime: value,
                hour: selected.hour.toString(),
                minute: '0'
            }));
        }
    };

    // ✅ Validation 체크 함수
    const validateForm = () => {
        if (!formData.name) {
            alert('성함을 입력해주세요.');
            return false;
        }
        if (!formData.gender) {
            alert('성별을 선택해주세요.');
            return false;
        }
        if (!formData.birthDate) {
            alert('생년월일을 입력해주세요.');
            return false;
        }
        if (!formData.mbti) {
            alert('MBTI를 선택해주세요.');
            return false;
        }
        return true;
    };

    // ✅ 프리미엄 결제 처리
    const handlePremiumPayment = () => {
        if (!validateForm()) {
            return;
        }

        const dateParts = formData.birthDate.split('.');
        if (dateParts.length !== 3) {
            alert('생년월일을 올바른 형식(YYYY.MM.DD)으로 입력해주세요.');
            return;
        }

        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        if (!year || !month || !day) {
            alert('올바른 생년월일을 입력해주세요.');
            return;
        }

        const requestData = {
            name: formData.name,
            year,
            month,
            day,
            hour: parseInt(formData.hour),
            minute: parseInt(formData.minute),
            isLunar: formData.isLunar,
            gender: formData.gender,
            mbti: formData.mbti
        };

        console.log('💎 유료 사주 - 결제 진행');
        navigate('/payment/premium', {
            state: {
                sajuData: requestData,
                product: product
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dateParts = formData.birthDate.split('.');
        if (dateParts.length !== 3) {
            alert('생년월일을 올바른 형식(YYYY.MM.DD)으로 입력해주세요.');
            return;
        }

        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        if (!year || !month || !day) {
            alert('올바른 생년월일을 입력해주세요.');
            return;
        }

        const requestData = {
            name: formData.name,
            year,
            month,
            day,
            hour: parseInt(formData.hour),
            minute: parseInt(formData.minute),
            isLunar: formData.isLunar,
            gender: formData.gender,
            mbti: formData.mbti
        };

        // 무료 모드만 처리
        try {
            setLoading(true);
            console.log('🔵 무료 사주 요청:', requestData);

            const response = await getFreeDiagnosis(requestData);
            console.log('✅ 무료 사주 응답:', response);

            navigate('/result', {
                state: {
                    result: {
                        ...response.sajuData,
                        summary: response.sajuData.summary,
                        diagnosis: response.diagnosis,
                        usage: response.usage,
                        uniqueId: response.uniqueId
                    }
                }
            });

        } catch (error) {
            console.error('❌ 무료 사주 오류:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="form-section-wrapper" id="saju-form">
                <div className="container">
                    <div className="corner-deco top-left"></div>
                    <div className="corner-deco top-right"></div>
                    <div className="corner-deco bottom-left"></div>
                    <div className="corner-deco bottom-right"></div>

                    <header className="header">
                        <h2>사주 정보 입력 {mode === 'premium' && '(프리미엄)'}</h2>
                        <p>정확한 풀이를 위해 생년월시를 입력해주세요.</p>
                    </header>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">성함</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="성함을 입력해주세요"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">성별</label>
                            <div className="radio-group">
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="male"
                                        name="gender"
                                        value="M"
                                        checked={formData.gender === 'M'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="male">남성 (乾)</label>
                                </div>
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="female"
                                        name="gender"
                                        value="F"
                                        checked={formData.gender === 'F'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="female">여성 (坤)</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">생년월일</label>
                            <input
                                type="text"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleBirthDateChange}
                                placeholder="1990.01.01"
                                maxLength="10"
                                required
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                * 형식: YYYY.MM.DD
                            </p>

                            <div className="radio-group" style={{ marginTop: '10px' }}>
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="solar"
                                        name="calendar"
                                        checked={!formData.isLunar}
                                        onChange={() => setFormData(prev => ({ ...prev, isLunar: false }))}
                                    />
                                    <label htmlFor="solar">양력</label>
                                </div>
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="lunar"
                                        name="calendar"
                                        checked={formData.isLunar}
                                        onChange={() => setFormData(prev => ({ ...prev, isLunar: true }))}
                                    />
                                    <label htmlFor="lunar">음력</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">MBTI</label>
                            <select
                                name="mbti"
                                value={formData.mbti}
                                onChange={handleChange}
                                className="select-input"
                                required
                            >
                                <option value="">MBTI를 선택해주세요</option>
                                {mbtiOptions.map(mbti => (
                                    <option key={mbti} value={mbti}>
                                        {mbti}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                * 모르실 경우 가장 가까운 유형을 선택해주세요.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">태어난 시간</label>
                            <select
                                name="selectedTime"
                                value={formData.selectedTime}
                                onChange={handleTimeSelect}
                                className="select-input"
                            >
                                <option value="">시간대를 선택해주세요</option>
                                {timeOptions.map((option, index) => (
                                    <option key={index} value={option.label}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                * 시간을 모르실 경우 '시간 모름'을 선택해주세요.
                            </p>
                        </div>

                        {/* ✅ 유료 모드일 때 하단 여백 (카드 공간 확보) */}
                        {mode === 'premium' && <div style={{ height: '300px' }}></div>}

                        {/* 무료 모드일 때만 제출 버튼 표시 */}
                        {mode === 'free' && (
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? '분석 중...' : '내 운명 확인하기'}
                            </button>
                        )}
                    </form>
                </div>
            </section>

            {/* ✅ 유료 모드일 때 Fixed 카드 */}
            {mode === 'premium' && product && (
                <PremiumPromoCard
                    sajuData={formData}
                    productInfo={product}
                    onPaymentClick={handlePremiumPayment}
                />
            )}
        </>
    );
};

export default SajuInput;