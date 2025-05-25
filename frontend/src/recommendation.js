import React from 'react';
import './recommendation.css';

const Recommendations = () => {
  const recommendedRecipes = [
    { id: 1, title: 'Paneer Butter Masala', description: 'A rich, creamy Indian favorite.' },
    { id: 2, title: 'Thai Green Curry', description: 'A fragrant, spicy Thai dish.' },
    { id: 3, title: 'Lemon Garlic Pasta', description: 'A light, zesty Italian classic.' },
  ];

  return (
    <div className="recommendations-page">
      <h2>Recommended Recipes for You</h2>
      <div className="recommendation-list">
        {recommendedRecipes.map(recipe => (
          <div key={recipe.id} className="recommendation-card">
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <a href={`/recipes/${recipe.id}`}>View Recipe</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
