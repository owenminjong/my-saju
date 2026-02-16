// backend/src/routes/admin/adminPay.js

const express = require('express');
const router = express.Router();
const orderAdminController = require('../../controllers/admin/adminPayController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware');

// 관리자 인증 미들웨어 적용
router.use(adminOnlyMiddleware);

// GET /api/admin/orders - 주문 목록 조회
router.get('/', orderAdminController.getOrders);

// GET /api/admin/orders/stats - 주문 통계
router.get('/stats', orderAdminController.getOrderStats);

// GET /api/admin/orders/:id - 주문 상세 조회
router.get('/:id', orderAdminController.getOrderDetail);

// POST /api/admin/orders/:id/cancel - 결제 취소 (전액)
router.post('/:id/cancel', orderAdminController.cancelOrder);

module.exports = router;