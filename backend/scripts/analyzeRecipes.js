const db = require('../models');
const { Recipe } = db;

async function analyzeRecipes() {
  try {
    console.log('🔍 Analyzing all recipes...\n');

    // Get all recipes
    const recipes = await Recipe.findAll({
      attributes: ['recipe_id', 'title', 'description', 'food_category', 'difficulty'],
      order: [['recipe_id', 'ASC']]
    });

    console.log(`📊 Found ${recipes.length} recipes:\n`);

    recipes.forEach(recipe => {
      console.log(`ID: ${recipe.recipe_id}`);
      console.log(`Title: ${recipe.title}`);
      console.log(`Current Category: ${recipe.food_category || 'Not set'}`);
      console.log(`Difficulty: ${recipe.difficulty || 'Not set'}`);
      console.log(`Description: ${recipe.description ? recipe.description.substring(0, 100) + '...' : 'No description'}`);
      console.log('---');
    });

    // Show current distribution
    const categories = await Recipe.findAll({
      attributes: [
        'food_category',
        [db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'count']
      ],
      group: ['food_category'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'DESC']],
      raw: true
    });

    console.log('\n📈 Current category distribution:');
    categories.forEach(cat => {
      console.log(`  ${cat.food_category || 'NULL'}: ${cat.count} recipes`);
    });

  } catch (error) {
    console.error('❌ Error analyzing recipes:', error);
  } finally {
    await db.sequelize.close();
  }
}

analyzeRecipes();
