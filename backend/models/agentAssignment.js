'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AgentAssignment extends Model {
        static associate(models) {
            AgentAssignment.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });
            // Assuming VoteCentre model is named 'VoteCentre'
            AgentAssignment.belongsTo(models.VoteCentre, { foreignKey: 'booth_id', as: 'booth' });
        }
    }
    AgentAssignment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        agent_id: DataTypes.INTEGER,
        booth_id: DataTypes.INTEGER,
        booth_number: DataTypes.STRING,
        shift_date: DataTypes.DATEONLY,
        expected_start_time: DataTypes.DATE,
        actual_check_in: DataTypes.DATE,
        check_in_location: DataTypes.GEOMETRY('POINT'),
        status: {
            type: DataTypes.ENUM('ASSIGNED', 'ON_DUTY', 'ABSENT', 'COMPLETED', 'LATE'),
            defaultValue: 'ASSIGNED'
        }
    }, {
        sequelize,
        modelName: 'AgentAssignment',
        tableName: 'agent_assignments',
        underscored: true,
    });
    return AgentAssignment;
};
