'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserHoliday extends Model {
    static associate(models) {
      UserHoliday.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
      UserHoliday.belongsTo(models.Holiday, {
        foreignKey: 'holiday_id'
      });
    }
  }
  
  UserHoliday.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    holiday_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'holidays',
        key: 'id'
      }
    },
    is_applicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'UserHoliday',
    tableName: 'user_holidays',
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'holiday_id']
      }
    ]
  });
  
  return UserHoliday;
};