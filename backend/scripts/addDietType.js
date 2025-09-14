const db = require('../models');
const { Recipe } = db;

async function addDietType() {
  try {
    console.log('🥗 Adding diet_type field to recipe table...\n');

    // Check if diet_type column already exists
    try {
      await Recipe.findOne({
        attributes: ['diet_type'],
        limit: 1
      });
      console.log('✅ diet_type column already exists');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('diet_type')) {
        console.log('❌ diet_type column does not exist. Adding it...');
        
        // Add the column using raw SQL
        await db.sequelize.query(`
          ALTER TABLE recipe 
          ADD COLUMN diet_type VARCHAR(20) DEFAULT 'vegetarian' 
          AFTER food_category
        `);
        console.log('✅ Added diet_type column to recipe table');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Diet type field setup completed!');

  } catch (error) {
    console.error('❌ Error adding diet type field:', error);
  } finally {
    await db.sequelize.close();
  }
}

addDietType();
