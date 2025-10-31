import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewSlideshow from '../components/ReviewSlideshow';
import './ChefInsightsPage.css';

const ChefInsightsPage = ({ user }) => {
  const [userStats, setUserStats] = useState(null);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
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
      const response = await fetch(`http://localhost:5000/api/recipes/reviews/chef/${user.user_id}`, {
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

  // Auto-rotate reviews every 7 seconds
  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prevIndex) =>
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

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
                    {userStats.engagementMetrics && userStats.engagementMetrics['view'] !== undefined
                      ? userStats.engagementMetrics['view']
                      : 0}
                  </div>
                  <div className="stat-label">Views</div>
                </div>
                <div className="stat-card engagement-card">
                  <div className="stat-value">
                    {userStats.engagementMetrics && userStats.engagementMetrics['like'] !== undefined
                      ? userStats.engagementMetrics['like']
                      : 0}
                  </div>
                  <div className="stat-label">Likes</div>
                </div>
                <div className="stat-card engagement-card">
                  <div className="stat-value">
                    {userStats.engagementMetrics && userStats.engagementMetrics['save'] !== undefined
                      ? userStats.engagementMetrics['save']
                      : 0}
                  </div>
                  <div className="stat-label">Saves</div>
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
              <div className="reviews-slideshow-container">
                <div className="reviews-slideshow">
                  <div className="review-card-large">
                    <div className="review-content-large">
                      <h4 className="recipe-title">Review for: {reviews[currentReviewIndex].recipe_title}</h4>
                      <p className="review-rating">⭐ {reviews[currentReviewIndex].rating}/5</p>
                      <p className="review-text">"{reviews[currentReviewIndex].review_text}"</p>
                      <p className="review-author">- {reviews[currentReviewIndex].reviewer_name}</p>
                    </div>
                  </div>
                </div>
                <div className="slideshow-controls">
                  <button
                    className="nav-button prev-button"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === 0 ? reviews.length - 1 : currentReviewIndex - 1)}
                  >
                    ‹
                  </button>
                  <div className="review-indicators">
                    {reviews.slice(0, 5).map((_, index) => (
                      <span
                        key={index}
                        className={`indicator ${index === currentReviewIndex ? 'active' : ''}`}
                        onClick={() => setCurrentReviewIndex(index)}
                      ></span>
                    ))}
                  </div>
                  <button
                    className="nav-button next-button"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === reviews.length - 1 ? 0 : currentReviewIndex + 1)}
                  >
                    ›
                  </button>
                </div>
                <div className="click-to-view">
                  <button
                    className="view-recipe-button"
                    onClick={() => handleRecipeClick(reviews[currentReviewIndex].recipe_id)}
                  >
                    View Recipe
                  </button>
                </div>
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
