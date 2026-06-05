'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Worker_Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Worker_Location.init({
    user_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    address: DataTypes.STRING,
    metadata: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Worker_Location',
    tableName: 'worker_locations',
  });
  return Worker_Location;
};