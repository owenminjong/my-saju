// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 활성화된 소셜 로그인 목록
router.get('/social-logins', authController.getActiveSocialLogins);

// 카카오 로그인 시작
router.get('/kakao', authController.kakaoLogin);

// 카카오 콜백
router.get('/kakao/callback', authController.kakaoCallback);

// 네이버 로그인 ← 추가
router.get('/naver', authController.naverLogin);
router.get('/naver/callback', authController.naverCallback);

module.exports = router;