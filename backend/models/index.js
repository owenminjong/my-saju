const { sequelize } = require('./sequelize');

// 모델 import
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const TokenUsage = require('./TokenUsage');
const ApiKey = require('./ApiKey');
const Prompt = require('./Prompt');
const DiagnosisResult = require('./DiagnosisResult');

// 관계 설정 추가
User.hasMany(DiagnosisResult, {
  foreignKey: 'user_id',
  as: 'diagnosisResults'
});
DiagnosisResult.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Order.hasOne(DiagnosisResult, {
  foreignKey: 'order_id',
  as: 'diagnosisResult'
});
DiagnosisResult.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// export에 추가
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  TokenUsage,
  ApiKey,
  Prompt,
  DiagnosisResult  // 추가
};