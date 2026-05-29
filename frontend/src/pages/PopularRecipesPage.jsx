import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PopularRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularRecipes = async () => {
      try {
        setLoading(true);
        // Fetch global popular recipes
        const response = await fetch('http://localhost:5000/api/ml/popular?limit=20');
        if (!response.ok) {
          throw new Error('Failed to fetch popular recipes');
        }
        const data = await response.json();
        if (data.success) {
          setRecipes(data.popularRecipes || data.recipes || []);
        } else {
          throw new Error('Failed to get popular recipes');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []);

  const getBadge = (rating) => {
    if (rating >= 4.3) {
      return <div className="absolute top-[16px] left-[15px] py-[7px] px-[16px] rounded-[10px_18px_18px_10px] text-[0.98rem] font-bold text-white z-10 shadow-[0_2px_6px_rgba(76,175,80,0.08)] tracking-[0.03em] drop-shadow-[0_1px_6px_rgba(88,44,10,0.14)] bg-gradient-to-br from-[#baf99b] to-[#47af49]">Excellent</div>;
    } else if (rating >= 3.5) {
      return <div className="absolute top-[16px] left-[15px] py-[7px] px-[16px] rounded-[10px_18px_18px_10px] text-[0.98rem] font-bold text-white z-10 shadow-[0_2px_6px_rgba(76,175,80,0.08)] tracking-[0.03em] drop-shadow-[0_1px_6px_rgba(88,44,10,0.14)] bg-gradient-to-br from-[#ffe192] to-[#f1ae00]">Good</div>;
    }
    return <div className="absolute top-[16px] left-[15px] py-[7px] px-[16px] rounded-[10px_18px_18px_10px] text-[0.98rem] font-bold text-white z-10 shadow-[0_2px_6px_rgba(76,175,80,0.08)] tracking-[0.03em] drop-shadow-[0_1px_6px_rgba(88,44,10,0.14)] bg-gradient-to-br from-[#ffb74d] to-[#ff9800]">Popular</div>;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#fff8ee] to-[#fee9c8] flex flex-col items-center py-[44px] pb-[64px]">
      <h1 className="font-['ElegantWomanDemo',_cursive] text-[2.5rem] text-[#ff6600] text-center mb-[20px]">Community Popular Recipes</h1>
      <p className="font-['TropicalCalm',_serif] text-[1.2rem] text-[#888] text-center mb-[30px] max-w-[700px]">
        Explore the most loved and highly-rated culinary masterpieces crafted by our community.
      </p>

      {loading ? (
        <div className="text-[#996600] text-[1.2rem] text-center my-[80px] font-['Poppins',_sans-serif]">Loading popular recipes...</div>
      ) : error ? (
        <div className="text-[#996600] text-[1.2rem] text-center my-[80px] font-['Poppins',_sans-serif]">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="text-[#996600] text-[1.2rem] text-center my-[80px] font-['Poppins',_sans-serif]">No popular recipes found.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-[24px] md:gap-[34px] w-full max-w-[1260px] justify-items-center px-[20px]">
          {recipes.map((recipe) => (
            <div 
              key={recipe.recipe_id} 
              className="bg-white rounded-[18px] shadow-[0_8px_28px_rgba(255,140,0,0.13)] overflow-hidden w-full max-w-full sm:max-w-[370px] min-h-[380px] md:min-h-[430px] flex flex-col transition-all duration-200 hover:shadow-[0_20px_48px_rgba(255,140,0,0.23)] hover:-translate-y-[7px] hover:scale-[1.014] cursor-pointer"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
            >
              <div 
                className="w-full h-[180px] md:h-[225px] bg-cover bg-center rounded-t-[18px] relative flex flex-col justify-end"
                style={{ backgroundImage: `url(${recipe.image_url?.startsWith('http') ? recipe.image_url : `http://localhost:5000/images/${recipe.image_url}`})` }}
              >
                {getBadge(recipe.avg_rating)}
                <div className="bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent w-full pt-[21px] px-[20px] pb-[14px] absolute left-0 bottom-0 z-[1] flex flex-col gap-[8px]">
                  <h3 className="font-['SweetHipster',_cursive] text-[1.4rem] md:text-[1.6rem] text-[#ffd481] drop-shadow-[0_0_12px_rgba(0,0,0,0.38)] font-semibold m-0 text-left z-[2] overflow-hidden text-ellipsis whitespace-nowrap">
                    {recipe.title}
                  </h3>
                </div>
              </div>
              <div className="p-[20px_26px_10px_26px] m-0 flex flex-col items-start rounded-b-[18px] grow bg-white">
                <p className="font-['TropicalCalm',_serif] text-[1rem] md:text-[1.13rem] font-medium text-[#b07724] text-left m-0">
                  {recipe.chef_name ? `By ${recipe.chef_name}` : 'Community Recipe'}
                </p>
                <p className="text-[#555] text-[0.85rem] md:text-[0.9rem] mt-[10px] line-clamp-3">
                  {recipe.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularRecipesPage;
