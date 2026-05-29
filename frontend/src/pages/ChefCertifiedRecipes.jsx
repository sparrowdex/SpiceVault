import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChefCertifiedRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefCertifiedRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/chef-certified`);
        if (!response.ok) {
          throw new Error('Failed to fetch chef certified recipes');
        }
        const data = await response.json();
        if (data.success) {
          setRecipes(data.recipes);
        } else {
          throw new Error('Failed to get chef certified recipes');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChefCertifiedRecipes();
  }, []);

  const getBadge = (rating) => {
    if (rating >= 4.3) {
      return <div className="absolute top-[15px] left-[15px] px-[14px] py-[6px] rounded-[25px] text-[0.9rem] font-extrabold text-white select-none bg-gradient-to-tr from-[#56ab2f] to-[#a8e063] shadow-[0_3px_8px_rgba(86,171,47,0.6)]">Excellent Dish</div>;
    } else if (rating >= 3.5) {
      return <div className="absolute top-[15px] left-[15px] px-[14px] py-[6px] rounded-[25px] text-[0.9rem] font-extrabold text-white select-none bg-gradient-to-tr from-[#f6d365] to-[#fda085] shadow-[0_3px_8px_rgba(253,160,133,0.6)]">Good Dish</div>;
    }
    return null;
  };

  if (loading) {
    return <div className="text-center mt-[40px] text-[1.2rem] text-[#b35c00] font-semibold">Loading chef certified recipes...</div>;
  }

  if (error) {
    return <div className="text-center mt-[40px] text-red-600 text-[1.2rem] font-semibold">Error: {error}</div>;
  }

  return (
    <div className="p-[20px] bg-[#ffe5b4] min-h-screen">
      <h1 className="font-['ElegantWomanDemo',_cursive] text-[3rem] text-center mb-[10px] text-[#b35c00]">Chef Certified Recipes</h1>
      <p className="text-center text-[1.2rem] mb-[30px] text-[#6b4c00] max-w-[600px] mx-auto">Explore top-rated recipes created by our certified chefs.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[40px] gap-y-[30px] justify-items-center">
        {recipes.map((recipe) => (
          <div
            key={recipe.recipe_id}
            className="group bg-gradient-to-br from-[#fff8e1] to-[#ffe0b2] bg-[#fff3d4] border border-[#f0c27b] rounded-[15px] shadow-[0_8px_15px_rgba(255,165,0,0.3)] w-full max-w-[320px] pt-[15px] px-[15px] pb-[25px] relative cursor-pointer transition-all duration-300 hover:-translate-y-[8px] hover:shadow-[0_12px_20px_rgba(255,140,0,0.5)]"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            {getBadge(recipe.avg_rating)}
            <img
              src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
              alt={recipe.title}
              className="w-full h-[180px] object-cover rounded-[12px] mb-[15px] shadow-[0_4px_8px_rgba(255,165,0,0.4)] transition-transform duration-300 bg-[rgba(255,255,255,0.3)] group-hover:scale-105"
            />
            <div className="font-['TropicalCalm',_serif] text-[1.4rem] md:text-[1.8rem] text-center mb-[10px] text-[#6b3e00] drop-shadow-[1px_1px_2px_#f0c27b] whitespace-nowrap overflow-hidden text-ellipsis w-full">{recipe.title}</div>
            <div className="text-[0.9rem] md:text-[1rem] text-[#a0522d] text-center mb-[15px] font-bold before:content-['Chef:_'] before:font-black before:text-[#d2691e]">{recipe.chef_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChefCertifiedRecipesPage;
