const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TokenUsage = sequelize.define('TokenUsage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    service_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '서비스 유형 (saju, diagnosis 등)'
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '사용된 토큰 수'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: '비용'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'token_usage',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['service_type']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  TokenUsage.associate = (models) => {
    TokenUsage.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return TokenUsage;
};
