import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GlobalRankingsPage = ({ user }) => {
  const [rankings, setRankings] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRankings = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ml/global-rankings?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch global rankings');
      }
      const data = await response.json();
      setRankings(data.rankings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRankings(period);
    }
  }, [user, period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  const topThree = rankings.slice(0, 3);
  const remainingRankings = rankings.slice(3);

  const hasNoDailyChanges = period === 'daily' && (rankings.length === 0 || rankings.every(recipe => recipe.rankChange === 0));

  return (
    <div className="max-w-[1200px] mx-auto p-5 font-['Poppins',_sans-serif]">
      <h1 className="text-center text-[2.5rem] md:text-[2rem] mb-[30px] font-['ElegantWomanDemo',_cursive] bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent font-bold">Global Recipe Rankings</h1>

      {/* Period Filter */}
      <div className="flex justify-center gap-5 mb-[40px] flex-wrap md:gap-[15px]">
        <label className="flex items-center gap-[8px] cursor-pointer text-[1.1rem] md:text-[1rem] font-medium text-[#555] transition-colors duration-300 hover:text-[#ff6b35]">
          <input
            className="accent-[#ff6b35]"
            type="radio"
            value="daily"
            checked={period === 'daily'}
            onChange={handlePeriodChange}
          />
          Daily
        </label>
        <label className="flex items-center gap-[8px] cursor-pointer text-[1.1rem] md:text-[1rem] font-medium text-[#555] transition-colors duration-300 hover:text-[#ff6b35]">
          <input
            className="accent-[#ff6b35]"
            type="radio"
            value="weekly"
            checked={period === 'weekly'}
            onChange={handlePeriodChange}
          />
          Weekly
        </label>
        <label className="flex items-center gap-[8px] cursor-pointer text-[1.1rem] md:text-[1rem] font-medium text-[#555] transition-colors duration-300 hover:text-[#ff6b35]">
          <input
            className="accent-[#ff6b35]"
            type="radio"
            value="monthly"
            checked={period === 'monthly'}
            onChange={handlePeriodChange}
          />
          Monthly
        </label>
        <label className="flex items-center gap-[8px] cursor-pointer text-[1.1rem] md:text-[1rem] font-medium text-[#555] transition-colors duration-300 hover:text-[#ff6b35]">
          <input
            className="accent-[#ff6b35]"
            type="radio"
            value="all"
            checked={period === 'all'}
            onChange={handlePeriodChange}
          />
          All Time
        </label>
      </div>

      {loading ? (
        <p className="text-center text-[1.2rem] my-[50px]">Loading rankings...</p>
      ) : error ? (
        <p className="text-center text-[1.2rem] my-[50px] text-[#e74c3c]">{error}</p>
      ) : hasNoDailyChanges ? (
        <div className="text-center text-[1.5rem] md:text-[1.2rem] text-[#ff6600] p-[40px] md:p-[30px_20px] bg-[#fff8f0] rounded-[10px] my-[40px] mx-auto md:m-[20px] max-w-[600px] font-semibold border-2 border-dashed border-[#ff6600] leading-[1.4]">
          No changes in rankings today. Make a rating on a recipe to see daily rankings!
        </div>
      ) : (
        <>
          {/* Podium Section */}
          {topThree.length >= 3 && (
            <div className="mb-[60px] px-2">
              <div className="flex flex-row justify-center items-end gap-[10px] md:gap-[20px] mb-[40px] relative max-w-[800px] mx-auto">
                
                {/* 2nd Place */}
                <div className="flex flex-col items-center flex-1 min-w-[0]">
                  <div className="bg-gradient-to-br from-[#c0c0c0] to-[#e8e8e8] h-[70px] md:h-[90px] rounded-t-[15px] p-[10px] md:p-[15px] mb-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-center w-full">
                    <span className="text-[1.5rem] md:text-[2rem] font-bold text-[#333] block">2</span>
                  </div>
                  <div 
                    className="bg-white rounded-[12px] md:rounded-[15px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] w-full" 
                    onClick={() => handleRecipeClick(topThree[1].recipe_id)}
                  >
                    <img
                      src={`http://localhost:5000/images/${topThree[1].image_url}`}
                      alt={topThree[1].title}
                      className="w-full h-[110px] md:h-[180px] object-cover"
                    />
                    <div className="p-[10px] md:p-[15px] text-center">
                      <h3 className="m-0 mb-[4px] md:mb-[8px] text-[0.9rem] md:text-[1.2rem] font-semibold text-[#333] leading-[1.2] line-clamp-2 min-h-[2.4em]">
                        {topThree[1].title}
                      </h3>
                      <p className="m-0 text-[0.85rem] md:text-[1.1rem] text-[#ff6b35] font-medium">⭐ {parseFloat(topThree[1].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center flex-1 min-w-[0]">
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#ffed4e] h-[95px] md:h-[120px] flex flex-col justify-center rounded-t-[15px] p-[10px] md:p-[15px] mb-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-center w-full">
                    <span className="text-[1.5rem] md:text-[2rem] font-bold text-[#333] block leading-none">1</span>
                    <div className="text-[1.2rem] md:text-[2rem] mt-[2px] md:mt-[5px]">👑</div>
                  </div>
                  <div 
                    className="bg-white rounded-[12px] md:rounded-[15px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] w-full" 
                    onClick={() => handleRecipeClick(topThree[0].recipe_id)}
                  >
                    <img
                      src={`http://localhost:5000/images/${topThree[0].image_url}`}
                      alt={topThree[0].title}
                      className="w-full h-[125px] md:h-[200px] object-cover"
                    />
                    <div className="p-[10px] md:p-[15px] text-center">
                      <h3 className="m-0 mb-[4px] md:mb-[8px] text-[0.9rem] md:text-[1.2rem] font-semibold text-[#333] leading-[1.2] line-clamp-2 min-h-[2.4em]">
                        {topThree[0].title}
                      </h3>
                      <p className="m-0 text-[0.85rem] md:text-[1.1rem] text-[#ff6b35] font-medium">⭐ {parseFloat(topThree[0].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center flex-1 min-w-[0]">
                  <div className="bg-gradient-to-br from-[#cd7f32] to-[#d4af37] h-[55px] md:h-[70px] rounded-t-[15px] p-[10px] md:p-[15px] mb-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-center w-full">
                    <span className="text-[1.5rem] md:text-[2rem] font-bold text-[#333] block">3</span>
                  </div>
                  <div 
                    className="bg-white rounded-[12px] md:rounded-[15px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] w-full" 
                    onClick={() => handleRecipeClick(topThree[2].recipe_id)}
                  >
                    <img
                      src={`http://localhost:5000/images/${topThree[2].image_url}`}
                      alt={topThree[2].title}
                      className="w-full h-[100px] md:h-[160px] object-cover"
                    />
                    <div className="p-[10px] md:p-[15px] text-center">
                      <h3 className="m-0 mb-[4px] md:mb-[8px] text-[0.9rem] md:text-[1.2rem] font-semibold text-[#333] leading-[1.2] line-clamp-2 min-h-[2.4em]">
                        {topThree[2].title}
                      </h3>
                      <p className="m-0 text-[0.85rem] md:text-[1.1rem] text-[#ff6b35] font-medium">⭐ {parseFloat(topThree[2].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Full Rankings List */}
          <div className="mb-[30px]">
            <h2 className="text-center text-[2rem] md:text-[1.5rem] mb-[30px] font-['ElegantWomanDemo',_cursive] bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent font-semibold drop-shadow-[1px_1px_2px_rgba(139,69,19,0.3)]">Complete Rankings</h2>
            <div className="flex flex-col gap-[10px]">
              {remainingRankings.map((recipe, index) => (
                <div
                  key={recipe.recipe_id}
                  className={`flex items-center bg-white rounded-[8px] py-[10px] px-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] ${recipe.chef_id === user?.user_id ? 'border-l-[4px] border-l-[#ff6b35] bg-gradient-to-r from-[rgba(255,107,53,0.05)] to-white' : ''}`}
                  onClick={() => handleRecipeClick(recipe.recipe_id)}
                >
                  <div className="text-[1.2rem] font-bold text-[#666] min-w-[30px] text-center mr-[15px]">{index + 4}</div>
                  <img
                    src={`http://localhost:5000/images/${recipe.image_url}`}
                    alt={recipe.title}
                    className="w-[50px] h-[50px] rounded-[6px] object-cover mr-[15px]"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="m-0 text-[1rem] font-semibold text-[#333] leading-tight">{recipe.title}</h4>
                    <p className="m-0 text-[0.85rem] text-[#ff6b35] font-medium mt-[4px]">⭐ {parseFloat(recipe.avg_rating).toFixed(1)}</p>
                  </div>
                  <div className="flex justify-center items-center w-[30px] ml-[15px]">
                    {recipe.rankChange > 0 ? (
                      <span className="text-[#27ae60] text-[1.2rem]">▲</span>
                    ) : recipe.rankChange < 0 ? (
                      <span className="text-[#e74c3c] text-[1.2rem]">▼</span>
                    ) : (
                      <span className="text-[#95a5a6] text-[1.5rem] leading-none font-black">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalRankingsPage;