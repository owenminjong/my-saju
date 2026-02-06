// models/Prompt.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Prompt = sequelize.define('prompts', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {  // ⭐ 추가
        type: DataTypes.STRING(255),
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    step: {  // ⭐ 추가
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    estimated_tokens: {  // ⭐ 추가 (여기!)
        type: DataTypes.INTEGER(11),
        allowNull: true
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
    }
}, {
    tableName: 'prompts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Prompt;