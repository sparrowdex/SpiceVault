const db = require('../models');
const { Recipe } = db;

async function addFoodCategory() {
  try {
    console.log('Connected to database via Sequelize');

    // Check if food_category column already exists by trying to query it
    try {
      await Recipe.findOne({
        attributes: ['food_category'],
        limit: 1
      });
      console.log('✅ food_category column already exists');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('food_category')) {
        console.log('❌ food_category column does not exist. Adding it...');
        
        // Add the column using raw SQL
        await db.sequelize.query(`
          ALTER TABLE recipe 
          ADD COLUMN food_category VARCHAR(50) DEFAULT 'main_course' 
          AFTER difficulty
        `);
        console.log('✅ Added food_category column to recipe table');
      } else {
        throw error;
      }
    }

    // Update existing recipes with appropriate categories based on their titles
    const categoryUpdates = [
      { pattern: '%cake%', category: 'dessert' },
      { pattern: '%brownie%', category: 'dessert' },
      { pattern: '%pancake%', category: 'breakfast' },
      { pattern: '%toast%', category: 'breakfast' },
      { pattern: '%salad%', category: 'appetizer' },
      { pattern: '%sushi%', category: 'main_course' },
      { pattern: '%pasta%', category: 'main_course' },
      { pattern: '%risotto%', category: 'main_course' },
      { pattern: '%carbonara%', category: 'main_course' },
      { pattern: '%tacos%', category: 'main_course' },
      { pattern: '%ribs%', category: 'main_course' },
      { pattern: '%tandoori%', category: 'main_course' },
      { pattern: '%stroganoff%', category: 'main_course' },
      { pattern: '%stir%', category: 'main_course' },
      { pattern: '%buddha%', category: 'main_course' },
      { pattern: '%bhat%', category: 'main_course' }
    ];

    for (const update of categoryUpdates) {
      const [affectedCount] = await Recipe.update(
        { food_category: update.category },
        { 
          where: {
            title: {
              [db.Sequelize.Op.like]: update.pattern
            }
          }
        }
      );
      console.log(`Updated ${affectedCount} recipes with pattern "${update.pattern}" to category "${update.category}"`);
    }

    // Show final results
    const categories = await Recipe.findAll({
      attributes: [
        'food_category',
        [db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'count']
      ],
      group: ['food_category'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'DESC']],
      raw: true
    });

    console.log('\n📊 Final food category distribution:');
    categories.forEach(cat => {
      console.log(`  ${cat.food_category}: ${cat.count} recipes`);
    });

    console.log('\n✅ Food category field added successfully!');

  } catch (error) {
    console.error('❌ Error adding food category:', error);
  } finally {
    await db.sequelize.close();
  }
}

addFoodCategory();
