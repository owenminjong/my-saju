// backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../../models');

/**
 * JWT 인증 미들웨어
 *
 * 사용법:
 * router.get('/protected', authMiddleware, controller.method);
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Authorization 헤더에서 토큰 추출
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 없습니다.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // 2. JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('🔓 JWT 디코딩:', decoded);

        // 3. DB에서 사용자 확인
        const user = await User.findOne({
            where: { id: decoded.userId },
            attributes: ['id', 'uuid', 'email', 'name', 'role', 'status']
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 사용자입니다.'
            });
        }

        // 4. 계정 상태 확인
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: '비활성화된 계정입니다.'
            });
        }

        // 5. req.user에 사용자 정보 저장
        req.user = {
            id: user.id,
            uuid: user.uuid,  // ⭐ UUID 포함
            email: user.email,
            name: user.name,
            role: user.role
        };

        console.log('✅ 인증 성공:', req.user);

        next();

    } catch (error) {
        console.error('❌ 인증 오류:', error);

        // JWT 관련 에러 처리
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
            });
        }

        // 기타 서버 오류
        res.status(500).json({
            success: false,
            message: '인증 처리 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 통과 (로그인/비로그인 모두 허용)
 *
 * 사용법:
 * router.get('/public', optionalAuthMiddleware, controller.method);
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // 토큰 없음 → 비로그인 상태로 통과
            req.user = null;
            return next();
        }

        const token = authHeader.replace('Bearer ', '');

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // DB에서 사용자 확인
        const user = await User.findOne({
            where: { id: decoded.userId },
            attributes: ['id', 'uuid', 'email', 'name', 'role', 'status']
        });

        if (user && user.status === 'active') {
            req.user = {
                id: user.id,
                uuid: user.uuid,
                email: user.email,
                name: user.name,
                role: user.role
            };
        } else {
            req.user = null;
        }

        next();

    } catch (error) {
        // 토큰 오류 시에도 통과 (비로그인 상태로)
        req.user = null;
        next();
    }
};

/**
 * 관리자 권한 확인 미들웨어
 * authMiddleware와 함께 사용
 *
 * 사용법:
 * router.get('/admin', authMiddleware, adminMiddleware, controller.method);
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '인증이 필요합니다.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    adminMiddleware
};