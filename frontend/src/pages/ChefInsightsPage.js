import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChefInsightsPage.css';

const ChefInsightsPage = ({ user }) => {
  const [userStats, setUserStats] = useState(null);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const tipsAndTricks = [
    "Keep adding diverse recipes to improve your ranking!",
    "Focus on quality to increase your average rating.",
    "Engage with reviewers to get more feedback.",
    "Use the app's features to promote your recipes.",
    "Regularly update your recipes to keep them fresh."
  ];

  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ml/chef-stats/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      setError(err.message);
    }
  }, [user.user_id]);

  const fetchPopularRecipes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipes/popular/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch popular recipes');
      }
      const data = await response.json();
      setPopularRecipes(data.recipes);
    } catch (err) {
      console.error(err.message);
    }
  }, [user.user_id]);

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/chef/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error(err.message);
    }
  }, [user.user_id]);

  useEffect(() => {
    if (user && user.user_type === 'chef') {
      setLoading(true);
      Promise.all([fetchUserStats(), fetchPopularRecipes(), fetchReviews()])
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user, fetchUserStats, fetchPopularRecipes, fetchReviews]);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  if (!user || user.user_type !== 'chef') {
    return (
      <div className="chef-insights-page">
        <div className="access-denied">
          <h2>Access Restricted</h2>
          <p>This page is only available for chefs. Please upgrade your account to access chef insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-insights-page">
      <h1 className="page-title">Chef Insights Dashboard</h1>

      {loading ? (
        <div className="loading-state">
          <p>Loading your insights...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="error-message">{error}</p>
        </div>
      ) : (
        <div className="insights-content">
          {/* Performance Analytics Section */}
          <section className="insights-section performance-section">
            <h2>Performance Analytics</h2>
            {userStats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{userStats.averageRating || 'N/A'}</div>
                  <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userStats.totalRecipes}</div>
                  <div className="stat-label">Total Recipes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userStats.recipesInTop10}</div>
                  <div className="stat-label">Recipes in Top 10</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userStats.successScore}/100</div>
                  <div className="stat-label">Success Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userStats.healthRecipes}</div>
                  <div className="stat-label">Health Recipes</div>
                </div>
                <div className="stat-card engagement-card">
                  <div className="stat-value">
                    {Object.entries(userStats.engagementMetrics || {}).map(([type, count]) => `${type}: ${count}`).join(', ') || 'No data'}
                  </div>
                  <div className="stat-label">Engagement</div>
                </div>
              </div>
            ) : (
              <p>Loading performance data...</p>
            )}
          </section>

          {/* Popular Recipes Section */}
          <section className="insights-section popular-recipes-section">
            <h2>Your Popular Recipes</h2>
            {popularRecipes.length === 0 ? (
              <p>No popular recipes currently. Keep creating amazing recipes!</p>
            ) : (
              <div className="popular-recipes-grid">
                {popularRecipes.map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="popular-recipe-card"
                    onClick={() => handleRecipeClick(recipe.recipe_id)}
                  >
                    <img
                      src={`http://localhost:5000/images/${recipe.image_url}`}
                      alt={recipe.title}
                      className="recipe-image"
                    />
                    <div className="recipe-details">
                      <h3>{recipe.title}</h3>
                      <p className="rating">⭐ {parseFloat(recipe.avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Reviews Section */}
          <section className="insights-section reviews-section">
            <h2>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p>No recent reviews. Keep engaging with your audience!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-content">
                      <p className="review-text">"{review.text}"</p>
                      <p className="review-author">- {review.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tips & Tricks Section */}
          <section className="insights-section tips-section">
            <h2>Tips & Tricks</h2>
            <div className="tips-grid">
              {tipsAndTricks.map((tip, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-icon">💡</div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ChefInsightsPage;
