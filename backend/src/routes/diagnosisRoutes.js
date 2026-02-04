const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');

/**
 * POST /api/diagnosis/free
 * 무료 베이직 진단
 */
router.post('/free', diagnosisController.generateFreeDiagnosis);

/**
 * POST /api/diagnosis/premium
 * 프리미엄 풀코스 진단
 */
// router.post('/premium', diagnosisController.generatePremiumDiagnosis);

module.exports = router;