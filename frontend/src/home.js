// import React, { useState, useEffect } from 'react';
// import './home.css';

// const Home = () => {
//   const [recipes, setRecipes] = useState([]);

//   useEffect(() => {
//     const fetchRecipes = async () => {
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes`);
//         const data = await res.json();

//         const topThree = data.slice(0, 3);
//         setRecipes(topThree);
//       } catch (error) {
//         console.error('Failed to fetch recipes:', error);
//       }
//     };

//     fetchRecipes();
//   }, []);

//   return (
//     <div className="home-page">
//       <h2>Featured Recipes</h2>
//       <div className="recipe-list">
//         {recipes.map((recipe) => (
//           <div key={recipe.recipe_id} className="recipe-card">
//             <img
//               src={`http://localhost:5000/images/${recipe.image_url}`}
//               alt={recipe.title}
//               style={{ width: '202px', height: '113px', objectFit: 'cover' }}
//             />
//             <h3>{recipe.title}</h3>
//             <p>{recipe.description}</p>
//             <a href={`/recipes/${recipe.recipe_id}`}>View Recipe</a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Home;

//pagination and difficult toggle
// import React, { useState, useEffect } from 'react';
// import './home.css';

// const Home = () => {
//   const [recipes, setRecipes] = useState([]);
//   const [difficulty, setDifficulty] = useState(''); // '', 'Easy', 'Medium', 'Hard'
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchRecipes = async () => {
//     try {
//       const query = `?page=${page}&limit=6${difficulty ? `&difficulty=${difficulty}` : ''}`;
//       const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes${query}`);
//       const data = await res.json();
//       setRecipes(data.recipes);
//       setTotalPages(data.totalPages);
//     } catch (error) {
//       console.error('Failed to fetch recipes:', error);
//     }
//   };

//   useEffect(() => {
//     fetchRecipes();
//   }, [page, difficulty]);

//   const handleDifficultyChange = (level) => {
//     setDifficulty(level);
//     setPage(1); // Reset to page 1 on filter change
//   };

//   return (
//     <div className="home-page">
//       <h2>All Recipes</h2>

//       <div className="difficulty-buttons">
//         {['', 'Easy', 'Medium', 'Hard'].map((level) => (
//           <button
//             key={level}
//             onClick={() => handleDifficultyChange(level)}
//             className={difficulty === level ? 'active' : ''}
//           >
//             {level || 'All'}
//           </button>
//         ))}
//       </div>

//       <div className="recipe-list">
//         {recipes.map((recipe) => (
//           <div key={recipe.recipe_id} className="recipe-card">
//             <img
//               src={`http://localhost:5000/images/${recipe.image_url}`}
//               alt={recipe.title}
//               style={{ width: '202px', height: '113px', objectFit: 'cover' }}
//             />
//             <h3>{recipe.title}</h3>
//             <p>{recipe.description}</p>
//             <a href={`/recipes/${recipe.recipe_id}`}>View Recipe</a>
//           </div>
//         ))}
//       </div>

//       <div className="pagination">
//         <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
//           Previous
//         </button>
//         <span>Page {page} of {totalPages}</span>
//         <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Home;

//fixing the useEffect warning and a search input and sorting dropdown
import React, { useState, useEffect, useCallback } from 'react';
import './home.css';
const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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
      const query = new URLSearchParams({
        page,
        limit: 9,
        difficulty,
        food_category: foodCategory,
        diet_type: dietType,
        search
      });

      const res = await fetch(`http://localhost:5000/api/recipes?${query}`);
      const data = await res.json();
      setRecipes(data.recipes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
  }, [page, difficulty, foodCategory, dietType, search]);

  // Fetch recommendations for a test user (userId=1)
  const fetchRecommendations = useCallback(async () => {
    setRecommendations([]);
    return;
  }, []);

  // Fetch popular recipes for homepage
  const fetchPopularRecipes = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ml/popular?limit=12');
      const data = await res.json();
      if (data.success) {
        setPopularRecipes(data.popularRecipes);
      }
    } catch (error) {
      console.error('Failed to fetch popular recipes:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    fetchPopularRecipes();
  }, [fetchPopularRecipes]);

  return (
    <div>
      <div className="home-page">
        <h2 className="gradient-heading">Popular Recipes</h2>
        <div className="popular-carousel">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={() => setPopularCarouselIndex((prev) => (prev - 4 + popularRecipes.length) % popularRecipes.length)}
            disabled={popularRecipes.length === 0}
          >
            ‹
          </button>
        <div className="popular-cards">
          {popularRecipes.length > 0 ? (
            popularRecipes.slice(popularCarouselIndex, popularCarouselIndex + 4).map((recipe, index) => (
              <div key={recipe.recipe_id} className="popular-recipe-card">
                <div className="recipe-rank">{popularCarouselIndex + index + 1}</div>
                <img
                  src={`http://localhost:5000/images/${recipe.image_url}`}
                  alt={recipe.title}
                  style={{ width: '202px', height: '113px', objectFit: 'cover' }}
                />
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="recipe-meta">
                  <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
                    {recipe.difficulty}
                  </span>
                  <span className="category-tag">
                    {recipe.food_category?.replace('_', ' ').toUpperCase() || 'MAIN COURSE'}
                  </span>
                  <span className={`diet-tag ${recipe.diet_type?.toLowerCase()}`}>
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
            className="carousel-arrow carousel-arrow-right"
            onClick={() => setPopularCarouselIndex((prev) => (prev + 4) % popularRecipes.length)}
            disabled={popularRecipes.length === 0}
          >
            ›
          </button>
        </div>

        <h2 className="gradient-heading">All Recipes</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div 
            className="filter-carousel"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button className="carousel-arrow carousel-arrow-left" onClick={prevFilterSection}>
              ‹
            </button>
            
            <div className="filter-section">
              <h3 className={`filter-section-title ${filterSections[currentFilterSection].id === 'difficulty' ? 'difficulty-font' : ''}`}>
                {filterSections[currentFilterSection].id === 'difficulty' ? 'Filter Your Choice' : filterSections[currentFilterSection].title}
              </h3>
              <div className="filter-options">
                {filterSections[currentFilterSection].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      filterSections[currentFilterSection].setValue(option.value);
                      setPage(1);
                    }}
                    className={`filter-option ${filterSections[currentFilterSection].currentValue === option.value ? 'active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="carousel-arrow carousel-arrow-right" onClick={nextFilterSection}>
              ›
            </button>
          </div>
          
          <div className="filter-indicators">
            {filterSections.map((_, index) => (
              <button
                key={index}
                className={`filter-indicator ${index === currentFilterSection ? 'active' : ''}`}
                onClick={() => setCurrentFilterSection(index)}
              />
            ))}
          </div>
        </div>

        <div className="recipe-list">
          {recipes.map((recipe) => (
            <div key={recipe.recipe_id} className="popular-recipe-card" onClick={() => window.location.href = `/recipes/${recipe.recipe_id}`}>
              <img
                src={`http://localhost:5000/images/${recipe.image_url}`}
                alt={recipe.title}
                style={{ width: '202px', height: '113px', objectFit: 'cover' }}
              />
              <h3>{recipe.title}</h3>
              <p>{recipe.description}</p>
              <div className="recipe-meta">
                <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
                  {recipe.difficulty}
                </span>
                <span className="category-tag">
                  {recipe.food_category?.replace('_', ' ').toUpperCase() || 'MAIN COURSE'}
                </span>
                <span className={`diet-tag ${recipe.diet_type?.toLowerCase()}`}>
                  {recipe.diet_type?.replace('_', ' ').toUpperCase() || 'VEGETARIAN'}
                </span>
              </div>
              <div className="view-recipe-overlay">View Recipe</div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={page === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
