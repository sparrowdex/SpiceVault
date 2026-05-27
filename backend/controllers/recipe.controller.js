// controllers/recipe.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { title, calories, protein, carbs, fat, fiber } = req.body;

    const existingRecipe = await prisma.recipe.findFirst({ where: { title: title } });

    if (existingRecipe) {
      return res.status(400).json({ success: false, error: 'A recipe with this title already exists.' });
    }

    const recipeData = { 
      ...req.body, 
      user_id: req.user.userId,
      chef_id: req.user.userId,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
      fiber: fiber ? parseInt(fiber) : null
    };

    const recipe = await prisma.recipe.create({ data: recipeData });
    res.status(201).json({ success: true, recipe, message: 'Recipe created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { difficulty, food_category, diet_type, search, user_id } = req.query;

    const whereClause = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (food_category) whereClause.food_category = food_category;
    if (diet_type) whereClause.diet_type = diet_type;
    if (search) whereClause.title = { contains: search };
    if (user_id) whereClause.user_id = parseInt(user_id);

    console.log("🔍 Prisma fetching All Recipes with filters:", whereClause);

    const [count, rows] = await prisma.$transaction([
      prisma.recipe.count({ where: whereClause }),
      prisma.recipe.findMany({
        where: whereClause,
        take: limit,
        skip: offset
      })
    ]);

    console.log(`✅ Prisma found ${count} total recipes, returning ${rows.length}`);

    res.json({
      totalRecipes: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      recipes: rows
    });
  } catch (error) {
    console.error("❌ getAllRecipes Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { recipe_id: parseInt(req.params.id) }
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a recipe by ID
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await prisma.recipe.update({
      where: { recipe_id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(recipe);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: "Recipe not found" });
    res.status(500).json({ error: error.message });
  }
};

// Delete a recipe by ID
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { recipe_id: parseInt(req.params.id) } });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, error: "You can only delete your own recipes" });
    }

    await prisma.recipe.delete({ where: { recipe_id: parseInt(req.params.id) } });
    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate a recipe
exports.rateRecipe = async (req, res) => {
  try {
    const { rating, user_id, review_text } = req.body;
    const recipe_id = parseInt(req.params.id);

    const existingRating = await prisma.review.findFirst({
      where: { recipe_id, user_id: parseInt(user_id) }
    });

    if (existingRating) {
      const updatedRating = await prisma.review.update({
        where: { review_id: existingRating.review_id },
        data: { rating: parseInt(rating), review_text }
      });
      return res.json({ message: "Rating updated successfully", rating: updatedRating });
    } else {
      const newRating = await prisma.review.create({
        data: { recipe_id, user_id: parseInt(user_id), rating: parseInt(rating), review_text }
      });
      return res.status(201).json({ message: "Rating added successfully", rating: newRating });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chef certified recipes with ratings and chef info
exports.getChefCertifiedRecipes = async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { chef_id: { not: null } },
      include: {
        chef: { select: { f_name: true, l_name: true } },
        reviews: { select: { rating: true } }
      }
    });

    const recipesWithAvgRating = recipes.map(recipe => {
      const ratings = recipe.reviews || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null;
      const { chef, reviews, ...recipeData } = recipe;
      return {
        ...recipeData,
        avg_rating: avgRating,
        chef_name: chef ? `${chef.f_name} ${chef.l_name}` : null
      };
    });

    res.json({ success: true, recipes: recipesWithAvgRating });
  } catch (error) {
    console.error('Error in getChefCertifiedRecipes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get popular recipes by a specific chef
exports.getPopularRecipesByChef = async (req, res) => {
  try {
    const chefId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 10;

    const popularRecipes = await prisma.$queryRaw`
      SELECT r.recipe_id, r.title, r.description, r.image_url, r.difficulty, r.food_category, r.diet_type, AVG(rg.rating) as avg_rating, COUNT(rg.rating) as rating_count
      FROM recipe r LEFT JOIN reviews_given rg ON r.recipe_id = rg.recipe_id
      WHERE r.chef_id = ${chefId} GROUP BY r.recipe_id HAVING COUNT(rg.rating) > 0
      ORDER BY AVG(rg.rating) DESC, COUNT(rg.rating) DESC LIMIT ${limit}
    `;

    res.json({
      success: true,
      recipes: popularRecipes.map(recipe => ({
        ...recipe,
        avg_rating: recipe.avg_rating ? parseFloat(recipe.avg_rating).toFixed(1) : "0.0",
        rating_count: Number(recipe.rating_count)
      }))
    });
  } catch (error) {
    console.error('Error getting popular recipes by chef:', error);
    res.status(500).json({ success: false, error: 'Failed to get popular recipes by chef', message: error.message });
  }
};

// Get reviews for a chef's recipes
exports.getReviewsByChef = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const reviews = await prisma.$queryRaw`
      SELECT rg.review_id, rg.recipe_id, rg.user_id as reviewer_id, rg.rating, rg.review_text, rg.datestamp, r.title as recipe_title, CONCAT(u.f_name, ' ', u.l_name) as reviewer_name
      FROM reviews_given rg JOIN recipe r ON rg.recipe_id = r.recipe_id JOIN user u ON rg.user_id = u.user_id
      WHERE r.chef_id = ${userId} ORDER BY rg.datestamp DESC LIMIT 10
    `;

    res.json({ success: true, reviews: reviews });
  } catch (error) {
    console.error('Error getting reviews by chef:', error);
    res.status(500).json({ success: false, error: 'Failed to get reviews by chef', message: error.message });
  }
};
