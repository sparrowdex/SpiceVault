const db = require('../models');
const User = db.User;
const Recipe = db.Recipe;

async function updateChefIds() {
  try {
    console.log('Starting to update chef_ids for existing recipes...');

    // Get all users who are chefs
    const chefs = await User.findAll({
      where: { user_type: 'chef' },
      attributes: ['user_id', 'f_name', 'l_name']
    });

    console.log(`Found ${chefs.length} chefs`);

    let updatedCount = 0;

    for (const chef of chefs) {
      // Update recipes where user_id matches the chef's user_id and chef_id is null
      const [updatedRows] = await Recipe.update(
        { chef_id: chef.user_id },
        {
          where: {
            user_id: chef.user_id,
            chef_id: null
          }
        }
      );

      if (updatedRows > 0) {
        console.log(`Updated ${updatedRows} recipes for chef ${chef.f_name} ${chef.l_name}`);
        updatedCount += updatedRows;
      }
    }

    console.log(`Total recipes updated: ${updatedCount}`);
    console.log('Chef ID update completed successfully');

  } catch (error) {
    console.error('Error updating chef IDs:', error);
  } finally {
    process.exit(0);
  }
}

updateChefIds();
