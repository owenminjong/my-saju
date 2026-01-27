import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSaju } from '../services/sajuApi';
import { getFreeDiagnosis } from '../services/sajuApi';

function SajuInput() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        isLunar: false,
        gender: '',
        mbti: '',
        timeOption: 'select',
        selectedTime: '',
        hour: '0',
        minute: '0'
    });

    // MBTI 16가지 옵션
    const mbtiOptions = [
        'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
        'ISTP', 'ISFP', 'INFP', 'INTP',
        'ESTP', 'ESFP', 'ENFP', 'ENTP',
        'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
    ];

    // 십이지 시간대 옵션
    const timeOptions = [
        { label: '시간 모름', hour: 0, isUnknown: true },
        { label: '子시 자시 쥐 (23:30~01:29)', hour: 0 },
        { label: '丑시 축시 소 (01:30~03:29)', hour: 1 },
        { label: '寅시 인시 호랑이 (03:30~05:29)', hour: 3 },
        { label: '卯시 묘시 토끼 (05:30~07:29)', hour: 5 },
        { label: '辰시 진시 용 (07:30~09:29)', hour: 7 },
        { label: '巳시 사시 뱀 (09:30~11:29)', hour: 9 },
        { label: '午시 오시 말 (11:30~13:29)', hour: 11 },
        { label: '未시 미시 양 (13:30~15:29)', hour: 13 },
        { label: '申시 신시 원숭이 (15:30~17:29)', hour: 15 },
        { label: '酉시 유시 닭 (17:30~19:29)', hour: 17 },
        { label: '戌시 술시 개 (19:30~21:29)', hour: 19 },
        { label: '亥시 해시 돼지 (21:30~23:29)', hour: 21 }
    ];

    // 생년월일 입력 처리
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

    // 십이지 시간 선택
    const handleTimeSelect = (e) => {
        const value = e.target.value;
        const selected = timeOptions.find(opt => opt.label === value);
        if (!selected) return;

        if (selected.isUnknown) {
            setFormData(prev => ({
                ...prev,
                selectedTime: value,
                timeOption: 'unknown',
                hour: '0',
                minute: '0'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedTime: value,
                timeOption: 'select',
                hour: selected.hour.toString(),
                minute: '0'
            }));
        }
    };

    // 다음 단계
    const nextStep = () => {
        if (currentStep === 1 && !formData.name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (currentStep === 2 && !formData.birthDate) {
            alert('생년월일을 입력해주세요.');
            return;
        }
        if (currentStep === 3 && !formData.gender) {
            alert('성별을 선택해주세요.');
            return;
        }
        if (currentStep === 4 && !formData.mbti) {
            alert('MBTI를 선택해주세요.');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    // 이전 단계
    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // 폼 제출
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

        try {
            setLoading(true);

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

            const response = await getFreeDiagnosis(requestData);

            navigate('/result', {
                state: {
                    result: {
                        ...response.sajuData,     // 기존 사주 데이터 유지
                        summary: response.sajuData.summary, // 혹시 이미 있으면 유지
                        diagnosis: response.diagnosis,      // ⬅️ 여기로 넣어줌
                        usage: response.usage               // (필요하면 사용)
                    }
                }
            });


        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] py-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* 헤더 */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <div className="text-6xl mb-4 animate-pulse">✨</div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        나만의 인생 코드 확인하기
                    </h1>
                    <p className="text-lg text-white/70">
                        당신의 정보를 입력하면 AI가 분석해드립니다
                    </p>
                </div>

                {/* 진행 바 */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div key={step} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                    currentStep >= step
                                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white scale-110'
                                        : 'bg-white/20 text-white/50'
                                }`}>
                                    {step}
                                </div>
                                <span className="text-xs text-white/60 mt-1">
                                    {step === 1 && '이름'}
                                    {step === 2 && '생년월일'}
                                    {step === 3 && '성별'}
                                    {step === 4 && 'MBTI'}
                                    {step === 5 && '생시'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] transition-all duration-500"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 입력 폼 카드 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit}>

                        {/* Step 1: 이름 */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-white text-lg font-bold mb-4">
                                        이름을 알려주세요
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-6 py-4 bg-white/90 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 transition-all"
                                        placeholder="홍길동"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform"
                                >
                                    다음 →
                                </button>
                            </div>
                        )}

                        {/* Step 2: 생년월일 */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-white text-lg font-bold mb-4">
                                        생년월일을 알려주세요
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.birthDate}
                                        onChange={handleBirthDateChange}
                                        className="w-full px-6 py-4 bg-white/90 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 transition-all"
                                        placeholder="1990.01.01"
                                        maxLength="10"
                                        autoFocus
                                    />
                                    <p className="text-white/60 text-sm mt-2">
                                        형식: YYYY.MM.DD
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isLunar"
                                        checked={formData.isLunar}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isLunar: e.target.checked }))}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="isLunar" className="text-white text-sm">
                                        음력입니다
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 bg-white/20 text-white py-4 rounded-2xl text-lg font-bold hover:bg-white/30 transition-colors"
                                    >
                                        ← 이전
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform"
                                    >
                                        다음 →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: 성별 */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-white text-lg font-bold mb-6">
                                        성별을 선택해주세요
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gender: 'M' }))}
                                            className={`py-6 rounded-2xl text-lg font-bold transition-all ${
                                                formData.gender === 'M'
                                                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white scale-105'
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                        >
                                            👨 남성
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gender: 'F' }))}
                                            className={`py-6 rounded-2xl text-lg font-bold transition-all ${
                                                formData.gender === 'F'
                                                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white scale-105'
                                                    : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                        >
                                            👩 여성
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 bg-white/20 text-white py-4 rounded-2xl text-lg font-bold hover:bg-white/30 transition-colors"
                                    >
                                        ← 이전
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform"
                                    >
                                        다음 →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: MBTI */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-white text-lg font-bold mb-4">
                                        MBTI를 선택해주세요
                                    </label>
                                    <select
                                        value={formData.mbti}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value }))}
                                        className="w-full px-6 py-4 bg-white/90 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 transition-all"
                                    >
                                        <option value="">선택해주세요</option>
                                        {mbtiOptions.map(mbti => (
                                            <option key={mbti} value={mbti}>{mbti}</option>
                                        ))}
                                    </select>
                                    <p className="text-white/60 text-sm mt-2">
                                        💡 MBTI를 모르시면 <a href="https://www.16personalities.com/ko" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline">여기서 테스트</a>
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 bg-white/20 text-white py-4 rounded-2xl text-lg font-bold hover:bg-white/30 transition-colors"
                                    >
                                        ← 이전
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform"
                                    >
                                        다음 →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: 생시 */}
                        {currentStep === 5 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-white text-lg font-bold mb-4">
                                        태어난 시간을 선택해주세요
                                    </label>
                                    <select
                                        value={formData.selectedTime}
                                        onChange={handleTimeSelect}
                                        className="w-full px-6 py-4 bg-white/90 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50 transition-all"
                                    >
                                        <option value="">선택해주세요</option>
                                        {timeOptions.map((option, idx) => (
                                            <option key={idx} value={option.label}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-white/60 text-sm mt-2">
                                        💡 정확한 시간을 모르시면 '시간 모름'을 선택해주세요
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 bg-white/20 text-white py-4 rounded-2xl text-lg font-bold hover:bg-white/30 transition-colors"
                                    >
                                        ← 이전
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-white py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '분석 중...' : '✨ 내 운세 확인하기'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* 돌아가기 */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        ← 메인으로 돌아가기
                    </button>
                </div>
            </div>

            {/* CSS 애니메이션 */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default SajuInput;