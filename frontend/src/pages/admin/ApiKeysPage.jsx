import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showKey, setShowKey] = useState({}); // 키 보기 상태
  const [formData, setFormData] = useState({
    service_name: '',
    api_key: '',
    is_active: true,
  });

  const serviceLabels = {
    gpt: 'OpenAI GPT',
    gemini: 'Google Gemini',
    claude: 'Anthropic Claude',
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApiKeys();
      setApiKeys(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('API 키 목록 조회 실패:', error);
      setLoading(false);
    }
  };

  const handleEdit = async (apiKey) => {
    try {
      // 실제 키 값을 가져옴
      const response = await adminAPI.getApiKeyDetail(apiKey.id);
      const keyData = response.data.data;

      setEditingKey(keyData);
      setFormData({
        service_name: keyData.service_name,
        api_key: keyData.api_key,
        is_active: keyData.is_active,
      });
      setShowModal(true);
    } catch (error) {
      console.error('API 키 조회 실패:', error);
      alert('API 키 조회에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await adminAPI.upsertApiKey(formData);
      alert('API 키가 저장되었습니다.');

      setShowModal(false);
      setEditingKey(null);
      setFormData({ service_name: '', api_key: '', is_active: true });
      fetchApiKeys();
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      alert('API 키 저장에 실패했습니다.');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await adminAPI.toggleApiKey(id, !currentStatus);
      fetchApiKeys();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const toggleShowKey = (id) => {
    setShowKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return <div className="p-8">로딩중...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">API Keys 관리</h1>
      </div>

      {/* API Keys 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">
                  {serviceLabels[apiKey.service_name] || apiKey.service_name}
                </h3>
                <p className="text-sm text-gray-500">{apiKey.service_name}</p>
              </div>
              <button
                onClick={() => handleToggle(apiKey.id, apiKey.is_active)}
                className={`px-3 py-1 text-xs rounded-full ${
                  apiKey.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {apiKey.is_active ? '활성' : '비활성'}
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">API Key</div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                {apiKey.api_key_masked}
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              마지막 수정: {new Date(apiKey.updated_at).toLocaleString('ko-KR')}
            </div>

            <button
              onClick={() => handleEdit(apiKey)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              수정
            </button>
          </div>
        ))}
      </div>

      {/* API Key 수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {serviceLabels[formData.service_name]} API Key 수정
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">서비스</label>
                <input
                  type="text"
                  value={serviceLabels[formData.service_name] || formData.service_name}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">API Key *</label>
                <textarea
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="sk-..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  보안을 위해 암호화되어 저장됩니다.
                </p>
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingKey(null);
                  }}
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

export default ApiKeysPage;