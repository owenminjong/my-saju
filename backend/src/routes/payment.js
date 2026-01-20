const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payment/prepare - 결제 준비
router.post('/prepare', paymentController.preparePayment);

// POST /api/payment/verify - 결제 검증
router.post('/verify', paymentController.verifyPayment);

// POST /api/payment/cancel - 결제 취소
router.post('/cancel', paymentController.cancelPayment);

module.exports = router;