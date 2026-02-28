import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

        if (config.url.includes('/admin')) {
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
    (error) => Promise.reject(error)
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

// 일반 유저 API
export const userAPI = {
    getActiveProducts: () => api.get('/api/saju/products'),
};

// 관리자 API
export const adminAPI = {
    // 대시보드
    getDashboardStats: () => api.get('/api/admin/dashboard/stats'),

    // 사용자 관리
    getUsers: (params) => api.get('/api/admin/users', { params }),
    getUserDetail: (id) => api.get(`/api/admin/users/${id}`),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    updateUserStatus: (id, status) => api.patch(`/api/admin/users/${id}/status`, { status }),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

    // 토큰 사용 내역
    getTokenUsages: (params) => api.get('/api/admin/token-usage', { params }),
    getTokenUsageByOrder: (orderId) => api.get(`/api/admin/token-usage/order/${orderId}`),

    // 프롬프트 관리
    getPrompts: () => api.get('/api/admin/prompts'),
    getPromptDetail: (id) => api.get(`/api/admin/prompts/${id}`),
    createPrompt: (data) => api.post('/api/admin/prompts', data),
    updatePrompt: (id, data) => api.put(`/api/admin/prompts/${id}`, data),
    deletePrompt: (id) => api.delete(`/api/admin/prompts/${id}`),

    // 프롬프트 테스트
    runPromptTest: (data) => api.post('/api/admin/prompt-test', data),

    // 상품 관리
    getProducts: () => api.get('/api/admin/products'),
    getProductDetail: (id) => api.get(`/api/admin/products/${id}`),
    createProduct: (data) => api.post('/api/admin/products', data),
    updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

    // API 키 관리
    getApiKeys: () => api.get('/api/admin/api-keys'),
    getApiKeyDetail: (id) => api.get(`/api/admin/api-keys/${id}`),
    upsertApiKey: (data) => api.post('/api/admin/api-keys', data),
    toggleApiKey: (id, is_active) => api.patch(`/api/admin/api-keys/${id}/toggle`, { is_active }),
    createApiKey: (data) => api.post('/api/admin/api-keys', data),
    updateApiKey: (id, data) => api.put(`/api/admin/api-keys/${id}`, data),
    deleteApiKey: (id) => api.delete(`/api/admin/api-keys/${id}`),

    // 주문 관리
    getOrders: (params) => api.get('/api/admin/orders', { params }),
    getOrderDetail: (orderId) => api.get(`/api/admin/orders/${orderId}`),
    getOrderStats: () => api.get('/api/admin/orders/stats'),
    cancelOrder: (orderId, cancelReason) => api.post(`/api/admin/orders/${orderId}/cancel`, { cancelReason }),
    updateOrderStatus: (orderId, data) => api.patch(`/api/admin/orders/${orderId}/status`, data),
    deleteOrder: (orderId) => api.delete(`/api/admin/orders/${orderId}`),
};

export const paymentAPI = {
    prepare: (data) => api.post('/api/payment/prepare', data),
    requestPayment: (data) => api.post('/api/payment/request', data),
    completePayment: (data) => api.post('/api/payment/complete', data),
    confirm: (data) => api.post('/api/payment/confirm', data),
    cancelPayment: (orderId) => api.post(`/api/payment/cancel/${orderId}`),
    getUserPayments: () => api.get('/api/payment/history'),
    getPaymentDetail: (orderId) => api.get(`/api/payment/${orderId}`),
};

export default api;