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
 * GET /api/share/free/:uniqueId
 * 무료 버전 공유 링크 조회
 */
router.get('/free/:uniqueId', shareController.getFreeResult);

module.exports = router;