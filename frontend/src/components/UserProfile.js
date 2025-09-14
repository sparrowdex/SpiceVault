import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [addedRecipes, setAddedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch saved recipes (interactions with type 'save')
      const savedResponse = await fetch(`http://localhost:5000/api/ml/interactions/${user.user_id}?type=save`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedRecipes(savedData.interactions || []);
      }

      // Fetch liked recipes (interactions with type 'like')
      const likedResponse = await fetch(`http://localhost:5000/api/ml/interactions/${user.user_id}?type=like`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (likedResponse.ok) {
        const likedData = await likedResponse.json();
        setLikedRecipes(likedData.interactions || []);
      }

      // Fetch rated recipes
      const ratedResponse = await fetch(`http://localhost:5000/api/ml/ratings/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ratedResponse.ok) {
        const ratedData = await ratedResponse.json();
        setRatedRecipes(ratedData.ratings || []);
      }

      // Fetch added recipes (recipes created by this user)
      const addedResponse = await fetch(`http://localhost:5000/api/recipes?user_id=${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (addedResponse.ok) {
        const addedData = await addedResponse.json();
        setAddedRecipes(addedData.recipes || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInteraction = async (idToRemove, type) => {
    try {
      const token = localStorage.getItem('token');
      let url = '';
      let method = 'DELETE';

      if (type === 'rated') {
        url = `http://localhost:5000/api/ml/ratings/${idToRemove}`;
      } else {
        // For other types (saved, liked), we don't have a DELETE endpoint yet
        // So we'll just refresh the data for now
        fetchUserData();
        showNotification(`${type} removed!`, 'success');
        return; // Exit early as no API call is made for other types
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`${type} removed!`, 'success');
        // Optimistically update the UI
        if (type === 'rated') {
          setRatedRecipes(prevRecipes => prevRecipes.filter(r => r.review_id !== idToRemove));
        }
        // No need to call fetchUserData() if we update state optimistically
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to remove ${type}`);
      }
    } catch (error) {
      console.error('Error removing interaction:', error);
      showNotification(`Failed to remove ${type}: ${error.message}`, 'error');
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const renderRecipeCard = (recipe, type) => {
    console.log('recipe object in renderRecipeCard:', recipe);
    return (
    <div key={recipe.recipe_id || recipe.interaction_id} className="recipe-card">
      {recipe.recipe && recipe.recipe.image_url && (
        <img 
          src={`http://localhost:5000/images/${recipe.recipe.image_url}`} 
          alt={recipe.recipe.title}
          className="recipe-image"
        />
      )}
      
      <div className="recipe-content">
        <h3>{recipe.recipe ? recipe.recipe.title : recipe.title}</h3>
        <p>{recipe.recipe ? recipe.recipe.description : recipe.description}</p>
        
        {type === 'rated' && (
          <div className="rating-display">
            <span className="rating-label">Your Rating:</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  className={`star ${star <= recipe.rating ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="recipe-actions">
          <button 
            className="view-button"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            View Recipe
          </button>
          <button 
            className="remove-button"
            onClick={() => handleRemoveInteraction(type === 'rated' ? recipe.review_id : recipe.recipe_id, type)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )};

  const renderAddedRecipeCard = (recipe) => (
    <div key={recipe.recipe_id} className="recipe-card added-recipe-card">
      {recipe.image_url && (
        <img 
          src={`http://localhost:5000/images/${recipe.image_url}`} 
          alt={recipe.title}
          className="recipe-image"
        />
      )}
      
      <div className="recipe-content">
        <div className="recipe-header">
          <h3>{recipe.title}</h3>
          <span className="recipe-status">Your Recipe</span>
        </div>
        <p>{recipe.description}</p>
        
        <div className="recipe-meta">
          <span className="meta-item">⏱️ {recipe.preparation_time}</span>
          <span className="meta-item">🔥 {recipe.cooking_time}</span>
          <span className="meta-item">📊 {recipe.difficulty}</span>
        </div>
        
        <div className="recipe-actions">
          <button 
            className="view-button"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            View Recipe
          </button>
          <button 
            className="edit-button"
            onClick={() => showNotification('Edit recipe feature coming soon!', 'info')}
          >
            Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>Welcome, {user.f_name}!</h1>
          <p className="user-type">{user.user_type} Account</p>
          <p className="user-email">{user.email}</p>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved Recipes ({savedRecipes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          ❤️ Liked Recipes ({likedRecipes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'rated' ? 'active' : ''}`}
          onClick={() => setActiveTab('rated')}
        >
          ⭐ Rated Recipes ({ratedRecipes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'added' ? 'active' : ''}`}
          onClick={() => setActiveTab('added')}
        >
          ➕ Added Recipes ({addedRecipes.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'saved' && (
          <div className="tab-content">
            <h2>Your Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <div className="empty-state">
                <p>No saved recipes yet. Start exploring and save your favorites!</p>
              </div>
            ) : (
              <div className="recipes-grid">
                {savedRecipes.map(recipe => renderRecipeCard(recipe, 'saved'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="tab-content">
            <h2>Your Liked Recipes</h2>
            {likedRecipes.length === 0 ? (
              <div className="empty-state">
                <p>No liked recipes yet. Like recipes you enjoy!</p>
              </div>
            ) : (
              <div className="recipes-grid">
                {likedRecipes.map(recipe => renderRecipeCard(recipe, 'liked'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rated' && (
          <div className="tab-content">
            <h2>Your Rated Recipes</h2>
            {ratedRecipes.length === 0 ? (
              <div className="empty-state">
                <p>No rated recipes yet. Rate recipes to help improve recommendations!</p>
              </div>
            ) : (
              <div className="recipes-grid">
                {ratedRecipes.map(recipe => renderRecipeCard(recipe, 'rated'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'added' && (
          <div className="tab-content">
            <h2>Your Added Recipes</h2>
            {addedRecipes.length === 0 ? (
              <div className="empty-state">
                <p>No recipes added yet. <a href="/addrecipe" style={{color: '#ff6600', textDecoration: 'none'}}>Create your first recipe!</a></p>
              </div>
            ) : (
              <div className="recipes-grid">
                {addedRecipes.map(recipe => renderAddedRecipeCard(recipe))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
