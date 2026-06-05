'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CandidateProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CandidateProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      CandidateProfile.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  }
  CandidateProfile.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    company_id: {
      type: DataTypes.INTEGER
    },
    bio: {
      type: DataTypes.TEXT
    },
    menifesto: {
      type: DataTypes.TEXT
    },
    photo_url: {
      type: DataTypes.STRING
    },
    intro_video_url: {
      type: DataTypes.STRING
    },
    metatdata: {
      type: DataTypes.JSON
    },
  }, {
    sequelize,
    modelName: 'CandidateProfile',
    tableName: 'candidateprofiles'
  });
  return CandidateProfile;
};