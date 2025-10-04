import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './recommendation.css';

const Recommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationType, setRecommendationType] = useState('random');
  const [ratedRecipes, setRatedRecipes] = useState({}); // Track which recipes have been rated
  const [hoveredStar, setHoveredStar] = useState({}); // Track hover state for stars
  const [selectedRecipe, setSelectedRecipe] = useState(null); // For modal display
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [popularUserRecipes, setPopularUserRecipes] = useState([]); // Popular recipes from user database

  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`http://localhost:5000/api/ml/recommendations/${user.user_id}?type=${recommendationType}&limit=10`, { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error('Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRateRecipe = async (recipeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ml/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          recipe_id: recipeId,
          rating,
        }),
      });
      if (response.ok) {
        setRatedRecipes(prev => ({
          ...prev,
          [recipeId]: rating
        }));
      } else {
        console.error('Failed to rate recipe');
      }
    } catch (err) {
      console.error('Error rating recipe:', err);
    }
  };

  const handleRecordInteraction = async (recipeId, interactionType) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/ml/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          recipe_id: recipeId,
          interaction_type: interactionType,
        }),
      });
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      await fetchRecommendations();
      await fetchPopularUserRecipes();
      // Fetch user's existing ratings
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`http://localhost:5000/api/ml/ratings/${user.user_id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.ratings.length > 0) {
            const initialRatedRecipes = {};
            data.ratings.forEach(r => {
              initialRatedRecipes[r.recipe_id] = r.rating;
            });
            setRatedRecipes(initialRatedRecipes);
          }
        }
      } catch (err) {
        console.error('Error fetching existing ratings:', err);
      }
    };
    fetchData();
  }, [recommendationType, user]);

  const fetchPopularUserRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ml/popular');
      if (!response.ok) {
        throw new Error(`Failed to fetch popular user recipes: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPopularUserRecipes(data.popularRecipes);
      } else {
        throw new Error('Failed to get popular user recipes');
      }
    } catch (err) {
      console.error('Error fetching popular user recipes:', err);
    }
  };

  return (
    <div className="recommendations-page">
      <h2 className="recommendation-title">Recommended Recipes for You</h2>
      <p className="recommendation-description">
        This page shows personalized recipe recommendations generated using a hybrid machine learning approach combining collaborative filtering and content-based filtering. You can rate recipes to improve your recommendations, like or save recipes, and view popular recipes by other chefs.
      </p>

      {/* Recommendations List */}
      <div className="recommendation-list">
        {recommendations.length === 0 ? (
          <div className="no-recommendations">
            <p>No recommendations available at the moment.</p>
            <p>Try rating some recipes to get personalized recommendations!</p>
          </div>
        ) : (
          recommendations.map(recipe => (
            <div
              key={recipe.recipe_id}
              className="recommendation-card"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
              style={{ cursor: 'pointer' }}
            >
              {recipe.image_url && (
                <img
                  src={`http://localhost:5000/images/${recipe.image_url}`}
                  alt={recipe.title}
                  className="recipe-image"
                  onLoad={() => handleRecordInteraction(recipe.recipe_id, 'view')}
                />
              )}

              <div className="recipe-content">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>

                {/* ML Score and Reason */}
                <div className="ml-info">
                  <span className="ml-score">Avg Rating: {recipe.avg_rating?.toFixed(1) || 'N/A'}</span>
                  <span className="ml-reason">Based on user ratings</span>
                </div>

                {/* Rating System */}
                <div className="rating-section">
                  <label>Rate this recipe:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isRated = ratedRecipes[recipe.recipe_id] >= star;
                      const isHovered = hoveredStar[recipe.recipe_id] >= star;
                      const shouldFill = isHovered || isRated;

                      return (
                        <button
                          key={star}
                          className={`star-button ${isRated ? 'rated' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateRecipe(recipe.recipe_id, star);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoveredStar(prev => ({
                              ...prev,
                              [recipe.recipe_id]: star
                            }));
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHoveredStar(prev => ({
                              ...prev,
                              [recipe.recipe_id]: 0
                            }));
                          }}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <svg
                            className="star-icon"
                            viewBox="0 0 24 24"
                            fill={shouldFill ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    className="like-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecordInteraction(recipe.recipe_id, 'like');
                    }}
                  >
                    Like
                  </button>
                  <button
                    className="save-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecordInteraction(recipe.recipe_id, 'save');
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recommendations;
