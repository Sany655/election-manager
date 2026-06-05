'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class EventVolunteerTeam extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    EventVolunteerTeam.init({
        event_id: DataTypes.INTEGER,
        volunteer_team_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'EventVolunteerTeam',
        tableName: 'event_volunteer_teams',
    });
    return EventVolunteerTeam;
};
