// seeders/mlDataSeeder.js - Enhanced seeder for ML training data

const { User, Recipe, Rating, UserInteraction, RecipeTag } = require('../models');

// Enhanced sample data for ML training
const enhancedRecipes = [
  {
    recipe_id: 11,
    user_id: 1,
    chef_id: 2,
    title: 'Mediterranean Quinoa Bowl',
    description: 'Healthy quinoa bowl with Mediterranean flavors, olives, and feta cheese',
    instructions: '1. Cook quinoa. 2. Add Mediterranean vegetables. 3. Top with feta and olives.',
    difficulty: 'Easy',
    image_url: 'mediterranean_bowl.jpg',
    preparation_time: '15 min',
    cooking_time: '10 min',
    nutrition_info: 'calories: 420, protein: 18g, carbs: 45g, fat: 12g, fiber: 8g'
  },
  {
    recipe_id: 12,
    user_id: 2,
    chef_id: 4,
    title: 'Teriyaki Salmon',
    description: 'Glazed salmon with homemade teriyaki sauce and steamed vegetables',
    instructions: '1. Marinate salmon. 2. Cook with teriyaki glaze. 3. Serve with vegetables.',
    difficulty: 'Medium',
    image_url: 'teriyaki_salmon.jpg',
    preparation_time: '20 min',
    cooking_time: '15 min',
    nutrition_info: 'calories: 380, protein: 25g, carbs: 20g, fat: 15g, fiber: 3g'
  },
  {
    recipe_id: 13,
    user_id: 3,
    chef_id: 7,
    title: 'Creamy Mushroom Risotto',
    description: 'Rich and creamy risotto with wild mushrooms and parmesan cheese',
    instructions: '1. Sauté mushrooms. 2. Add rice gradually. 3. Finish with cheese.',
    difficulty: 'Hard',
    image_url: 'mushroom_risotto.jpg',
    preparation_time: '10 min',
    cooking_time: '30 min',
    nutrition_info: 'calories: 520, protein: 20g, carbs: 60g, fat: 25g, fiber: 4g'
  },
  {
    recipe_id: 14,
    user_id: 4,
    chef_id: 10,
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies with a soft center',
    instructions: '1. Mix ingredients. 2. Form cookies. 3. Bake until golden.',
    difficulty: 'Easy',
    image_url: 'chocolate_cookies.jpg',
    preparation_time: '15 min',
    cooking_time: '12 min',
    nutrition_info: 'calories: 180, protein: 2g, carbs: 25g, fat: 8g, fiber: 1g'
  },
  {
    recipe_id: 15,
    user_id: 5,
    chef_id: 2,
    title: 'Thai Green Curry',
    description: 'Authentic Thai green curry with coconut milk and fresh vegetables',
    instructions: '1. Make curry paste. 2. Cook with coconut milk. 3. Add vegetables.',
    difficulty: 'Medium',
    image_url: 'thai_green_curry.jpg',
    preparation_time: '25 min',
    cooking_time: '20 min',
    nutrition_info: 'calories: 350, protein: 12g, carbs: 30g, fat: 15g, fiber: 5g'
  }
];

