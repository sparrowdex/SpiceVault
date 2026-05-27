import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewSlideshow from '../components/ReviewSlideshow';

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

  const statCardClasses = "bg-[#f9f0e0] border border-dashed border-[#A0522D] rounded-lg p-5 md:p-[15px] text-center shadow-[0_2px_8px_rgba(139,69,19,0.2),inset_0_1px_0_rgba(218,165,32,0.1)] md:shadow-[0_2px_6px_rgba(139,69,19,0.2)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(139,69,19,0.3),inset_0_1px_0_rgba(218,165,32,0.2)]";
  const statValueClasses = "text-[2rem] md:text-[1.5rem] font-bold text-[#DAA520] mb-[8px] drop-shadow-[1px_1px_1px_rgba(139,69,19,0.2)]";
  const engagementValueClasses = "text-[2rem] md:text-[1.5rem] font-bold text-[#DAA520] leading-[1.2] drop-shadow-[1px_1px_1px_rgba(139,69,19,0.2)]";
  const statLabelClasses = "text-[1rem] text-[#5D4037] font-medium";
  const sectionClasses = "bg-transparent border-2 border-[#8B4513] rounded-lg p-[30px] md:p-5 shadow-[0_4px_12px_rgba(139,69,19,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]";
  const sectionTitleClasses = "text-[1.8rem] md:text-[1.5rem] mb-[25px] font-['ElegantWomanDemo',_cursive] bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent font-semibold border-b-2 border-b-[#A0522D] pb-[10px] drop-shadow-[1px_1px_2px_rgba(139,69,19,0.3)]";

  if (!user || user.user_type !== 'chef') {
    return (
      <div className="max-w-[1200px] mx-auto p-5 font-['Georgia',_serif] bg-transparent min-h-screen md:p-[15px]">
        <div className="text-center py-[60px] px-5 bg-gradient-to-br from-[#f4e4bc] to-[#d7c4a3] border-2 border-[#8B4513] rounded-lg shadow-[0_4px_12px_rgba(139,69,19,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] my-5 mx-auto max-w-[600px]">
          <h2 className="text-[#DAA520] mb-5 text-[2rem] font-['ElegantWomanDemo',_cursive] bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent drop-shadow-[1px_1px_2px_rgba(139,69,19,0.3)]">Access Restricted</h2>
          <p className="text-[1.1rem] text-[#5D4037] leading-[1.6]">This page is only available for chefs. Please upgrade your account to access chef insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-5 font-['Georgia',_serif] bg-transparent min-h-screen md:p-[15px]">
      <h1 className="text-center text-[2.5rem] md:text-[2rem] mb-[40px] md:mb-[30px] font-['ElegantWomanDemo',_cursive] bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent font-bold drop-shadow-[1px_1px_2px_rgba(139,69,19,0.3)]">Chef Insights Dashboard</h1>

      {loading ? (
        <div className="text-center py-[60px] px-5 text-[1.2rem] text-[#5D4037] bg-gradient-to-br from-[#f4e4bc] to-[#d7c4a3] border border-[#8B4513] rounded-lg my-5 mx-auto max-w-[600px]">
          <p>Loading your insights...</p>
        </div>
      ) : error ? (
        <div className="text-center py-[60px] px-5 text-[1.2rem] text-[#5D4037] bg-gradient-to-br from-[#f4e4bc] to-[#d7c4a3] border border-[#8B4513] rounded-lg my-5 mx-auto max-w-[600px]">
          <p className="text-[#8B4513] bg-[#f9f0e0] p-[15px] rounded-lg border-l-[3px] border-l-[#8B4513] border border-dashed border-[#A0522D]">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[40px]">
          {/* Performance Analytics Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Performance Analytics</h2>
            {userStats ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 md:gap-[15px]">
                <div className={statCardClasses}>
                  <div className={statValueClasses}>{userStats.averageRating || 'N/A'}</div>
                  <div className={statLabelClasses}>Average Rating</div>
                </div>
                <div className={statCardClasses}>
                  <div className={statValueClasses}>{userStats.totalRecipes}</div>
                  <div className={statLabelClasses}>Total Recipes</div>
                </div>
                <div className={statCardClasses}>
                  <div className={statValueClasses}>{userStats.recipesInTop10}</div>
                  <div className={statLabelClasses}>Recipes in Top 10</div>
                </div>
                <div className={statCardClasses}>
                  <div className={statValueClasses}>{userStats.successScore}/100</div>
                  <div className={statLabelClasses}>Success Score</div>
                </div>
                <div className={statCardClasses}>
                  <div className={statValueClasses}>{userStats.healthRecipes}</div>
                  <div className={statLabelClasses}>Health Recipes</div>
                </div>
                <div className={statCardClasses}>
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['view'] !== undefined
                      ? userStats.engagementMetrics['view']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Views</div>
                </div>
                <div className={statCardClasses}>
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['like'] !== undefined
                      ? userStats.engagementMetrics['like']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Likes</div>
                </div>
                <div className={statCardClasses}>
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['save'] !== undefined
                      ? userStats.engagementMetrics['save']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Saves</div>
                </div>
              </div>
            ) : (
              <p>Loading performance data...</p>
            )}
          </section>

          {/* Popular Recipes Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Your Popular Recipes</h2>
            {popularRecipes.length === 0 ? (
              <p>No popular recipes currently. Keep creating amazing recipes!</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 md:gap-[15px]">
                {popularRecipes.map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="bg-[#f9f0e0] border border-[#8B4513] rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(139,69,19,0.2)] md:shadow-[0_2px_6px_rgba(139,69,19,0.2)] cursor-pointer transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]"
                    onClick={() => handleRecipeClick(recipe.recipe_id)}
                  >
                    <img
                      src={`http://localhost:5000/images/${recipe.image_url}`}
                      alt={recipe.title}
                      className="w-full h-[180px] object-cover border-b border-b-[#A0522D]"
                    />
                    <div className="p-[15px] text-center">
                      <h3 className="m-0 mb-[8px] text-[1.2rem] font-semibold text-[#5D4037] leading-[1.3] font-['Georgia',_serif]">{recipe.title}</h3>
                      <p className="m-0 text-[1.1rem] text-[#DAA520] font-medium">⭐ {parseFloat(recipe.avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Reviews Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p>No recent reviews. Keep engaging with your audience!</p>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="w-full max-w-[800px]">
                  <div className="bg-[#f0e6d6] border-2 border-[#A0522D] rounded-[12px] p-[30px] border-l-[4px] border-l-[#8B4513] shadow-[0_4px_12px_rgba(139,69,19,0.2)] min-h-[200px] flex items-center justify-center">
                    <div className="text-center w-full">
                      <h4 className="text-[1.4rem] font-semibold text-[#5D4037] mb-[15px] font-['Georgia',_serif]">Review for: {reviews[currentReviewIndex].recipe_title}</h4>
                      <p className="text-[1.2rem] text-[#DAA520] mb-[15px] font-medium">⭐ {reviews[currentReviewIndex].rating}/5</p>
                      <p className="italic text-[#5D4037] mb-[15px] leading-[1.6] text-[1.1rem] font-['Georgia',_serif]">"{reviews[currentReviewIndex].review_text}"</p>
                      <p className="text-[#8B4513] font-semibold text-[1rem] font-['Georgia',_serif]">- {reviews[currentReviewIndex].reviewer_name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-5 mt-5">
                  <button
                    className="bg-[#8B4513] text-white border-none rounded-full w-[40px] h-[40px] text-[1.5rem] cursor-pointer flex items-center justify-center transition-all duration-300 shadow-[0_2px_6px_rgba(139,69,19,0.3)] hover:bg-[#A0522D] hover:scale-110"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === 0 ? reviews.length - 1 : currentReviewIndex - 1)}
                  >
                    ‹
                  </button>
                  <div className="flex gap-[8px]">
                    {reviews.slice(0, 5).map((_, index) => (
                      <span
                        key={index}
                        className={`w-[12px] h-[12px] rounded-full cursor-pointer transition-all duration-300 ${index === currentReviewIndex ? 'bg-[#8B4513] scale-125' : 'bg-[#D7C4A3]'}`}
                        onClick={() => setCurrentReviewIndex(index)}
                      ></span>
                    ))}
                  </div>
                  <button
                    className="bg-[#8B4513] text-white border-none rounded-full w-[40px] h-[40px] text-[1.5rem] cursor-pointer flex items-center justify-center transition-all duration-300 shadow-[0_2px_6px_rgba(139,69,19,0.3)] hover:bg-[#A0522D] hover:scale-110"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === reviews.length - 1 ? 0 : currentReviewIndex + 1)}
                  >
                    ›
                  </button>
                </div>
                <div className="mt-5">
                  <button
                    className="bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white border-none rounded-lg py-[12px] px-[24px] text-[1rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(139,69,19,0.3)] font-['Georgia',_serif] hover:from-[#A0522D] hover:to-[#CD853F] hover:-translate-y-[2px]"
                    onClick={() => handleRecipeClick(reviews[currentReviewIndex].recipe_id)}
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Tips & Tricks Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Tips & Tricks</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:grid-cols-1 gap-5 md:gap-[15px]">
              {tipsAndTricks.map((tip, index) => (
                <div key={index} className="bg-gradient-to-br from-[#e8d8b9] to-[#d7c4a3] border border-[#A0522D] rounded-lg p-5 md:p-[15px] flex items-start gap-[15px] shadow-[0_2px_8px_rgba(139,69,19,0.2),inset_0_1px_0_rgba(218,165,32,0.1)] md:shadow-[0_2px_6px_rgba(139,69,19,0.2)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(139,69,19,0.3),inset_0_1px_0_rgba(218,165,32,0.2)]">
                  <div className="text-[1.5rem] shrink-0 text-[#8B4513]">💡</div>
                  <p className="m-0 text-[#5D4037] leading-[1.5] text-[1rem] font-['Georgia',_serif]">{tip}</p>
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
