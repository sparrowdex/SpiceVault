// routes/recipe.routes.js

const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controller");

// Routes
router.post("/", recipeController.createRecipe);
router.get("/", recipeController.getAllRecipes);

// Route for getting chef certified recipes
router.get("/chef-certified", recipeController.getChefCertifiedRecipes);

router.get("/:id", recipeController.getRecipeById);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

// Route for rating a recipe
router.post("/:id/rate", recipeController.rateRecipe);

module.exports = router;