// Enhanced ratings data for ML training
const enhancedRatings = [
  // User 1 ratings
  { review_id: 9, recipe_id: 1, user_id: 1, rating: 5, review_text: 'Perfect carbonara!', datestamp: '2025-03-15' },
  { review_id: 10, recipe_id: 3, user_id: 1, rating: 4, review_text: 'Great vegan option', datestamp: '2025-03-16' },
  { review_id: 11, recipe_id: 11, user_id: 1, rating: 5, review_text: 'Love Mediterranean flavors', datestamp: '2025-03-17' },
  { review_id: 12, recipe_id: 12, user_id: 1, rating: 4, review_text: 'Good salmon recipe', datestamp: '2025-03-18' },
  
  // User 2 ratings
  { review_id: 13, recipe_id: 2, user_id: 2, rating: 5, review_text: 'Healthy and delicious', datestamp: '2025-03-15' },
  { review_id: 14, recipe_id: 4, user_id: 2, rating: 3, review_text: 'Too complex for me', datestamp: '2025-03-16' },
  { review_id: 15, recipe_id: 6, user_id: 2, rating: 4, review_text: 'Great breakfast option', datestamp: '2025-03-17' },
  { review_id: 16, recipe_id: 15, user_id: 2, rating: 5, review_text: 'Amazing Thai flavors', datestamp: '2025-03-18' },
  
  // User 3 ratings
  { review_id: 17, recipe_id: 3, user_id: 3, rating: 5, review_text: 'Best vegan dish ever!', datestamp: '2025-03-15' },
  { review_id: 18, recipe_id: 7, user_id: 3, rating: 4, review_text: 'Spicy but good', datestamp: '2025-03-16' },
  { review_id: 19, recipe_id: 11, user_id: 3, rating: 4, review_text: 'Nice Mediterranean taste', datestamp: '2025-03-17' },
  { review_id: 20, recipe_id: 13, user_id: 3, rating: 5, review_text: 'Creamy and delicious', datestamp: '2025-03-18' },
  
  // User 4 ratings
  { review_id: 21, recipe_id: 4, user_id: 4, rating: 5, review_text: 'Perfect sushi technique', datestamp: '2025-03-15' },
  { review_id: 22, recipe_id: 9, user_id: 4, rating: 4, review_text: 'Good pasta dish', datestamp: '2025-03-16' },
  { review_id: 23, recipe_id: 12, user_id: 4, rating: 5, review_text: 'Excellent salmon', datestamp: '2025-03-17' },
  { review_id: 24, recipe_id: 14, user_id: 4, rating: 4, review_text: 'Classic cookies', datestamp: '2025-03-18' },
  
  // User 5 ratings
  { review_id: 25, recipe_id: 5, user_id: 5, rating: 5, review_text: 'Best BBQ ever!', datestamp: '2025-03-15' },
  { review_id: 26, recipe_id: 7, user_id: 5, rating: 4, review_text: 'Good tandoori', datestamp: '2025-03-16' },
  { review_id: 27, recipe_id: 15, user_id: 5, rating: 5, review_text: 'Authentic Thai taste', datestamp: '2025-03-17' },
  { review_id: 28, recipe_id: 13, user_id: 5, rating: 3, review_text: 'Too rich for me', datestamp: '2025-03-18' },
  
  // User 6 ratings
  { review_id: 29, recipe_id: 6, user_id: 6, rating: 5, review_text: 'Perfect pancakes', datestamp: '2025-03-15' },
  { review_id: 30, recipe_id: 10, user_id: 6, rating: 4, review_text: 'Great dessert', datestamp: '2025-03-16' },
  { review_id: 31, recipe_id: 14, user_id: 6, rating: 5, review_text: 'Love these cookies', datestamp: '2025-03-17' },
  { review_id: 32, recipe_id: 8, user_id: 6, rating: 3, review_text: 'Simple but good', datestamp: '2025-03-18' },
  
  // User 7 ratings
  { review_id: 33, recipe_id: 9, user_id: 7, rating: 5, review_text: 'Amazing seafood pasta', datestamp: '2025-03-15' },
  { review_id: 34, recipe_id: 12, user_id: 7, rating: 5, review_text: 'Perfect salmon', datestamp: '2025-03-16' },
  { review_id: 35, recipe_id: 4, user_id: 7, rating: 4, review_text: 'Good sushi', datestamp: '2025-03-17' },
  { review_id: 36, recipe_id: 1, user_id: 7, rating: 4, review_text: 'Classic carbonara', datestamp: '2025-03-18' },
  
  // User 8 ratings
  { review_id: 37, recipe_id: 8, user_id: 8, rating: 4, review_text: 'Healthy breakfast', datestamp: '2025-03-15' },
  { review_id: 38, recipe_id: 10, user_id: 8, rating: 5, review_text: 'Decadent dessert', datestamp: '2025-03-16' },
  { review_id: 39, recipe_id: 14, user_id: 8, rating: 4, review_text: 'Good cookies', datestamp: '2025-03-17' },
  { review_id: 40, recipe_id: 6, user_id: 8, rating: 3, review_text: 'Too sweet for me', datestamp: '2025-03-18' },
  
  // User 9 ratings
  { review_id: 41, recipe_id: 1, user_id: 9, rating: 4, review_text: 'Good pasta', datestamp: '2025-03-15' },
  { review_id: 42, recipe_id: 3, user_id: 9, rating: 5, review_text: 'Excellent vegan dish', datestamp: '2025-03-16' },
  { review_id: 43, recipe_id: 11, user_id: 9, rating: 4, review_text: 'Nice Mediterranean bowl', datestamp: '2025-03-17' },
  { review_id: 44, recipe_id: 15, user_id: 9, rating: 5, review_text: 'Amazing curry', datestamp: '2025-03-18' },
  
  // User 10 ratings
  { review_id: 45, recipe_id: 10, user_id: 10, rating: 5, review_text: 'Perfect lava cake', datestamp: '2025-03-15' },
  { review_id: 46, recipe_id: 7, user_id: 10, rating: 4, review_text: 'Good tandoori', datestamp: '2025-03-16' },
  { review_id: 47, recipe_id: 13, user_id: 10, rating: 5, review_text: 'Creamy risotto', datestamp: '2025-03-17' },
  { review_id: 48, recipe_id: 14, user_id: 10, rating: 4, review_text: 'Classic cookies', datestamp: '2025-03-18' }
];

