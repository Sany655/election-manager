'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.belongsTo(models.Team, {
        foreignKey: 'team_id',
        as: 'team'
      });
    }
  }
  Location.init({
    location_name: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    team_id: DataTypes.INTEGER,
    address: DataTypes.STRING,
    metadata: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Location',
    tableName: 'locations',
  });
  return Location;
};