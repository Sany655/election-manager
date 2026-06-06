'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttendancePolicyHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     AttendancePolicyHistory.belongsTo(models.Team, {
        foreignKey: 'attendence_policy_id',
        as: 'task',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      AttendancePolicyHistory.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      AttendancePolicyHistory.belongsTo(models.Task, {
        foreignKey: 'user_id',
        as: 'tasks',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  AttendancePolicyHistory.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    attendence_policy_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'attendance_policies',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    start_date: {
      allowNull: false,
      type: DataTypes.DATE
    },
    end_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'AttendancePolicyHistory',
    tableName: 'attendance_policy_histories',
  });
  return AttendancePolicyHistory;
};