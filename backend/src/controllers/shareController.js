// backend/src/controllers/shareController.js

const kakaoShareService = require('../services/kakaoShareService');
const freeShareService = require('../services/freeShareService');
const { encodeData, decodeData } = require('../utils/dataEncoder');

/**
 * GET /api/share/kakao-key
 * 카카오 JavaScript 키 조회
 */
exports.getKakaoKey = async (req, res) => {
    try {
        const kakaoKey = await kakaoShareService.getKakaoJsKey();

        res.json({
            success: true,
            data: {
                kakaoJsKey: kakaoKey
            }
        });

    } catch (error) {
        console.error('카카오 키 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '카카오 키 조회에 실패했습니다.'
        });
    }
};

/**
 * POST /api/share/encode
 * 세션 데이터를 인코딩해서 공유 URL 생성 (기존 gzip)
 */
exports.encodeShareData = async (req, res) => {
    try {
        const sajuData = freeShareService.getFreeResult(req.session);

        const dataToEncode = {
            user: sajuData.user || {
                name: sajuData.metadata?.userName || '익명',
                birthDate: sajuData.birthDate,
                birthTime: sajuData.birthTime,
                gender: sajuData.gender
            },
            saju: sajuData.saju || {},
            fields: sajuData.fields || sajuData.metadata?.grades || {},
            metadata: sajuData.metadata || {}
        };

        const encodedData = await encodeData(dataToEncode);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const shareUrl = `${frontendUrl}/result/${encodedData}`;

        console.log('✅ 공유 URL 생성 완료:', {
            이름: dataToEncode.user.name,
            URL길이: shareUrl.length
        });

        res.json({
            success: true,
            data: {
                encodedData,
                shareUrl,
                urlLength: shareUrl.length
            }
        });

    } catch (error) {
        console.error('공유 URL 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '공유 URL 생성에 실패했습니다.'
        });
    }
};

/**
 * ✅ POST /api/share/encode-hash
 * gzip 압축 + Base64 인코딩 (짧은 URL)
 */
exports.encodeShareDataHash = async (req, res) => {
    try {
        const zlib = require('zlib');
        const sajuData = freeShareService.getFreeResult(req.session);

        const dataToEncode = {
            user: sajuData.user || {
                name: sajuData.metadata?.userName || '익명',
                birthDate: sajuData.birthDate,
                birthTime: sajuData.birthTime,
                gender: sajuData.gender
            },
            saju: sajuData.saju || {},
            fields: sajuData.fields || sajuData.metadata?.grades || {},
            metadata: sajuData.metadata || {}
        };

        console.log('📦 압축 인코딩 시작:', {
            이름: dataToEncode.user.name
        });

        // ✅ 1. JSON 문자열화
        const dataString = JSON.stringify(dataToEncode);
        console.log('원본 크기:', dataString.length, '자');

        // ✅ 2. gzip 압축
        const compressed = zlib.gzipSync(dataString);
        console.log('압축 후 크기:', compressed.length, '바이트');

        // ✅ 3. Base64 URL-safe 인코딩
        const encoded = compressed
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        console.log('인코딩 후 크기:', encoded.length, '자');

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const shareUrl = `${frontendUrl}/r/${encoded}`;

        console.log('✅ 최종 URL 길이:', shareUrl.length, '자');

        res.json({
            success: true,
            data: {
                encodedData: encoded,
                shareUrl,
                urlLength: shareUrl.length
            }
        });

    } catch (error) {
        console.error('압축 인코딩 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '공유 URL 생성에 실패했습니다.'
        });
    }
};

/**
 * GET /api/share/decode/:encodedData
 * 인코딩된 데이터를 디코딩해서 사주 결과 반환 (기존 gzip)
 */
exports.decodeShareData = async (req, res) => {
    try {
        let { encodedData } = req.params;

        if (!encodedData) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 공유 링크입니다.'
            });
        }

        try {
            encodedData = decodeURIComponent(encodedData);
        } catch (e) {
            // 이미 디코딩됨
        }

        const sajuData = await decodeData(encodedData);

        console.log('✅ 공유 데이터 디코딩 완료:', {
            이름: sajuData.user?.name
        });

        res.json({
            success: true,
            data: sajuData
        });

    } catch (error) {
        console.error('공유 데이터 디코딩 오류:', error);

        const statusCode = error.message.includes('유효하지 않은') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || '공유 링크를 불러올 수 없습니다.'
        });
    }
};

/**
 * ✅ POST /api/share/decode-hash
 * Base64 디코딩 + gzip 압축 해제
 */
exports.decodeShareDataHash = async (req, res) => {
    try {
        const zlib = require('zlib');
        let encoded = req.body.encodedData;

        if (!encoded) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 데이터입니다.'
            });
        }

        console.log('📥 압축 디코딩 요청:', {
            길이: encoded.length
        });

        // ✅ 1. URL-safe Base64를 일반 Base64로 복원
        encoded = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // 패딩 추가
        while (encoded.length % 4) {
            encoded += '=';
        }

        // ✅ 2. Base64 디코딩
        const compressed = Buffer.from(encoded, 'base64');

        // ✅ 3. gzip 압축 해제
        const decompressed = zlib.gunzipSync(compressed);
        const dataString = decompressed.toString('utf-8');
        const sajuData = JSON.parse(dataString);

        console.log('✅ 압축 디코딩 완료:', {
            이름: sajuData.user?.name
        });

        res.json({
            success: true,
            data: sajuData
        });

    } catch (error) {
        console.error('압축 디코딩 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 디코딩에 실패했습니다.'
        });
    }
};

module.exports = exports;