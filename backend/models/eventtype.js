'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventType extends Model {
    static associate(models) {
      // define associations here if needed
    }
  }
  EventType.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EventType',
    tableName:'event_types'
  });
  return EventType;
};