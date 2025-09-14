// controllers/recipe.controller.js

const db = require("../models");
const Recipe = db.Recipe;
const Rating = db.Rating;

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all recipes
//new code for accepting search queries
exports.getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const difficulty = req.query.difficulty;
    const foodCategory = req.query.food_category;
    const dietType = req.query.diet_type;
    const search = req.query.search || "";

    const whereClause = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (foodCategory) whereClause.food_category = foodCategory;
    if (dietType) whereClause.diet_type = dietType;
    if (search) {
      whereClause.title = { [db.Sequelize.Op.like]: `%${search}%` };
    }
    if (req.query.user_id) {
      whereClause.user_id = req.query.user_id;
    }

    const { count, rows } = await Recipe.findAndCountAll({
      where: whereClause,
      limit,
      offset
    });

    res.json({
      totalRecipes: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      recipes: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a recipe by ID
exports.updateRecipe = async (req, res) => {
  try {
    const [updated] = await Recipe.update(req.body, {
      where: { recipe_id: req.params.id }
    });
    if (updated) {
      const updatedRecipe = await Recipe.findByPk(req.params.id);
      res.json(updatedRecipe);
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a recipe by ID
exports.deleteRecipe = async (req, res) => {
  try {
    const deleted = await Recipe.destroy({
      where: { recipe_id: req.params.id }
    });
    if (deleted) {
      res.json({ message: "Recipe deleted successfully" });
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate a recipe
exports.rateRecipe = async (req, res) => {
  try {
    const { rating, user_id } = req.body;
    const recipe_id = req.params.id;

    // Check if the user has already rated this recipe
    const existingRating = await Rating.findOne({
      where: { recipe_id, user_id },
    });

    if (existingRating) {
      // If a rating exists, update it
      existingRating.rating = rating;
      await existingRating.save();
      return res.json({ message: "Rating updated successfully", rating: existingRating });
    } else {
      // If no rating exists, create a new one
      const newRating = await Rating.create({ recipe_id, user_id, rating });
      return res.status(201).json({ message: "Rating added successfully", rating: newRating });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
