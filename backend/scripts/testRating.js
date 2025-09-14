// scripts/testRating.js - Test rating functionality directly

require('dotenv').config();
const { Rating, User, Recipe } = require('../models');

async function testRating() {
  try {
    console.log('🧪 Testing rating functionality...\n');

    // Check if we have users and recipes
    const userCount = await User.count();
    const recipeCount = await Recipe.count();
    
    console.log(`👥 Users in database: ${userCount}`);
    console.log(`🍳 Recipes in database: ${recipeCount}`);

    if (userCount === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    if (recipeCount === 0) {
      console.log('❌ No recipes found. Please create recipes first.');
      return;
    }

    // Get first user and recipe
    const firstUser = await User.findOne();
    const firstRecipe = await Recipe.findOne();

    console.log(`\n👤 Testing with user: ${firstUser.f_name} (ID: ${firstUser.user_id})`);
    console.log(`🍳 Testing with recipe: ${firstRecipe.title} (ID: ${firstRecipe.recipe_id})`);

    // Test creating a rating
    try {
      const testRating = await Rating.create({
        user_id: firstUser.user_id,
        recipe_id: firstRecipe.recipe_id,
        rating: 5,
        review_text: 'Test rating from script',
        datestamp: new Date().toISOString().split('T')[0]
      });

      console.log('✅ Rating created successfully:', testRating.toJSON());

      // Test finding the rating
      const foundRating = await Rating.findOne({
        where: { user_id: firstUser.user_id, recipe_id: firstRecipe.recipe_id }
      });

      console.log('✅ Rating found successfully:', foundRating.toJSON());

      // Clean up test rating
      await testRating.destroy();
      console.log('✅ Test rating cleaned up');

    } catch (ratingError) {
      console.error('❌ Rating test failed:', ratingError.message);
      console.error('Error details:', ratingError);
    }

    console.log('\n🎉 Rating test completed!');
    
  } catch (error) {
    console.error('💥 Rating test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    process.exit(0);
  }
}

testRating();
