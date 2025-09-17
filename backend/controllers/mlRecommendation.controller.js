// controllers/mlRecommendation.controller.js

const mlRecommendationService = require('../services/mlRecommendationService');
const db = require('../models');
const { Rating, UserInteraction, RecipeTag } = db;

// Get ML-powered recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const type = req.query.type || 'hybrid'; // hybrid, collaborative, content
    const limit = parseInt(req.query.limit) || 10;

    let recommendations;
    switch (type) {
      case 'collaborative':
        recommendations = await mlRecommendationService.generateUserBasedRecommendations(userId, limit);
        break;
      case 'content':
        recommendations = await mlRecommendationService.generateContentBasedRecommendations(userId, limit);
        break;
      case 'hybrid':
      default:
        recommendations = await mlRecommendationService.generateHybridRecommendations(userId, limit);
        break;
    }

    res.json({
      success: true,
      type,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
};

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
      res.json({
        success: true,
        message: 'Rating updated successfully',
        rating: existingRating
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
      res.status(201).json({
        success: true,
        message: 'Rating added successfully',
        rating: newRating
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

// Get similar recipes based on content
exports.getSimilarRecipes = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const limit = parseInt(req.query.limit) || 5;

    // This would use the content-based similarity from the ML service
    // For now, return a simple implementation
    const recipe = await db.Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found'
      });
    }

    // Get recipes with similar tags
    const recipeTags = await RecipeTag.findAll({
      where: { recipe_id: recipeId }
    });

    if (recipeTags.length === 0) {
      return res.json({
        success: true,
        similarRecipes: []
      });
    }

    const tagNames = recipeTags.map(tag => tag.tag_name);
    const similarRecipes = await db.Recipe.findAll({
      include: [{
        model: RecipeTag,
        as: 'tags',
        where: {
          tag_name: tagNames
        }
      }],
      where: {
        recipe_id: { [db.Sequelize.Op.ne]: recipeId }
      },
      limit
    });

    res.json({
      success: true,
      similarRecipes
    });
  } catch (error) {
    console.error('Error getting similar recipes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get similar recipes',
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
