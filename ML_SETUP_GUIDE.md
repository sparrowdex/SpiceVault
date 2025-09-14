# SpiceVault ML Integration Setup Guide

## 🚀 Overview

Your SpiceVault project has been successfully transformed into a machine learning-powered recommendation system! This guide will help you set up and run the ML features.

## 📋 What's Been Added

### Backend ML Features:
- **Collaborative Filtering**: User-based recommendations using rating patterns
- **Content-Based Filtering**: Recommendations based on recipe tags and user preferences
- **Hybrid Approach**: Combines both methods for optimal results
- **User Interaction Tracking**: Records views, likes, saves, and cooking activities
- **Rating System**: Enhanced rating and review functionality
- **ML Service**: Advanced recommendation algorithms with cosine similarity

### Frontend ML Features:
- **Smart Recommendations**: Real-time ML-powered recipe suggestions
- **Interactive Rating System**: Star-based rating with immediate feedback
- **User Interaction Tracking**: Automatic tracking of user behavior
- **Recommendation Types**: Switch between collaborative, content-based, and hybrid
- **ML Score Display**: Shows recommendation confidence scores
- **Enhanced UI**: Modern, responsive design with ML insights

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install new ML dependencies
npm install
```

### 2. Database Setup

Your existing database structure is compatible! The ML system uses your existing tables:
- `Reviews_Given` for ratings
- `Recipe_Occasion` for content-based filtering
- `Recipe_Allergies` for dietary preferences

### 3. Seed ML Training Data

```bash
# Run the ML data seeder
npm run seed:ml
```

This will add:
- 5 additional recipes with rich metadata
- 40+ ratings across different users
- 30+ user interactions (views, likes, saves)
- Enhanced recipe tags and occasions

### 4. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### 5. Test ML Features

1. **Navigate to Recommendations**: Go to `http://localhost:3000/recommendations`
2. **Try Different Recommendation Types**: Use the dropdown to switch between:
   - Hybrid (recommended)
   - Collaborative Filtering
   - Content-Based
3. **Rate Recipes**: Click the star ratings to provide feedback
4. **Interact with Recipes**: Use Like, Save, and View buttons
5. **Watch Recommendations Update**: Refresh to see how your interactions affect recommendations

## 🧠 How the ML System Works

### Collaborative Filtering
- Analyzes user rating patterns
- Finds users with similar tastes
- Recommends recipes liked by similar users
- Uses cosine similarity for user matching

### Content-Based Filtering
- Analyzes recipe tags (occasions, allergies, cuisine types)
- Builds user preference profiles from interaction history
- Recommends recipes with similar characteristics
- Uses weighted scoring for different tag categories

### Hybrid Approach
- Combines collaborative and content-based scores
- Collaborative filtering: 60% weight
- Content-based filtering: 40% weight
- Provides most accurate recommendations

## 📊 ML Data Structure

### User Interactions Tracked:
- **View**: When user views a recipe
- **Like**: When user likes a recipe
- **Save**: When user saves a recipe
- **Cook**: When user marks as cooked
- **Share**: When user shares a recipe

### Rating System:
- 1-5 star ratings
- Review text (optional)
- Timestamp tracking
- User-recipe uniqueness

### Recipe Features:
- Occasion tags (Family dinner, Italian night, etc.)
- Allergy information (Dairy, Gluten, etc.)
- Difficulty levels
- Preparation/cooking times
- Nutrition information

## 🔧 API Endpoints

### ML Recommendations:
- `GET /api/ml/recommendations/:userId?type=hybrid&limit=10`
- `GET /api/ml/similar/:recipeId`

### Ratings:
- `POST /api/ml/ratings`
- `GET /api/ml/ratings/:userId`

### Interactions:
- `POST /api/ml/interactions`
- `GET /api/ml/interactions/:userId`

### Tags:
- `POST /api/ml/recipes/:recipeId/tags`
- `GET /api/ml/recipes/:recipeId/tags`

## 🎯 Next Steps for Enhancement

### 1. Advanced ML Features:
- **Deep Learning**: Implement neural collaborative filtering
- **Real-time Learning**: Update models as users interact
- **A/B Testing**: Compare different recommendation algorithms
- **Cold Start Problem**: Handle new users and recipes

### 2. Data Enhancement:
- **Ingredient Analysis**: Use recipe ingredients for better content filtering
- **Nutritional Preferences**: Factor in dietary goals and restrictions
- **Seasonal Recommendations**: Consider time of year and availability
- **Cooking Skill Matching**: Match recipes to user skill levels

### 3. User Experience:
- **Personalization Dashboard**: Show user's taste profile
- **Recommendation Explanations**: Explain why recipes are recommended
- **Feedback Loop**: Allow users to improve recommendations
- **Social Features**: Friend recommendations and sharing

### 4. Performance Optimization:
- **Caching**: Cache recommendation results
- **Batch Processing**: Update ML models in background
- **Scalability**: Handle large user bases efficiently
- **Real-time Updates**: Instant recommendation updates

## 🐛 Troubleshooting

### Common Issues:

1. **No Recommendations**: 
   - Ensure ML data is seeded (`npm run seed:ml`)
   - Check if user has rating/interaction history
   - Verify database connections

2. **ML Service Errors**:
   - Check console logs for detailed error messages
   - Ensure all dependencies are installed
   - Verify database models are properly configured

3. **Frontend Not Loading**:
   - Check if backend is running on port 5000
   - Verify CORS settings
   - Check browser console for errors

### Debug Commands:

```bash
# Check ML data in database
mysql -u your_username -p spicevault
SELECT COUNT(*) FROM Reviews_Given;
SELECT COUNT(*) FROM Recipe_Occasion;

# Test ML API directly
curl http://localhost:5000/api/ml/recommendations/1?type=hybrid&limit=5
```

## 📈 Monitoring and Analytics

### Key Metrics to Track:
- **Recommendation Click-through Rate**: How often users click recommended recipes
- **Rating Distribution**: Quality of recommendations
- **User Engagement**: Time spent on recommended recipes
- **Conversion Rate**: How often recommendations lead to cooking

### Logging:
- All ML operations are logged to console
- User interactions are tracked in database
- Recommendation scores are stored for analysis

## 🎉 Congratulations!

Your SpiceVault project now has a sophisticated ML recommendation system! The system will learn from user behavior and provide increasingly accurate recommendations over time.

For questions or issues, check the console logs and ensure all dependencies are properly installed.
