import React from 'react';
import PopularRecipes from '../components/PopularRecipes';

const PopularRecipesPage = () => {
  return (
    <div>
      <h1 className="page-title">Chef Certified Recipes</h1>
      <p className="page-description">Explore top-rated recipes created by our certified chefs. Discover culinary masterpieces crafted by professional chefs in our community.</p>
      <PopularRecipes />
    </div>
  );
};

export default PopularRecipesPage;
