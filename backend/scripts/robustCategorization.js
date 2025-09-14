const db = require('../models');
const { Recipe } = db;

async function robustCategorization() {
  try {
    console.log('🚀 Starting robust recipe categorization...\n');

    // Comprehensive categorization rules
    const categorizationRules = [
      // Breakfast & Morning
      { patterns: ['pancake', 'toast', 'waffle', 'cereal', 'oatmeal'], category: 'breakfast', diet: 'vegetarian' },
      
      // Desserts & Sweets
      { patterns: ['cake', 'brownie', 'blondie', 'cookie', 'pie', 'ice cream', 'pudding', 'lava'], category: 'dessert', diet: 'vegetarian' },
      
      // Appetizers & Starters
      { patterns: ['salad', 'bruschetta', 'dip', 'soup', 'appetizer'], category: 'appetizer', diet: 'vegetarian' },
      
      // Main Courses - Vegetarian
      { patterns: ['buddha bowl', 'stir-fry', 'risotto', 'pasta', 'quinoa', 'vegetable'], category: 'main_course', diet: 'vegetarian' },
      
      // Main Courses - Non-Vegetarian (Meat)
      { patterns: ['chicken', 'beef', 'pork', 'ribs', 'tandoori', 'bbq'], category: 'main_course', diet: 'non_vegetarian' },
      
      // Main Courses - Non-Vegetarian (Seafood)
      { patterns: ['fish', 'shrimp', 'sushi', 'salmon', 'tuna', 'crab', 'lobster'], category: 'main_course', diet: 'non_vegetarian' },
      
      // Italian Cuisine
      { patterns: ['carbonara', 'alfredo', 'pasta', 'risotto', 'pizza'], category: 'italian', diet: 'mixed' },
      
      // Asian Cuisine
      { patterns: ['sushi', 'stir-fry', 'tandoori', 'curry', 'noodles'], category: 'asian', diet: 'mixed' },
      
      // Mexican Cuisine
      { patterns: ['tacos', 'burrito', 'quesadilla', 'enchilada'], category: 'mexican', diet: 'mixed' },
      
      // Healthy & Light
      { patterns: ['salad', 'buddha bowl', 'quinoa', 'vegetable'], category: 'healthy', diet: 'vegetarian' },
      
      // Comfort Food
      { patterns: ['ribs', 'pasta', 'risotto', 'pancakes'], category: 'comfort_food', diet: 'mixed' }
    ];

    // Get all recipes
    const recipes = await Recipe.findAll({
      attributes: ['recipe_id', 'title', 'description', 'food_category', 'difficulty']
    });

    console.log(`📊 Processing ${recipes.length} recipes...\n`);

    let updatedCount = 0;

    for (const recipe of recipes) {
      const title = recipe.title.toLowerCase();
      const description = (recipe.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      let bestMatch = null;
      let maxMatches = 0;

      // Find the best matching category
      for (const rule of categorizationRules) {
        let matches = 0;
        for (const pattern of rule.patterns) {
          if (combinedText.includes(pattern.toLowerCase())) {
            matches++;
          }
        }
        
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = rule;
        }
      }

      // Determine diet type more precisely
      let dietType = 'vegetarian'; // default
      if (bestMatch) {
        dietType = bestMatch.diet;
      }

      // Override diet type based on specific ingredients
      const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'sushi', 'ribs', 'tandoori', 'bbq'];
      const hasMeat = meatKeywords.some(keyword => combinedText.includes(keyword));
      
      if (hasMeat) {
        dietType = 'non_vegetarian';
      }

      // Create comprehensive category
      let newCategory = 'main_course'; // default
      if (bestMatch) {
        newCategory = bestMatch.category;
      }

      // Special cases for better categorization
      if (title.includes('blondie')) {
        newCategory = 'dessert';
        dietType = 'vegetarian';
      } else if (title.includes('salad') && !title.includes('chicken')) {
        newCategory = 'appetizer';
        dietType = 'vegetarian';
      } else if (title.includes('salad') && title.includes('chicken')) {
        newCategory = 'main_course';
        dietType = 'non_vegetarian';
      }

      // Update the recipe
      await Recipe.update(
        { 
          food_category: newCategory,
          diet_type: dietType
        },
        { where: { recipe_id: recipe.recipe_id } }
      );

      console.log(`✅ ${recipe.title}: ${newCategory} (${dietType})`);
      updatedCount++;
    }

    // Show final distribution
    console.log('\n📈 Final category distribution:');
    const categories = await Recipe.findAll({
      attributes: [
        'food_category',
        [db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'count']
      ],
      group: ['food_category'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'DESC']],
      raw: true
    });

    categories.forEach(cat => {
      console.log(`  ${cat.food_category}: ${cat.count} recipes`);
    });

    // Show diet distribution
    console.log('\n🥗 Diet type distribution:');
    const diets = await Recipe.findAll({
      attributes: [
        'diet_type',
        [db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'count']
      ],
      group: ['diet_type'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('recipe_id')), 'DESC']],
      raw: true
    });

    diets.forEach(diet => {
      console.log(`  ${diet.diet_type}: ${diet.count} recipes`);
    });

    console.log(`\n✅ Successfully categorized ${updatedCount} recipes!`);

  } catch (error) {
    console.error('❌ Error in robust categorization:', error);
  } finally {
    await db.sequelize.close();
  }
}

robustCategorization();
