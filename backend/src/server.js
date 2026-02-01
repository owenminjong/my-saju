const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('../models');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
const authRoutes = require('./routes/auth');
const sajuRoutes = require('./routes/sajuRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');  // ← 변경
const paymentRoutes = require('./routes/payment');
const adminUsersRoutes = require('./routes/admin/users');
const adminProductsRoutes = require('./routes/admin/products');
const adminPromptsRoutes = require('./routes/admin/prompts');
const adminApiKeysRoutes = require('./routes/admin/apiKeys');
const adminDashboardRoutes = require('./routes/admin/dashboard');

// API 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/saju', sajuRoutes);
app.use('/api/diagnosis', diagnosisRoutes);  // ← 동일
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/prompts', adminPromptsRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// 루트 경로
app.get('/', (req, res) => {
    res.json({ message: 'MyLifeCode Backend API' });
});

// 서버 시작 + Sequelize 연결
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