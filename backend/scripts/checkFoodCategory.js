const db = require('../models');
const { Recipe } = db;

async function checkFoodCategory() {
  try {
    console.log('Checking if food_category column exists...');

    // Try to query the food_category column
    const sampleRecipe = await Recipe.findOne({
      attributes: ['recipe_id', 'title', 'food_category'],
      limit: 1
    });

    if (sampleRecipe) {
      console.log('✅ food_category column exists!');
      console.log('Sample recipe:', {
        id: sampleRecipe.recipe_id,
        title: sampleRecipe.title,
        food_category: sampleRecipe.food_category
      });

      // Show category distribution
      const categories = await Recipe.findAll({
        attributes: [
          'food_category',
          [db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'count']
        ],
        group: ['food_category'],
        order: [[db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'DESC']],
        raw: true
      });

      console.log('\n📊 Current food category distribution:');
      categories.forEach(cat => {
        console.log(`  ${cat.food_category}: ${cat.count} recipes`);
      });

    } else {
      console.log('❌ No recipes found or food_category column missing');
    }

  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('food_category')) {
      console.log('❌ food_category column does not exist');
      console.log('Run: npm run add:food-category');
    } else {
      console.error('❌ Error checking food category:', error.message);
    }
  } finally {
    await db.sequelize.close();
  }
}

checkFoodCategory();
