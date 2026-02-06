const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path'); // ✅ 추가
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use('/generated-images', express.static(path.join(__dirname, '../public/generated-images'))); // ✅ 경로 수정

// 라우트
const authRoutes = require('./routes/auth');
const sajuRoutes = require('./routes/sajuRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const paymentRoutes = require('./routes/payment');
const adminUsersRoutes = require('./routes/admin/users');
const adminProductsRoutes = require('./routes/admin/products');
const adminPromptsRoutes = require('./routes/admin/prompts');
const adminApiKeysRoutes = require('./routes/admin/apiKeys');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const shareRoutes = require('./routes/shareRoutes');
const adminPay = require('./routes/admin/adminPay');
app.use('/api/auth', authRoutes);
app.use('/api/saju', sajuRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/prompts', adminPromptsRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminPay);

app.get('/', (req, res) => {
    res.json({ message: 'MyLifeCode Backend API' });
});

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize 연결 성공!');
        console.log(`🚀 서버 실행: http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        process.exit(1);
    }
});