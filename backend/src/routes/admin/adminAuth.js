const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../../../models/Admin');

// ⭐ /admin/login → /login으로 수정
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 관리자 로그인 시도:', username);

        const admin = await Admin.findOne({
            where: { username }
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: '관리자 계정을 찾을 수 없습니다.'
            });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.'
            });
        }

        const token = jwt.sign(
            {
                adminId: admin.id,
                username: admin.username,
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await admin.update({ last_login: new Date() });

        console.log('✅ 관리자 로그인 성공:', admin.username);

        res.json({
            success: true,
            message: '관리자 로그인 성공',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name
            }
        });

    } catch (error) {
        console.error('❌ 관리자 로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// ⭐ /admin/me → /me로 수정
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 없습니다.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                message: '관리자 권한이 필요합니다.'
            });
        }

        const admin = await Admin.findOne({
            where: { id: decoded.adminId }
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 관리자 계정입니다.'
            });
        }

        res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name
            }
        });

    } catch (error) {
        console.error('❌ 관리자 정보 조회 에러:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다.'
            });
        }

        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router;