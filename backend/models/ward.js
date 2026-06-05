'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Ward extends Model {
        static associate(models) {
            Ward.belongsTo(models.Union, { foreignKey: 'union_id', as: 'union' });
        }
    }

    Ward.init({
        union_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        bn_name: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        pcode: {
            type: DataTypes.STRING(12),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Ward',
        tableName: 'wards',
        timestamps: false,
        underscored: true
    });

    return Ward;
};
