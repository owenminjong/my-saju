import React, { useState } from 'react';
import { adminAPI } from '../../services/api';

const DEFAULT_DATA = {
    name: '홍길동',
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    minute: 0,
    isLunar: false,
    gender: 'M',
    mbti: 'INTJ'
};

function PromptTestPage() {
    const [mode, setMode] = useState('free');
    const [formData, setFormData] = useState(DEFAULT_DATA);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await adminAPI.runPromptTest({
                mode,
                ...formData,
                year: parseInt(formData.year),
                month: parseInt(formData.month),
                day: parseInt(formData.day),
                hour: parseInt(formData.hour),
                minute: parseInt(formData.minute),
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">프롬프트 테스트</h1>

            {/* 모드 선택 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">모드</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="free"
                            checked={mode === 'free'}
                            onChange={() => setMode('free')}
                        />
                        <span className="text-sm font-medium text-gray-700">무료 (free)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value="premium"
                            checked={mode === 'premium'}
                            onChange={() => setMode('premium')}
                        />
                        <span className="text-sm font-medium text-gray-700">유료 (premium)</span>
                    </label>
                </div>
            </div>

            {/* 입력값 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-sm font-medium text-gray-700 mb-3">입력 데이터</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: '이름', name: 'name', type: 'text' },
                        { label: '년', name: 'year', type: 'number' },
                        { label: '월', name: 'month', type: 'number' },
                        { label: '일', name: 'day', type: 'number' },
                        { label: '시', name: 'hour', type: 'number' },
                        { label: '분', name: 'minute', type: 'number' },
                    ].map(({ label, name, type }) => (
                        <div key={name}>
                            <label className="block text-xs text-gray-500 mb-1">{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">성별</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white"
                        >
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">MBTI</label>
                        <select
                            name="mbti"
                            value={formData.mbti}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white"
                        >
                            {['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP',
                                'ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="isLunar"
                            name="isLunar"
                            checked={formData.isLunar}
                            onChange={handleChange}
                        />
                        <label htmlFor="isLunar" className="text-sm text-gray-700">음력</label>
                    </div>
                </div>
            </div>

            {/* 실행 버튼 */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
            >
                {loading ? `${mode === 'premium' ? 'Step 1→2→3 처리 중... (시간이 걸립니다)' : '분석 중...'}` : '테스트 실행'}
            </button>

            {/* 에러 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
                    ❌ {error}
                </div>
            )}

            {/* 결과 */}
            {result && (
                <div className="space-y-4">
                    {/* 토큰 사용량 요약 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h2 className="font-bold text-green-800 mb-2">✅ 완료</h2>
                        {result.mode === 'free' ? (
                            <p className="text-sm text-green-700">
                                토큰: input {result.usage?.input_tokens} / output {result.usage?.output_tokens}
                            </p>
                        ) : (
                            <div className="text-sm text-green-700 space-y-1">
                                {['step1', 'step2', 'step3'].map(step => (
                                    <p key={step}>
                                        {step.toUpperCase()}: input {result.steps?.[step]?.usage?.input_tokens} / output {result.steps?.[step]?.usage?.output_tokens}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 무료 결과 */}
                    {result.mode === 'free' && (
                        <>
                            <ResultBlock title="📤 System Prompt" content={result.prompts?.systemPrompt} />
                            <ResultBlock title="📤 User Prompt" content={result.prompts?.userPrompt} />
                            <ResultBlock title="🤖 AI 응답" content={result.diagnosis} highlight />
                            <JsonBlock title="📊 사주 데이터" data={result.sajuData} />
                        </>
                    )}

                    {/* 유료 결과 */}
                    {result.mode === 'premium' && ['step1', 'step2', 'step3'].map((step, i) => (
                        <div key={step} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700">
                                Step {i + 1} {['인생 로드맵', '3대 핵심 분야', '월간 캘린더'][i]}
                            </div>
                            <div className="p-4 space-y-3">
                                <ResultBlock title="📤 System Prompt" content={result.steps[step]?.prompts?.systemPrompt} />
                                <ResultBlock title="📤 User Prompt" content={result.steps[step]?.prompts?.userPrompt} />
                                <ResultBlock title="🤖 AI 응답" content={result.steps[step]?.result} highlight />
                            </div>
                        </div>
                    ))}

                    {/* 전체 JSON */}
                    <JsonBlock title="📦 전체 응답 JSON" data={result} />
                </div>
            )}
        </div>
    );
}

// 텍스트 블록
function ResultBlock({ title, content, highlight }) {
    const [open, setOpen] = useState(true);
    return (
        <div className={`border rounded-lg overflow-hidden ${highlight ? 'border-blue-300' : 'border-gray-200'}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-full text-left px-4 py-2 text-sm font-medium flex justify-between items-center ${
                    highlight ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-700'
                }`}
            >
                {title}
                <span>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <pre className="p-4 text-xs text-gray-800 whitespace-pre-wrap break-words bg-white overflow-auto max-h-96">
                    {content}
                </pre>
            )}
        </div>
    );
}

// JSON 블록
function JsonBlock({ title, data }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full text-left px-4 py-2 text-sm font-medium flex justify-between items-center bg-gray-50 text-gray-700"
            >
                {title}
                <span>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <pre className="p-4 text-xs text-gray-800 whitespace-pre-wrap break-words bg-white overflow-auto max-h-96">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}

export default PromptTestPage;