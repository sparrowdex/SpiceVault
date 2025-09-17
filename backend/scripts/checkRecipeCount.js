
const db = require('../models');
const Recipe = db.Recipe;

async function checkRecipeCount() {
  try {
    const count = await Recipe.count();
    console.log(`Number of recipes in the database: ${count}`);
  } catch (error) {
    console.error('Error counting recipes:', error);
  } finally {
    await db.sequelize.close();
  }
}

checkRecipeCount();
