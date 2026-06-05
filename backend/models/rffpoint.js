'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RffPoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RffPoint.belongsTo(models.Territory, {
        foreignKey: 'territory_id',
        as: 'territory'
      });
    }
  }
  RffPoint.init({
    name: DataTypes.STRING,
    start_date: DataTypes.DATE,
    rff_sub_code: {
      type: DataTypes.STRING,
    },
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'RffPoint',
    tableName: 'rff_points',
  });
  return RffPoint;
};