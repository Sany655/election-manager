'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Holiday extends Model {
    static associate(models) {

      Holiday.belongsToMany(models.User, {
        through: models.UserHoliday,
        foreignKey: 'holiday_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }

  Holiday.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('government', 'religious', 'company', 'team_specific', 'location_specific', 'area_specific', 'territory_specific'),
      allowNull: false,
      defaultValue: 'company'
    },
    scope: {
      type: DataTypes.ENUM('global', 'team', 'location', 'area', 'territory', 'user_specific'),
      allowNull: false,
      defaultValue: 'global'
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id'
      }
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id'
      }
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'areas',
        key: 'id'
      }
    },
    territory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'territories',
        key: 'id'
      }
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Holiday',
    tableName: 'holidays',
    freezeTableName: true,
    timestamps: true
  });

  return Holiday;
};