const CryptoJS = require('crypto-js');

// 암호화 키 (환경변수로 관리)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my-saju-secret-key-2025';

/**
 * API 키 암호화
 */
exports.encrypt = (text) => {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * API 키 복호화
 */
exports.decrypt = (encryptedText) => {
    if (!encryptedText) return '';
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};