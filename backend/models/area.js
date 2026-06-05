'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Area.belongsTo(models.Location, {
        foreignKey: 'location_id',
        as: 'location',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Area.init({
    area_name: DataTypes.STRING,
    location_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Location',
        key: 'id',
      },
    }
  }, {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
  });
  return Area;
};