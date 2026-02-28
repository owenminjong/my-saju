const express = require('express');
const router = express.Router();
const promptTestController = require('../../controllers/admin/promptTestController');
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware');

router.use(adminOnlyMiddleware);

router.post('/', promptTestController.runPromptTest);

module.exports = router;