const { Sequelize } = require('sequelize');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    pool: dbConfig.pool
  }
);

const db = {};

// 모델 import
db.User = require('./User')(sequelize);
db.Product = require('./Product')(sequelize);
db.ApiKey = require('./ApiKey')(sequelize);
db.Order = require('./Order')(sequelize);
db.Prompt = require('./Prompt')(sequelize);
db.TokenUsage = require('./TokenUsage')(sequelize);

// 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 연결 테스트
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize - MariaDB 연결 성공!');
  } catch (error) {
    console.error('❌ Sequelize - MariaDB 연결 실패:', error.message);
    process.exit(1);
  }
};

db.testConnection = testConnection;

module.exports = db;
