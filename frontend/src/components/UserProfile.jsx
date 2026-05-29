import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Heart, Star, ChefHat, Clock, Flame, BarChart2, User, Settings, Eye, Edit3, Trash2 } from 'lucide-react';
import ChefInsightsPage from '../pages/ChefInsightsPage';

const UserProfile = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [addedRecipes, setAddedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <div key={recipe.recipe_id || recipe.interaction_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 w-full hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
        <div>
          {recipe.recipe && recipe.recipe.image_url && (
            <img 
              src={recipe.recipe.image_url.startsWith('http') ? recipe.recipe.image_url : `http://localhost:5000/images/${recipe.recipe.image_url}`} 
              alt={recipe.recipe.title}
              className="w-full h-32 sm:h-40 md:h-48 object-cover border-b border-gray-100 transition-transform duration-500 group-hover:scale-105"
            />
          )}
          
          <div className="p-3 md:p-5 relative bg-white z-10">
            <h3 className="m-0 mb-1 md:mb-2 text-gray-800 text-base md:text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              {recipe.recipe ? recipe.recipe.title : recipe.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 m-0 mb-3 md:mb-4 leading-relaxed line-clamp-2 h-8 md:h-10">
              {recipe.recipe ? recipe.recipe.description : recipe.description}
            </p>
            
            {type === 'rated' && (
              <div className="flex items-center gap-1 md:gap-2 mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 text-[10px] md:text-xs uppercase tracking-wider">Your Rating:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star} 
                      size={14}
                      className={star <= recipe.rating ? 'fill-orange-500 text-orange-500' : 'fill-gray-200 text-gray-200'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 md:p-5 pt-0 bg-white z-10">
          <div className="flex gap-2">
            <button 
              className="flex-1 py-2 md:py-2.5 px-3 md:px-4 bg-orange-500 text-white rounded-xl font-semibold text-xs md:text-sm transition-colors hover:bg-orange-600 flex items-center justify-center gap-2"
              onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
            >
              <Eye size={16} /> View
            </button>
            <button 
              className="flex-1 py-2 md:py-2.5 px-3 md:px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs md:text-sm transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
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
    <div key={recipe.recipe_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 w-full hover:-translate-y-1 hover:shadow-md relative flex flex-col justify-between group">
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-orange-600 p-2 rounded-full shadow-sm z-20">
        <ChefHat size={18} />
      </div>
      
      <div>
        {recipe.image_url && (
          <img 
            src={recipe.image_url.startsWith('http') ? recipe.image_url : `http://localhost:5000/images/${recipe.image_url}`} 
            alt={recipe.title}
            className="w-full h-32 sm:h-40 md:h-48 object-cover border-b border-gray-100 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        <div className="p-3 md:p-5 relative bg-white z-10">
          <div className="flex justify-between items-center mb-2 gap-2">
            <h3 className="m-0 text-gray-800 text-base md:text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis flex-1">{recipe.title}</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-500 m-0 mb-3 md:mb-4 leading-relaxed line-clamp-2 h-8 md:h-10">{recipe.description}</p>
          
          <div className="flex gap-1.5 md:gap-2 my-3 md:my-4 flex-wrap">
            <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-600 bg-gray-50 border border-gray-100 py-1 md:py-1.5 px-2 md:px-3 rounded-lg font-semibold"><Clock size={12} className="text-orange-500 md:w-3.5 md:h-3.5"/> {recipe.preparation_time}</span>
            <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-600 bg-gray-50 border border-gray-100 py-1 md:py-1.5 px-2 md:px-3 rounded-lg font-semibold"><Flame size={12} className="text-orange-500 md:w-3.5 md:h-3.5"/> {recipe.cooking_time}</span>
            <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-gray-600 bg-gray-50 border border-gray-100 py-1 md:py-1.5 px-2 md:px-3 rounded-lg font-semibold"><BarChart2 size={12} className="text-orange-500 md:w-3.5 md:h-3.5"/> {recipe.difficulty}</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 md:p-5 pt-0 bg-white z-10">
        <div className="flex gap-2">
          <button 
            className="flex-1 py-2 md:py-2.5 px-3 md:px-4 bg-orange-500 text-white rounded-xl font-semibold text-xs md:text-sm transition-colors hover:bg-orange-600 flex items-center justify-center gap-2"
            onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
          >
            <Eye size={16} /> View
          </button>
          <button 
            className="flex-1 py-2 md:py-2.5 px-3 md:px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-xs md:text-sm transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => showNotification('Edit recipe feature coming soon!', 'info')}
          >
            <Edit3 size={16} /> Edit
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white shadow-md shrink-0 border-4 border-white overflow-hidden">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-['Nostalgia',_serif] tracking-wide m-0 mb-2">
              {user.f_name} {user.l_name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold tracking-wide capitalize flex items-center gap-1.5">
                {user.user_type === 'chef' ? <ChefHat size={14} /> : <User size={14} />}
                {user.user_type}
              </span>
              <span className="text-gray-500 text-sm font-medium">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-sm cursor-pointer" onClick={() => navigate('/settings')}>
            <Settings size={18} />
            Settings
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold hover:bg-red-100 transition-colors shadow-sm text-sm cursor-pointer" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 w-full snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { id: 'saved', label: 'Saved', icon: Save, count: savedRecipes.length },
          { id: 'liked', label: 'Liked', icon: Heart, count: likedRecipes.length },
          { id: 'rated', label: 'Rated', icon: Star, count: ratedRecipes.length },
          ...(user.user_type === 'chef' ? [
            { id: 'added', label: 'Added', icon: ChefHat, count: addedRecipes.length },
            { id: 'insights', label: 'Insights', icon: BarChart2 }
          ] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap shrink-0 snap-start cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid Layout Fix Applied Below */}
      <div className="min-h-[400px]">
        {activeTab === 'saved' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold font-['Nostalgia',_serif] text-gray-800">Your Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-16 px-6 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Save className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-base m-0 font-medium">No saved recipes yet. Start exploring and save your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {savedRecipes.map(recipe => renderRecipeCard(recipe, 'saved'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold font-['Nostalgia',_serif] text-gray-800">Your Liked Recipes</h2>
            {likedRecipes.length === 0 ? (
              <div className="text-center py-16 px-6 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Heart className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-base m-0 font-medium">No liked recipes yet. Like recipes you enjoy!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {likedRecipes.map(recipe => renderRecipeCard(recipe, 'liked'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rated' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold font-['Nostalgia',_serif] text-gray-800">Your Rated Recipes</h2>
            {ratedRecipes.length === 0 ? (
              <div className="text-center py-16 px-6 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Star className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-base m-0 font-medium">No rated recipes yet. Rate recipes to help improve recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {ratedRecipes.map(recipe => renderRecipeCard(recipe, 'rated'))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'added' && (
          <div>
            <h2 className="mb-6 text-2xl font-bold font-['Nostalgia',_serif] text-gray-800">Your Added Recipes</h2>
            {addedRecipes.length === 0 ? (
              <div className="text-center py-16 px-6 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ChefHat className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-base m-0 font-medium">No recipes added yet. <a href="/addrecipe" className="text-orange-500 no-underline hover:underline">Create your first recipe!</a></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                {addedRecipes.map(recipe => renderAddedRecipeCard(recipe))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-['Nostalgia',_serif] text-gray-800">
                Chef Insights Dashboard
              </h2>
            </div>
            <ChefInsightsPage user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;