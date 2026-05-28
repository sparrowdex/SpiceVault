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
        fetchUserData();
        showNotification(`${type} removed!`, 'success');
        return;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification(`${type} removed!`, 'success');
        if (type === 'rated') {
          setRatedRecipes(prevRecipes => prevRecipes.filter(r => r.review_id !== idToRemove));
        }
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
    notification.className = `notification notification-${type} fixed top-5 right-5 p-[15px_20px] rounded-lg text-white font-medium z-[1000] max-w-[300px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transform translate-x-full transition-transform duration-300`;
    notification.textContent = message;
    
    notification.style.cssText = `
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
    return (
      <div key={recipe.recipe_id || recipe.interaction_id} className="bg-white rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 border border-[#e0e0e0] w-full hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between">
        <div>
          {recipe.recipe && recipe.recipe.image_url && (
            <img 
              src={recipe.recipe.image_url.startsWith('http') ? recipe.recipe.image_url : `http://localhost:5000/images/${recipe.recipe.image_url}`} 
              alt={recipe.recipe.title}
              className="w-full h-[160px] object-cover border-b border-[#e0e0e0]"
            />
          )}
          
          <div className="p-[15px]">
            <h3 className="m-0 mb-[10px] text-[#333] text-[18px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              {recipe.recipe ? recipe.recipe.title : recipe.title}
            </h3>
            <p className="text-[14px] text-[#666] my-[10px] mb-[15px] leading-[1.5] line-clamp-2 overflow-hidden text-ellipsis h-[42px]">
              {recipe.recipe ? recipe.recipe.description : recipe.description}
            </p>
            
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
          </div>
        </div>
        
        <div className="p-[15px] pt-0">
          <div className="flex gap-[10px] mt-[5px]">
            <button 
              className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[1px]"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
            >
              View
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
    );
  };

  const renderAddedRecipeCard = (recipe) => (
    <div key={recipe.recipe_id} className="bg-white rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 w-full hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-2 border-[#ff6600] relative before:content-['👨‍🍳'] before:absolute before:top-[10px] before:right-[10px] before:bg-[#ff6600e6] before:text-white before:py-[5px] before:px-[8px] before:rounded-full before:text-[16px] before:z-[1] flex flex-col justify-between">
      <div>
        {recipe.image_url && (
          <img 
            src={recipe.image_url.startsWith('http') ? recipe.image_url : `http://localhost:5000/images/${recipe.image_url}`} 
            alt={recipe.title}
            className="w-full h-[160px] object-cover border-b border-[#e0e0e0]"
          />
        )}
        
        <div className="p-[15px]">
          <div className="flex justify-between items-center mb-[10px] gap-[10px]">
            <h3 className="m-0 text-[#333] text-[18px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%]">{recipe.title}</h3>
            <span className="bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white py-[4px] px-[10px] rounded-[20px] text-[11px] font-semibold shrink-0">Your Recipe</span>
          </div>
          <p className="text-[14px] text-[#666] my-[10px] mb-[15px] leading-[1.5] line-clamp-2 overflow-hidden text-ellipsis h-[42px]">{recipe.description}</p>
          
          <div className="flex gap-[8px] my-[15px] flex-wrap">
            <span className="flex items-center gap-[3px] text-[12px] text-[#666] bg-[#f8f9fa] py-[4px] px-[8px] rounded-[15px]">⏱️ {recipe.preparation_time}</span>
            <span className="flex items-center gap-[3px] text-[12px] text-[#666] bg-[#f8f9fa] py-[4px] px-[8px] rounded-[15px]">🔥 {recipe.cooking_time}</span>
            <span className="flex items-center gap-[3px] text-[12px] text-[#666] bg-[#f8f9fa] py-[4px] px-[8px] rounded-[15px]">📊 {recipe.difficulty}</span>
          </div>
        </div>
      </div>
      
      <div className="p-[15px] pt-0">
        <div className="flex gap-[10px] mt-[5px]">
          <button 
            className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[1px]"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            View
          </button>
          <button 
            className="flex-1 py-[10px] px-[15px] border-none rounded-[8px] cursor-pointer text-[14px] font-medium transition-all duration-300 bg-gradient-to-br from-[#4caf50] to-[#66bb6a] text-white hover:from-[#388e3c] hover:to-[#4caf50] hover:-translate-y-[1px]"
            onClick={() => showNotification('Edit recipe feature coming soon!', 'info')}
          >
            Edit
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
      <div className="flex justify-between items-center bg-gradient-to-br from-[#ff6600] via-[#ff8533] to-[#cc6600] text-white p-[30px] sm:p-[20px] rounded-[30px_/_60px] mb-[30px] shadow-[0_6px_20px_rgba(255,102,0,0.3)] filter drop-shadow-[0_0_5px_rgba(255,102,0,0.5)] transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(255,102,0,0.8)]">
        <div>
          <h1 className="m-0 mb-[10px] sm:mb-[5px] text-[32px] sm:text-[22px] font-semibold flex items-baseline gap-[6px] flex-wrap"><span className="font-['MerivalRounded',_serif] text-[28px] sm:text-[20px] font-semibold">Welcome,</span> <span className="font-['MerivalRounded',_serif] text-[32px] sm:text-[24px] font-bold">{user.f_name}!</span></h1>
          <p className="m-[5px_0] text-[16px] sm:text-[13px] opacity-90">{user.user_type} Account</p>
          <p className="m-[5px_0_0_0] text-[14px] sm:text-[11px] opacity-80 sm:break-all">{user.email}</p>
        </div>
        <div className="shrink-0 ml-[10px]">
          <button className="bg-transparent text-white border-2 border-[#f44336] py-[10px] px-[20px] sm:py-[8px] sm:px-[12px] sm:text-[13px] rounded-[8px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#f44336] hover:-translate-y-[1px] whitespace-nowrap" onClick={() => { setModalType('deleteInteractions'); setShowDeleteModal(true); }}>
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

      {/* Tabs Container */}
      <div className="flex gap-[10px] sm:gap-[5px] mb-[30px] border-b-2 border-[#e0e0e0] overflow-x-auto pb-2 whitespace-nowrap">
        <button 
          className={`bg-transparent border-none py-[15px] px-[25px] lg:px-[40px] sm:py-[10px] sm:px-[15px] cursor-pointer text-[18px] lg:text-[20px] sm:text-[14px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] sm:tracking-normal whitespace-nowrap shrink-0 ${activeTab === 'saved' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0]' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved ({savedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[25px] lg:px-[40px] sm:py-[10px] sm:px-[15px] cursor-pointer text-[18px] lg:text-[20px] sm:text-[14px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] sm:tracking-normal whitespace-nowrap shrink-0 ${activeTab === 'liked' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0]' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('liked')}
        >
          ❤️ Liked ({likedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[25px] lg:px-[40px] sm:py-[10px] sm:px-[15px] cursor-pointer text-[18px] lg:text-[20px] sm:text-[14px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] sm:tracking-normal whitespace-nowrap shrink-0 ${activeTab === 'rated' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0]' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('rated')}
        >
          ⭐ Rated ({ratedRecipes.length})
        </button>
        <button 
          className={`bg-transparent border-none py-[15px] px-[25px] lg:px-[40px] sm:py-[10px] sm:px-[15px] cursor-pointer text-[18px] lg:text-[20px] sm:text-[14px] font-semibold border-b-[3px] transition-all duration-300 rounded-[8px_8px_0_0] font-['TropicalCalm',_serif] tracking-[0.1em] sm:tracking-normal whitespace-nowrap shrink-0 ${activeTab === 'added' ? 'text-[#ff6600] border-b-[#ff6600] bg-[#fff5f0]' : 'text-[#666] border-transparent hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
          onClick={() => setActiveTab('added')}
        >
          ➕ Added ({addedRecipes.length})
        </button>
      </div>

      {/* Grid Layout Fix Applied Below */}
      <div className="min-h-[400px]">
        {activeTab === 'saved' && (
          <div>
            <h2 className="mb-[20px] text-[24px] font-semibold font-['Nostalgia',_serif] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent">Your Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-[60px] px-[20px] text-[#666] bg-[#f8f9fa] rounded-[15px] border-2 border-dashed border-[#ccc]">
                <p className="text-[16px] m-0">No saved recipes yet. Start exploring and save your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] justify-items-center">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] justify-items-center">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] justify-items-center">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] justify-items-center">
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