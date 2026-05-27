import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [addedRecipes, setAddedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'deleteAccount' or 'deleteInteractions'
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
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
  }, [user.user_id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
    <div key={recipe.recipe_id || recipe.interaction_id} className="bg-white rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 border border-[#e0e0e0] w-full max-w-[320px] hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] md:max-w-full">
      {recipe.recipe && recipe.recipe.image_url && (
        <img 
          src={`http://localhost:5000/images/${recipe.recipe.image_url}`} 
          alt={recipe.recipe.title}
          className="w-full h-[160px] object-cover border-b border-[#e0e0e0]"
        />
      )}
      
      <div className="p-[15px]">
        <h3 className="m-0 mb-[10px] text-[#333] text-[18px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{recipe.recipe ? recipe.recipe.title : recipe.title}</h3>
        <p className="text-[14px] text-[#666] my-[10px] mb-[15px] leading-[1.5] line-clamp-2 overflow-hidden text-ellipsis h-[42px]">{recipe.recipe ? recipe.recipe.description : recipe.description}</p>
        
        {type === 'rated' && (
          <div className="flex items-center gap-[10px] my-[15px] p-[10px] bg-[#f8f9fa] rounded-[8px]">
            <span className="font-medium text-[#333] text-[14px]">Your Rating:</span>
            <div className="flex gap-[2px]">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  className={`text-[16px] transition-colors duration-200 ${star <= recipe.rating ? 'text-[#ff6600]' : 'text-[#ddd]'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-[10px] mt-[15px] md:flex-col">
          <button 
            className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[1px]"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            View Recipe
          </button>
          <button 
            className="flex-1 py-[10px] px-[15px] border border-[#ddd] rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-[#f5f5f5] text-[#666] hover:bg-[#ffebee] hover:text-[#d32f2f] hover:border-[#ffcdd2]"
            onClick={() => handleRemoveInteraction(type === 'rated' ? recipe.review_id : recipe.recipe_id, type)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )};

  const renderAddedRecipeCard = (recipe) => (
    <div key={recipe.recipe_id} className="bg-white rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 border w-full max-w-[320px] hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] md:max-w-full border-2 border-[#ff6600] relative before:content-['👨‍🍳'] before:absolute before:top-[10px] before:right-[10px] before:bg-[#ff6600e6] before:text-white before:py-[5px] before:px-[8px] before:rounded-full before:text-[16px] before:z-[1]">
      {recipe.image_url && (
        <img 
          src={`http://localhost:5000/images/${recipe.image_url}`} 
          alt={recipe.title}
          className="w-full h-[160px] object-cover border-b border-[#e0e0e0]"
        />
      )}
      
      <div className="p-[15px]">
        <div className="flex justify-between items-center mb-[10px] md:flex-col md:items-start md:gap-[10px]">
          <h3 className="m-0 text-[#333] text-[18px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[65%]">{recipe.title}</h3>
          <span className="bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white py-[4px] px-[12px] rounded-[20px] text-[12px] font-semibold">Your Recipe</span>
        </div>
        <p className="text-[14px] text-[#666] my-[10px] mb-[15px] leading-[1.5] line-clamp-2 overflow-hidden text-ellipsis h-[42px]">{recipe.description}</p>
        
        <div className="flex gap-[15px] my-[15px] flex-wrap md:justify-center">
          <span className="flex items-center gap-[5px] text-[13px] text-[#666] bg-[#f8f9fa] py-[6px] px-[10px] rounded-[15px]">⏱️ {recipe.preparation_time}</span>
          <span className="flex items-center gap-[5px] text-[13px] text-[#666] bg-[#f8f9fa] py-[6px] px-[10px] rounded-[15px]">🔥 {recipe.cooking_time}</span>
          <span className="flex items-center gap-[5px] text-[13px] text-[#666] bg-[#f8f9fa] py-[6px] px-[10px] rounded-[15px]">📊 {recipe.difficulty}</span>
        </div>
        
        <div className="flex gap-[10px] mt-[15px] md:flex-col">
          <button 
            className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[1px]"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            View Recipe
          </button>
          <button 
            className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#4caf50] to-[#66bb6a] text-white hover:from-[#388e3c] hover:to-[#4caf50] hover:-translate-y-[1px]"
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
      <div className="max-w-[1200px] mx-auto p-[20px]">
        <div className="text-center py-[60px] px-[20px] text-[18px] text-[#666]">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-[20px] font-['Poppins',_sans-serif]">
      <div className="flex justify-between items-center bg-gradient-to-br from-[#ff6600] via-[#ff8533] to-[#cc6600] text-white p-[30px] rounded-[30px_/_60px] mb-[30px] shadow-[0_6px_20px_rgba(255,102,0,0.3)] filter drop-shadow-[0_0_5px_rgba(255,102,0,0.5)] transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(255,102,0,0.8)] md:flex-col md:gap-[20px] md:text-center">
        <div>
          <h1 className="m-0 mb-[10px] text-[32px] font-semibold"><span className="font-['MerivalRounded',_serif] text-[28px] font-semibold">Welcome,</span> <span className="font-['MerivalRounded',_serif] text-[32px] font-bold ml-[8px]">{user.f_name}!</span></h1>
          <p className="m-[5px_0] text-[16px] opacity-90">{user.user_type} Account</p>
          <p className="m-[5px_0_0_0] text-[14px] opacity-80">{user.email}</p>
        </div>
      <div>
          <button className="bg-transparent text-white border-2 border-[#f44336] py-[10px] px-[20px] rounded-[8px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#f44336] hover:-translate-y-[1px]" onClick={() => { setModalType('deleteInteractions'); setShowDeleteModal(true); }}>
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && modalType === 'deleteAccount' && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[2000]">
          <div className="bg-white p-[30px] rounded-[12px] max-w-[400px] w-[90%] shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-center">
            <h3 className="mt-0 mb-[15px] text-[22px] text-[#333]">Confirm Account Deletion</h3>
            <p className="text-[16px] mb-[25px] text-[#555]">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex justify-around gap-[15px]">
              <button 
                className="bg-transparent text-[#f44336] border-2 border-[#f44336] font-['TropicalCalm',_serif] flex-1 py-[10px] px-0 rounded-[8px] font-semibold cursor-pointer transition-all duration-300 max-w-[150px] text-center hover:bg-[#f44336] hover:text-white" 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5000/api/users/${user.user_id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    if (response.ok) {
                      showNotification('Account deleted successfully.', 'success');
                      onLogout();
                      navigate('/');
                    } else {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to delete account');
                    }
                  } catch (error) {
                    showNotification(`Error: ${error.message}`, 'error');
                  } finally {
                    setShowDeleteModal(false);
                    setModalType(null);
                  }
                }}
              >
                Confirm Delete
              </button>
              <button 
                className="bg-transparent text-[#f44336] border-2 border-[#f44336] font-['TropicalCalm',_serif] flex-1 py-[10px] px-0 rounded-[8px] font-semibold cursor-pointer transition-all duration-300 max-w-[150px] text-center hover:bg-[#f44336] hover:text-white" 
                onClick={() => { setShowDeleteModal(false); setModalType(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && modalType === 'deleteInteractions' && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[2000]">
          <div className="bg-white p-[30px] rounded-[12px] max-w-[400px] w-[90%] shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-center">
            <h3 className="mt-0 mb-[15px] text-[22px] text-[#333]">Delete All Interactions</h3>
            <p className="text-[16px] mb-[25px] text-[#555]">This will delete all your saved, liked, and other interactions. This action cannot be undone.</p>
            <div className="flex justify-around gap-[15px]">
              <button
                className="bg-transparent text-[#f44336] border-2 border-[#f44336] font-['TropicalCalm',_serif] flex-1 py-[10px] px-0 rounded-[8px] font-semibold cursor-pointer transition-all duration-300 max-w-[150px] text-center hover:bg-[#f44336] hover:text-white"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:5000/api/user-interactions/delete-all', {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    if (response.ok) {
                      showNotification('All interactions deleted successfully.', 'success');
                      // Refresh user data to reflect changes
                      await fetchUserData();
                      setModalType('deleteAccount');
                    } else {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to delete interactions');
                    }
                  } catch (error) {
                    showNotification(`Error: ${error.message}`, 'error');
                  }
                }}
              >
                Confirm Delete All Interactions
              </button>
              <button
                className="bg-transparent text-[#f44336] border-2 border-[#f44336] font-['TropicalCalm',_serif] flex-1 py-[10px] px-0 rounded-[8px] font-semibold cursor-pointer transition-all duration-300 max-w-[150px] text-center hover:bg-[#f44336] hover:text-white"
                onClick={() => { setShowDeleteModal(false); setModalType(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-[10px] mb-[30px] border-b-2 border-[#e0e0e0] md:flex-col md:gap-[5px]">
        <button 
          className={`bg-transparent border-none py-[15px] px-[40px] cursor-pointer text-[20px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] md:text-center md:rounded-[8px] md:border-b-0 md:border-l-[3px] ${activeTab === 'saved' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0] md:border-l-[#ff6600] md:border-b-transparent' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved Recipes ({savedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[40px] cursor-pointer text-[20px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] md:text-center md:rounded-[8px] md:border-b-0 md:border-l-[3px] ${activeTab === 'liked' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0] md:border-l-[#ff6600] md:border-b-transparent' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('liked')}
        >
          ❤️ Liked Recipes ({likedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[40px] cursor-pointer text-[20px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] md:text-center md:rounded-[8px] md:border-b-0 md:border-l-[3px] ${activeTab === 'rated' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0] md:border-l-[#ff6600] md:border-b-transparent' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('rated')}
        >
          ⭐ Rated Recipes ({ratedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[40px] cursor-pointer text-[20px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] md:text-center md:rounded-[8px] md:border-b-0 md:border-l-[3px] ${activeTab === 'added' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0] md:border-l-[#ff6600] md:border-b-transparent' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('added')}
        >
          ➕ Added Recipes ({addedRecipes.length})
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'saved' && (
          <div>
            <h2 className="mb-[20px] text-[24px] font-semibold font-['Nostalgia',_serif] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent">Your Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-[60px] px-[20px] text-[#666] bg-[#f8f9fa] rounded-[15px] border-2 border-dashed border-[#ccc]">
                <p className="text-[16px] m-0">No saved recipes yet. Start exploring and save your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[15px] justify-items-center md:grid-cols-1 md:gap-[10px]">
                {savedRecipes.map(recipe => renderRecipeCard(recipe, 'saved'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            <h2 className="mb-[20px] text-[24px] font-semibold font-['Nostalgia',_serif] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent">Your Liked Recipes</h2>
            {likedRecipes.length === 0 ? (
              <div className="text-center py-[60px] px-[20px] text-[#666] bg-[#f8f9fa] rounded-[15px] border-2 border-dashed border-[#ccc]">
                <p className="text-[16px] m-0">No liked recipes yet. Like recipes you enjoy!</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[15px] justify-items-center md:grid-cols-1 md:gap-[10px]">
                {likedRecipes.map(recipe => renderRecipeCard(recipe, 'liked'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rated' && (
          <div>
            <h2 className="mb-[20px] text-[24px] font-semibold font-['Nostalgia',_serif] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent">Your Rated Recipes</h2>
            {ratedRecipes.length === 0 ? (
              <div className="text-center py-[60px] px-[20px] text-[#666] bg-[#f8f9fa] rounded-[15px] border-2 border-dashed border-[#ccc]">
                <p className="text-[16px] m-0">No rated recipes yet. Rate recipes to help improve recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[15px] justify-items-center md:grid-cols-1 md:gap-[10px]">
                {ratedRecipes.map(recipe => renderRecipeCard(recipe, 'rated'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'added' && (
          <div>
            <h2 className="mb-[20px] text-[24px] font-semibold font-['Nostalgia',_serif] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent">Your Added Recipes</h2>
            {addedRecipes.length === 0 ? (
              <div className="text-center py-[60px] px-[20px] text-[#666] bg-[#f8f9fa] rounded-[15px] border-2 border-dashed border-[#ccc]">
                <p className="text-[16px] m-0">No recipes added yet. <a href="/addrecipe" className="text-[#ff6600] no-underline hover:underline">Create your first recipe!</a></p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[15px] justify-items-center md:grid-cols-1 md:gap-[10px]">
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
