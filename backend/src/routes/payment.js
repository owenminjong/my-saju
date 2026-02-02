const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payment/prepare - 결제 준비
router.post('/prepare', paymentController.preparePayment);

// POST /api/payment/confirm - 결제 승인 (토스페이먼츠)
router.post('/confirm', paymentController.confirmPayment);

// POST /api/payment/cancel - 결제 취소
router.post('/cancel', paymentController.cancelPayment);

module.exports = router;