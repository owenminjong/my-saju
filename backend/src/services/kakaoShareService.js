// backend/src/services/kakaoShareService.js
const { ApiKey } = require('../../models');
const { decrypt } = require('../utils/encryption');

/**
 * 카카오 JavaScript 키 조회
 */
const getKakaoJsKey = async () => {
    try {
        const apiKey = await ApiKey.findOne({
            where: {
                service_name: 'kakao',
                is_active: true
            },
            attributes: ['api_key']
        });

        if (!apiKey) {
            throw new Error('카카오 API 키가 설정되지 않았습니다.');
        }

        // 복호화
        const decryptedKey = decrypt(apiKey.api_key);

        // JSON 파싱
        const keyObject = JSON.parse(decryptedKey);

        // JavaScript 키 반환
        return keyObject.javascript;

    } catch (error) {
        console.error('카카오 JS 키 조회 오류:', error);
        throw error;
    }
};

module.exports = {
    getKakaoJsKey
};