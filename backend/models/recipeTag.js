// models/recipeTag.js - Using your existing Recipe_Occasion and Recipe_Allergies tables

module.exports = (sequelize, DataTypes) => {
  const RecipeTag = sequelize.define('RecipeTag', {
    recipe_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Recipe',
        key: 'recipe_id'
      }
    },
    tag_name: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      field: 'occasion'
    },
    tag_category: {
      type: DataTypes.VIRTUAL,
      get() {
        return 'occasion';
      }
    }
  }, {
    tableName: 'recipe_occasion', // We'll use this as base, can extend for allergies
    timestamps: false
  });

  return RecipeTag;
};
