import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChefCertifiedRecipes.css';

const ChefCertifiedRecipes = ({ recipes }) => {
  const navigate = useNavigate();

  const getBadge = (rating) => {
    if (rating >= 4.3) {
      return <div className="badge excellent">Excellent Dish</div>;
    } else if (rating >= 3.5) {
      return <div className="badge good">Good Dish</div>;
    }
    return null;
  };

  return (
    <div className="chef-certified-recipes">
      {recipes.map((recipe) => (
        <div
          key={recipe.recipe_id}
          className="recipe-card"
          onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
        >
          {getBadge(recipe.avg_rating)}
          <img
            src={`http://localhost:5000/images/${recipe.image_url}`}
            alt={recipe.title}
            className="recipe-image"
          />
          <div className="recipe-title">{recipe.title}</div>
          <div className="chef-name">{recipe.chef_name}</div>
        </div>
      ))}
    </div>
  );
};

export default ChefCertifiedRecipes;
