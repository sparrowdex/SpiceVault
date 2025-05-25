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
//               src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
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
//               src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
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
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecipes = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        page,
        limit: 9,
        difficulty,
        search
      });

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes?${query}`);
      const data = await res.json();
      setRecipes(data.recipes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
  }, [page, difficulty, search]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div className="home-page">
      <h2>All Recipes</h2>

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

        <div className="difficulty-buttons">
          {['', 'Easy', 'Medium', 'Hard'].map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                setPage(1);
              }}
              className={difficulty === level ? 'active' : ''}
            >
              {level || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.recipe_id} className="recipe-card">
            <img
              src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
              alt={recipe.title}
              style={{ width: '202px', height: '113px', objectFit: 'cover' }}
            />
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <a href={`/recipes/${recipe.recipe_id}`}>View Recipe</a>
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
  );
};

export default Home;
