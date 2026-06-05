'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Organizer extends Model {
    static associate(models) {

      // Organizer → Events (One-to-Many)
      Organizer.hasMany(models.Event, {
        foreignKey: 'organized_by',
        as: 'events',
      });
    }
  }

  Organizer.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'e.g. Office, Branch, Partner, NGO',
      },

      contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.TINYINT,
        defaultValue: 1, // 1 = active, 0 = inactive
      },
    },
    {
      sequelize,
      modelName: 'Organizer',
      tableName: 'organizers',
      timestamps: true,
      underscored: true, // created_at, updated_at
    }
  );

  return Organizer;
};