require('dotenv').config({ path: './backend/.env' });
const db = require('../models');
const { UserInteraction } = db;
const { Sequelize } = require('sequelize');

async function removeDuplicateLikes() {
  try {
    console.log('Starting removal of duplicate liked recipes...');

    // Find all duplicate likes
    const duplicateLikes = await UserInteraction.findAll({
      attributes: [
        'user_id',
        'recipe_id',
        [Sequelize.fn('COUNT', Sequelize.col('interaction_id')), 'count']
      ],
      where: {
        interaction_type: 'like'
      },
      group: ['user_id', 'recipe_id'],
      having: Sequelize.literal('count > 1')
    });

    if (duplicateLikes.length === 0) {
      console.log('No duplicate liked recipes found.');
      return;
    }

    console.log(`Found ${duplicateLikes.length} sets of duplicate liked recipes.`);

    for (const duplicate of duplicateLikes) {
      const { user_id, recipe_id } = duplicate;

      // Find all instances of this duplicate like, ordered by creation date
      const allInstances = await UserInteraction.findAll({
        where: {
          user_id,
          recipe_id,
          interaction_type: 'like'
        },
        order: [['timestamp', 'ASC']] // Keep the oldest one
      });

      // Keep the first instance and delete the rest
      const instancesToDelete = allInstances.slice(1);

      if (instancesToDelete.length > 0) {
        const idsToDelete = instancesToDelete.map(instance => instance.interaction_id);
        await UserInteraction.destroy({
          where: {
            interaction_id: idsToDelete
          }
        });
        console.log(`Removed ${idsToDelete.length} duplicate likes for user ${user_id}, recipe ${recipe_id}.`);
      }
    }

    console.log('Finished removing duplicate liked recipes.');
  } catch (error) {
    console.error('Error removing duplicate liked recipes:', error);
  } finally {
    await db.sequelize.close();
  }
}

removeDuplicateLikes();
