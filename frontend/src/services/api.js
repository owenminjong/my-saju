import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        console.log('🚀 API 요청:', config.method.toUpperCase(), config.url);

        if (config.url.startsWith('/admin')) {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (window.location.pathname.startsWith('/admin')) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminInfo');
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// ⭐ 일반 유저 API (카카오/네이버 로그인 유저용)
export const userAPI = {
    // 활성화된 상품 목록 조회 (인증 불필요)
    getActiveProducts: () => api.get('/saju/products'),
};

// ⭐ adminAPI export 추가
export const adminAPI = {
    // 대시보드
    getDashboardStats: () => api.get('/admin/dashboard/stats'),

    // 사용자 관리
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // ⭐ 토큰 사용 내역
    getTokenUsages: (params) => api.get('/admin/token-usage', { params }),
    getTokenUsageByOrder: (orderId) => api.get(`/admin/token-usage/order/${orderId}`),

    // 프롬프트 관리
    getPrompts: () => api.get('/admin/prompts'),
    createPrompt: (data) => api.post('/admin/prompts', data),
    updatePrompt: (id, data) => api.put(`/admin/prompts/${id}`, data),
    deletePrompt: (id) => api.delete(`/admin/prompts/${id}`),

    // 상품 관리 (관리자 전용)
    getProducts: () => api.get('/admin/products'),
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    // API 키 관리
    getApiKeys: () => api.get('/admin/api-keys'),
    getApiKeyDetail: (id) => api.get(`/admin/api-keys/${id}`),
    createApiKey: (data) => api.post('/admin/api-keys', data),
    updateApiKey: (id, data) => api.put(`/admin/api-keys/${id}`, data),
    deleteApiKey: (id) => api.delete(`/admin/api-keys/${id}`),

    // ✅ 주문 관리 (수정 및 추가)
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrderDetail: (orderId) => api.get(`/admin/orders/${orderId}`),
    getOrderStats: () => api.get('/admin/orders/stats'),
    cancelOrder: (orderId, cancelReason) => api.post(`/admin/orders/${orderId}/cancel`, { cancelReason }),
    updateOrderStatus: (orderId, data) => api.patch(`/admin/orders/${orderId}/status`, data),
    deleteOrder: (orderId) => api.delete(`/admin/orders/${orderId}`),
};

export const paymentAPI = {
    // ✅ prepare 함수 추가!
    prepare: (data) => api.post('/payment/prepare', data),

    // 결제 요청
    requestPayment: (data) => api.post('/payment/request', data),

    // 결제 완료 처리
    completePayment: (data) => api.post('/payment/complete', data),

    // ✅ confirm 함수 추가 (토스페이먼츠 승인)
    confirm: (data) => api.post('/payment/confirm', data),

    // 결제 취소
    cancelPayment: (orderId) => api.post(`/payment/cancel/${orderId}`),

    // 사용자 결제 내역
    getUserPayments: () => api.get('/payment/history'),

    // 결제 상세 조회
    getPaymentDetail: (orderId) => api.get(`/payment/${orderId}`),
};

export default api;