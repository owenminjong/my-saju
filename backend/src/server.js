const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('../models');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL;

// 미들웨어 (순서 중요!)
app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'mylifecode-session-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24시간
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));
app.use('/generated-images', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}, express.static(path.join(__dirname, '../public/generated-images')));

// 라우트 import
const authRoutes = require('./routes/auth');
const sajuRoutes = require('./routes/sajuRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const paymentRoutes = require('./routes/payment');
const shareRoutes = require('./routes/shareRoutes');

// 관리자 라우트 import
const adminAuthRoutes = require('./routes/admin/adminAuth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUsersRoutes = require('./routes/admin/users');
const adminProductsRoutes = require('./routes/admin/products');
const adminPromptsRoutes = require('./routes/admin/prompts');
const adminApiKeysRoutes = require('./routes/admin/apiKeys');
const adminPayRoutes = require('./routes/admin/adminPay');
const adminTokenUsageRoutes = require('./routes/admin/tokenUsage');
const adminPromptTestRoutes = require('./routes/admin/promptTest');

// 일반 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/saju', sajuRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/share', shareRoutes);

// ⭐ 관리자 라우트 등록 (중요: adminAuth는 미들웨어 없이 맨 위에)
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/prompts', adminPromptsRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);
app.use('/api/admin/orders', adminPayRoutes);  // ✅ 이것만 남김
app.use('/api/admin/token-usage', adminTokenUsageRoutes);
app.use('/api/admin/prompt-test', adminPromptTestRoutes);

// 루트 경로
app.get('/', (req, res) => {
    res.json({
        message: 'MyLifeCode Backend API',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            saju: '/api/saju',
            diagnosis: '/api/diagnosis',
            payment: '/api/payment',
            share: '/api/share',
            admin: '/api/admin'
        }
    });
});

// 404 에러 핸들링
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.path);
    res.status(404).json({
        success: false,
        message: '요청한 경로를 찾을 수 없습니다.',
        path: req.path
    });
});

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error('❌ 서버 에러:', err);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 서버 시작
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL 데이터베이스 연결 성공!');

        await sequelize.sync({ force: false, alter: false });
        console.log('✅ DB 테이블 동기화 완료');

        console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
        console.log(`📡 프론트엔드 CORS 허용: ${frontendUrl}`);
        console.log('🔐 관리자 로그인: POST /api/admin/auth/login');
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        process.exit(1);
    }
});

module.exports = app;