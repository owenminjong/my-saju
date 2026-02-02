import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

axios.defaults.withCredentials = true;
/**
 * 사주 분석 API 호출
 */
export const analyzeSaju = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/saju/analyze`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || '사주 분석에 실패했습니다.');
    }
};

/**
 * 시간대 정보 조회
 */
export const getTimeInfo = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/saju/time-info`);
        return response.data;
    } catch (error) {
        throw new Error('시간 정보를 불러오는데 실패했습니다.');
    }
};

/**
 * 무료 진단 API 호출 (새로 추가 - Claude 진단 포함)
 */
export const getFreeDiagnosis = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/diagnosis/free`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || '진단에 실패했습니다.');
    }
}
export default {
    analyzeSaju,
    getTimeInfo,
    getFreeDiagnosis
};