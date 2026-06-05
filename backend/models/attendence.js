'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendence extends Model {

    static associate(models) {

      Attendence.belongsTo(models.AttendencePolicy, {
        foreignKey: 'company_attendence_policy_id',
        as: 'attendence_policy'
      });

      Attendence.hasMany(models.AttendancePolicyHistory, {
        foreignKey: 'attendence_policy_id',
        as: 'attendence_policy_history',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Attendence.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

    }
  }
  Attendence.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    company_attendence_policy_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'AttendencePolicy',
        key: 'id',
      },
    },
    clock_in: {
      type: DataTypes.DATE
    },
    clock_out: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isManual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAbsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    overtime_in_min: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    attendance_taken_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Attendence',
    tableName: 'attendances',
  });
  return Attendence;
};