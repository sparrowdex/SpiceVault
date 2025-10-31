const { sequelize } = require('./models');

async function testQuery() {
  try {
    const query = `SELECT rg.review_id, rg.review_text, CONCAT(u.f_name, ' ', u.l_name) as reviewer_name FROM reviews_given rg JOIN recipe r ON rg.recipe_id = r.recipe_id JOIN User u ON rg.user_id = u.user_id WHERE r.chef_id = 26 LIMIT 5`;
    console.log('Query:', query);

    const reviewDetails = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log('Review details for chef 26:', reviewDetails);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testQuery();
