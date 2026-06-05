'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here if needed
      Voter.belongsTo(models.Division, { foreignKey: 'division_id', as: 'division' });
      Voter.belongsTo(models.District, { foreignKey: 'district_id', as: 'district' });
      Voter.belongsTo(models.Upazilla, { foreignKey: 'upazilla_id', as: 'upazilla' });
      Voter.belongsTo(models.Union, { foreignKey: 'union_id', as: 'union' });
    }
  }
  
  Voter.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false
    },
    nid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Location information stored as JSON
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    upazilla_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    union_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: false
    },
    voter_center: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Voter',
    tableName: 'voters',
    timestamps: true,
    underscored: true
  });
  
  return Voter;
};
