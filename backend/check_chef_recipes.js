const db = require('./models');

async function checkChefRecipes() {
  try {
    const recipes = await db.Recipe.findAll({
      where: {
        chef_id: { [db.Sequelize.Op.ne]: null }
      },
      limit: 5
    });
    console.log('Recipes with chef_id:', recipes.map(r => ({ id: r.recipe_id, title: r.title, chef_id: r.chef_id })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkChefRecipes();
