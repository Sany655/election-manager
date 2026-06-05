'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {

      // Event Type
      Event.belongsTo(models.EventType, {
        foreignKey: 'type_id',
        as: 'event_type',
      });

      // Target Group
      Event.belongsTo(models.EventTargetGroup, {
        foreignKey: 'target_group_id',
        as: 'target_group',
      });

      Event.belongsToMany(models.VolunteerTeam, {
        through: models.EventVolunteerTeam,
        foreignKey: 'event_id',
        otherKey: 'volunteer_team_id',
        as: 'volunteer_teams'
      });

      // Organizer
      Event.belongsTo(models.Organizer, {
        foreignKey: 'organized_by',
        as: 'organizer',
      });

      Event.hasMany(models.EventResource, {
        foreignKey: 'event_id',
        as: 'resources',
      });

      // Location Associations
      Event.belongsTo(models.Division, { foreignKey: 'division_id', as: 'division' });
      Event.belongsTo(models.District, { foreignKey: 'district_id', as: 'district' });
      Event.belongsTo(models.Upazilla, { foreignKey: 'upazilla_id', as: 'upazilla' });
      Event.belongsTo(models.Union, { foreignKey: 'union_id', as: 'union' });
    }
  }

  Event.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      objective: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },

      visibility: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },

      target_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      organized_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      est_budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      est_spending: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      volunteer_team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      division_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      district_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      upazilla_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ward: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      union_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      expected_start_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      expected_end_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      actual_start_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      actual_end_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
      timestamps: true,
    }
  );

  return Event;
};