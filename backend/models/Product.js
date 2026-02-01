const { DataTypes } = require('sequelize');
const { sequelize } = require('../models/sequelize');

const Product = sequelize.define('products', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: '정가'
    },
    discount_rate: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
        comment: '할인율(%)'
    },
    discount_price: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: '할인된 가격'
    },
    promotion_active: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
        comment: '프로모션 활성화'
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
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;