'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class IncidentReport extends Model {
        static associate(models) {
            IncidentReport.belongsTo(models.User, { foreignKey: 'agent_id', as: 'reporter' });
            IncidentReport.belongsTo(models.VoteCentre, { foreignKey: 'booth_id', as: 'booth' });
        }
    }
    IncidentReport.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        agent_id: DataTypes.INTEGER,
        booth_id: DataTypes.INTEGER,
        type: DataTypes.ENUM('VIOLENCE', 'LOGISTICS_FAIL', 'RIGGING_ATTEMPT', 'OTHER'),
        severity: DataTypes.INTEGER,
        description: DataTypes.TEXT,
        media_urls: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        status: {
            type: DataTypes.ENUM('NEW', 'INVESTIGATING', 'RESOLVED'),
            defaultValue: 'NEW'
        },
        resolution_log: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'IncidentReport',
        tableName: 'incident_reports',
        underscored: true,
    });
    return IncidentReport;
};
