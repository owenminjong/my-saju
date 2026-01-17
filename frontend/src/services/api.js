import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 관리자 API
export const adminAPI = {
    // 대시보드
    getDashboard: () => api.get('/admin/dashboard'),

    // 회원 관리
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserDetail: (id) => api.get(`/admin/users/${id}`),
    updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // 프롬프트 관리
    getPrompts: (params) => api.get('/admin/prompts', { params }),
    getPromptDetail: (id) => api.get(`/admin/prompts/${id}`),
    createPrompt: (data) => api.post('/admin/prompts', data),
    updatePrompt: (id, data) => api.put(`/admin/prompts/${id}`, data),
    deletePrompt: (id) => api.delete(`/admin/prompts/${id}`),

    // 상품 관리
    getProducts: () => api.get('/admin/products'),
    getProductDetail: (id) => api.get(`/admin/products/${id}`),
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export default api;