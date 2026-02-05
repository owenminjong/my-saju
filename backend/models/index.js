const { sequelize } = require('./sequelize');

// 모델 import
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const TokenUsage = require('./TokenUsage');
const ApiKey = require('./ApiKey');
const Prompt = require('./Prompt');
const DiagnosisResult = require('./DiagnosisResult');

// ✅ 모든 모델을 객체로 묶기
const models = {
  User,
  Product,
  Order,
  TokenUsage,
  ApiKey,
  Prompt,
  DiagnosisResult
};

// ✅ 각 모델의 associate 함수 실행 (모델 파일에 정의된 관계 초기화)
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// export
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  TokenUsage,
  ApiKey,
  Prompt,
  DiagnosisResult
};
