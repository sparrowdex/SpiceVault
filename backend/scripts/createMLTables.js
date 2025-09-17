// scripts/createMLTables.js - Create ML tables in database

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Set up Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

async function createMLTables() {
  try {
    console.log('🔧 Creating ML tables...');

    // Create user_interactions table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        interaction_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        interaction_type ENUM('view', 'like', 'save', 'share', 'cook') NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INT NULL,
        FOREIGN KEY (user_id) REFERENCES user(user_id),
        FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
        INDEX idx_user_interaction (user_id, interaction_type),
        INDEX idx_recipe_interaction (recipe_id, interaction_type)
      )
    `);

    console.log('✅ Created user_interactions table');

    // Create recipe_tags table (for enhanced ML features)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS recipe_tags (
        tag_id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        tag_name VARCHAR(255) NOT NULL,
        tag_category ENUM('cuisine', 'diet', 'ingredient', 'cooking_method', 'meal_type', 'occasion', 'allergy') NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id),
        INDEX idx_recipe_tags (recipe_id),
        INDEX idx_tag_name (tag_name),
        INDEX idx_tag_category (tag_category)
      )
    `);

    console.log('✅ Created recipe_tags table');

    console.log('🎉 All ML tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating ML tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

createMLTables();
