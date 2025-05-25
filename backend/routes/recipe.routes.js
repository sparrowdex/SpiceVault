// routes/recipe.routes.js

const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipe.controller");

// Routes
router.post("/", recipeController.createRecipe);
router.get("/", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;
