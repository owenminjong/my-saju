import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSaju } from '../services/sajuApi';

function SajuInput() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        isLunar: false,
        timeOption: 'select', // ✅ select로 변경
        selectedTime: '', // ✅ 빈 값으로 시작
        hour: '0',
        minute: '0'
    });

    // 십이지 시간대 옵션
    const timeOptions = [
        { label: '시간 모름', hour: 0, isUnknown: true },
        { label: '子/자/鼠 (00:00~01:29)', hour: 0 },
        { label: '丑/축/牛 (01:30~03:29)', hour: 1 },
        { label: '寅/인/虎 (03:30~05:29)', hour: 3 },
        { label: '卯/묘/兔 (05:30~07:29)', hour: 5 },
        { label: '辰/진/龍 (07:30~09:29)', hour: 7 },
        { label: '巳/사/蛇 (09:30~11:29)', hour: 9 },
        { label: '午/오/馬 (11:30~13:29)', hour: 11 },
        { label: '未/미/羊 (13:30~15:29)', hour: 13 },
        { label: '申/신/猴 (15:30~17:29)', hour: 15 },
        { label: '酉/유/鷄 (17:30~19:29)', hour: 17 },
        { label: '戌/술/犬 (19:30~21:29)', hour: 19 },
        { label: '亥/해/猪 (21:30~23:29)', hour: 21 },
        { label: '子/자/鼠 (23:30~23:59)', hour: 23 }
    ];

    // 생년월일 입력 처리 (자동 포맷팅)
    const handleBirthDateChange = (e) => {
        let value = e.target.value;

        // . 제거하고 숫자만 추출
        const numbers = value.replace(/\D/g, '');

        // 자동 포맷팅
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

    // 시간 옵션 변경
    const handleTimeOptionChange = (option) => {
        setFormData(prev => ({
            ...prev,
            timeOption: option,
            hour: option === 'unknown' ? '0' : prev.hour,
            minute: option === 'unknown' ? '0' : prev.minute
        }));
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

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!formData.name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }

        // 생년월일 파싱
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
                isLunar: formData.isLunar
            };

            const response = await analyzeSaju(requestData);

            // 결과 페이지로 이동
            navigate('/result', { state: { result: response.data } });

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">

                {/* 헤더 */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        무료 사주 풀이
                    </h1>
                    <p className="text-sm text-gray-600">
                        기본 정보를 입력하시면 사주를 분석해드립니다
                    </p>
                </div>

                {/* 입력 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            maxLength={10}
                            placeholder="이름을 입력하세요"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* 생년월일 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            나의 생년월일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.birthDate}
                            onChange={handleBirthDateChange}
                            placeholder="0000.00.00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
                        />
                    </div>

                    {/* 양력/음력 선택 */}
                    <div className="flex gap-4 justify-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                checked={!formData.isLunar}
                                onChange={() => setFormData(prev => ({ ...prev, isLunar: false }))}
                                className="w-5 h-5 mr-2"
                            />
                            <span className="text-gray-700 text-lg">양력</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                checked={formData.isLunar}
                                onChange={() => setFormData(prev => ({ ...prev, isLunar: true }))}
                                className="w-5 h-5 mr-2"
                            />
                            <span className="text-gray-700 text-lg">음력</span>
                        </label>
                    </div>

                    {/* 시간 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            나의 태어난 시간
                        </label>

                        {/* 시간 모름 체크박스 */}
                        <div className="mb-3">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.timeOption === 'unknown'}
                                    onChange={(e) => handleTimeOptionChange(e.target.checked ? 'unknown' : 'select')}
                                    className="w-5 h-5 mr-2"
                                />
                                <span className="text-gray-600">시간모름</span>
                            </label>
                        </div>

                        {/* 시간 선택 드롭다운 */}
                        {formData.timeOption !== 'unknown' && (
                            <div>
                                <select
                                    value={formData.selectedTime}
                                    onChange={handleTimeSelect}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">태어난 시간을 선택해주세요.</option>
                                    {timeOptions.map((option) => (
                                        <option key={option.label} value={option.label}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-2 text-xs text-blue-600">
                                    ⓘ 정확한 시간을 아시면 더 정확한 사주를 볼 수 있습니다.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? '분석 중...' : '사주 분석하기'}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default SajuInput;