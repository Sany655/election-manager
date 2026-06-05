'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    static associate(models) {
      Campaign.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      Campaign.hasMany(models.Milestone, {
        foreignKey: 'campaign_id',
        as: 'milestones',
      });
    }
  }

  Campaign.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Campaign',
      tableName: 'campaigns',
      timestamps: true,
    }
  );

  return Campaign;
};