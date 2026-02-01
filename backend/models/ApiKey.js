const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const ApiKey = sequelize.define('api_keys', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    service_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    api_key: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'ai'
    },
    provider: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'api_keys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ApiKey;