'use strict';

require('dotenv').config();
console.log('Loaded env:', process.env.DB_DIALECT);
const { Sequelize, DataTypes } = require('sequelize');

// Set up Sequelize connection using .env variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
);

// Create db object to hold Sequelize and models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models here
db.User = require('./user')(sequelize, DataTypes);
db.Recipe = require('./recipe')(sequelize, DataTypes);
// db.RecipeIngredients = require('./recipe_ingredients')(sequelize, DataTypes);
// Add others as you go

// Export db object
module.exports = db;


