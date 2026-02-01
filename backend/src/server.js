const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 관리자 라우트
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUsersRoutes = require('./routes/admin/users');
const adminPromptsRoutes = require('./routes/admin/prompts');
const adminProductsRoutes = require('./routes/admin/products');
const adminApiKeysRoutes = require('./routes/admin/apiKeys');
const paymentRoutes = require('./routes/payment');
const sajuRoutes = require('./routes/sajuRoutes');
const authRoutes = require('./routes/auth');
const diagnosisRoutes = require('./routes/diagnosis');

app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/prompts', adminPromptsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/api-keys', adminApiKeysRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/saju', sajuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/diagnosis', diagnosisRoutes);

// 테스트 라우트
app.get('/', (req, res) => {
    res.json({ message: 'My Saju API Server' });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
