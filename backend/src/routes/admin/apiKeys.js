const express = require('express');
const router = express.Router();
const apiKeysController = require('../../controllers/admin/apiKeysController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware'); // ⭐ 추가

// ⭐ 모든 라우트에 관리자 인증 적용
router.use(adminOnlyMiddleware);

// GET /api/admin/api-keys - API 키 목록
router.get('/', apiKeysController.getApiKeys);

// GET /api/admin/api-keys/:id - API 키 상세
router.get('/:id', apiKeysController.getApiKey);

// POST /api/admin/api-keys - API 키 생성/수정
router.post('/', apiKeysController.upsertApiKey);

// PATCH /api/admin/api-keys/:id/toggle - 활성화 토글
router.patch('/:id/toggle', apiKeysController.toggleApiKey);

// DELETE /api/admin/api-keys/:id - API 키 삭제
router.delete('/:id', apiKeysController.deleteApiKey);

module.exports = router;
