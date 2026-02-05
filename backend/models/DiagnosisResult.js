const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const DiagnosisResult = sequelize.define('diagnosis_results', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    input_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    birth_date: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    birth_time: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    mbti: {
        type: DataTypes.STRING(4),
        allowNull: true
    },
    saju_data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    free_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    premium_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    diagnosis_type: {
        type: DataTypes.ENUM('free', 'premium'),
        allowNull: true
    },
    order_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true
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
    tableName: 'diagnosis_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

DiagnosisResult.associate = function(models) {
    // DiagnosisResult는 한 명의 User에게 속함
    DiagnosisResult.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // DiagnosisResult는 한 개의 Order에 속함
    DiagnosisResult.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
    });
};

module.exports = DiagnosisResult;