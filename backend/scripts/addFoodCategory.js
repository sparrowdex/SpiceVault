const mysql = require('mysql2/promise');
require('dotenv').config();

async function addFoodCategory() {
  let connection;
  
  try {
    // Create connection using environment variables or defaults
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'spicevault'
    });

    console.log('Connected to database');

    // Add food_category column to recipe table
    await connection.execute(`
      ALTER TABLE recipe 
      ADD COLUMN food_category VARCHAR(50) DEFAULT 'main_course' 
      AFTER difficulty
    `);

    console.log('✅ Added food_category column to recipe table');

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
      const [result] = await connection.execute(
        `UPDATE recipe SET food_category = ? WHERE title LIKE ?`,
        [update.category, update.pattern]
      );
      console.log(`Updated ${result.affectedRows} recipes with pattern "${update.pattern}" to category "${update.category}"`);
    }

    // Show final results
    const [categories] = await connection.execute(`
      SELECT food_category, COUNT(*) as count 
      FROM recipe 
      GROUP BY food_category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Final food category distribution:');
    categories.forEach(cat => {
      console.log(`  ${cat.food_category}: ${cat.count} recipes`);
    });

    console.log('\n✅ Food category field added successfully!');

  } catch (error) {
    console.error('❌ Error adding food category:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addFoodCategory();
