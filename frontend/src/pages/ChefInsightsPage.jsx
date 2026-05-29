import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChefHat, Trophy, TrendingUp, Leaf, Eye, Heart, Save, Lightbulb, BarChart2, Globe, Settings as SettingsIcon } from 'lucide-react';

const ChefInsightsPage = ({ user }) => {
  const [userStats, setUserStats] = useState(null);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const navigate = useNavigate();

  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/chef-stats/${user.user_id}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/popular/${user.user_id}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/reviews/chef/${user.user_id}`, {
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

  // Generate personalized tips based on the chef's actual statistics
  const generateDynamicTips = (stats) => {
    if (!stats) return [];
    const tips = [];
    if (stats.totalRecipes < 5) tips.push("Keep publishing! Aim for at least 5 recipes to build a strong profile and attract more viewers.");
    if (parseFloat(stats.averageRating) < 4.0) tips.push("Focus on recipe clarity and detailed instructions to boost your average ratings.");
    if (stats.healthRecipes === 0) tips.push("Try adding vegetarian, vegan, or keto recipes! Health-conscious tags boost ML recommendations.");
    if (stats.recipesInTop10 === 0) tips.push("Engage with reviews and share your recipes to climb into the Global Rankings.");
    if (stats.engagementMetrics?.save > (stats.engagementMetrics?.like || 0) * 2) tips.push("Users are saving your recipes for later! Beautiful cover photos help convert saves into cooks.");
    
    if (tips.length < 3) {
      tips.push("Consistently engaging with your reviewers builds a loyal following.");
      tips.push("High-quality, well-lit cover photos drastically improve your recipe interaction rates.");
    }
    return tips.slice(0, 4);
  };

  const statCardClasses = "bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md";
  const statValueClasses = "text-3xl font-bold text-gray-800 mb-1";
  const engagementValueClasses = "text-3xl font-bold text-gray-800 mb-1";
  const statLabelClasses = "text-sm text-gray-500 font-medium";
  const sectionClasses = "bg-white border border-gray-100 rounded-2xl p-8 shadow-sm";
  const sectionTitleClasses = "text-xl font-bold text-gray-800 mb-6 flex items-center gap-3";

  if (!user || user.user_type !== 'chef') {
    return null;
  }

  return (
    <div className="w-full font-['Poppins',_sans-serif] bg-transparent">
      {loading ? (
        <div className="text-center py-[60px] px-5 text-[1.2rem] text-gray-500 bg-white border border-gray-100 rounded-2xl my-5 mx-auto max-w-[600px] shadow-sm">
          <p>Loading your insights...</p>
        </div>
      ) : error ? (
        <div className="text-center py-[60px] px-5 text-[1.2rem] text-gray-500 bg-white border border-gray-100 rounded-2xl my-5 mx-auto max-w-[600px] shadow-sm">
          <p className="text-red-500 bg-red-50 p-[15px] rounded-lg border border-red-100">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Public Profile Disclaimer & Navigation */}
          <div className="bg-gradient-to-r from-orange-50 to-[#fff5f0] border border-orange-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4 z-10">
              <div className="bg-white p-2 rounded-full shadow-sm"><Globe className="text-orange-500" size={24} /></div>
              <p className="text-orange-900 text-[14px] font-medium m-0 leading-relaxed">
                <strong>Disclaimer:</strong> Your recipes, stats, and articles are visible on your <a href={`/user/${user.user_id}`} onClick={(e) => {e.preventDefault(); navigate(`/user/${user.user_id}`)}} className="text-orange-600 font-bold hover:underline cursor-pointer">Public Profile</a>. You can always change your visibility in the privacy settings!
              </p>
            </div>
            <div className="flex gap-3 shrink-0 z-10 w-full md:w-auto">
              <button onClick={() => navigate('/settings')} className="flex-1 md:flex-none bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2">
                <SettingsIcon size={16} /> Settings
              </button>
              <button onClick={() => navigate(`/user/${user.user_id}`)} className="flex-1 md:flex-none bg-orange-500 text-white border-none hover:bg-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer hover:-translate-y-[1px] flex items-center justify-center gap-2">
                <Eye size={16} /> Preview Profile
              </button>
            </div>
          </div>

          {/* Performance Analytics Section */}
          <section className={`${sectionClasses} relative`}>
            <h2 className="text-xl font-bold text-gray-800 m-0 mb-6 flex items-center gap-3"><BarChart2 className="text-orange-500" size={24} /> Performance Analytics</h2>
            {userStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={statCardClasses}>
                  <Star className="w-8 h-8 mb-3 text-orange-500 mx-auto fill-current" />
                  <div className={statValueClasses}>{userStats.averageRating || 'N/A'}</div>
                  <div className={statLabelClasses}>Average Rating</div>
                </div>
                <div className={statCardClasses}>
                  <ChefHat className="w-8 h-8 mb-3 text-orange-500 mx-auto" />
                  <div className={statValueClasses}>{userStats.totalRecipes}</div>
                  <div className={statLabelClasses}>Total Recipes</div>
                </div>
                <div className={statCardClasses}>
                  <Trophy className="w-8 h-8 mb-3 text-orange-500 mx-auto" />
                  <div className={statValueClasses}>{userStats.recipesInTop10}</div>
                  <div className={statLabelClasses}>Recipes in Top 10</div>
                </div>
                <div className={statCardClasses}>
                  <TrendingUp className="w-8 h-8 mb-3 text-orange-500 mx-auto" />
                  <div className={statValueClasses}>{userStats.successScore}/100</div>
                  <div className={statLabelClasses}>Success Score</div>
                </div>
                <div className={statCardClasses}>
                  <Leaf className="w-8 h-8 mb-3 text-green-500 mx-auto" />
                  <div className={statValueClasses}>{userStats.healthRecipes}</div>
                  <div className={statLabelClasses}>Health Recipes</div>
                </div>
                <div className={statCardClasses}>
                  <Eye className="w-8 h-8 mb-3 text-blue-500 mx-auto" />
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['view'] !== undefined
                      ? userStats.engagementMetrics['view']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Views</div>
                </div>
                <div className={statCardClasses}>
                  <Heart className="w-8 h-8 mb-3 text-red-500 mx-auto fill-current" />
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['like'] !== undefined
                      ? userStats.engagementMetrics['like']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Likes</div>
                </div>
                <div className={statCardClasses}>
                  <Save className="w-8 h-8 mb-3 text-indigo-500 mx-auto" />
                  <div className={engagementValueClasses}>
                    {userStats.engagementMetrics && userStats.engagementMetrics['save'] !== undefined
                      ? userStats.engagementMetrics['save']
                      : 0}
                  </div>
                  <div className={statLabelClasses}>Saves</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading performance data...</p>
            )}
          </section>

          {/* Rating Trends Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}><TrendingUp className="text-orange-500" size={24} /> Rating Trends - last six months </h2>
            {userStats && userStats.ratingTrends && userStats.ratingTrends.length > 0 ? (
              <div className="flex items-end justify-center h-[220px] mt-8 gap-4 max-w-[800px] mx-auto">
                {[...userStats.ratingTrends].reverse().map((trend, index) => {
                  const heightPercentage = (parseFloat(trend.avgRating) / 5) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <span className="text-orange-500 font-bold text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1 group-hover:translate-y-0 flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 fill-current" /> {trend.avgRating}</span>
                      <div className="w-full max-w-[60px] bg-gray-50 rounded-t-xl relative h-full flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-xl transition-all duration-1000 ease-out shadow-sm" style={{ height: `${heightPercentage}%` }}></div>
                      </div>
                      <span className="text-gray-500 text-xs mt-3 font-semibold uppercase tracking-wider">{new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic">Not enough historical data to show trends yet.</p>
            )}
          </section>

          {/* Popular Recipes Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}><Trophy className="text-orange-500" size={24} /> Your Popular Recipes</h2>
            {popularRecipes.length === 0 ? (
              <p className="text-gray-500">No popular recipes currently. Keep creating amazing recipes!</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                {popularRecipes.map((recipe) => (
                  <div
                    key={recipe.recipe_id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    onClick={() => handleRecipeClick(recipe.recipe_id)}
                  >
                    <img
                      src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
                      alt={recipe.title}
                      className="w-full h-[180px] object-cover border-b border-gray-100"
                    />
                    <div className="p-5 text-center bg-white">
                      <h3 className="m-0 mb-2 text-lg font-bold text-gray-800 leading-tight truncate">{recipe.title}</h3>
                      <p className="m-0 text-orange-500 font-bold flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-current" /> {parseFloat(recipe.avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Reviews Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}><Heart className="text-orange-500" size={24} /> Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent reviews. Keep engaging with your audience!</p>
            ) : (
              <div className="flex flex-col items-center gap-5">
                <div className="w-full max-w-[800px]">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 min-h-[200px] flex items-center justify-center overflow-hidden relative">
                    <div className="absolute top-4 left-4 text-orange-200">
                      <Star size={40} className="fill-current opacity-50" />
                    </div>
                    <div key={currentReviewIndex} className="text-center w-full animate-[fadeIn_0.5s_ease-in-out] z-10">
                      <h4 className="text-lg font-bold text-gray-800 mb-3">Review for: {reviews[currentReviewIndex].recipe_title}</h4>
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-4 font-bold">
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} size={18} className={i < reviews[currentReviewIndex].rating ? "fill-current" : "fill-gray-200 text-gray-200"} />
                        ))}
                      </div>
                      <p className="italic text-gray-600 mb-4 leading-relaxed text-lg">"{reviews[currentReviewIndex].review_text}"</p>
                      <p className="text-orange-500 font-bold text-sm uppercase tracking-wider">- {reviews[currentReviewIndex].reviewer_name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-5 mt-2">
                  <button
                    className="bg-white text-gray-600 border border-gray-200 rounded-full w-10 h-10 text-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:text-orange-500 shadow-sm cursor-pointer"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === 0 ? reviews.length - 1 : currentReviewIndex - 1)}
                  >
                    ‹
                  </button>
                  <div className="flex gap-[8px]">
                    {reviews.slice(0, 5).map((_, index) => (
                      <span
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${index === currentReviewIndex ? 'bg-orange-500 w-6' : 'bg-gray-300'}`}
                        onClick={() => setCurrentReviewIndex(index)}
                      ></span>
                    ))}
                  </div>
                  <button
                    className="bg-white text-gray-600 border border-gray-200 rounded-full w-10 h-10 text-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:text-orange-500 shadow-sm cursor-pointer"
                    onClick={() => setCurrentReviewIndex(currentReviewIndex === reviews.length - 1 ? 0 : currentReviewIndex + 1)}
                  >
                    ›
                  </button>
                </div>
                <div className="mt-5">
                  <button
                    className="bg-orange-500 text-white border-none rounded-xl py-3 px-6 text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-orange-600 hover:-translate-y-0.5 shadow-sm"
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
            <h2 className={sectionTitleClasses}><Lightbulb className="text-orange-500" size={24} /> Smart AI Tips</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:grid-cols-1 gap-4">
              {generateDynamicTips(userStats).map((tip, index) => (
                <div key={index} className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                  <Lightbulb className="w-6 h-6 shrink-0 text-orange-500 mt-0.5" />
                  <p className="m-0 text-gray-700 leading-relaxed text-sm font-medium">{tip}</p>
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
