'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventTargetGroup extends Model {
    static associate(models) {
      // define associations here if needed
    }
  }
  EventTargetGroup.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EventTargetGroup',
    tableName:'event_target_groups'
  });
  return EventTargetGroup;
};
