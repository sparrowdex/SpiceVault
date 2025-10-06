'use strict';

require('dotenv').config();
console.log('Loaded env DB_USER:', process.env.DB_USER);
console.log('Loaded env DB_PASSWORD:', process.env.DB_PASSWORD ? 'present' : 'missing');
console.log('Loaded env DB_NAME:', process.env.DB_NAME);
console.log('Loaded env DB_HOST:', process.env.DB_HOST);
console.log('Loaded env DB_DIALECT:', process.env.DB_DIALECT);
const { Sequelize, DataTypes } = require('sequelize');

// Set up Sequelize connection using .env variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql'
  }
);

// Create db object to hold Sequelize and models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models here
db.User = require('./user')(sequelize, DataTypes);
db.Recipe = require('./recipe')(sequelize, DataTypes);
db.Rating = require('./rating')(sequelize, DataTypes);
db.UserInteraction = require('./userInteraction')(sequelize, DataTypes);
db.RecipeTag = require('./recipeTag')(sequelize, DataTypes);
// db.RecipeIngredients = require('./recipe_ingredients')(sequelize, DataTypes);
// Add others as you go

// Define associations
db.User.hasMany(db.Rating, { foreignKey: 'user_id', as: 'ratings' });
db.Rating.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Recipe.hasMany(db.Rating, { foreignKey: 'recipe_id', as: 'ratings' });
db.Rating.belongsTo(db.Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

db.User.hasMany(db.UserInteraction, { foreignKey: 'user_id', as: 'interactions' });
db.UserInteraction.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Recipe.hasMany(db.UserInteraction, { foreignKey: 'recipe_id', as: 'interactions' });
db.UserInteraction.belongsTo(db.Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

db.Recipe.hasMany(db.RecipeTag, { foreignKey: 'recipe_id', as: 'tags' });
db.RecipeTag.belongsTo(db.Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

db.Recipe.belongsTo(db.User, { foreignKey: 'chef_id', as: 'chef' });
db.User.hasMany(db.Recipe, { foreignKey: 'chef_id', as: 'chefRecipes' });

// Export db object
module.exports = db;


