import React from 'react';
import './UserInsightsBar.css';

const UserInsightsBar = ({ insights }) => {
  return (
    <div className="user-insights-bar">
      <div className="insight-item">
        <strong>{insights.savedRecipesCount}</strong> Saved Recipes
      </div>
      <div className="insight-item">
        <strong>{insights.likedRecipesCount}</strong> Liked Recipes
      </div>
      <div className="insight-item">
        <strong>{insights.ratedRecipesCount}</strong> Rated Recipes
      </div>
      <div className="insight-item">
        <strong>{insights.favoriteCategories.join(', ') || 'None'}</strong> Favorite Categories
      </div>
    </div>
  );
};

export default UserInsightsBar;
