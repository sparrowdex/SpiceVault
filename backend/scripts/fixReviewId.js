// scripts/fixReviewId.js - Fix review_id auto-increment issue

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'spicevault',
  'root',
  'sd8823@SQL',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixReviewId() {
  try {
    console.log('🔧 Fixing review_id auto-increment...');
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_HOST:', process.env.DB_HOST);

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Alter the reviews_given table to add AUTO_INCREMENT to review_id
    await sequelize.query(`
      ALTER TABLE reviews_given
      MODIFY COLUMN review_id INT AUTO_INCREMENT;
    `);

    console.log('✅ Successfully added AUTO_INCREMENT to review_id column');

    // Close connection
    await sequelize.close();
    console.log('🎉 Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing review_id:', error);
    console.error('Error details:', error.message);
  }
}

// Run the fix
fixReviewId();
