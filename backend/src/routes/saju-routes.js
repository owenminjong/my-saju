const express = require('express');
const router = express.Router();
const sajuController = require('../controllers/saju-controller');

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

module.exports = router;