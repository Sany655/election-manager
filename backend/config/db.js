const db = require('../models');

// The models/index.js already initializes the Sequelize instance and loads all models.
// We export the db object (which contains sequelize and all models) to maintain the existing import structure.
module.exports = db;
