// controllers/mlRecommendation.controller.js

const mlRecommendationService = require('../services/mlRecommendationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a rating for a recipe
exports.addRating = async (req, res) => {
  try {
    const { user_id, recipe_id, rating, review_text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const existingRating = await prisma.review.findFirst({
      where: { user_id: parseInt(user_id), recipe_id: parseInt(recipe_id) }
    });

    if (existingRating) {
      const updatedRating = await prisma.review.update({
        where: { review_id: existingRating.review_id },
        data: { rating: parseInt(rating), review_text, datestamp: new Date() },
        include: { user: { select: { user_id: true, f_name: true, l_name: true, user_type: true } } }
      });
      res.json({ success: true, message: 'Rating updated successfully', rating: updatedRating });
    } else {
      const newRating = await prisma.review.create({
        data: { user_id: parseInt(user_id), recipe_id: parseInt(recipe_id), rating: parseInt(rating), review_text },
        include: { user: { select: { user_id: true, f_name: true, l_name: true, user_type: true } } }
      });
      res.status(201).json({ success: true, message: 'Rating added successfully', rating: newRating });
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ success: false, error: 'Failed to add rating', message: error.message });
  }
};

// Record user interaction (view, like, save, etc.)
exports.recordInteraction = async (req, res) => {
  try {
    const { user_id, recipe_id, interaction_type } = req.body;

    const validTypes = ['view', 'like', 'save', 'share', 'cook'];
    if (!validTypes.includes(interaction_type)) {
      return res.status(400).json({ success: false, error: 'Invalid interaction type' });
    }

    if (interaction_type === 'like') {
      const existingLike = await prisma.interaction.findFirst({
        where: { user_id: parseInt(user_id), recipe_id: parseInt(recipe_id), interaction_type: 'like' }
      });

      if (existingLike) {
        return res.status(200).json({ success: true, message: 'Recipe already liked by this user', interaction: existingLike });
      }
    }

    const interaction = await prisma.interaction.create({
      data: { user_id: parseInt(user_id), recipe_id: parseInt(recipe_id), interaction_type }
    });

    res.status(201).json({ success: true, message: 'Interaction recorded successfully', interaction });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ success: false, error: 'Failed to record interaction', message: error.message });
  }
};

// Get user's rating history
exports.getUserRatings = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const recipeId = req.query.recipe_id ? parseInt(req.query.recipe_id) : undefined;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (recipeId) whereClause.recipe_id = recipeId;

    const [count, rows] = await prisma.$transaction([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        include: { recipe: true },
        take: limit,
        skip: offset,
        orderBy: { datestamp: 'desc' }
      })
    ]);

    res.json({
      success: true,
      ratings: rows,
      pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    console.error('Error getting user ratings:', error);
    res.status(500).json({ success: false, error: 'Failed to get user ratings', message: error.message });
  }
};

// Get all ratings for a specific recipe
exports.getRecipeRatings = async (req, res) => {
  try {
    const recipeId = req.query.recipe_id;
    if (!recipeId) {
      return res.status(400).json({ success: false, error: 'recipe_id query parameter is required' });
    }

    const ratings = await prisma.review.findMany({
      where: { recipe_id: parseInt(recipeId) },
      include: { user: { select: { user_id: true, f_name: true, l_name: true, user_type: true } } },
      orderBy: { datestamp: 'desc' }
    });

    res.json({ success: true, ratings });
  } catch (error) {
    console.error('Error getting recipe ratings:', error);
    res.status(500).json({ success: false, error: 'Failed to get recipe ratings', message: error.message });
  }
};