// User interaction data for ML training
const userInteractions = [
  // User 1 interactions
  { interaction_id: 1, user_id: 1, recipe_id: 1, interaction_type: 'view', duration: 120 },
  { interaction_id: 2, user_id: 1, recipe_id: 1, interaction_type: 'like', duration: null },
  { interaction_id: 3, user_id: 1, recipe_id: 3, interaction_type: 'view', duration: 90 },
  { interaction_id: 4, user_id: 1, recipe_id: 3, interaction_type: 'save', duration: null },
  { interaction_id: 5, user_id: 1, recipe_id: 11, interaction_type: 'view', duration: 150 },
  { interaction_id: 6, user_id: 1, recipe_id: 11, interaction_type: 'cook', duration: null },
  
  // User 2 interactions
  { interaction_id: 7, user_id: 2, recipe_id: 2, interaction_type: 'view', duration: 100 },
  { interaction_id: 8, user_id: 2, recipe_id: 2, interaction_type: 'like', duration: null },
  { interaction_id: 9, user_id: 2, recipe_id: 6, interaction_type: 'view', duration: 80 },
  { interaction_id: 10, user_id: 2, recipe_id: 6, interaction_type: 'save', duration: null },
  { interaction_id: 11, user_id: 2, recipe_id: 15, interaction_type: 'view', duration: 200 },
  { interaction_id: 12, user_id: 2, recipe_id: 15, interaction_type: 'cook', duration: null },
  
  // User 3 interactions
  { interaction_id: 13, user_id: 3, recipe_id: 3, interaction_type: 'view', duration: 110 },
  { interaction_id: 14, user_id: 3, recipe_id: 3, interaction_type: 'like', duration: null },
  { interaction_id: 15, user_id: 3, recipe_id: 7, interaction_type: 'view', duration: 95 },
  { interaction_id: 16, user_id: 3, recipe_id: 7, interaction_type: 'save', duration: null },
  { interaction_id: 17, user_id: 3, recipe_id: 13, interaction_type: 'view', duration: 180 },
  { interaction_id: 18, user_id: 3, recipe_id: 13, interaction_type: 'cook', duration: null },
  
  // User 4 interactions
  { interaction_id: 19, user_id: 4, recipe_id: 4, interaction_type: 'view', duration: 300 },
  { interaction_id: 20, user_id: 4, recipe_id: 4, interaction_type: 'like', duration: null },
  { interaction_id: 21, user_id: 4, recipe_id: 12, interaction_type: 'view', duration: 140 },
  { interaction_id: 22, user_id: 4, recipe_id: 12, interaction_type: 'save', duration: null },
  { interaction_id: 23, user_id: 4, recipe_id: 14, interaction_type: 'view', duration: 60 },
  { interaction_id: 24, user_id: 4, recipe_id: 14, interaction_type: 'cook', duration: null },
  
  // User 5 interactions
  { interaction_id: 25, user_id: 5, recipe_id: 5, interaction_type: 'view', duration: 250 },
  { interaction_id: 26, user_id: 5, recipe_id: 5, interaction_type: 'like', duration: null },
  { interaction_id: 27, user_id: 5, recipe_id: 15, interaction_type: 'view', duration: 160 },
  { interaction_id: 28, user_id: 5, recipe_id: 15, interaction_type: 'save', duration: null },
  { interaction_id: 29, user_id: 5, recipe_id: 7, interaction_type: 'view', duration: 120 },
  { interaction_id: 30, user_id: 5, recipe_id: 7, interaction_type: 'cook', duration: null }
];

