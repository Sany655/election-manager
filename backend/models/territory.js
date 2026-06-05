'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Territory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Territory.belongsTo(models.Area, {
        foreignKey: 'area_id',
        as: 'area',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Territory.init({
    name: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Territory',
    tableName: 'territories',
  });
  return Territory;
};