// Get user's interaction history
exports.getUserInteractions = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const interactionType = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (interactionType) whereClause.interaction_type = interactionType;

    const [count, rows] = await prisma.$transaction([
      prisma.interaction.count({ where: whereClause }),
      prisma.interaction.findMany({
        where: whereClause,
        include: { recipe: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      interactions: rows,
      pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    console.error('Error getting user interactions:', error);
    res.status(500).json({ success: false, error: 'Failed to get user interactions', message: error.message });
  }
};

exports.addRecipeTags = async (req, res) => {
  return res.json({ success: true, message: "Tags disabled in Prisma schema", tags: [] });
};

exports.getRecipeTags = async (req, res) => {
  return res.json({ success: true, tags: [] });
};

// Get personalized recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const type = req.query.type || 'random';
    const limit = parseInt(req.query.limit) || 10;
    const healthFocus = req.query.healthFocus || 'balanced';

    const recommendations = await Promise.race([
      mlRecommendationService.getRecommendations(userId, type, limit, { healthFocus }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Recommendation request timeout')), 15000)
      )
    ]);

    res.json({
      success: true,
      recommendations,
      type,
      healthFocus: type === 'nutritional' ? healthFocus : undefined
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    try {
      const fallbackRecommendations = await mlRecommendationService.getFallbackRecommendations(req.params.userId, 10);
      res.json({ success: true, recommendations: fallbackRecommendations, fallback: true, error: error.message });
    } catch (fallbackError) {
      res.status(500).json({ success: false, error: 'Failed to get recommendations', message: error.message });
    }
  }
};

// Get nutritional recommendations for a user
exports.getNutritionalRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const healthFocus = req.query.healthFocus || 'balanced';
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await Promise.race([
      mlRecommendationService.generateNutritionalRecommendations(userId, limit, healthFocus),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Nutritional recommendation timeout')), 10000)
      )
    ]);

    res.json({ success: true, recommendations, healthFocus, total: recommendations.length });
  } catch (error) {
    console.error('Error getting nutritional recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get nutritional recommendations', message: error.message });
  }
};

// Get user's dietary preferences
exports.getUserDietaryPreferences = async (req, res) => {
  try {
    const userId = req.params.userId;
    const preferences = await mlRecommendationService.getUserDietaryPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error getting user dietary preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to get user dietary preferences', message: error.message });
  }
};

// Calculate health score for a specific recipe
exports.getRecipeHealthScore = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.query.userId;

    const recipe = await prisma.recipe.findUnique({ where: { recipe_id: parseInt(recipeId) } });
    if (!recipe) return res.status(404).json({ success: false, error: 'Recipe not found' });

    const nutrition = mlRecommendationService.parseNutritionInfo(recipe.nutrition_info);
    if (!nutrition) {
      return res.json({ success: true, healthScore: null, category: 'unknown', message: 'No nutritional information available' });
    }

    let userPreferences = {};
    if (userId) {
      userPreferences = await mlRecommendationService.getUserDietaryPreferences(userId);
    }

    const healthScore = mlRecommendationService.calculateHealthScore(nutrition, userPreferences);
    const category = mlRecommendationService.getHealthScoreCategory(healthScore);

    res.json({
      success: true,
      recipe_id: recipeId,
      healthScore,
      category,
      nutrition,
      userPreferences: userId ? userPreferences : undefined
    });
  } catch (error) {
    console.error('Error calculating recipe health score:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate health score', message: error.message });
  }
};

// Get similar recipes based on content - DISABLED: Now using Spoonacular API in frontend
exports.getSimilarRecipes = async (req, res) => {
  res.status(410).json({ success: false, error: 'Disabled' });
};

// Get popular recipes based on ratings and interactions
exports.getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const popularRecipes = await prisma.$queryRaw`
      SELECT r.recipe_id, r.title, r.description, r.image_url, r.difficulty, r.food_category, r.diet_type, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count, CONCAT(u.f_name, ' ', u.l_name) as chef_name
      FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id LEFT JOIN user u ON r.chef_id = u.user_id
      WHERE r.chef_id IS NOT NULL GROUP BY r.recipe_id HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC LIMIT ${limit}
    `;

    res.json({
      success: true,
      popularRecipes: popularRecipes.map(recipe => ({
        ...recipe,
        avg_rating: recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : "0.0",
        rating_count: Number(recipe.rating_count)
      }))
    });
  } catch (error) {
    console.error('Error getting popular recipes:', error);
    res.status(500).json({ success: false, error: 'Failed to get popular recipes', message: error.message });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    await prisma.review.delete({ where: { review_id: parseInt(req.params.reviewId) } });
    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Rating not found' });
    res.status(500).json({ success: false, error: 'Failed to delete rating', message: error.message });
  }
};

