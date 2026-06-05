'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Milestone extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Milestone.belongsTo(models.Campaign, { foreignKey: 'campaign_id', as: 'campaign' });
            Milestone.belongsTo(models.EventType, { foreignKey: 'event_type_id', as: 'eventType' });
        }
    }
    Milestone.init({
        campaign_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Campaigns',
                key: 'id'
            }
        },
        event_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'event_types',
                key: 'id'
            }
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Milestone',
        tableName: 'milestones',
    });
    return Milestone;
};
