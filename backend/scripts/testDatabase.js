// scripts/testDatabase.js - Test database tables and connections

require('dotenv').config();
const { sequelize } = require('../models');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and tables...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Available tables:', tables);

    // Test Reviews_Given table
    try {
      const reviewCount = await sequelize.query('SELECT COUNT(*) as count FROM Reviews_Given', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log('✅ Reviews_Given table exists with', reviewCount[0].count, 'records');
    } catch (error) {
      console.log('❌ Reviews_Given table issue:', error.message);
    }

    // Test user_interactions table
    try {
      const interactionCount = await sequelize.query('SELECT COUNT(*) as count FROM user_interactions', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log('✅ user_interactions table exists with', interactionCount[0].count, 'records');
    } catch (error) {
      console.log('❌ user_interactions table issue:', error.message);
    }

    // Test Recipe table
    try {
      const recipeCount = await sequelize.query('SELECT COUNT(*) as count FROM Recipe', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log('✅ Recipe table exists with', recipeCount[0].count, 'records');
    } catch (error) {
      console.log('❌ Recipe table issue:', error.message);
    }

    // Test User table
    try {
      const userCount = await sequelize.query('SELECT COUNT(*) as count FROM user', {
        type: sequelize.QueryTypes.SELECT
      });
      console.log('✅ User table exists with', userCount[0].count, 'records');
    } catch (error) {
      console.log('❌ User table issue:', error.message);
    }

    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
