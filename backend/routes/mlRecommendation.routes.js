// routes/mlRecommendation.routes.js

const express = require('express');
const router = express.Router();
const mlRecommendationController = require('../controllers/mlRecommendation.controller');

// ML Recommendation routes
router.get('/recommendations/:userId', mlRecommendationController.getRecommendations);
router.get('/similar/:recipeId', mlRecommendationController.getSimilarRecipes);

// Rating routes
router.post('/ratings', mlRecommendationController.addRating);
router.get('/ratings/:userId', mlRecommendationController.getUserRatings);
router.delete('/ratings/:reviewId', mlRecommendationController.deleteRating);

// Interaction routes
router.post('/interactions', mlRecommendationController.recordInteraction);
router.get('/interactions/:userId', mlRecommendationController.getUserInteractions);

// Tag routes
router.post('/recipes/:recipeId/tags', mlRecommendationController.addRecipeTags);
router.get('/recipes/:recipeId/tags', mlRecommendationController.getRecipeTags);

module.exports = router;
