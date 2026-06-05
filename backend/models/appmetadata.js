'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AppMetadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AppMetadata.init({
    version: DataTypes.STRING,
    company_id:DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'AppMetadata',
    tableName:'app_metadata',
    freezeTableName: true    
  });
  return AppMetadata;
};