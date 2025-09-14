const mysql = require('mysql2/promise');
require('dotenv').config();

async function testFoodCategory() {
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

    // Check if food_category column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'spicevault' 
      AND TABLE_NAME = 'recipe' 
      AND COLUMN_NAME = 'food_category'
    `);

    if (columns.length === 0) {
      console.log('❌ food_category column does not exist. Run addFoodCategory.js first.');
      return;
    }

    console.log('✅ food_category column exists');

    // Show current food category distribution
    const [categories] = await connection.execute(`
      SELECT food_category, COUNT(*) as count 
      FROM recipe 
      GROUP BY food_category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Current food category distribution:');
    categories.forEach(cat => {
      console.log(`  ${cat.food_category}: ${cat.count} recipes`);
    });

    // Show sample recipes with their categories
    const [samples] = await connection.execute(`
      SELECT title, difficulty, food_category 
      FROM recipe 
      ORDER BY RAND() 
      LIMIT 10
    `);

    console.log('\n🍽️ Sample recipes with categories:');
    samples.forEach(recipe => {
      console.log(`  "${recipe.title}" - ${recipe.difficulty} - ${recipe.food_category}`);
    });

    console.log('\n✅ Food category test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing food category:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testFoodCategory();
