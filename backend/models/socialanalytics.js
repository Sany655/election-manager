'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SocialAnalytics extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    SocialAnalytics.init({
        post_url: DataTypes.STRING,
        likes: DataTypes.INTEGER,
        comments_count: DataTypes.INTEGER,
        shares: DataTypes.INTEGER,
        comments: DataTypes.JSON,
        content: DataTypes.TEXT,
        post_time: DataTypes.STRING,
        raw_data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'SocialAnalytics',
        tableName: 'socialanalytics',
    });
    return SocialAnalytics;
};
