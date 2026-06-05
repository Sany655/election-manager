'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class VoteCentre extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            VoteCentre.belongsTo(models.Union, { foreignKey: 'union_id', as: 'union' });
            VoteCentre.hasMany(models.AgentAssignment, { foreignKey: 'booth_id', as: 'assignments' });
        }
    }
    VoteCentre.init({
        union_id: DataTypes.INTEGER,
        latitude: DataTypes.FLOAT,
        longitude: DataTypes.FLOAT,
        risk_level: {
            type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
            defaultValue: 'LOW'
        },
        upozilla_name: DataTypes.STRING,
        type: DataTypes.STRING,
        serial: DataTypes.STRING,
        name: DataTypes.STRING,
        booth_count: DataTypes.STRING,
        voter_area: DataTypes.STRING,
        male_voters: DataTypes.STRING,
        female_voters: DataTypes.STRING,
        hijra_voters: DataTypes.STRING,
        total_voters: DataTypes.STRING,
        remarks: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'VoteCentre',
        tableName: 'vote_centres',
        underscored: true,
    });
    return VoteCentre;
};
