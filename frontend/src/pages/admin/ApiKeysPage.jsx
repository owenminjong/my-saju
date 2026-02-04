import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    service_name: '',
    provider: '',
    category: '',
    api_key: '',
    is_active: true,
  });

  const categoryLabels = {
    ai: 'AI 모델',
    payment: '결제 모듈',
    social: '소셜 로그인',
  };

  const serviceLabels = {
    gpt: 'OpenAI GPT',
    gemini: 'Google Gemini',
    claude: 'Anthropic Claude',
    iamport: '아임포트',
    tosspayments: '토스페이먼츠',
    kakao: '카카오',
    naver: '네이버',
    google: '구글',
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApiKeys();
      const grouped = response.data.data.reduce((acc, key) => {
        if (!acc[key.category]) {
          acc[key.category] = [];
        }
        acc[key.category].push(key);
        return acc;
      }, {});
      setApiKeys(grouped);
      setLoading(false);
    } catch (error) {
      console.error('API 키 목록 조회 실패:', error);
      setLoading(false);
    }
  };

  const handleEdit = async (apiKey) => {
    try {
      const response = await adminAPI.getApiKeyDetail(apiKey.id);
      const keyData = response.data.data;
      setEditingKey(keyData);
      setFormData({
        id: keyData.id,
        service_name: keyData.service_name,
        provider: keyData.provider || '',
        category: keyData.category,
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
      setFormData({ id: null, service_name: '', provider: '', category: '', api_key: '', is_active: true });
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

  if (loading) {
    return <div className="p-4 sm:p-6 lg:p-8">로딩중...</div>;
  }

  return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">API Keys 관리</h1>

        {/* 카테고리별 섹션 */}
        {Object.entries(apiKeys).map(([category, keys]) => (
            <div key={category} className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                {categoryLabels[category]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {keys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold mb-1 truncate">
                            {serviceLabels[apiKey.service_name] || apiKey.service_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{apiKey.service_name}</p>
                        </div>
                        <button
                            onClick={() => handleToggle(apiKey.id, apiKey.is_active)}
                            className={`ml-2 px-2 sm:px-3 py-1 text-xs rounded-full transition-colors flex-shrink-0 ${
                                apiKey.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          {apiKey.is_active ? '활성' : '비활성'}
                        </button>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">API Key</div>
                        <div className="font-mono text-xs sm:text-sm bg-gray-50 p-2 rounded border overflow-hidden">
                          ********************
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-3 sm:mb-4">
                        마지막 수정: {new Date(apiKey.updated_at).toLocaleString('ko-KR')}
                      </div>

                      <button
                          onClick={() => handleEdit(apiKey)}
                          className="w-full px-4 py-2 sm:py-2.5 bg-blue-500 text-white text-sm sm:text-base rounded hover:bg-blue-600 transition-colors"
                      >
                        수정
                      </button>
                    </div>
                ))}
              </div>
            </div>
        ))}

        {/* API Key 수정 모달 */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  {serviceLabels[formData.service_name]} API Key 수정
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-sm font-medium mb-2">카테고리</label>
                    <input
                        type="text"
                        value={categoryLabels[formData.category]}
                        disabled
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg bg-gray-100 text-sm sm:text-base"
                    />
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <label className="block text-sm font-medium mb-2">서비스</label>
                    <input
                        type="text"
                        value={serviceLabels[formData.service_name] || formData.service_name}
                        disabled
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg bg-gray-100 text-sm sm:text-base"
                    />
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <label className="block text-sm font-medium mb-2">
                      API Key *
                      {formData.category === 'payment' && (
                          <span className="text-xs text-gray-500 ml-2 block sm:inline mt-1 sm:mt-0">
                      (결제 모듈의 경우 가맹점 코드 또는 API Key)
                    </span>
                      )}
                    </label>
                    <textarea
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        rows="4"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                        placeholder={
                          formData.category === 'ai' ? 'sk-...' :
                              formData.category === 'payment' ? 'imp_... 또는 toss_...' :
                                  'Client ID 또는 API Key'
                        }
                        required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ 보안을 위해 암호화되어 저장됩니다.
                    </p>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="flex items-center">
                      <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">활성화</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingKey(null);
                        }}
                        className="flex-1 px-4 py-2.5 sm:py-3 border rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
                    >
                      취소
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base"
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
