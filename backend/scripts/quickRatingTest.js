// scripts/quickRatingTest.js - Quick test for rating system

require('dotenv').config();
const { Rating, User, Recipe } = require('../models');

async function quickRatingTest() {
  try {
    console.log('🧪 Quick Rating Test...\n');

    // Test 1: Check if we can find users and recipes
    const user = await User.findOne();
    const recipe = await Recipe.findOne();

    if (!user) {
      console.log('❌ No users found');
      return;
    }

    if (!recipe) {
      console.log('❌ No recipes found');
      return;
    }

    console.log(`✅ Found user: ${user.f_name} (ID: ${user.user_id})`);
    console.log(`✅ Found recipe: ${recipe.title} (ID: ${recipe.recipe_id})`);

    // Test 2: Try to create a rating
    console.log('\n🔄 Testing rating creation...');
    
    const testRating = await Rating.create({
      user_id: user.user_id,
      recipe_id: recipe.recipe_id,
      rating: 5,
      review_text: 'Quick test rating',
      datestamp: new Date().toISOString().split('T')[0]
    });

    console.log('✅ Rating created successfully!');
    console.log('Rating ID:', testRating.review_id);

    // Test 3: Try to find the rating
    const foundRating = await Rating.findOne({
      where: { user_id: user.user_id, recipe_id: recipe.recipe_id }
    });

    if (foundRating) {
      console.log('✅ Rating found successfully!');
      console.log('Rating:', foundRating.rating, 'stars');
    }

    // Clean up
    await testRating.destroy();
    console.log('✅ Test rating cleaned up');

    console.log('\n🎉 Rating system is working correctly!');
    
  } catch (error) {
    console.error('❌ Rating test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

quickRatingTest();
