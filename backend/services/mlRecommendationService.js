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
      const interactedRecipes = await Recipe.findAll({
        where: {
          recipe_id: interactedRecipeIds
        },
        include: {
          model: RecipeTag,
          as: 'tags'
        }
      });

      // Step 4: Build user preference profile from the fetched recipes and their tags
      const userPreferences = this.buildUserPreferenceProfile(interactedRecipes);

      // Get all recipes with tags
      const allRecipes = await Recipe.findAll({
        include: [{
          model: RecipeTag,
          as: 'tags'
        }]
      });

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
      const [userBased, contentBased] = await Promise.all([
        this.generateUserBasedRecommendations(userId, limit * 2),
        this.generateContentBasedRecommendations(userId, limit * 2)
      ]);

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

      // Get all ratings
      const ratings = await Rating.findAll({
        include: [
          { model: User, as: 'user' },
          { model: Recipe, as: 'recipe' }
        ]
      });

      if (ratings.length === 0) {
        this.lastUpdated = now;
        console.log('ML Service: No ratings found, skipping matrix update. Fallback will be used.');
        return;
      }

      // Get unique users and recipes
      const users = await User.findAll({ order: [['user_id', 'ASC']] });
      const recipes = await Recipe.findAll({ order: [['recipe_id', 'ASC']] });

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

  // Main method to get recommendations based on type
  async getRecommendations(userId, type = 'random', limit = 10) {
    // Ensure userId is a number
    userId = parseInt(userId);

    let recommendations = [];

    try {
      switch (type) {
        case 'collaborative':
          recommendations = await this.generateUserBasedRecommendations(userId, limit);
          break;
        case 'hybrid':
          recommendations = await this.generateHybridRecommendations(userId, limit);
          break;
        case 'random':
        default:
          recommendations = await this.getFallbackRecommendations(userId, limit);
          break;
      }

      // Add avg_rating to each recommendation
      const recipeIds = recommendations.map(rec => rec.recipe_id);
      if (recipeIds.length > 0) {
        const db = require('../models');
        const avgRatings = await db.sequelize.query(`
          SELECT recipe_id, AVG(rating) as avg_rating
          FROM reviews_given
          WHERE recipe_id IN (${recipeIds.map(id => '?').join(',')})
          GROUP BY recipe_id
        `, {
          replacements: recipeIds,
          type: db.sequelize.QueryTypes.SELECT
        });

        const avgRatingMap = {};
        avgRatings.forEach(row => {
          avgRatingMap[row.recipe_id] = parseFloat(row.avg_rating);
        });

        recommendations = recommendations.map(rec => ({
          ...rec,
          avg_rating: avgRatingMap[rec.recipe_id] || null
        }));
      }

      return recommendations;
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return await this.getFallbackRecommendations(userId, limit);
    }
  }
}

module.exports = new MLRecommendationService();
