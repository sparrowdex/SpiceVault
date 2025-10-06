// controllers/mlRecommendation.controller.js

const mlRecommendationService = require('../services/mlRecommendationService');
const db = require('../models');
const { Rating, UserInteraction, RecipeTag, User } = db;

// Add a rating for a recipe
exports.addRating = async (req, res) => {
  try {
    const { user_id, recipe_id, rating, review_text } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: { user_id, recipe_id }
    });

    if (existingRating) {
      // Update existing rating
      await existingRating.update({ 
        rating, 
        review_text,
        datestamp: new Date().toISOString().split('T')[0]
      });
      // Reload with user info
      const updatedRating = await Rating.findOne({
        where: { review_id: existingRating.review_id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['user_id', 'f_name', 'l_name', 'user_type']
        }]
      });
      res.json({
        success: true,
        message: 'Rating updated successfully',
        rating: updatedRating
      });
    } else {
      // Create new rating
      const newRating = await Rating.create({
        user_id,
        recipe_id,
        rating,
        review_text,
        datestamp: new Date().toISOString().split('T')[0]
      });
      // Reload with user info
      const createdRating = await Rating.findOne({
        where: { review_id: newRating.review_id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['user_id', 'f_name', 'l_name', 'user_type']
        }]
      });
      res.status(201).json({
        success: true,
        message: 'Rating added successfully',
        rating: createdRating
      });
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    console.error('Request body:', req.body);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to add rating',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Record user interaction (view, like, save, etc.)
exports.recordInteraction = async (req, res) => {
  try {
    const { user_id, recipe_id, interaction_type, duration } = req.body;

    // Validate interaction type
    const validTypes = ['view', 'like', 'save', 'share', 'cook'];
    if (!validTypes.includes(interaction_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid interaction type'
      });
    }

    // Prevent duplicate 'like' interactions
    if (interaction_type === 'like') {
      const existingLike = await UserInteraction.findOne({
        where: {
          user_id,
          recipe_id,
          interaction_type: 'like'
        }
      });

      if (existingLike) {
        return res.status(200).json({
          success: true,
          message: 'Recipe already liked by this user',
          interaction: existingLike
        });
      }
    }

    const interaction = await UserInteraction.create({
      user_id,
      recipe_id,
      interaction_type,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'Interaction recorded successfully',
      interaction
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record interaction',
      message: error.message
    });
  }
};

// Get user's rating history
exports.getUserRatings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recipeId = req.query.recipe_id; // New: Get recipe_id from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (recipeId) { // New: Add recipe_id to where clause if present
      whereClause.recipe_id = recipeId;
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: whereClause, // Use the dynamic whereClause
      include: [{
        model: db.Recipe,
        as: 'recipe'
      }],
      limit,
      offset,
      order: [['datestamp', 'DESC']]
    });

    res.json({
      success: true,
      ratings: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error getting user ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user ratings',
      message: error.message
    });
  }
};

// Get all ratings for a specific recipe
exports.getRecipeRatings = async (req, res) => {
  try {
    const recipeId = req.query.recipe_id;
    if (!recipeId) {
      return res.status(400).json({
        success: false,
        error: 'recipe_id query parameter is required'
      });
    }

    const ratings = await Rating.findAll({
      where: { recipe_id: recipeId },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['user_id', 'f_name', 'l_name', 'user_type']
      }],
      order: [['datestamp', 'DESC']]
    });

    res.json({
      success: true,
      ratings
    });
  } catch (error) {
    console.error('Error getting recipe ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recipe ratings',
      message: error.message
    });
  }
};

// Get user's interaction history
exports.getUserInteractions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const interactionType = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (interactionType) {
      whereClause.interaction_type = interactionType;
    }

    const { count, rows } = await UserInteraction.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.Recipe,
        as: 'recipe'
      }],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      interactions: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error getting user interactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user interactions',
      message: error.message
    });
  }
};

// Add tags to a recipe
exports.addRecipeTags = async (req, res) => {
  try {
    const { recipe_id, tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Tags must be an array'
      });
    }

    // Remove existing tags for this recipe
    await RecipeTag.destroy({
      where: { recipe_id }
    });

    // Add new tags
    const newTags = await Promise.all(
      tags.map(tag => 
        RecipeTag.create({
          recipe_id,
          tag_name: tag.name,
          tag_category: tag.category
        })
      )
    );

    res.json({
      success: true,
      message: 'Tags added successfully',
      tags: newTags
    });
  } catch (error) {
    console.error('Error adding recipe tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add recipe tags',
      message: error.message
    });
  }
};

// Get recipe tags
exports.getRecipeTags = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;

    const tags = await RecipeTag.findAll({
      where: { recipe_id: recipeId }
    });

    res.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Error getting recipe tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recipe tags',
      message: error.message
    });
  }
};

