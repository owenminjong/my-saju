const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'local'
    },
    provider_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'active'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ✅ 관계 설정 추가
User.associate = function(models) {
    // User는 여러 개의 Order를 가질 수 있음
    User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders'
    });

    // User는 여러 개의 TokenUsage를 가질 수 있음
    User.hasMany(models.TokenUsage, {
        foreignKey: 'user_id',
        as: 'tokenUsages'
    });
};

module.exports = User;
