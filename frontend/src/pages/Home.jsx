

//fixing the useEffect warning and a search input and sorting dropdown
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Trash2, X } from 'lucide-react';
import FeaturedArticles from '../components/FeaturedArticles';
import { UploadButton } from '../utils/uploadthing';
import "@uploadthing/react/styles.css";

const Home = ({ user }) => {
  const [recipes, setRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [dietType, setDietType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [popularCarouselIndex, setPopularCarouselIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [allRecipesTouchStart, setAllRecipesTouchStart] = useState(null);
  const [allRecipesTouchEnd, setAllRecipesTouchEnd] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  
  // Story Modal States
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyFile, setStoryFile] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([
    { value: '', label: 'All' },
    { value: 'main_course', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'italian', label: 'Italian' },
    { value: 'asian', label: 'Asian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'healthy', label: 'Healthy' }
  ]);

  // Filter sections data
  const filterSections = [
    {
      id: 'difficulty',
      title: 'Difficulty',
      options: [
        { value: '', label: 'All' },
        { value: 'Easy', label: 'Easy' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Hard', label: 'Hard' }
      ],
      currentValue: difficulty,
      setValue: setDifficulty
    },
    {
      id: 'category',
      title: 'Category',
      options: dynamicCategories,
      currentValue: foodCategory,
      setValue: setFoodCategory
    },
    {
      id: 'diet',
      title: 'Diet',
      options: [
        { value: '', label: 'All' },
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'non_vegetarian', label: 'Non-Vegetarian' },
        { value: 'mixed', label: 'Mixed' }
      ],
      currentValue: dietType,
      setValue: setDietType
    }
  ];

  const fetchRecipes = useCallback(async () => {
    try {
      // Only append parameters if they actually have a value
      const queryParams = { page, limit: 10 };
      if (difficulty) queryParams.difficulty = difficulty;
      if (foodCategory) queryParams.food_category = foodCategory;
      if (dietType) queryParams.diet_type = dietType;
      if (search) queryParams.search = search;

      const query = new URLSearchParams(queryParams);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes?${query}`);
      const data = await res.json();
      
      if (res.ok) {
        setRecipes(data.recipes || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('API Error:', data);
        setRecipes([]);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    }
  }, [page, difficulty, foodCategory, dietType, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes?fetchCategories=true`);
      const data = await res.json();
      if (data.success && data.categories.length > 0) {
        setDynamicCategories([{ value: '', label: 'All' }, ...data.categories]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/stories/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { setStories(data.stories); }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  }, []);

  // Fetch popular recipes for homepage
  const fetchPopularRecipes = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/popular?limit=12`);
      const data = await res.json();
      if (data.success) {
        setPopularRecipes(data.popularRecipes || []);
      }
    } catch (error) {
      console.error('Failed to fetch popular recipes:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPopularRecipes();
  }, [fetchPopularRecipes]);

  const handleStorySubmit = async () => {
    if (!storyFile) return;
    setIsUploadingStory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image_url: storyFile, content: storyText })
      });
      if (res.ok) {
        setShowStoryModal(false);
        setStoryFile('');
        setStoryText('');
        fetchStories();
      }
    } catch (err) { console.error('Error posting story', err); }
    finally { setIsUploadingStory(false); }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/stories/${storyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveStoryIndex(null);
        fetchStories();
      }
    } catch (err) { console.error('Failed to delete', err); }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Setup initial position in the middle of the cloned array
  useEffect(() => {
    if (popularRecipes.length > 0) {
      setIsTransitionEnabled(false);
      setPopularCarouselIndex(popularRecipes.length * 5); 
    }
  }, [popularRecipes.length]);

  // Auto-swipe popular recipes every 5 seconds if the user is not hovering
  useEffect(() => {
    if (popularRecipes.length > 0 && !isHoveringCarousel) {
      const interval = setInterval(() => {
        setIsTransitionEnabled(true);
        setPopularCarouselIndex((prev) => prev + 4);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [popularRecipes.length, isHoveringCarousel]);

  const handleTransitionEnd = () => {
    if (popularRecipes.length === 0) return;
    
    // Seamless loop jump
    if (popularCarouselIndex >= popularRecipes.length * 7) {
      setIsTransitionEnabled(false);
      setPopularCarouselIndex((prev) => prev - popularRecipes.length * 2);
    } else if (popularCarouselIndex <= popularRecipes.length * 3) {
      setIsTransitionEnabled(false);
      setPopularCarouselIndex((prev) => prev + popularRecipes.length * 2);
    }
  };

  // Touch/swipe handlers for the "All Recipes" grid pagination
  const handleAllRecipesTouchStart = (e) => {
    setAllRecipesTouchEnd(null);
    setAllRecipesTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleAllRecipesTouchMove = (e) => {
    setAllRecipesTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleAllRecipesTouchEnd = () => {
    if (!allRecipesTouchStart || !allRecipesTouchEnd) return;
    const distanceX = allRecipesTouchStart.x - allRecipesTouchEnd.x;
    const distanceY = Math.abs(allRecipesTouchStart.y - allRecipesTouchEnd.y);
    // Ensure it's a horizontal swipe, not just the user scrolling down the page
    if (distanceY < 50) {
      if (distanceX > 50 && page < totalPages) setPage((prev) => prev + 1);
      else if (distanceX < -50 && page > 1) setPage((prev) => prev - 1);
    }
  };

  // Duplicate the array 10 times to create a massive seamless loop buffer
  const displayRecipes = popularRecipes.length > 0 
    ? Array(10).fill(popularRecipes).flat() 
    : [];

  const baseCardClasses = "bg-gradient-to-b from-[#e99f6e] to-[#ffcc80] border border-[#ddd] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.12)] flex flex-col items-center relative transition-all duration-300 cursor-pointer group shrink-0 hover:from-[#ff6600] hover:to-[#ff6600] hover:-translate-y-[8px] hover:shadow-[0_14px_40px_rgba(255,102,0,0.35)]";
  const carouselCardClasses = `w-[250px] h-[320px] p-[16px] ${baseCardClasses}`;
  const gridCardClasses = `w-[160px] h-[250px] sm:w-[200px] sm:h-[280px] md:w-[250px] md:h-[320px] p-[10px] md:p-[16px] ${baseCardClasses}`;
  const tagClasses = "inline-block py-[3px] px-[6px] md:py-[4px] md:px-[10px] rounded-[20px] text-[8px] md:text-[10px] font-bold uppercase tracking-[0.5px] whitespace-nowrap max-w-full overflow-hidden text-ellipsis shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:shadow-none cursor-default";
  const carouselArrowClasses = "bg-transparent text-[#ff6600] border-none flex items-center justify-center cursor-pointer transition-transform duration-300 z-[2] shrink-0 hover:text-[#d65a00] hover:scale-125 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed p-[5px]";

  const getDifficultyClass = (diff) => {
    switch(diff?.toLowerCase()) {
      case 'easy': return 'bg-[#e4f8e9] text-[#28a745]';
      case 'medium': return 'bg-[#fff8e1] text-[#f57c00]';
      case 'hard': return 'bg-[#fde2e4] text-[#d90429]';
      default: return 'bg-[#f0f0f0] text-[#555]';
    }
  };

  const getDietClass = (diet) => {
    switch(diet?.toLowerCase()) {
      case 'vegetarian': return 'bg-[#e8f5e8] text-[#2d5a2d]';
      case 'non_vegetarian': return 'bg-[#ffe8e8] text-[#8b0000]';
      case 'mixed': return 'bg-[#fff3cd] text-[#856404]';
      default: return 'bg-[#f0f0f0] text-[#555]';
    }
  };

  return (
    <div>
      {/* Chef Updates / Stories Section (Logged in users only) */}
      {user && (
        <div className="w-full bg-transparent py-[15px] overflow-hidden mb-[10px]">
          <div className="max-w-[1400px] mx-auto px-[20px]">
            <h2 className="font-bold text-[1.2rem] text-[#5C4033] mb-[10px] font-['Nostalgia',_serif] pl-[5px]">Chef Updates</h2>
            <div className="flex gap-[15px] overflow-x-auto pb-[5px] snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex flex-col items-center gap-[6px] shrink-0 snap-start cursor-pointer group" onClick={() => window.location.href = '/profile'}>
                 <div className="w-[60px] h-[60px] rounded-full border-[2px] border-dashed border-[#ff6600] flex items-center justify-center bg-[#fff5f0] transition-colors group-hover:bg-[#ffe6d6]" onClick={(e) => { e.stopPropagation(); setShowStoryModal(true); }}>
                    <span className="text-[#ff6600] text-[20px] font-light">+</span>
                 </div>
                 <span className="text-[11px] font-semibold text-[#555]">Add Update</span>
              </div>
              {stories.length === 0 && user.user_type !== 'chef' && (
                 <span className="text-[12px] text-[#888] italic flex items-center h-[60px]">No updates yet. Discover and follow chefs in your Feed!</span>
              )}
              {stories.map(story => (
                <div key={story.story_id} className="flex flex-col items-center gap-[6px] shrink-0 snap-start cursor-pointer group" onClick={() => setActiveStoryIndex(stories.indexOf(story))}>
                  <div className={`w-[60px] h-[60px] rounded-full p-[2px] ${story.user?.user_type === 'chef' ? 'bg-gradient-to-tr from-[#ff6600] to-[#ffcc80]' : 'bg-gradient-to-tr from-[#4caf50] to-[#a8e063]'}`}>
                    <img src={story.image_url?.startsWith('http') ? story.image_url : `${import.meta.env.VITE_API_URL}/images/${story.image_url}`} alt={story.user?.f_name} className="w-full h-full rounded-full object-cover border-[2px] border-white transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#555] max-w-[65px] truncate">{story.user?.f_name}</span>
                </div>
              ))}
            </div>

      {/* Instagram-Style Story Viewer */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 bg-[#111] z-[3000] flex flex-col items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              {stories[activeStoryIndex].user?.profile_picture ? (
                <img src={stories[activeStoryIndex].user.profile_picture.startsWith('http') ? stories[activeStoryIndex].user.profile_picture : `${import.meta.env.VITE_API_URL}/images/${stories[activeStoryIndex].user.profile_picture}`} className="w-10 h-10 rounded-full object-cover border border-white/30" alt="Avatar"/>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6600] to-[#ffcc80] flex items-center justify-center text-white font-bold border border-white/30">{stories[activeStoryIndex].user?.f_name?.[0] || 'S'}</div>
              )}
              <div className="text-white shadow-sm">
                <p className="font-bold text-sm m-0 drop-shadow-md">{stories[activeStoryIndex].user?.f_name} {stories[activeStoryIndex].user?.l_name}</p>
                <p className="text-xs opacity-80 m-0 drop-shadow-md">{formatTimeAgo(stories[activeStoryIndex].createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {stories[activeStoryIndex].user_id === user?.user_id && (
                <button className="bg-black/40 p-2 rounded-full text-white hover:bg-red-500 transition border-none cursor-pointer" onClick={() => handleDeleteStory(stories[activeStoryIndex].story_id)}><Trash2 size={20} /></button>
              )}
              <button className="bg-black/40 p-2 rounded-full text-white hover:bg-white/30 transition border-none cursor-pointer" onClick={() => setActiveStoryIndex(null)}><X size={24} /></button>
            </div>
          </div>
          <div className="absolute inset-0 flex z-40">
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setActiveStoryIndex(prev => prev > 0 ? prev - 1 : prev)} />
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setActiveStoryIndex(prev => prev < stories.length - 1 ? prev + 1 : prev)} />
          </div>
          <img src={stories[activeStoryIndex].image_url?.startsWith('http') ? stories[activeStoryIndex].image_url : `${import.meta.env.VITE_API_URL}/images/${stories[activeStoryIndex].image_url}`} className="max-h-[100vh] max-w-full object-contain pointer-events-none z-20" alt="Story" />
          {stories[activeStoryIndex].content && (
            <div className="absolute bottom-[10%] left-0 w-full text-center z-50 pointer-events-none px-4"><span className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-[15px] font-medium inline-block max-w-[80%]">{stories[activeStoryIndex].content}</span></div>
          )}
        </div>
      )}
          </div>
        </div>
      )}

      <FeaturedArticles />

      <div className="p-[20px]">
        <h2 className="font-['Nostalgia',_serif] font-bold text-[3rem] bg-gradient-to-r from-[#ff6600] to-[#5C4033] bg-clip-text text-transparent mb-[1rem] text-center tracking-wide">Popular Recipes</h2>
        <div 
          className="flex items-center justify-center my-[30px] relative max-w-[1200px] mx-auto md:max-w-full md:my-[15px] sm:my-[10px]"
          onMouseEnter={() => setIsHoveringCarousel(true)}
          onMouseLeave={() => setIsHoveringCarousel(false)}
        >
          <button
            className={carouselArrowClasses}
            onClick={() => { setIsTransitionEnabled(true); setPopularCarouselIndex((prev) => prev - 4); }}
            disabled={popularRecipes.length === 0}
          >
            <ChevronLeft size={36} strokeWidth={2.5} />
          </button>
        <div className="overflow-hidden w-full max-w-[1060px] mx-[10px] py-[15px]">
          <div 
            className={"flex gap-[20px] ease-in-out w-max " + (isTransitionEnabled ? "transition-transform duration-[800ms]" : "transition-none duration-0")}
            style={{ transform: `translateX(calc(-${popularCarouselIndex} * (250px + 20px)))` }}
            onTransitionEnd={handleTransitionEnd}
          >
          {displayRecipes.length > 0 ? (
            displayRecipes.map((recipe, index) => (
              <div key={`${recipe.recipe_id}-${index}`} className={carouselCardClasses} onClick={() => window.location.href = `/recipes/${recipe.recipe_id}`}>
                <div className="absolute top-[8px] left-[8px] w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#ff6600] to-[#888] text-white font-bold text-[14px] flex items-center justify-center select-none shadow-[0_2px_6px_rgba(0,0,0,0.2)] z-10">
                  {(index % popularRecipes.length) + 1}
                </div>
                <img
                  src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
                  alt={recipe.title}
                  className="w-[202px] h-[113px] object-cover rounded-[8px]"
                />
                <h3 className="mt-[10px] min-h-[40px] text-[1rem] text-center break-words font-['TropicalCalm',_sans-serif] tracking-[0.05em] group-hover:text-white leading-[1.2]">{recipe.title}</h3>
                <p className="text-[0.75rem] text-[#555] flex-grow line-clamp-3 text-center group-hover:text-white my-[8px]">{recipe.description}</p>
                <div className="flex gap-[6px] justify-center flex-wrap min-h-[30px] my-[8px] w-full">
                  <span className={`${tagClasses} ${getDifficultyClass(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                  <span className={`${tagClasses} bg-[#e6f3ff] text-[#0066cc]`}>
                    {recipe.food_category?.replace('_', ' ').toUpperCase() || 'MAIN COURSE'}
                  </span>
                  <span className={`${tagClasses} ${getDietClass(recipe.diet_type)}`}>
                    {recipe.diet_type?.replace('_', ' ').toUpperCase() || 'VEGETARIAN'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="w-full text-center text-[#666]">No popular recipes available at the moment.</p>
          )}
          </div>
        </div>
          <button
            className={carouselArrowClasses}
            onClick={() => { setIsTransitionEnabled(true); setPopularCarouselIndex((prev) => prev + 4); }}
            disabled={popularRecipes.length === 0}
          >
            <ChevronRight size={36} strokeWidth={2.5} />
          </button>
        </div>

        <h2 className="font-['Nostalgia',_serif] font-bold text-[3rem] bg-gradient-to-r from-[#ff6600] to-[#5C4033] bg-clip-text text-transparent mb-[1rem] text-center tracking-wide">All Recipes</h2>

        <div className="bg-transparent py-[30px] px-[20px] rounded-b-[20px] -mt-[20px]">
          <div className="flex flex-wrap gap-[10px] md:gap-[15px] mb-[30px] md:mb-[40px] max-w-[1200px] w-full mx-auto justify-center items-center">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              className="p-[10px_16px] text-[14px] md:p-[12px_20px] md:text-[16px] border-2 border-[#ddd] rounded-xl outline-none transition-all duration-300 flex-[1_1_100%] md:flex-[1_1_250px] bg-[#f9f9f9] focus:border-[#ff6600] focus:shadow-[0_0_15px_rgba(255,102,0,0.2)] box-border w-full md:w-auto"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            {filterSections.map((section) => (
              <div key={section.id} className="relative flex-1 min-w-[100px] md:flex-none">
                <select
                  value={section.currentValue}
                  onChange={(e) => {
                    section.setValue(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-[10px_30px_10px_12px] text-[13px] md:p-[12px_40px_12px_20px] md:text-[15px] border-2 border-[#ddd] rounded-xl outline-none transition-all duration-300 bg-[#f9f9f9] focus:border-[#ff6600] cursor-pointer text-[#555] font-medium appearance-none shadow-sm hover:border-[#ff6600]/50"
                >
                  {section.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label === 'All' ? `${section.title}: All` : opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-[10px] md:right-[15px] top-1/2 -translate-y-1/2 pointer-events-none text-[#ff6600]">
                  <ChevronDown strokeWidth={2.5} className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" />
                </div>
              </div>
            ))}

            {(search || difficulty || foodCategory || dietType) && (
              <button
                onClick={() => { setSearch(''); setDifficulty(''); setFoodCategory(''); setDietType(''); setPage(1); }}
                className="shrink-0 bg-transparent text-[#e74c3c] border-2 border-[#e74c3c] rounded-xl p-[8px_15px] text-[13px] md:p-[10px_20px] md:text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#e74c3c] hover:text-white shadow-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div 
            className="flex flex-wrap gap-[20px] justify-center items-stretch content-start"
            onTouchStart={handleAllRecipesTouchStart}
            onTouchMove={handleAllRecipesTouchMove}
            onTouchEnd={handleAllRecipesTouchEnd}
          >
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
              <div key={recipe.recipe_id} className={gridCardClasses} onClick={() => window.location.href = `/recipes/${recipe.recipe_id}`}>
                <img
                  src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
                  alt={recipe.title}
                  className="w-full h-[90px] sm:h-[100px] md:h-[113px] object-cover rounded-[8px]"
                />
                <h3 className="mt-[8px] md:mt-[10px] min-h-[32px] md:min-h-[40px] text-[14px] md:text-[1rem] text-center break-words font-['TropicalCalm',_sans-serif] tracking-[0.05em] group-hover:text-white leading-[1.2] w-full overflow-hidden">{recipe.title}</h3>
                <p className="text-[10px] md:text-[0.75rem] flex-grow line-clamp-2 md:line-clamp-3 text-center group-hover:text-white my-[6px] md:my-[8px] w-full">{recipe.description}</p>
                <div className="flex gap-[4px] md:gap-[6px] justify-center flex-wrap min-h-[25px] md:min-h-[30px] mt-auto w-full">
                  <span className={`${tagClasses} ${getDifficultyClass(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                  <span className={`${tagClasses} bg-[#e6f3ff] text-[#0066cc]`}>
                    {recipe.food_category?.replace('_', ' ').toUpperCase() || 'MAIN COURSE'}
                  </span>
                  <span className={`${tagClasses} ${getDietClass(recipe.diet_type)}`}>
                    {recipe.diet_type?.replace('_', ' ').toUpperCase() || 'VEGETARIAN'}
                  </span>
                </div>
              </div>
              ))
            ) : (
              <div className="w-full text-center py-[40px] text-[#666] text-[1.2rem]">
                No recipes found.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-[40px] flex items-center gap-[15px] justify-center w-full">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-transparent text-[#ff6600] border-none transition-all duration-300 hover:text-[#d65a00] hover:scale-125 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
              >
                <ChevronLeft size={32} strokeWidth={2.5} />
              </button>
              
              <div className="flex gap-[8px] items-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-[12px] h-[12px] rounded-full border-none cursor-pointer transition-all duration-300 ${page === i + 1 ? 'bg-gradient-to-br from-[#ff6600] to-[#ff8533] scale-125 shadow-[0_2px_6px_rgba(255,102,0,0.4)]' : 'bg-[#ddd] hover:bg-[#ff6600]/60 hover:scale-110'}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-transparent text-[#ff6600] border-none transition-all duration-300 hover:text-[#d65a00] hover:scale-125 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
              >
                <ChevronRight size={32} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Story Upload Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-2xl p-[30px] w-full max-w-[400px] shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
            <button className="absolute top-[15px] right-[15px] text-[#888] hover:text-red-500 cursor-pointer border-none bg-transparent text-[20px]" onClick={() => setShowStoryModal(false)}>✕</button>
            <h2 className="text-[1.5rem] font-bold text-[#5C4033] mb-[20px] font-['Nostalgia',_serif] m-0">Post an Update</h2>
            <div className="flex flex-col gap-[15px]">
              {storyFile ? (
                <div className="relative rounded-[15px] overflow-hidden bg-gray-100 h-[200px] flex items-center justify-center border border-[#ddd]">
                  <img src={storyFile} className="max-h-full max-w-full object-contain" alt="Story preview" />
                  <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold cursor-pointer border-none shadow-md hover:bg-red-600" onClick={() => setStoryFile('')}>✕</button>
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => setStoryFile(res[0].ufsUrl || res[0].url)}
                  appearance={{ button: "bg-[#fff5f0] text-[#ff6600] border border-[#ffcc80] rounded-[15px] w-full py-[20px] font-semibold text-[16px] outline-none hover:bg-[#ffe6d6] transition-colors" }}
                  content={{ button: "Upload Photo" }}
                />
              )}
              <textarea
                className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[15px] p-[15px] outline-none focus:border-[#ff6600] resize-none h-[80px] text-[14px] font-['Poppins',_sans-serif]"
                placeholder="Add a caption..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />
              <button 
                className="w-full bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white rounded-[15px] py-[12px] font-bold shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer border-none transition-all"
                disabled={isUploadingStory || !storyFile}
                onClick={handleStorySubmit}
              >
                {isUploadingStory ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
