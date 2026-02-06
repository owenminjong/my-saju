// backend/src/routes/diagnosisRoutes.js

const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

/**
 * 무료 베이직 진단 생성
 * POST /api/diagnosis/free
 * 인증 선택 (로그인/비로그인 모두 가능)
 */
router.post('/free', optionalAuthMiddleware, diagnosisController.generateFreeDiagnosis);

/**
 * 프리미엄 진단 생성 (3단계)
 * POST /api/diagnosis/premium
 * 인증 필수
 */
router.post('/premium', authMiddleware, diagnosisController.generatePremiumDiagnosis);

/**
 * 프리미엄 진단 결과 조회
 * GET /api/diagnosis/premium/:diagnosisId
 * 인증 필수 + 소유자 검증
 */
router.get('/premium/:diagnosisId', authMiddleware, diagnosisController.getPremiumResult);

/**
 * 나의 프리미엄 진단 목록 조회
 * GET /api/diagnosis/my-results
 * 인증 필수
 */
router.get('/my-results', authMiddleware, diagnosisController.getMyResults);

module.exports = router;