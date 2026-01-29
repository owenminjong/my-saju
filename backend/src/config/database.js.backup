const mysql = require('mysql2/promise');
require('dotenv').config();

// 커넥션 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// DB 연결 테스트
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MariaDB 연결 성공!');
        connection.release();
    } catch (error) {
        console.error('❌ MariaDB 연결 실패:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, testConnection };