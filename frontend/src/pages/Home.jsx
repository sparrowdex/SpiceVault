

//fixing the useEffect warning and a search input and sorting dropdown
import React, { useState, useEffect, useCallback } from 'react';
const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [dietType, setDietType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilterSection, setCurrentFilterSection] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [popularCarouselIndex, setPopularCarouselIndex] = useState(0);

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
      options: [
        { value: '', label: 'All' },
        { value: 'main_course', label: 'Main Course' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'appetizer', label: 'Appetizer' },
        { value: 'breakfast', label: 'Breakfast' },
        { value: 'italian', label: 'Italian' },
        { value: 'asian', label: 'Asian' },
        { value: 'mexican', label: 'Mexican' },
        { value: 'healthy', label: 'Healthy' },
        { value: 'comfort_food', label: 'Comfort Food' }
      ],
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

  const nextFilterSection = () => {
    setCurrentFilterSection((prev) => (prev + 1) % filterSections.length);
  };

  const prevFilterSection = () => {
    setCurrentFilterSection((prev) => (prev - 1 + filterSections.length) % filterSections.length);
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextFilterSection();
    } else if (isRightSwipe) {
      prevFilterSection();
    }
  };

  const fetchRecipes = useCallback(async () => {
    try {
      // Only append parameters if they actually have a value
      const queryParams = { page, limit: 9 };
      if (difficulty) queryParams.difficulty = difficulty;
      if (foodCategory) queryParams.food_category = foodCategory;
      if (dietType) queryParams.diet_type = dietType;
      if (search) queryParams.search = search;

      const query = new URLSearchParams(queryParams);

      const res = await fetch(`http://localhost:5000/api/recipes?${query}`);
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

  // Fetch popular recipes for homepage
  const fetchPopularRecipes = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ml/popular?limit=12');
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
    fetchPopularRecipes();
  }, [fetchPopularRecipes]);

  const cardClasses = "w-[250px] h-[320px] bg-gradient-to-b from-[#e99f6e] to-[#ffcc80] border border-[#ddd] rounded-[12px] p-[16px] shadow-[0_2px_6px_rgba(0,0,0,0.12)] flex flex-col items-center relative transition-all duration-300 cursor-pointer group shrink-0 hover:from-[#ff6600] hover:to-[#ff6600] hover:-translate-y-[8px] hover:shadow-[0_14px_40px_rgba(255,102,0,0.35)]";
  const tagClasses = "inline-block py-[4px] px-[10px] rounded-[20px] text-[10px] font-bold uppercase tracking-[0.5px] whitespace-nowrap max-w-full overflow-hidden text-ellipsis shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:shadow-none cursor-default";
  const carouselArrowClasses = "bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white border-none w-[40px] h-[40px] rounded-full text-[20px] font-bold cursor-pointer flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(255,102,0,0.3)] z-[2] shrink-0 hover:from-[#e55a00] hover:to-[#ff6600] hover:scale-110 hover:shadow-[0_6px_16px_rgba(255,102,0,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed md:w-[35px] md:h-[35px] md:text-[18px] sm:w-[30px] sm:h-[30px] sm:text-[16px]";

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
      <div className="p-[20px]">
        <h2 className="font-bold text-[2.5rem] bg-gradient-to-r from-orange-500 to-[#5C4033] bg-clip-text text-transparent mb-[1rem] text-center uppercase tracking-[2px]">Popular Recipes</h2>
        <div className="flex items-center justify-center my-[30px] relative max-w-[1200px] mx-auto md:max-w-full md:my-[15px] sm:my-[10px]">
          <button
            className={carouselArrowClasses}
            onClick={() => setPopularCarouselIndex((prev) => (prev - 4 + popularRecipes.length) % popularRecipes.length)}
            disabled={popularRecipes.length === 0}
          >
            ‹
          </button>
        <div className="flex gap-[20px] justify-center flex-nowrap max-w-full overflow-hidden relative">
          {popularRecipes.length > 0 ? (
            popularRecipes.slice(popularCarouselIndex, popularCarouselIndex + 4).map((recipe, index) => (
              <div key={recipe.recipe_id} className={cardClasses} onClick={() => window.location.href = `/recipes/${recipe.recipe_id}`}>
                <div className="absolute top-[8px] left-[8px] w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#ff6600] to-[#888] text-white font-bold text-[14px] flex items-center justify-center select-none shadow-[0_2px_6px_rgba(0,0,0,0.2)] z-10">{popularCarouselIndex + index + 1}</div>
                <img
                  src={`http://localhost:5000/images/${recipe.image_url}`}
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
            <p>No popular recipes available at the moment.</p>
          )}
        </div>
          <button
            className={carouselArrowClasses}
            onClick={() => setPopularCarouselIndex((prev) => (prev + 4) % popularRecipes.length)}
            disabled={popularRecipes.length === 0}
          >
            ›
          </button>
        </div>

        <h2 className="font-bold text-[2.5rem] bg-gradient-to-r from-orange-500 to-[#5C4033] bg-clip-text text-transparent mb-[1rem] text-center uppercase tracking-[2px]">All Recipes</h2>

        <div className="bg-transparent py-[30px] px-[20px] rounded-b-[20px] -mt-[20px]">
          <div className="flex flex-col gap-[10px] mb-[20px]">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              className="p-[12px_20px] text-[16px] border-2 border-[#ddd] rounded-[30px] outline-none transition-all duration-300 w-full box-border bg-[#f9f9f9] focus:border-[#ff6600] focus:shadow-[0_0_15px_rgba(255,102,0,0.2)]"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <div 
              className="flex items-center justify-center my-[20px] relative max-w-[600px] mx-auto md:my-[15px] md:max-w-full sm:my-[10px]"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button className={carouselArrowClasses} onClick={prevFilterSection}>
                ‹
              </button>
              
              <div className="flex-1 text-center px-[20px] min-h-[120px] flex flex-col justify-center md:px-[15px] md:min-h-[100px] sm:px-[10px] sm:min-h-[80px]">
                <h3 className={`m-[0_0_15px_0] text-[#333] text-[18px] font-semibold md:text-[16px] md:mb-[12px] sm:text-[14px] sm:mb-[10px] ${filterSections[currentFilterSection].id === 'difficulty' ? 'font-[\'SweetHipster\',_cursive] text-[8rem] font-normal tracking-[0.1em] text-black drop-shadow-[2px_2px_4px_rgba(0,0,0,0.15)] relative block text-center px-[1rem]' : ''}`}>
                  {filterSections[currentFilterSection].id === 'difficulty' ? 'Filter Your Choice' : filterSections[currentFilterSection].title}
                </h3>
                <div className="flex gap-[8px] justify-center flex-wrap max-w-full md:gap-[6px] sm:gap-[4px]">
                  {filterSections[currentFilterSection].options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        filterSections[currentFilterSection].setValue(option.value);
                        setPage(1);
                      }}
                      className={`py-[8px] px-[16px] border-2 rounded-[25px] cursor-pointer text-[14px] font-medium transition-all duration-300 whitespace-nowrap hover:-translate-y-[2px] md:py-[6px] md:px-[12px] md:text-[13px] sm:py-[5px] sm:px-[10px] sm:text-[12px] ${filterSections[currentFilterSection].currentValue === option.value ? 'bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white border-[#ff6600] shadow-[0_4px_12px_rgba(255,102,0,0.3)]' : 'bg-white text-[#666] border-[#e0e0e0] hover:border-[#ff6600] hover:text-[#ff6600] hover:bg-[#fff5f0]'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button className={carouselArrowClasses} onClick={nextFilterSection}>
                ›
              </button>
            </div>
            
            <div className="flex justify-center gap-[8px] mt-[15px] md:mt-[12px] md:gap-[6px]">
              {filterSections.map((_, index) => (
                <button
                  key={index}
                  className={`w-[12px] h-[12px] rounded-full border-none cursor-pointer transition-all duration-300 md:w-[10px] md:h-[10px] ${index === currentFilterSection ? 'bg-[#ff6600] scale-125' : 'bg-[#ddd] hover:bg-[#ff6600] hover:scale-[1.2]'}`}
                  onClick={() => setCurrentFilterSection(index)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-[20px] justify-center items-stretch content-start">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
              <div key={recipe.recipe_id} className={cardClasses} onClick={() => window.location.href = `/recipes/${recipe.recipe_id}`}>
                <img
                  src={`http://localhost:5000/images/${recipe.image_url}`}
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
              <div className="w-full text-center py-[40px] text-[#666] text-[1.2rem]">
                No recipes found.
              </div>
            )}
          </div>

          <div className="mt-[20px] flex items-center gap-[10px] justify-center flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`py-[8px] px-[12px] cursor-pointer text-white border-none rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${page === i + 1 ? 'bg-[#d62828]' : 'bg-[#ff6600] hover:bg-[#e55a00]'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
