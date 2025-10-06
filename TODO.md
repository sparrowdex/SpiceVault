# Fix Recommend Recipes Page 500 Error

## Issues Identified
- Controller `getRecommendations` ignores the `type` query parameter sent by frontend
- Service `mlRecommendationService` lacks a `getRecommendations` method
- Returned recommendations lack `avg_rating` field expected by frontend

## Plan
1. Update `backend/controllers/mlRecommendation.controller.js`:
   - Read `type` from `req.query.type` (default to 'random')
   - Pass `type` to service method

2. Add `getRecommendations` method to `backend/services/mlRecommendationService.js`:
   - Accept `userId`, `type`, `limit` parameters
   - Switch based on type:
     - 'random': call `getFallbackRecommendations`
     - 'collaborative': call `generateUserBasedRecommendations`
     - 'hybrid': call `generateHybridRecommendations`
   - Ensure returned recipes include `avg_rating` by querying database

3. Test the endpoint to verify 500 error is resolved

## Status
- [x] Update controller
- [x] Add service method
- [ ] Test endpoint
