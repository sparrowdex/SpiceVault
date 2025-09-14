import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './recommendation.css';

const Recommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationType, setRecommendationType] = useState('hybrid');
  const [ratedRecipes, setRatedRecipes] = useState({}); // Track which recipes have been rated
  const [hoveredStar, setHoveredStar] = useState({}); // Track hover state for stars

  // Use authenticated user ID or fallback to 1 for testing
  const userId = user ? user.user_id : 1;
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, [recommendationType, userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/ml/recommendations/${userId}?type=${recommendationType}&limit=10`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationTypeChange = (type) => {
    setRecommendationType(type);
  };

  const handleRateRecipe = async (recipeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/ml/ratings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          recipe_id: recipeId,
          rating: rating,
          review_text: `Rated ${rating} star${rating > 1 ? 's' : ''}`,
          datestamp: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      
      console.log('Rating response:', { status: response.status, data });

      if (response.ok && data.success) {
        // Update local state to show the rating
        setRatedRecipes(prev => ({
          ...prev,
          [recipeId]: rating
        }));
        
        // Show success message in a better way
        showNotification(`Rated ${rating} star${rating > 1 ? 's' : ''}! ⭐`, 'success');
        // Refresh recommendations after rating
        setTimeout(() => {
          fetchRecommendations();
        }, 1000);
      } else {
        console.error('Rating failed:', data);
        throw new Error(data.error || data.message || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      showNotification(`Failed to submit rating: ${err.message}`, 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    // Create a custom notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
      notification.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#f44336';
    } else {
      notification.style.backgroundColor = '#2196f3';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const handleRecordInteraction = async (recipeId, interactionType) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/ml/interactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          recipe_id: recipeId,
          interaction_type: interactionType,
          duration: interactionType === 'view' ? 30 : null
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Interaction recorded successfully');
        // Show feedback for certain interactions
        if (interactionType === 'like') {
          showNotification('Recipe liked! ❤️', 'success');
        } else if (interactionType === 'save') {
          showNotification('Recipe saved! 💾', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to record interaction');
      }
    } catch (err) {
      console.error('Error recording interaction:', err);
      showNotification(`Failed to ${interactionType} recipe`, 'error');
    }
  };

  const handleViewRecipe = (recipeId) => {
    // Record view interaction
    handleRecordInteraction(recipeId, 'view');
    // Navigate to recipe detail page
    navigate(`/recipes/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <h2>Recommended Recipes for You</h2>
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-page">
        <h2>Recommended Recipes for You</h2>
        <div className="error">Error: {error}</div>
        <button onClick={fetchRecommendations} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <h2>Recommended Recipes for You</h2>
      
      {/* Recommendation Type Selector */}
      <div className="recommendation-type-selector">
        <label>Recommendation Type:</label>
        <select 
          value={recommendationType} 
          onChange={(e) => handleRecommendationTypeChange(e.target.value)}
        >
          <option value="hybrid">Hybrid (Best of Both)</option>
          <option value="collaborative">Collaborative Filtering</option>
          <option value="content">Content-Based</option>
        </select>
      </div>

      {/* Recommendations List */}
      <div className="recommendation-list">
        {recommendations.length === 0 ? (
          <div className="no-recommendations">
            <p>No recommendations available at the moment.</p>
            <p>Try rating some recipes to get personalized recommendations!</p>
          </div>
        ) : (
          recommendations.map(recipe => (
            <div key={recipe.recipe_id} className="recommendation-card">
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
                  <span className="ml-score">Score: {recipe.score?.toFixed(2) || 'N/A'}</span>
                  <span className="ml-reason">{recipe.reason || 'Recommended for you'}</span>
                </div>

                {/* Rating System */}
                <div className="rating-section">
                  <label>Rate this recipe:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isRated = ratedRecipes[recipe.recipe_id] >= star;
                      const isHovered = hoveredStar[recipe.recipe_id] >= star;
                      const shouldFill = isRated || isHovered;
                      
                      return (
                        <button
                          key={star}
                          className={`star-button ${isRated ? 'rated' : ''}`}
                          onClick={() => handleRateRecipe(recipe.recipe_id, star)}
                          onMouseEnter={() => setHoveredStar(prev => ({
                            ...prev,
                            [recipe.recipe_id]: star
                          }))}
                          onMouseLeave={() => setHoveredStar(prev => ({
                            ...prev,
                            [recipe.recipe_id]: 0
                          }))}
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
                  <div className="rating-feedback">
                    {ratedRecipes[recipe.recipe_id] 
                      ? `You rated this recipe ${ratedRecipes[recipe.recipe_id]} star${ratedRecipes[recipe.recipe_id] > 1 ? 's' : ''}!`
                      : 'Click a star to rate this recipe'
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    className="view-button"
                    onClick={() => handleViewRecipe(recipe.recipe_id)}
                  >
                    👁️ View Recipe
                  </button>
                  <button 
                    className="like-button"
                    onClick={() => handleRecordInteraction(recipe.recipe_id, 'like')}
                  >
                    ❤️ Like
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => handleRecordInteraction(recipe.recipe_id, 'save')}
                  >
                    💾 Save
                  </button>
          </div>
      </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <button onClick={fetchRecommendations} className="refresh-button">
        🔄 Refresh Recommendations
      </button>
    </div>
  );
};

export default Recommendations;
