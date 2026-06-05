'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Resource extends Model {
    /**
     * Define associations here (future use)
     */
    static associate(models) {
      // Example:
      // Resource.hasMany(models.EventResource, { foreignKey: 'resource_id' });
    }
  }

  Resource.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      category: {
        type: DataTypes.STRING,
        allowNull: true
      },

      unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'piece'
      },

      rate_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Resource',
      tableName: 'resources',

      // IMPORTANT: matches your migration
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Resource;
};