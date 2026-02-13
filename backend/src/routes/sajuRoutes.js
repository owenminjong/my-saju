const express = require('express');
const router = express.Router();
const sajuController = require('../controllers/sajuController');
const productsController = require('../controllers/admin/productsController'); // ⭐ 추가

/**
 * POST /api/saju/analyze
 * 무료 사주 분석
 */
router.post('/analyze', sajuController.analyzeFreeSaju);

/**
 * GET /api/saju/time-info
 * 시간대별 지지 정보 조회
 */
router.get('/time-info', sajuController.getTimeInfo);

/**
 * ⭐ GET /api/saju/products
 * 일반 유저용 활성화된 상품 목록 조회 (인증 불필요)
 */
router.get('/products', productsController.getActiveProducts);

module.exports = router;