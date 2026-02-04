// models/Order.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const Order = sequelize.define('Order', {  // ⭐ 모델명 'Order'로 변경
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded', 'partial_refunded'),
        allowNull: true,
        defaultValue: 'pending'
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
    imp_uid: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    payment_key: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    refunded_amount: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ✅ 관계 설정
Order.associate = function(models) {
    // Order는 한 명의 User에게 속함
    Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'User'  // ⭐ 대문자 유지
    });

    // Order는 한 개의 Product에 속함
    Order.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'Product'  // ⭐ 대문자 유지
    });

    // ⭐ DiagnosisResult와의 관계는 index.js에서 이미 설정되므로 주석 처리
    // Order.hasOne(models.DiagnosisResult, {
    //     foreignKey: 'order_id',
    //     as: 'diagnosisResult'
    // });
};

module.exports = Order;
