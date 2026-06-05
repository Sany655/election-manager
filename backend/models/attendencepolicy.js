'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttendencePolicy extends Model {

    static associate(models) {
      AttendencePolicy.hasMany(models.AttendancePolicyHistory, {
        foreignKey: 'attendence_policy_id',
        as: 'attendence_policy',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });   
    }
  }
  AttendencePolicy.init({
    name: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    working_days: {
      type: DataTypes.JSON
    },
    off_days: {
      type: DataTypes.JSON
    },
    work_start_time: {
      allowNull: false,
      type: DataTypes.TIME
    },
    work_end_time: {
      allowNull: false,
      type: DataTypes.TIME
    },
    late_grace_period: {
      type: DataTypes.INTEGER
    },
    overtime_threshold: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'AttendencePolicy',
    tableName: 'attendance_policies',
  });
  return AttendencePolicy;
};