// services/mlRecommendationService.js

const { Matrix } = require('ml-matrix');
const natural = require('natural');
const _ = require('lodash');

class MLRecommendationService {
  constructor() {
    this.userItemMatrix = null;
    this.userSimilarities = null;
    this.recipeSimilarities = null;
    this.lastUpdated = null;
    this.updateInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.users = null;
    this.recipes = null;
    // Nutritional scoring constants
    this.nutritionWeights = {
      calories: 0.3,
      protein: 0.25,
      carbs: 0.2,
      fat: 0.15,
      fiber: 0.1
    };
    this.healthScoreThresholds = {
      excellent: 85,
      good: 70,
      fair: 50,
      poor: 30
    };
  }

  // Collaborative Filtering using User-Based approach
  async generateUserBasedRecommendations(userId, limit = 10) {
    console.log(`Generating user-based recommendations for user ${userId}`);
    try {
      await this.updateMatrices();
      
      if (!this.userItemMatrix || !this.userSimilarities) {
        console.log('ML Service: User-item matrix or similarities not available, falling back.');
        return await this.getFallbackRecommendations(userId, limit);
      }

      const userIndex = await this.getUserIndex(userId);
      if (userIndex === -1) {
        console.log(`ML Service: User ${userId} not found in matrix, falling back.`);
        return await this.getFallbackRecommendations(userId, limit);
      }

      const userSimilarities = this.userSimilarities[userIndex];
      const userRatings = this.userItemMatrix[userIndex];

      // Find similar users (top 20 most similar)
      const similarUsers = userSimilarities
        .map((similarity, index) => ({ index, similarity }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(1, 21); // Exclude self (index 0)

      // Calculate predicted ratings for unrated items
      const predictions = [];
      for (let itemIndex = 0; itemIndex < userRatings.length; itemIndex++) {
        if (userRatings[itemIndex] === 0) { // Unrated item
          let weightedSum = 0;
          let similaritySum = 0;

          for (const { index: similarUserIndex, similarity } of similarUsers) {
            const similarUserRating = this.userItemMatrix[similarUserIndex][itemIndex];
            if (similarUserRating > 0) {
              weightedSum += similarUserRating * similarity;
              similaritySum += Math.abs(similarity);
            }
          }

          if (similaritySum > 0) {
            const predictedRating = weightedSum / similaritySum;
            predictions.push({
              itemIndex,
              predictedRating,
              confidence: similaritySum
            });
          }
        }
      }

      // Sort by predicted rating and return top recommendations
      const recommendations = predictions
        .sort((a, b) => b.predictedRating - a.predictedRating)
        .slice(0, limit);

      console.log(`Generated ${recommendations.length} user-based recommendations.`);
      if (recommendations.length === 0) {
        return await this.getFallbackRecommendations(userId, limit);
      }
      return await this.formatRecommendations(recommendations);
    } catch (error) {
      console.error('Error in user-based recommendations:', error);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }

  // Content-Based Filtering using recipe tags and descriptions
  async generateContentBasedRecommendations(userId, limit = 10) {
    console.log(`Generating content-based recommendations for user ${userId}`);
    try {
      const db = require('../models');
      const { Recipe, RecipeTag, UserInteraction } = db;

      // Get user's interaction history
      // Step 1: Get user's interaction history (likes, saves, etc.)
      const userInteractions = await UserInteraction.findAll({
        where: { user_id: userId },
        attributes: ['recipe_id', 'interaction_type'] // Only need these columns
      });

      if (userInteractions.length === 0) {
        console.log(`ML Service: No user interactions found for user ${userId}, falling back.`);
        return await this.getFallbackRecommendations(userId, limit);
      }

      // Step 2: Get the unique recipe IDs from the interactions
      const interactedRecipeIds = [...new Set(userInteractions.map(i => i.recipe_id))];

      // Step 3: Fetch those recipes and their associated tags in a separate query
      let interactedRecipes = [];
      try {
        interactedRecipes = await Recipe.findAll({
          where: {
            recipe_id: interactedRecipeIds
          },
          include: {
            model: RecipeTag,
            as: 'tags',
            required: false // Left join to avoid errors if no tags
          }
        });
      } catch (includeError) {
        console.warn('Error including RecipeTag, fetching without tags:', includeError.message);
        interactedRecipes = await Recipe.findAll({
          where: {
            recipe_id: interactedRecipeIds
          }
        });
      }

      // Step 4: Build user preference profile from the fetched recipes and their tags
      const userPreferences = this.buildUserPreferenceProfile(interactedRecipes);

      // Get all recipes with tags
      let allRecipes = [];
      try {
        allRecipes = await Recipe.findAll({
          include: [{
            model: RecipeTag,
            as: 'tags',
            required: false
          }]
        });
      } catch (includeError) {
        console.warn('Error including RecipeTag for all recipes, fetching without tags:', includeError.message);
        allRecipes = await Recipe.findAll();
      }

      // Calculate similarity scores
      // Exclude recipes the user has already interacted with from the recommendations
      const alreadyInteractedSet = new Set(interactedRecipeIds);
      const recommendations = allRecipes
        .filter(recipe => !alreadyInteractedSet.has(recipe.recipe_id))
        .map(recipe => ({
          recipe,
          score: this.calculateContentSimilarity(recipe, userPreferences)
        }))
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Generated ${recommendations.length} content-based recommendations.`);
      if (recommendations.length === 0) {
        return await this.getFallbackRecommendations(userId, limit);
      }
      return recommendations.map(rec => ({
        recipe_id: rec.recipe.recipe_id,
        title: rec.recipe.title,
        description: rec.recipe.description,
        image_url: rec.recipe.image_url,
        score: rec.score,
        reason: 'Based on your preferences'
      }));
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }

  // Hybrid approach combining collaborative and content-based filtering
  async generateHybridRecommendations(userId, limit = 10) {
    console.log(`Generating hybrid recommendations for user ${userId}`);
    try {
      // Generate recommendations sequentially to avoid overwhelming the database
      const userBased = await this.generateUserBasedRecommendations(userId, limit * 2);
      console.log(`User-based recommendations generated: ${userBased.length}`);

      const contentBased = await this.generateContentBasedRecommendations(userId, limit * 2);
      console.log(`Content-based recommendations generated: ${contentBased.length}`);

      // Combine and re-rank recommendations
      const combined = new Map();

      // Add user-based recommendations with weight 0.6
      userBased.forEach(rec => {
        combined.set(rec.recipe_id, {
          ...rec,
          score: (rec.score || 0) * 0.6,
          source: 'collaborative'
        });
      });

      // Add content-based recommendations with weight 0.4
      contentBased.forEach(rec => {
        const existing = combined.get(rec.recipe_id);
        if (existing) {
          existing.score += rec.score * 0.4;
          existing.source = 'hybrid';
        } else {
          combined.set(rec.recipe_id, {
            ...rec,
            score: rec.score * 0.4,
            source: 'content'
          });
        }
      });

      const hybridRecommendations = Array.from(combined.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Generated ${hybridRecommendations.length} hybrid recommendations.`);
      if (hybridRecommendations.length === 0) {
        return await this.getFallbackRecommendations(userId, limit);
      }
      return hybridRecommendations;
    } catch (error) {
      console.error('Error in hybrid recommendations:', error);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }

  // Update user-item matrix and similarity matrices
  async updateMatrices() {
    const now = Date.now();
    if (this.lastUpdated && (now - this.lastUpdated) < this.updateInterval) {
      return; // Skip update if recent enough
    }

    console.log('Updating ML matrices...');
    try {
      const db = require('../models');
      const { Rating, User, Recipe } = db;

      // Get all ratings with timeout protection
      const ratings = await Promise.race([
        Rating.findAll({
          include: [
            { model: User, as: 'user' },
            { model: Recipe, as: 'recipe' }
          ]
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Rating query timeout')), 30000)
        )
      ]);

      if (ratings.length === 0) {
        this.lastUpdated = now;
        console.log('ML Service: No ratings found, skipping matrix update. Fallback will be used.');
        return;
      }

      // Get unique users and recipes with timeout protection
      const [users, recipes] = await Promise.all([
        Promise.race([
          User.findAll({ order: [['user_id', 'ASC']] }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('User query timeout')), 10000)
          )
        ]),
        Promise.race([
          Recipe.findAll({ order: [['recipe_id', 'ASC']] }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Recipe query timeout')), 10000)
          )
        ])
      ]);

      // Store users and recipes for mapping
      this.users = users;
      this.recipes = recipes;

      // Create user-item matrix
      const userItemMatrix = users.map(user =>
        recipes.map(recipe => {
          const rating = ratings.find(r =>
            r.user_id === user.user_id && r.recipe_id === recipe.recipe_id
          );
          return rating ? rating.rating : 0;
        })
      );

      this.userItemMatrix = userItemMatrix;
      this.userSimilarities = this.calculateUserSimilarities(userItemMatrix);
      this.recipeSimilarities = this.calculateRecipeSimilarities(userItemMatrix);
      this.lastUpdated = now;

      console.log('ML matrices updated successfully');
    } catch (error) {
      console.error('Error updating ML matrices:', error);
      // Don't set lastUpdated on error to allow retry
    }
  }

  // Calculate cosine similarity between users
  calculateUserSimilarities(userItemMatrix) {
    const similarities = [];
    const matrix = new Matrix(userItemMatrix);

    for (let i = 0; i < matrix.rows; i++) {
      const userSimilarities = [];
      for (let j = 0; j < matrix.rows; j++) {
        if (i === j) {
          userSimilarities.push(1);
        } else {
          const similarity = this.cosineSimilarity(
            matrix.getRow(i),
            matrix.getRow(j)
          );
          userSimilarities.push(similarity);
        }
      }
      similarities.push(userSimilarities);
    }

    return similarities;
  }

  // Calculate cosine similarity between recipes
  calculateRecipeSimilarities(userItemMatrix) {
    const matrix = new Matrix(userItemMatrix);
    const recipeMatrix = matrix.transpose();
    const similarities = [];

    for (let i = 0; i < recipeMatrix.rows; i++) {
      const recipeSimilarities = [];
      for (let j = 0; j < recipeMatrix.rows; j++) {
        if (i === j) {
          recipeSimilarities.push(1);
        }
        else {
          const similarity = this.cosineSimilarity(
            recipeMatrix.getRow(i),
            recipeMatrix.getRow(j)
          );
          recipeSimilarities.push(similarity);
        }
      }
      similarities.push(recipeSimilarities);
    }

    return similarities;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Build user preference profile from interactions
  buildUserPreferenceProfile(recipesWithTags) {
    const preferences = {
      tags: {},
      cuisines: {},
      difficulties: {},
      mealTypes: {}
    };

    recipesWithTags.forEach(recipe => {
      if (recipe.tags) {
        recipe.tags.forEach(tag => {
          const category = tag.tag_category;
          const name = tag.tag_name;

          if (!preferences[category]) {
            preferences[category] = {};
          }
          preferences[category][name] = (preferences[category][name] || 0) + 1;
        });
      }
    });

    return preferences;
  }

  // Calculate content similarity between recipe and user preferences
  calculateContentSimilarity(recipe, userPreferences) {
    let score = 0;
    let totalWeight = 0;

    if (recipe.tags) {
      recipe.tags.forEach(tag => {
        const category = tag.tag_category;
        const name = tag.tag_name;
        
        if (userPreferences[category] && userPreferences[category][name]) {
          const weight = this.getTagWeight(category);
          score += userPreferences[category][name] * weight;
          totalWeight += weight;
        }
      });
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // Get weight for different tag categories
  getTagWeight(category) {
    const weights = {
      cuisine: 1.0,
      diet: 0.8,
      ingredient: 0.6,
      cooking_method: 0.4,
      meal_type: 0.7
    };
    return weights[category] || 0.5;
  }

  // Fallback recommendations when ML fails
  async getFallbackRecommendations(userId, limit) {
    try {
      const db = require('../models');
      const { Recipe, Sequelize } = db;

      // Get popular recipes (most rated)
      const recipes = await Recipe.findAll({
        limit,
        order: Sequelize.literal('RAND()')
      });

      return recipes.map(recipe => ({
        recipe_id: recipe.recipe_id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        score: 0.5,
        reason: 'Popular recipes'
      }));
    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return [];
    }
  }

  // Helper methods
  async getUserIndex(userId) {
    const db = require('../models');
    const { User } = db;
    const users = await User.findAll({ order: [['user_id', 'ASC']] });
    return users.findIndex(user => user.user_id === userId);
  }

  async formatRecommendations(recommendations) {
    if (!this.recipes) {
      console.error('ML Service: Recipes array not available for formatting recommendations');
      return [];
    }

    return recommendations.map(rec => {
      const recipe = this.recipes[rec.itemIndex];
      if (!recipe) {
        console.warn(`ML Service: Recipe not found for itemIndex ${rec.itemIndex}`);
        return null;
      }

      return {
        recipe_id: recipe.recipe_id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        score: rec.predictedRating,
        confidence: rec.confidence,
        reason: 'Based on similar users'
      };
    }).filter(rec => rec !== null);
  }

  // Parse nutritional information from recipe
  parseNutritionInfo(nutritionString) {
    if (!nutritionString) return null;

    try {
      // Handle different formats: JSON string, comma-separated, etc.
      let nutrition = {};

      if (nutritionString.startsWith('{')) {
        // JSON format
        nutrition = JSON.parse(nutritionString);
      } else {
        // Parse comma-separated format like "calories: 450, protein: 25g, carbs: 60g, fat: 15g, fiber: 8g"
        const parts = nutritionString.split(',').map(p => p.trim());
        parts.forEach(part => {
          const [key, value] = part.split(':').map(s => s.trim());
          if (key && value) {
            const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
            if (!isNaN(numValue)) {
              nutrition[key.toLowerCase()] = numValue;
            }
          }
        });
      }

      return {
        calories: nutrition.calories || nutrition.cal || 0,
        protein: nutrition.protein || nutrition.prot || 0,
        carbs: nutrition.carbs || nutrition.carbohydrates || 0,
        fat: nutrition.fat || 0,
        fiber: nutrition.fiber || 0
      };
    } catch (error) {
      console.warn('Error parsing nutrition info:', error);
      return null;
    }
  }

  // Calculate health score based on nutritional content
  calculateHealthScore(nutrition, userPreferences = {}) {
    if (!nutrition) return 0; // No score for missing data

    let score = 0;

    // Calorie scoring (ideal range: 300-600 for a meal)
    if (nutrition.calories > 0) {
      if (nutrition.calories >= 300 && nutrition.calories <= 600) score += 20;
      else if (nutrition.calories >= 250 && nutrition.calories <= 700) score += 15;
      else if (nutrition.calories >= 200 && nutrition.calories <= 800) score += 10;
      else if (nutrition.calories > 800 || nutrition.calories < 200) score += 5;
    }

    // Protein scoring (good: 15-30g per meal)
    if (nutrition.protein > 0) {
      if (nutrition.protein >= 20 && nutrition.protein <= 30) score += 25;
      else if (nutrition.protein >= 15 && nutrition.protein < 20) score += 20;
      else if (nutrition.protein > 30) score += 15;
      else if (nutrition.protein >= 10) score += 10;
      else if (nutrition.protein < 10) score += 5;
    }

    // Fiber scoring (good: 5-10g)
    if (nutrition.fiber > 0) {
      if (nutrition.fiber >= 5 && nutrition.fiber <= 10) score += 20;
      else if (nutrition.fiber > 10) score += 15;
      else if (nutrition.fiber >= 3) score += 10;
      else if (nutrition.fiber < 3) score += 5;
    }

    // Fat scoring (moderate fat is okay, very high fat is concerning)
    if (nutrition.fat > 0) {
      if (nutrition.fat >= 10 && nutrition.fat <= 20) score += 15;
      else if (nutrition.fat >= 5 && nutrition.fat < 10) score += 10;
      else if (nutrition.fat > 20 && nutrition.fat <= 30) score += 5;
      // Very high fat gets no points
    }

    // Carb scoring (balanced carbs are good)
    if (nutrition.carbs > 0) {
      if (nutrition.carbs >= 30 && nutrition.carbs <= 60) score += 15;
      else if (nutrition.carbs >= 20 && nutrition.carbs < 30) score += 10;
      else if (nutrition.carbs > 60 && nutrition.carbs <= 80) score += 5;
      // Very high carbs get no points
    }

    // User preference adjustments
    if (userPreferences.dietType) {
      switch (userPreferences.dietType.toLowerCase()) {
        case 'keto':
        case 'low_carb':
          if (nutrition.carbs < 20) score += 25;
          else if (nutrition.carbs < 30) score += 15;
          break;
        case 'high_protein':
          if (nutrition.protein > 25) score += 20;
          else if (nutrition.protein > 20) score += 15;
          break;
        case 'low_fat':
          if (nutrition.fat < 15) score += 20;
          else if (nutrition.fat < 20) score += 15;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  // Get health score category
  getHealthScoreCategory(score) {
    if (score >= this.healthScoreThresholds.excellent) return 'excellent';
    if (score >= this.healthScoreThresholds.good) return 'good';
    if (score >= this.healthScoreThresholds.fair) return 'fair';
    return 'poor';
  }

  // Generate nutritional recommendations
  async generateNutritionalRecommendations(userId, limit = 10, healthFocus = 'balanced') {
    console.log(`Generating nutritional recommendations for user ${userId}, focus: ${healthFocus}`);
    try {
      const db = require('../models');
      const { Recipe, UserInteraction } = db;

      // Get user's dietary preferences from interactions and ratings
      const userPreferences = await this.getUserDietaryPreferences(userId);

      // Get all recipes with nutrition info
      const recipes = await Recipe.findAll({
        where: {
          nutrition_info: { [db.Sequelize.Op.ne]: null }
        },
        limit: 100 // Get more recipes to score and filter
      });

      if (recipes.length === 0) {
        console.log('No recipes with nutrition info found, falling back to regular recommendations');
        return await this.getFallbackRecommendations(userId, limit);
      }

      // Score recipes based on nutritional content
      const scoredRecipes = recipes.map(recipe => {
        const nutrition = this.parseNutritionInfo(recipe.nutrition_info);
        const healthScore = this.calculateHealthScore(nutrition, userPreferences);
        const category = this.getHealthScoreCategory(healthScore);

        return {
          recipe,
          nutrition,
          healthScore,
          category,
          score: healthScore / 100 // Normalize to 0-1 for compatibility
        };
      });

      // Filter and sort based on health focus
      let filteredRecipes = scoredRecipes;
      switch (healthFocus) {
        case 'excellent':
          filteredRecipes = scoredRecipes.filter(r => r.category === 'excellent');
          break;
        case 'healthy':
          filteredRecipes = scoredRecipes.filter(r => r.category === 'excellent' || r.category === 'good');
          break;
        case 'balanced':
        default:
          filteredRecipes = scoredRecipes.filter(r => r.healthScore >= 40);
          break;
      }

      // Sort by health score descending
      filteredRecipes.sort((a, b) => b.healthScore - a.healthScore);

      const recommendations = filteredRecipes.slice(0, limit).map(item => ({
        recipe_id: item.recipe.recipe_id,
        title: item.recipe.title,
        description: item.recipe.description,
        image_url: item.recipe.image_url,
        score: item.score,
        healthScore: item.healthScore,
        healthCategory: item.category,
        nutrition: item.nutrition,
        reason: `Health-focused recommendation (${item.category} health score)`
      }));

      console.log(`Generated ${recommendations.length} nutritional recommendations`);
      return recommendations;
    } catch (error) {
      console.error('Error in nutritional recommendations:', error);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }

  // Get user's dietary preferences from their interactions
  async getUserDietaryPreferences(userId) {
    try {
      const db = require('../models');
      const { Recipe, UserInteraction, Rating } = db;

      // Get user's highly rated recipes
      const highlyRated = await Rating.findAll({
        where: { user_id: userId, rating: { [db.Sequelize.Op.gte]: 4 } },
        include: [{ model: Recipe, as: 'recipe' }],
        limit: 20
      });

      // Get user's interaction history
      const interactions = await UserInteraction.findAll({
        where: { user_id: userId },
        include: [{ model: Recipe, as: 'recipe' }],
        limit: 50
      });

      const preferences = {
        dietType: null,
        preferredCategories: {},
        avgCalories: 0,
        avgProtein: 0
      };

      // Analyze diet types from highly rated recipes
      const dietTypes = {};
      highlyRated.forEach(rating => {
        if (rating.recipe.diet_type) {
          dietTypes[rating.recipe.diet_type] = (dietTypes[rating.recipe.diet_type] || 0) + 1;
        }
      });

      // Find most common diet type
      let maxCount = 0;
      for (const [diet, count] of Object.entries(dietTypes)) {
        if (count > maxCount) {
          maxCount = count;
          preferences.dietType = diet;
        }
      }

      // Analyze nutritional patterns
      const nutritionData = [];
      [...highlyRated, ...interactions].forEach(item => {
        const recipe = item.recipe || item;
        if (recipe.nutrition_info) {
          const nutrition = this.parseNutritionInfo(recipe.nutrition_info);
          if (nutrition) nutritionData.push(nutrition);
        }
      });

      if (nutritionData.length > 0) {
        preferences.avgCalories = nutritionData.reduce((sum, n) => sum + n.calories, 0) / nutritionData.length;
        preferences.avgProtein = nutritionData.reduce((sum, n) => sum + n.protein, 0) / nutritionData.length;
      }

      return preferences;
    } catch (error) {
      console.error('Error getting user dietary preferences:', error);
      return {};
    }
  }

  // Main method to get recommendations based on type
  async getRecommendations(userId, type = 'random', limit = 10, options = {}) {
    // Ensure userId is a number
    userId = parseInt(userId);

    let recommendations = [];

    try {
      switch (type) {
        case 'collaborative':
          console.log(`Getting collaborative recommendations for user ${userId}`);
          recommendations = await this.generateUserBasedRecommendations(userId, limit);
          break;
        case 'content':
          console.log(`Getting content-based recommendations for user ${userId}`);
          recommendations = await this.generateContentBasedRecommendations(userId, limit);
          break;
        case 'hybrid':
          console.log(`Getting hybrid recommendations for user ${userId}`);
          recommendations = await this.generateHybridRecommendations(userId, limit);
          break;
        case 'nutritional':
          console.log(`Getting nutritional recommendations for user ${userId}`);
          recommendations = await this.generateNutritionalRecommendations(userId, limit, options.healthFocus);
          break;
        case 'random':
        default:
          console.log(`Getting random recommendations for user ${userId}`);
          recommendations = await this.getFallbackRecommendations(userId, limit);
          break;
      }

      console.log(`Generated ${recommendations.length} ${type} recommendations`);

      // Add avg_rating to each recommendation with timeout protection
      const recipeIds = recommendations.map(rec => rec.recipe_id);
      if (recipeIds.length > 0) {
        try {
          const db = require('../models');
          const avgRatings = await Promise.race([
            db.sequelize.query(`
              SELECT recipe_id, AVG(rating) as avg_rating
              FROM reviews_given
              WHERE recipe_id IN (${recipeIds.map(id => '?').join(',')})
              GROUP BY recipe_id
            `, {
              replacements: recipeIds,
              type: db.sequelize.QueryTypes.SELECT
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Avg rating query timeout')), 5000)
            )
          ]);

          const avgRatingMap = {};
          avgRatings.forEach(row => {
            avgRatingMap[row.recipe_id] = parseFloat(row.avg_rating);
          });

          recommendations = recommendations.map(rec => ({
            ...rec,
            avg_rating: avgRatingMap[rec.recipe_id] || null
          }));
        } catch (ratingError) {
          console.warn('Error fetching avg ratings, continuing without:', ratingError.message);
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      console.error('Stack:', error.stack);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }
}

module.exports = new MLRecommendationService();
