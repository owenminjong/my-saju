const express = require('express');
const router = express.Router();
const promptsController = require('../../controllers/admin/promptsController');

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