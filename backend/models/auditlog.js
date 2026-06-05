'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      // optional: link to User model later
      // AuditLog.belongsTo(models.User, { foreignKey: 'changed_by' });
    }
  }

  AuditLog.init(
    {
      entity_type: {
        type: DataTypes.STRING,
        allowNull: false
      },

      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      action: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: false
      },

      old_value: {
        type: DataTypes.JSON,
        allowNull: true
      },

      new_value: {
        type: DataTypes.JSON,
        allowNull: true
      },

      changed_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      timestamps: false,
      createdAt: 'created_at'
    }
  );

  return AuditLog;
};