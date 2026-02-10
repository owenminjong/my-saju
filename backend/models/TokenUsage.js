const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const TokenUsage = sequelize.define('token_usage', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    order_id: {  // ⭐ 추가
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    tokens_used: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    api_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'token_usage',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
});

// ✅ 관계 설정
TokenUsage.associate = function(models) {
    // TokenUsage는 한 명의 User에게 속함
    TokenUsage.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // ⭐ TokenUsage는 한 개의 Order에 속함
    TokenUsage.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
    });
};

module.exports = TokenUsage;