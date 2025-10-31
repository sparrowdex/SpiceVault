// routes/mlRecommendation.routes.js

const express = require('express');
const router = express.Router();
const mlRecommendationController = require('../controllers/mlRecommendation.controller');
const auth = require('../middleware/auth');
const {
  validateRating,
  validateInteraction,
  validateRecipeTags,
  validatePagination,
  validateRecipeId,
  validateUserId,
  validateReviewId
} = require('../middleware/validation');

// ML Recommendation routes (require auth)
router.get('/recommendations/:userId', auth, validateUserId, validatePagination, mlRecommendationController.getRecommendations);
router.get('/nutritional/:userId', auth, validateUserId, validatePagination, mlRecommendationController.getNutritionalRecommendations);
router.get('/dietary-preferences/:userId', auth, validateUserId, mlRecommendationController.getUserDietaryPreferences);
router.get('/recipe-health-score/:recipeId', auth, validateRecipeId, mlRecommendationController.getRecipeHealthScore);
router.get('/similar/:recipeId', auth, validateRecipeId, mlRecommendationController.getSimilarRecipes);

// Popular recipes route (public)
router.get('/popular', mlRecommendationController.getPopularRecipes);

// Chef stats route (require auth)
router.get('/chef-stats/:userId', auth, validateUserId, mlRecommendationController.getChefStats);

// Global rankings route (require auth)
router.get('/global-rankings', auth, mlRecommendationController.getGlobalRankings);

// Rating routes (require auth)
router.post('/ratings', validateRating, mlRecommendationController.addRating); // Removed auth middleware to allow review submission
router.get('/ratings/:userId', auth, validateUserId, validatePagination, mlRecommendationController.getUserRatings);
router.get('/ratings', mlRecommendationController.getRecipeRatings); // Allow unauthenticated access to reviews
router.delete('/ratings/:reviewId', auth, validateReviewId, mlRecommendationController.deleteRating);

// Interaction routes (require auth)
router.post('/interactions', auth, validateInteraction, mlRecommendationController.recordInteraction);
router.get('/interactions/:userId', auth, validateUserId, validatePagination, mlRecommendationController.getUserInteractions);

// Tag routes (require auth)
router.post('/recipes/:recipeId/tags', auth, validateRecipeId, validateRecipeTags, mlRecommendationController.addRecipeTags);
router.get('/recipes/:recipeId/tags', auth, validateRecipeId, mlRecommendationController.getRecipeTags);

module.exports = router;
