// routes/recipe.routes.js

const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controller");
const auth = require("../middleware/authenticate");

// Routes
router.post("/", auth, recipeController.createRecipe);
router.get("/", recipeController.getAllRecipes);

// Route for getting chef certified recipes
router.get("/chef-certified", recipeController.getChefCertifiedRecipes);

router.get("/:id", recipeController.getRecipeById);
router.put("/:id", auth, recipeController.updateRecipe);
router.delete("/:id", auth, recipeController.deleteRecipe);

// Route for rating a recipe
router.post("/:id/rate", recipeController.rateRecipe);

// Route for getting popular recipes by a specific chef
router.get("/popular/:userId", auth, recipeController.getPopularRecipesByChef);

// Route for getting reviews for a chef's recipes
router.get("/reviews/chef/:userId", auth, recipeController.getReviewsByChef);

module.exports = router;
