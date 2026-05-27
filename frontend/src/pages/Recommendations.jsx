import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterButtons from '../components/FilterButtons';

const Recommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationType, setRecommendationType] = useState(() => {
    // Load from localStorage or default to 'random'
    return localStorage.getItem('recommendationType') || 'random';
  });
  const [healthFocus, setHealthFocus] = useState('balanced');
  const [ratedRecipes, setRatedRecipes] = useState({}); // Track which recipes have been rated
  const [hoveredStar, setHoveredStar] = useState({}); // Track hover state for stars


  const navigate = useNavigate();

  const recommendationTypeOptions = [
    { value: 'random', label: 'Random' },
    { value: 'collaborative', label: 'For You' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'nutritional', label: 'By Health' },
  ];

  const healthFocusOptions = [
    { value: 'balanced', label: 'Balanced' },
    { value: 'excellent', label: 'Extremely Healthy' },
    { value: 'healthy', label: 'Very Healthy' },
  ];

  const fetchRecommendations = useCallback(async (type) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const params = new URLSearchParams({
        type,
        limit: '10'
      });

      if (type === 'nutritional') {
        params.append('healthFocus', healthFocus);
      }

      const response = await fetch(`http://localhost:5000/api/ml/recommendations/${user.user_id}?${params.toString()}`, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        // If fallback was used, show a subtle message
        if (data.fallback) {
          console.warn('Using fallback recommendations due to:', data.error);
        }
      } else {
        throw new Error('Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message);
      }
      // Set empty recommendations on error to prevent stale data
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user, healthFocus]);

  const handleRateRecipe = async (recipeId, rating) => {
    // Update state immediately for instant UI feedback
    setRatedRecipes(prev => ({
      ...prev,
      [recipeId]: rating
    }));

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
      if (!response.ok) {
        console.error('Failed to rate recipe');
        // Revert the state if the request failed
        setRatedRecipes(prev => {
          const newRated = { ...prev };
          delete newRated[recipeId];
          return newRated;
        });
      }
    } catch (err) {
      console.error('Error rating recipe:', err);
      // Revert the state if the request failed
      setRatedRecipes(prev => {
        const newRated = { ...prev };
        delete newRated[recipeId];
        return newRated;
      });
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
      await fetchRecommendations(recommendationType);
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
  }, [recommendationType, user, healthFocus, fetchRecommendations]);

  const handleRecommendationTypeChange = (newType) => {
    setRecommendationType(newType);
    localStorage.setItem('recommendationType', newType);
    setError(null);
  };

  const baseBtnClasses = "flex-1 p-[10px] border-2 border-transparent rounded-[6px] font-bold cursor-pointer transition-all duration-300 bg-transparent font-['ElegantWomanDemo',_cursive] flex justify-center items-center gap-[6px] shadow-none";

  return (
    <div className="p-[20px] font-['Poppins',_sans-serif]">
      <h2 className="font-['ElegantWomanDemo',_cursive] text-[1.8rem] font-bold bg-gradient-to-r from-[#d2691e] to-[#8b4513] bg-clip-text text-transparent py-[10px] rounded-[6px] text-center mb-[10px] block w-full">Recommended Recipes for You</h2>
      <p className="text-[1rem] text-[#555] mb-[20px] text-center">
        Discover recipes tailored just for you. Rate them to enhance future recommendations.
      </p>

      {/* Recommendation Type Selector */}
      <FilterButtons
        options={recommendationTypeOptions}
        selectedValue={recommendationType}
        onChange={handleRecommendationTypeChange}
        aria-label="Recommendation type filter"
      />

      {recommendationType === 'nutritional' && (
        <FilterButtons
          options={healthFocusOptions}
          selectedValue={healthFocus}
          onChange={setHealthFocus}
          aria-label="Health focus filter"
        />
      )}

      {/* Recommendations List */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[20px] mx-auto max-w-[1200px]">
        {loading ? (
          <p className="text-center text-[1.2rem] my-[40px] text-[#666]">Loading recommendations...</p>
        ) : error ? (
          <div className="text-red-500 text-center my-[20px] p-[15px] border border-[#ff6b6b] rounded-[8px] bg-[#ffeaea]">
            <p>{error}</p>
            <button
              onClick={() => fetchRecommendations(recommendationType)}
              className="bg-[#007bff] text-white border-none py-[8px] px-[16px] rounded-[4px] cursor-pointer mt-[10px] text-[14px] hover:bg-[#0056b3]"
            >
              Retry
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-[1.2rem] text-[#666] my-[40px] col-span-full">
            <p>No recommendations available at the moment.</p>
            <p>Try rating some recipes to get personalized recommendations!</p>
          </div>
        ) : (
          recommendations.map(recipe => (
            <div
              key={recipe.recipe_id}
              className="rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] mb-[10px] overflow-hidden flex flex-col max-w-[400px] w-full mx-auto bg-gradient-to-br from-[#f9f1e7] to-[#f0d9b5] p-[15px] box-border cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
            >
              {recipe.image_url && (
                <img
                  src={`http://localhost:5000/images/${recipe.image_url}`}
                  alt={recipe.title}
                  className="w-full h-[200px] object-cover rounded-t-[8px]"
                  onLoad={() => handleRecordInteraction(recipe.recipe_id, 'view')}
                />
              )}

              <div className="p-[15px] flex flex-col grow">
                <h3 className="font-['TrovicalCalmFree',_serif] text-[1.3rem] font-semibold mb-[10px] tracking-[0.05em] text-[#333]">{recipe.title}</h3>
                <p className="text-[0.95rem] text-[#555] mb-[10px] line-clamp-3 leading-relaxed">{recipe.description}</p>

                {/* ML Score and Reason */}
                <div className="mt-[10px] text-[0.9rem] text-[#666] flex flex-col gap-[5px]">
                  <span className="font-medium text-[#444]">Avg Rating: {recipe.avg_rating?.toFixed(1) || 'N/A'}</span>
                  {recommendationType === 'nutritional' && recipe.healthScore && (
                    <span className="text-[#28a745] font-bold">Health Score: {recipe.healthScore}/100 ({recipe.healthCategory})</span>
                  )}
                  <span className="italic text-[#777]">
                    {recommendationType === 'nutritional' ? recipe.reason : 'Based on user ratings'}
                  </span>
                </div>

                {/* Rating System */}
                <div className="my-[10px] border border-[#ddd] rounded-[8px] p-[10px] bg-[#fff8e1] flex flex-col items-start">
                  <label className="mb-[8px] font-semibold text-[#333]">Rate this recipe:</label>
                  <div className="flex gap-[5px] justify-start">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isRated = ratedRecipes[recipe.recipe_id] >= star;
                      const isHovered = hoveredStar[recipe.recipe_id] >= star;
                      const shouldFill = isHovered || isRated;

                      return (
                        <button
                          key={star}
                          className={`bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 relative ${shouldFill ? 'text-[#ffcc00] z-[2]' : 'text-[#ccc] z-[1]'}`}
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
                            className="w-[24px] h-[24px] stroke-current stroke-2 pointer-events-none"
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
                <div className="mt-auto flex gap-[10px]">
                  <button
                    className={`${baseBtnClasses} !border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081] hover:text-white hover:shadow-[0_4px_12px_rgba(255,64,129,0.6)]`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecordInteraction(recipe.recipe_id, 'like');
                    }}
                  >
                    Like
                  </button>
                  <button
                    className={`${baseBtnClasses} !border-[#2196f3] text-[#2196f3] hover:bg-[#2196f3] hover:text-white hover:shadow-[0_4px_12px_rgba(33,150,243,0.6)]`}
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
