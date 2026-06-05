'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VolunteerTeamMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VolunteerTeamMember.belongsTo(models.User,{
        foreignKey:'user_id',
        as:'user'
      });
    }
  }
  VolunteerTeamMember.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    volunteer_team_id: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'VolunteerTeamMember',
    tableName: 'volunteer_team_members'
  });
  return VolunteerTeamMember;
};