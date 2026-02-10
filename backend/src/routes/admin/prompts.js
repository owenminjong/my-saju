const express = require('express');
const router = express.Router();
const promptsController = require('../../controllers/admin/promptsController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware'); // ⭐ 추가

// ⭐ 모든 라우트에 관리자 인증 적용
router.use(adminOnlyMiddleware);

// GET /api/admin/prompts - 프롬프트 목록
router.get('/', promptsController.getPrompts);

// GET /api/admin/prompts/:id - 프롬프트 상세
router.get('/:id', promptsController.getPromptDetail);

// POST /api/admin/prompts - 프롬프트 생성
router.post('/', promptsController.createPrompt);

// PUT /api/admin/prompts/:id - 프롬프트 수정
router.put('/:id', promptsController.updatePrompt);

// DELETE /api/admin/prompts/:id - 프롬프트 삭제
router.delete('/:id', promptsController.deletePrompt);

module.exports = router;
