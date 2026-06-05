'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventResource extends Model {
    /**
     * Define associations
     * This method is called automatically by models/index.js
     */
    static associate(models) {
      // Each allocation belongs to one Event
      EventResource.belongsTo(models.Event, {
        foreignKey: 'event_id',
        as: 'event',
      });

      // Each allocation belongs to one Resource
      EventResource.belongsTo(models.Resource, {
        foreignKey: 'resource_id',
        as: 'resource',
      });
    }
  }

  EventResource.init(
    {
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      rate_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      total_cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'EventResource',
      tableName: 'event_resources',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return EventResource;
};