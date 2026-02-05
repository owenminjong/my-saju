// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true
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
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: (user) => {
            if (!user.uuid) {
                user.uuid = uuidv4();
            }
        }
    }
});

User.associate = function(models) {
    User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders'
    });

    User.hasMany(models.TokenUsage, {
        foreignKey: 'user_id',
        as: 'tokenUsages'
    });

    // ⭐ DiagnosisResult와의 관계 추가
    User.hasMany(models.DiagnosisResult, {
        foreignKey: 'user_id',
        as: 'diagnosisResults'
    });
};

module.exports = User;
