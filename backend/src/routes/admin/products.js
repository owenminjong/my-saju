const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/admin/productsController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware'); // ⭐ 추가

// ⭐ 모든 라우트에 관리자 인증 적용
router.use(adminOnlyMiddleware);

// GET /api/admin/products - 상품 목록
router.get('/', productsController.getProducts);

// GET /api/admin/products/:id - 상품 상세
router.get('/:id', productsController.getProductDetail);

// POST /api/admin/products - 상품 생성
router.post('/', productsController.createProduct);

// PUT /api/admin/products/:id - 상품 수정
router.put('/:id', productsController.updateProduct);

// DELETE /api/admin/products/:id - 상품 삭제
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
