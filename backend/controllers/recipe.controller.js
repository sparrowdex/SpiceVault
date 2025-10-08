// controllers/recipe.controller.js

const db = require("../models");
const Recipe = db.Recipe;
const Rating = db.Rating;

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { title } = req.body;

    // Check if a recipe with the same title already exists
    const existingRecipe = await Recipe.findOne({
      where: { title: title }
    });

    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        error: 'A recipe with this title already exists. Please choose a different title.'
      });
    }

    const recipe = await Recipe.create(req.body);
    res.status(201).json({
      success: true,
      recipe,
      message: 'Recipe created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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

// Get chef certified recipes with ratings and chef info
exports.getChefCertifiedRecipes = async (req, res) => {
  try {
    const User = db.User;
    console.log('Fetching chef certified recipes...');
    const recipes = await Recipe.findAll({
      where: {
        chef_id: { [db.Sequelize.Op.ne]: null } // Recipes with a chef assigned
      },
      include: [
        {
          model: User,
          as: 'chef', // Assuming association is set up
          attributes: ['f_name', 'l_name']
        },
        {
          model: Rating,
          as: 'ratings', // Assuming association is set up
          attributes: ['rating']
        }
      ]
    });
    console.log('Found recipes:', recipes.length);

    // Calculate average rating for each recipe
    const recipesWithAvgRating = recipes.map(recipe => {
      const ratings = recipe.ratings || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : null;
      return {
        ...recipe.toJSON(),
        avg_rating: avgRating,
        chef_name: recipe.chef ? `${recipe.chef.f_name} ${recipe.chef.l_name}` : null
      };
    });

    console.log('Recipes with avg rating:', recipesWithAvgRating.length);
    res.json({
      success: true,
      recipes: recipesWithAvgRating
    });
  } catch (error) {
    console.error('Error in getChefCertifiedRecipes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get popular recipes by a specific chef
exports.getPopularRecipesByChef = async (req, res) => {
  try {
    const chefId = req.params.chefId;
    const limit = parseInt(req.query.limit) || 10;

    // Get recipes by chef ordered by average rating and number of ratings
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
        COUNT(rg.rating) as rating_count
      FROM recipe r
      LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id = ?
      GROUP BY r.recipe_id
      HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC
      LIMIT ?
    `, {
      replacements: [chefId, limit],
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      recipes: popularRecipes.map(recipe => ({
        recipe_id: recipe.recipe_id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        difficulty: recipe.difficulty,
        food_category: recipe.food_category,
        diet_type: recipe.diet_type,
        avg_rating: parseFloat(recipe.avg_rating).toFixed(1),
        rating_count: recipe.rating_count
      }))
    });
  } catch (error) {
    console.error('Error getting popular recipes by chef:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular recipes by chef',
      message: error.message
    });
  }
};
