// backend/src/routes/shareRoutes.js

const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

/**
 * GET /api/share/kakao-key
 * 카카오 JavaScript 키 조회
 */
router.get('/kakao-key', shareController.getKakaoKey);

/**
 * POST /api/share/encode
 * 세션 데이터를 인코딩해서 공유 URL 생성 (gzip)
 */
router.post('/encode', shareController.encodeShareData);

/**
 * ✅ POST /api/share/encode-hash
 * Base64 인코딩 (더 짧은 URL)
 */
router.post('/encode-hash', shareController.encodeShareDataHash);

/**
 * GET /api/share/decode/:encodedData
 * 인코딩된 데이터를 디코딩해서 사주 결과 반환 (gzip)
 */
router.get('/decode/:encodedData', shareController.decodeShareData);

/**
 * ✅ POST /api/share/decode-hash
 * Base64 디코딩
 */
router.post('/decode-hash', shareController.decodeShareDataHash);

module.exports = router;