// Enhanced recipe tags/occasions
const enhancedRecipeOccasions = [
  // Existing occasions
  { recipe_id: 1, occasion: 'Family dinner' },
  { recipe_id: 1, occasion: 'Italian night' },
  { recipe_id: 2, occasion: 'Healthy eating' },
  { recipe_id: 2, occasion: 'Summer lunch' },
  { recipe_id: 3, occasion: 'Vegan meal' },
  { recipe_id: 3, occasion: 'Post-workout' },
  { recipe_id: 4, occasion: 'Dinner party' },
  { recipe_id: 4, occasion: 'Japanese Cuisine' },
  { recipe_id: 5, occasion: 'Backyard BBQ' },
  { recipe_id: 5, occasion: 'Game night' },
  
  // New occasions for enhanced recipes
  { recipe_id: 11, occasion: 'Healthy lunch' },
  { recipe_id: 11, occasion: 'Mediterranean night' },
  { recipe_id: 12, occasion: 'Date night' },
  { recipe_id: 12, occasion: 'Asian cuisine' },
  { recipe_id: 13, occasion: 'Comfort food' },
  { recipe_id: 13, occasion: 'Italian night' },
  { recipe_id: 14, occasion: 'Dessert time' },
  { recipe_id: 14, occasion: 'Baking day' },
  { recipe_id: 15, occasion: 'Spicy food night' },
  { recipe_id: 15, occasion: 'Asian cuisine' }
];

// Enhanced recipe allergies
const enhancedRecipeAllergies = [
  // Existing allergies
  { recipe_id: 1, allergy: 'Dairy' },
  { recipe_id: 1, allergy: 'Eggs' },
  { recipe_id: 1, allergy: 'Gluten' },
  { recipe_id: 2, allergy: 'None' },
  { recipe_id: 3, allergy: 'Nuts' },
  { recipe_id: 3, allergy: 'Soy' },
  { recipe_id: 4, allergy: 'Shellfish' },
  { recipe_id: 4, allergy: 'Soy' },
  { recipe_id: 5, allergy: 'None' },
  
  // New allergies for enhanced recipes
  { recipe_id: 11, allergy: 'Dairy' },
  { recipe_id: 12, allergy: 'Fish' },
  { recipe_id: 12, allergy: 'Soy' },
  { recipe_id: 13, allergy: 'Dairy' },
  { recipe_id: 13, allergy: 'Gluten' },
  { recipe_id: 14, allergy: 'Dairy' },
  { recipe_id: 14, allergy: 'Eggs' },
  { recipe_id: 14, allergy: 'Gluten' },
  { recipe_id: 15, allergy: 'Fish' },
  { recipe_id: 15, allergy: 'Soy' }
];

async function seedMLData() {
  try {
    console.log('🌱 Starting ML data seeding...');

    // Add enhanced recipes (skip if already exists)
    console.log('📝 Adding enhanced recipes...');
    for (const recipe of enhancedRecipes) {
      const existingRecipe = await Recipe.findByPk(recipe.recipe_id);
      if (!existingRecipe) {
        await Recipe.create(recipe);
      } else {
        console.log(`Recipe ${recipe.recipe_id} already exists, skipping...`);
      }
    }

    // Add enhanced ratings
    console.log('⭐ Adding enhanced ratings...');
    for (const rating of enhancedRatings) {
      const existingRating = await Rating.findByPk(rating.review_id);
      if (!existingRating) {
        await Rating.create(rating);
      } else {
        console.log(`Rating ${rating.review_id} already exists, skipping...`);
      }
    }

    // Add user interactions (skip if already exists)
    console.log('👆 Adding user interactions...');
    for (const interaction of userInteractions) {
      const existingInteraction = await UserInteraction.findByPk(interaction.interaction_id);
      if (!existingInteraction) {
        await UserInteraction.create(interaction);
      } else {
        console.log(`UserInteraction ${interaction.interaction_id} already exists, skipping...`);
      }
    }

    // Add enhanced recipe occasions
    console.log('🏷️ Adding enhanced recipe occasions...');
    try {
      for (const occasion of enhancedRecipeOccasions) {
        await RecipeTag.create({
          recipe_id: occasion.recipe_id,
          tag_name: occasion.occasion,
          tag_category: 'occasion'
        });
      }
    } catch (error) {
      console.log('⚠️ Skipping recipe occasions due to table schema issue:', error.message);
    }

    console.log('✅ ML data seeding completed successfully!');
    console.log(`📊 Seeded ${enhancedRecipes.length} recipes, ${enhancedRatings.length} ratings, ${userInteractions.length} interactions`);
    
  } catch (error) {
    console.error('❌ Error seeding ML data:', error);
    throw error;
  }
}

module.exports = { seedMLData };
