const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateUserRegistration = [
  body('f_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),

  body('l_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Validation rules for adding/editing recipes
const validateRecipe = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),

  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),

  body('cooking_time')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Cooking time must be between 1 and 1440 minutes'),

  body('servings')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Servings must be between 1 and 50'),

  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),

  handleValidationErrors
];

// Validation rules for ratings
const validateRating = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),

  body('recipe_id')
    .isInt({ min: 1 })
    .withMessage('Valid recipe ID is required'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('review_text')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review text must not exceed 500 characters'),

  handleValidationErrors
];

// Validation rules for user interactions
const validateInteraction = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),

  body('recipe_id')
    .isInt({ min: 1 })
    .withMessage('Valid recipe ID is required'),

  body('interaction_type')
    .isIn(['view', 'like', 'save', 'share', 'cook'])
    .withMessage('Invalid interaction type'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),

  handleValidationErrors
];

// Validation rules for recipe tags
const validateRecipeTags = [
  body('recipe_id')
    .isInt({ min: 1 })
    .withMessage('Valid recipe ID is required'),

  body('tags')
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*.name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters'),

  body('tags.*.category')
    .optional()
    .isIn(['cuisine', 'diet', 'ingredient', 'cooking_method', 'meal_type'])
    .withMessage('Invalid tag category'),

  handleValidationErrors
];

// Validation for query parameters
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

const validateRecipeId = [
  param('recipeId')
    .isInt({ min: 1 })
    .withMessage('Valid recipe ID is required'),

  handleValidationErrors
];

const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),

  handleValidationErrors
];

const validateReviewId = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Valid review ID is required'),

  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateRecipe,
  validateRating,
  validateInteraction,
  validateRecipeTags,
  validatePagination,
  validateRecipeId,
  validateUserId,
  validateReviewId,
  handleValidationErrors
};
