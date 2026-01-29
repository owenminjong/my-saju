const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prompt = sequelize.define('Prompt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '프롬프트 이름'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '프롬프트 내용'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '카테고리 (saju, diagnosis 등)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: '활성화 여부'
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
    tableName: 'prompts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return Prompt;
};
