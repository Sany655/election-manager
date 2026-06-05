'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VolunteerTeam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VolunteerTeam.hasMany(models.VolunteerTeamMember, {
        foreignKey: "volunteer_team_id",
        as: "members"
      });

      VolunteerTeam.belongsToMany(models.VolunteerTeam, {
        through: models.AttendancePolicyHistory,
        otherKey: 'attendence_policy_id',
        foreignKey: 'user_id',
        as: 'volunteer_teams'
      });

      VolunteerTeam.belongsToMany(models.Event, {
        through: models.EventVolunteerTeam,
        foreignKey: 'volunteer_team_id',
        otherKey: 'event_id',
        as: 'events'
      });

      VolunteerTeam.belongsTo(models.Division, { foreignKey: 'division_id', as: 'division' });
      VolunteerTeam.belongsTo(models.District, { foreignKey: 'district_id', as: 'district' });
      VolunteerTeam.belongsTo(models.Upazilla, { foreignKey: 'upazilla_id', as: 'upazilla' });
      VolunteerTeam.belongsTo(models.Union, { foreignKey: 'union_id', as: 'union' });
    }
  }
  VolunteerTeam.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    leader_id: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    division_id: DataTypes.INTEGER,
    district_id: DataTypes.INTEGER,
    upazilla_id: DataTypes.INTEGER,
    union_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'VolunteerTeam',
    tableName: 'volunteer_teams'
  });
  return VolunteerTeam;
};