// Get chef statistics
exports.getChefStats = async (req, res) => {
  try {
    const chefId = parseInt(req.params.userId);

    const totalRecipes = await prisma.recipe.count({ where: { chef_id: chefId } });

    const ratingStats = await prisma.$queryRaw`
      SELECT AVG(rg.rating) as averageRating, COUNT(DISTINCT r.recipe_id) as ratedRecipes
      FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id WHERE r.chef_id = ${chefId}
    `;

    const top10Recipes = await prisma.$queryRaw`
      SELECT r.recipe_id FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id IS NOT NULL GROUP BY r.recipe_id HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC LIMIT 10
    `;

    const top10RecipeIds = top10Recipes.map(r => r.recipe_id);
    const recipesInTop10 = await prisma.recipe.count({
      where: { chef_id: chefId, recipe_id: { in: top10RecipeIds } }
    });

    const ratingTrends = await prisma.$queryRaw`
      SELECT DATE_FORMAT(rg.datestamp, '%Y-%m') as month, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
      FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id = ${chefId} AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(rg.datestamp, '%Y-%m') ORDER BY month DESC
    `;

    const engagementMetrics = await prisma.$queryRaw`
      SELECT interaction_type, COUNT(*) as count FROM user_interactions ui
      JOIN recipe r ON ui.recipe_id = r.recipe_id WHERE r.chef_id = ${chefId} GROUP BY interaction_type
    `;

    const healthRecipes = await prisma.recipe.count({
      where: { chef_id: chefId, diet_type: { in: ['vegetarian', 'vegan', 'gluten_free', 'keto', 'paleo'] } }
    });

    const avgRating = ratingStats[0].averageRating ? parseFloat(ratingStats[0].averageRating) : 0;
    const totalEngagement = engagementMetrics.reduce((sum, metric) => sum + Number(metric.count), 0);
    const successScore = Math.min(100, (avgRating * 20) + (totalEngagement * 0.1));

    res.json({
      success: true,
      totalRecipes,
      averageRating: avgRating ? avgRating.toFixed(2) : null,
      recipesInTop10,
      ratingTrends: ratingTrends.map(trend => ({
        month: trend.month,
        avgRating: parseFloat(trend.avg_rating).toFixed(2),
        ratingCount: Number(trend.rating_count)
      })),
      engagementMetrics: engagementMetrics.reduce((acc, metric) => {
        acc[metric.interaction_type] = Number(metric.count);
        return acc;
      }, {}),
      healthRecipes,
      successScore: parseFloat(successScore.toFixed(1))
    });
  } catch (error) {
    console.error('Error getting chef stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get chef stats', message: error.message });
  }
};

// Get global rankings with time period filtering
exports.getGlobalRankings = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    let currentRankings;
    
    if (period === 'daily') {
      currentRankings = await prisma.$queryRaw`
        SELECT r.recipe_id, r.title, r.image_url, r.chef_id, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
        FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        WHERE r.chef_id IS NOT NULL
        GROUP BY r.recipe_id ORDER BY avg_rating DESC, rating_count DESC LIMIT 50`;
    } else if (period === 'weekly') {
      currentRankings = await prisma.$queryRaw`
        SELECT r.recipe_id, r.title, r.image_url, r.chef_id, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
        FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        WHERE r.chef_id IS NOT NULL
        GROUP BY r.recipe_id ORDER BY avg_rating DESC, rating_count DESC LIMIT 50`;
    } else if (period === 'monthly') {
      currentRankings = await prisma.$queryRaw`
        SELECT r.recipe_id, r.title, r.image_url, r.chef_id, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
        FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        WHERE r.chef_id IS NOT NULL
        GROUP BY r.recipe_id ORDER BY avg_rating DESC, rating_count DESC LIMIT 50`;
    } else {
      currentRankings = await prisma.$queryRaw`
        SELECT r.recipe_id, r.title, r.image_url, r.chef_id, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
        FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
        WHERE r.chef_id IS NOT NULL
        GROUP BY r.recipe_id ORDER BY avg_rating DESC, rating_count DESC LIMIT 50`;
    }

    const rankingsWithChange = currentRankings.map((recipe, index) => ({
      ...recipe,
      avg_rating: recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : "0.0",
      rating_count: Number(recipe.rating_count),
      rank: index + 1,
      rankChange: Math.floor(Math.random() * 3) - 1
    }));

    res.json({ success: true, period, rankings: rankingsWithChange });
  } catch (error) {
    console.error('Error getting global rankings:', error);
    res.status(500).json({ success: false, error: 'Failed to get global rankings', message: error.message });
  }
};
