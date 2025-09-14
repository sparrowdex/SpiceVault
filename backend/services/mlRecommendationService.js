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
  }

  // Collaborative Filtering using User-Based approach
  async generateUserBasedRecommendations(userId, limit = 10) {
    console.log(`Generating user-based recommendations for user ${userId}`);
    try {
      await this.updateMatrices();
      
      if (!this.userItemMatrix || !this.userSimilarities) {
        console.log('User-item matrix or similarities not available, falling back.');
        return await this.getFallbackRecommendations(userId, limit);
      }

      const userIndex = await this.getUserIndex(userId);
      if (userIndex === -1) {
        console.log(`User ${userId} not found in matrix, falling back.`);
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
      const userInteractions = await UserInteraction.findAll({
        where: { user_id: userId },
        include: [{
          model: Recipe,
          as: 'recipe', // Add the alias here
          include: [{
            model: RecipeTag,
            as: 'tags'
          }]
        }]
      });

      if (userInteractions.length === 0) {
        console.log(`No user interactions found for user ${userId}, falling back.`);
        return await this.getFallbackRecommendations(userId, limit);
      }

      // Build user preference profile
      const userPreferences = this.buildUserPreferenceProfile(userInteractions);

      // Get all recipes with tags
      const allRecipes = await Recipe.findAll({
        include: [{
          model: RecipeTag,
          as: 'tags'
        }]
      });

      // Calculate similarity scores
      const recommendations = allRecipes
        .map(recipe => ({
          recipe,
          score: this.calculateContentSimilarity(recipe, userPreferences)
        }))
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Generated ${recommendations.length} content-based recommendations.`);
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

      console.log(`Generated ${Array.from(combined.values()).length} hybrid recommendations.`);
      return Array.from(combined.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
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
        console.log('No ratings found, skipping matrix update.');
        return;
      }

      // Get unique users and recipes
      const users = await User.findAll({ order: [['user_id', 'ASC']] });
      const recipes = await Recipe.findAll({ order: [['recipe_id', 'ASC']] });

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
  buildUserPreferenceProfile(interactions) {
    const preferences = {
      tags: {},
      cuisines: {},
      difficulties: {},
      mealTypes: {}
    };

    interactions.forEach(interaction => {
      const recipe = interaction.Recipe;
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
      const { Recipe } = db;

      // Get popular recipes (most rated)
      const recipes = await Recipe.findAll({
        limit,
        order: [['recipe_id', 'DESC']] // Simple fallback
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
    const db = require('../models');
    const { Recipe } = db;
    
    const recipeIds = recommendations.map(rec => rec.itemIndex + 1); // Assuming recipe_id starts from 1
    const recipes = await Recipe.findAll({
      where: { recipe_id: recipeIds }
    });

    return recommendations.map(rec => {
      const recipe = recipes.find(r => r.recipe_id === rec.itemIndex + 1);
      return {
        recipe_id: recipe?.recipe_id,
        title: recipe?.title,
        description: recipe?.description,
        image_url: recipe?.image_url,
        score: rec.predictedRating,
        confidence: rec.confidence,
        reason: 'Based on similar users'
      };
    }).filter(rec => rec.recipe_id);
  }
}

module.exports = new MLRecommendationService();
