const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '서비스명 (kakao, naver, google, openai 등)'
    },
    provider: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'API 제공자명'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'API 카테고리 (social, ai, payment 등)'
    },
    api_key: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '암호화된 API 키'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: '활성화 여부'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '설명'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'api_keys',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['service_name', 'category']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return ApiKey;
};