// Get personalized recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const type = req.query.type || 'random';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await mlRecommendationService.getRecommendations(userId, type, limit);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
};

// Get similar recipes based on content - DISABLED: Now using Spoonacular API in frontend
exports.getSimilarRecipes = async (req, res) => {
  res.status(410).json({
    success: false,
    error: 'Similar recipes are no longer available. Please use the frontend Spoonacular integration.',
    message: 'This endpoint has been disabled as similar recipes are now handled by Spoonacular API in the frontend.'
  });
};

// Get popular recipes based on ratings and interactions
exports.getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    // Get recipes ordered by average rating and number of ratings using raw query
    const popularRecipes = await db.sequelize.query(`
      SELECT
        r.recipe_id,
        r.title,
        r.description,
        r.image_url,
        r.difficulty,
        r.food_category,
        r.diet_type,
        AVG(rg.rating) as avg_rating,
        COUNT(rg.rating) as rating_count,
        CONCAT(u.f_name, ' ', u.l_name) as chef_name
      FROM recipe r
      LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      LEFT JOIN user u ON r.chef_id = u.user_id
      WHERE r.chef_id IS NOT NULL
      GROUP BY r.recipe_id
      HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC
      LIMIT ?
    `, {
      replacements: [limit],
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      popularRecipes: popularRecipes.map(recipe => ({
        recipe_id: recipe.recipe_id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        difficulty: recipe.difficulty,
        food_category: recipe.food_category,
        diet_type: recipe.diet_type,
        avg_rating: parseFloat(recipe.avg_rating).toFixed(1),
        rating_count: recipe.rating_count,
        chef_name: recipe.chef_name
      }))
    });
  } catch (error) {
    console.error('Error getting popular recipes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular recipes',
      message: error.message
    });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deleted = await Rating.destroy({
      where: { review_id: reviewId }
    });

    if (deleted) {
      res.json({ success: true, message: 'Rating deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Rating not found' });
    }
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rating',
      message: error.message
    });
  }
};

// Get chef statistics
exports.getChefStats = async (req, res) => {
  try {
    const chefId = req.params.chefId;

    // Get total recipes by chef
    const totalRecipes = await db.Recipe.count({
      where: { chef_id: chefId }
    });

    // Get average rating across all chef's recipes
    const ratingStats = await db.sequelize.query(`
      SELECT
        AVG(rg.rating) as averageRating,
        COUNT(DISTINCT r.recipe_id) as ratedRecipes
      FROM recipe r
      LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id = ?
    `, {
      replacements: [chefId],
      type: db.sequelize.QueryTypes.SELECT
    });

    // Get recipes in top 10 global rankings
    const top10Recipes = await db.sequelize.query(`
      SELECT r.recipe_id
      FROM recipe r
      LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id IS NOT NULL
      GROUP BY r.recipe_id
      HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC
      LIMIT 10
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    const top10RecipeIds = top10Recipes.map(recipe => recipe.recipe_id);

    const recipesInTop10 = await db.Recipe.count({
      where: {
        chef_id: chefId,
        recipe_id: top10RecipeIds
      }
    });

    res.json({
      success: true,
      totalRecipes,
      averageRating: ratingStats[0].averageRating ? parseFloat(ratingStats[0].averageRating).toFixed(2) : null,
      recipesInTop10
    });
  } catch (error) {
    console.error('Error getting chef stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chef stats',
      message: error.message
    });
  }
};

// Get global rankings with time period filtering
exports.getGlobalRankings = async (req, res) => {
  try {
    const period = req.query.period || 'all'; // daily, weekly, monthly, all
    let dateFilter = '';

    if (period === 'daily') {
      dateFilter = 'AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } else if (period === 'weekly') {
      dateFilter = 'AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'monthly') {
      dateFilter = 'AND rg.datestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    // Get current rankings
    const currentRankings = await db.sequelize.query(`
      SELECT
        r.recipe_id,
        r.title,
        r.image_url,
        r.chef_id,
        AVG(rg.rating) as avg_rating,
        COUNT(rg.rating) as rating_count,
        ROW_NUMBER() OVER (ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC) as current_rank
      FROM recipe r
      LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id IS NOT NULL ${dateFilter}
      GROUP BY r.recipe_id
      HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC
      LIMIT 50
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    // For rank change calculation, we'd need historical data
    // For now, we'll simulate rank changes (in a real implementation, store previous rankings)
    const rankingsWithChange = currentRankings.map((recipe, index) => ({
      ...recipe,
      rank: index + 1,
      rankChange: Math.floor(Math.random() * 3) - 1 // -1, 0, or 1 for demo
    }));

    res.json({
      success: true,
      period,
      rankings: rankingsWithChange
    });
  } catch (error) {
    console.error('Error getting global rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get global rankings',
      message: error.message
    });
  }
};
