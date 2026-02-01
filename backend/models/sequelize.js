const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'my_saju',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '0000',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+09:00',
        define: {
            timestamps: true,
            underscored: true, // snake_case 사용
            freezeTableName: true // 테이블명 복수형 변환 방지
        }
    }
);

// 연결 테스트 함수
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize 연결 성공!');
    } catch (error) {
        console.error('❌ Sequelize 연결 실패:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };