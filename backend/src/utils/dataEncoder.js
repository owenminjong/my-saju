// backend/src/utils/dataEncoder.js

const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * 사주 데이터를 압축하고 Base64URL 인코딩
 * @param {Object} sajuData - 사주 데이터
 * @returns {Promise<string>} 인코딩된 문자열
 */
const encodeData = async (sajuData) => {
    try {
        // 1. JSON 문자열로 변환
        const jsonString = JSON.stringify(sajuData);

        // 2. Gzip 압축
        const compressed = await gzip(Buffer.from(jsonString, 'utf-8'));

        // 3. Base64URL 인코딩 (URL safe)
        const encoded = compressed
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        console.log('📦 데이터 인코딩 완료:', {
            원본크기: jsonString.length,
            압축후: compressed.length,
            인코딩후: encoded.length
        });

        return encoded;

    } catch (error) {
        console.error('데이터 인코딩 오류:', error);
        throw new Error('데이터 인코딩에 실패했습니다.');
    }
};

/**
 * Base64URL 디코딩하고 압축 해제
 * @param {string} encodedData - 인코딩된 문자열
 * @returns {Promise<Object>} 원본 사주 데이터
 */
const decodeData = async (encodedData) => {
    try {
        // 1. Base64URL → Base64
        let base64 = encodedData
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // 패딩 추가
        while (base64.length % 4) {
            base64 += '=';
        }

        // 2. Base64 디코딩
        const compressed = Buffer.from(base64, 'base64');

        // 3. Gzip 압축 해제
        const decompressed = await gunzip(compressed);

        // 4. JSON 파싱
        const jsonString = decompressed.toString('utf-8');
        const sajuData = JSON.parse(jsonString);

        console.log('📦 데이터 디코딩 완료');

        return sajuData;

    } catch (error) {
        console.error('데이터 디코딩 오류:', error);
        throw new Error('유효하지 않은 공유 링크입니다.');
    }
};

module.exports = {
    encodeData,
    decodeData
};
