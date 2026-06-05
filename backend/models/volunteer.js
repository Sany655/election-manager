'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Volunteer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Volunteer.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Volunteer.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    volunteer_team_id: {
      type: DataTypes.INTEGER
    },
    location: {
      type: DataTypes.STRING
    },
    expertise_in: {
      type: DataTypes.STRING
    },
    skills: {
      type: DataTypes.TEXT
    },
    experience_year: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Volunteer',
  });
  return Volunteer;
};