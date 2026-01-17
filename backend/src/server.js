const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// DB 연결 테스트
testConnection();

// 관리자 라우트
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminUsersRoutes = require('./routes/admin/users');
const adminPromptsRoutes = require('./routes/admin/prompts');
const adminProductsRoutes = require('./routes/admin/products');

app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/prompts', adminPromptsRoutes);
app.use('/api/admin/products', adminProductsRoutes);

// 테스트 라우트
app.get('/', (req, res) => {
    res.json({ message: 'My Saju API Server' });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
