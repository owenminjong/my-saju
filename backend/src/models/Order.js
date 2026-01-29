const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    order_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '주문 번호'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '주문 금액'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
      comment: '주문 상태'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '결제 수단'
    },
    payment_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '결제 완료 시간'
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
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['order_number']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Order.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return Order;
};
