// models/recipe.js

module.exports = (sequelize, DataTypes) => {
    const Recipe = sequelize.define('Recipe', {
      recipe_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      chef_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      difficulty: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      food_category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'main_course'
      },
      diet_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'vegetarian'
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      preparation_time: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      cooking_time: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      nutrition_info: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'recipe',
      timestamps: false
    });
  
    return Recipe;
  };
  