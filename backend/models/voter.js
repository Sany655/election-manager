'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    static associate(models) {
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
    membership_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    },
    nid: {
      type: DataTypes.STRING,
      allowNull: true,
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
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passing_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paid_upto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    years_of_dues: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dues_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    upazilla_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    union_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true
    },
    voter_center: {
      type: DataTypes.STRING,
      allowNull: true
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
