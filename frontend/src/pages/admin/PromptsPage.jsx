import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function PromptsPage() {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        category: '',
        is_active: true,
    });

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPrompts();
            setPrompts(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('프롬프트 목록 조회 실패:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPrompt) {
                await adminAPI.updatePrompt(editingPrompt.id, formData);
                alert('프롬프트가 수정되었습니다.');
            } else {
                await adminAPI.createPrompt(formData);
                alert('프롬프트가 생성되었습니다.');
            }
            setShowModal(false);
            setEditingPrompt(null);
            setFormData({ name: '', content: '', category: '', is_active: true });
            fetchPrompts();
        } catch (error) {
            console.error('프롬프트 저장 실패:', error);
            alert('프롬프트 저장에 실패했습니다.');
        }
    };

    const handleEdit = (prompt) => {
        setEditingPrompt(prompt);
        setFormData({
            name: prompt.name,
            content: prompt.content,
            category: prompt.category || '',
            is_active: prompt.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 프롬프트를 삭제하시겠습니까?')) return;
        try {
            await adminAPI.deletePrompt(id);
            alert('프롬프트가 삭제되었습니다.');
            fetchPrompts();
        } catch (error) {
            console.error('프롬프트 삭제 실패:', error);
            alert('프롬프트 삭제에 실패했습니다.');
        }
    };

    const handleAdd = () => {
        setEditingPrompt(null);
        setFormData({ name: '', content: '', category: '', is_active: true });
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-4 sm:p-6 lg:p-8 text-gray-900">로딩중...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">프롬프트 관리</h1>
            </div>

            {/* 사용 가능한 변수 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">📌 사용 가능한 변수</h3>
                <div className="text-xs sm:text-sm text-blue-700 space-y-1 overflow-x-auto">
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{color}`}</code> - 천간 색상</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{animalName}`}</code> - 띠 동물 이름</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{animalEmoji}`}</code> - 띠 이모지</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{seasonBg}`}</code> - 계절 배경</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{timeBg}`}</code> - 시간대 분위기</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{dominantEffect}`}</code> - 가장 강한 오행 효과</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{fullDescription}`}</code> - 캐릭터 전체 설명</p>
                    <p><code className="bg-blue-100 px-2 py-1 rounded whitespace-nowrap">{`{personalityExpression}`}</code> - MBTI 성향</p>
                </div>
            </div>

            {/* 프롬프트 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {prompts.map((prompt) => (
                    <div key={prompt.id} className="bg-white p-4 sm:p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 min-w-0 truncate">
                                {prompt.name}
                            </h3>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                                prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {prompt.is_active ? '활성' : '비활성'}
                            </span>
                        </div>

                        {prompt.category && (
                            <div className="text-xs sm:text-sm text-gray-500 mb-2">
                                카테고리: {prompt.category}
                            </div>
                        )}

                        <div className="text-sm text-gray-700 mb-3 sm:mb-4 line-clamp-3">
                            {prompt.content}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(prompt)}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600"
                            >
                                수정
                            </button>
                            <button
                                onClick={() => handleDelete(prompt.id)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 프롬프트 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
                            {editingPrompt ? '프롬프트 수정' : '새 프롬프트'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 sm:mb-4">
                                <label className="block text-sm font-medium mb-2 text-gray-700">이름 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                                    required
                                />
                            </div>

                            <div className="mb-3 sm:mb-4">
                                <label className="block text-sm font-medium mb-2 text-gray-700">카테고리</label>
                                <p>{formData.category}</p>
                            </div>

                            <div className="mb-3 sm:mb-4">
                                <label className="block text-sm font-medium mb-2 text-gray-700">내용 *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows="10"
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-sm sm:text-base"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm sm:text-base"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PromptsPage;
