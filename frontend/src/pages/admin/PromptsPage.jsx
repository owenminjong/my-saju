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
        if (!window.confirm('정말 이 프롬프트를 삭제하시겠습니까?')) {
            return;
        }

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
        return <div className="p-8">로딩중...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">프롬프트 관리</h1>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + 새 프롬프트
                </button>
            </div>

            {/* 프롬프트 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt) => (
                    <div key={prompt.id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">{prompt.name}</h3>
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                    prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                {prompt.is_active ? '활성' : '비활성'}
              </span>
                        </div>

                        {prompt.category && (
                            <div className="text-sm text-gray-500 mb-2">카테고리: {prompt.category}</div>
                        )}

                        <div className="text-sm text-gray-700 mb-4 line-clamp-3">
                            {prompt.content}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(prompt)}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                수정
                            </button>
                            <button
                                onClick={() => handleDelete(prompt.id)}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 프롬프트 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingPrompt ? '프롬프트 수정' : '새 프롬프트'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">이름 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">카테고리</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: saju, love, wealth"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">내용 *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows="10"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">활성화</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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