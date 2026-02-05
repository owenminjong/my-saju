// src/routes/admin/users.js

const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/usersController');  // ⭐ userController로 수정

// GET /api/admin/users - 회원 목록
router.get('/', usersController.getUsers);

// GET /api/admin/users/:id - 회원 상세
router.get('/:id', usersController.getUserDetail);

// PATCH /api/admin/users/:id/status - 회원 상태 변경
router.patch('/:id/status', usersController.updateUserStatus);

// DELETE /api/admin/users/:id - 회원 삭제
router.delete('/:id', usersController.deleteUser);

module.exports = router;
