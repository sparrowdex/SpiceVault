# TODO: Add Backend Route for Fetching Reviews by Recipe ID

## Completed Tasks
- [x] Add new controller function `getRecipeRatings` in `backend/controllers/mlRecommendation.controller.js` to fetch all ratings for a given recipe_id
- [x] Add new route `GET /api/ml/ratings` in `backend/routes/mlRecommendation.routes.js` that accepts `recipe_id` query param and calls `getRecipeRatings`
- [x] Verify frontend token usage in `frontend/src/viewrecipe.js` (already confirmed correct)

## Completed Tasks
- [x] Test end-to-end review fetching and submission after backend changes
- [x] Debug and fix any remaining 401 Unauthorized errors if they persist
