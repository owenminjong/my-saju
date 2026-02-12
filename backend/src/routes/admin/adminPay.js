// backend/src/routes/admin/adminPay.js

const express = require('express');
const router = express.Router();
const adminPayController = require('../../controllers/admin/adminPayController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware'); // ⭐ 추가

// ⭐ 모든 라우트에 관리자 인증 적용
router.use(adminOnlyMiddleware);

// 주문 관리
router.get('/orders', adminPayController.getOrders);
router.get('/orders/:id', adminPayController.getOrderDetail);
router.post('/orders/:id/cancel', adminPayController.cancelOrder);
router.post('/orders/:id/refund', adminPayController.refundOrder);

module.exports = router;
