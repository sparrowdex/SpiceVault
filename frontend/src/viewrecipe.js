// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import './viewrecipe.css';

// function ViewRecipe() {
//   const { id } = useParams(); // Get the recipe ID from the URL
//   const [recipe, setRecipe] = useState(null);

//   useEffect(() => {
//     const fetchRecipe = async () => {
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`);
//         const data = await res.json();
//         setRecipe(data);
//       } catch (error) {
//         console.error('Failed to fetch recipe:', error);
//       }
//     };

//     fetchRecipe();
//   }, [id]);

//   if (!recipe) return <div className="view-recipe-page">Loading...</div>;

//   return (
//     <div className="view-recipe-page">
//       <header className="header">
//         <h1>Spice Vault</h1>
//         <nav>
//           <a href="/">Home</a>
//           <a href="/addrecipe">Add Recipe</a>
//           <a href="/recommendations">Recommendations</a>
//         </nav>
//       </header>

//       <div className="view-recipe-card">
//         <h2>{recipe.title}</h2>
//         <img
//           src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
//           alt={recipe.title}
//         />

//         <div className="section">
//           <h3>Description</h3>
//           <p>{recipe.description}</p>
//         </div>

//         <div className="section">
//           <h3>Instructions</h3>
//           <p>{recipe.instructions}</p>
//         </div>

//         <div className="section">
//           <h3>Recipe Info</h3>
//           <div className="recipe-info-row">
//             <div className="recipe-info-box">
//               <strong>Prep Time:</strong><br />{recipe.preparation_time} mins
//             </div>
//             <div className="recipe-info-box">
//               <strong>Cooking Time:</strong><br />{recipe.cooking_time} mins
//             </div>
//             <div className="recipe-info-box">
//               <strong>Nutrition:</strong><br />{recipe.nutrition_info}
//             </div>
//           </div>
//         </div>

//         <div className="section">
//           <h3>Difficulty</h3>
//           <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
//             {recipe.difficulty}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ViewRecipe;
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import './viewrecipe.css';

// function ViewRecipe() {
//   const { id } = useParams();
//   const [recipe, setRecipe] = useState(null);

//   useEffect(() => {
//     const fetchRecipe = async () => {
//       try {
//         const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`);
//         const data = await res.json();
//         setRecipe(data);
//       } catch (error) {
//         console.error('Failed to fetch recipe:', error);
//       }
//     };

//     fetchRecipe();
//   }, [id]);

//   if (!recipe) return <div className="view-recipe-page">Loading...</div>;

//   return (
//     <div className="view-recipe-page">
//       <div className="view-recipe-card">
//         <h2>{recipe.title}</h2>
//         <img
//           src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
//           alt={recipe.title}
//         />

//         <div className="section">
//           <h3>Description</h3>
//           <p>{recipe.description}</p>
//         </div>

//         <div className="section">
//           <h3>Instructions</h3>
//           <p>{recipe.instructions}</p>
//         </div>

//         <div className="section">
//           <h3>Recipe Info</h3>
//           <div className="recipe-info-row">
//             <div className="recipe-info-box">
//               <strong>Prep Time:</strong><br />{recipe.preparation_time} mins
//             </div>
//             <div className="recipe-info-box">
//               <strong>Cooking Time:</strong><br />{recipe.cooking_time} mins
//             </div>
//             <div className="recipe-info-box">
//               <strong>Nutrition:</strong><br />{recipe.nutrition_info}
//             </div>
//           </div>
//         </div>

//         <div className="section">
//           <h3>Difficulty</h3>
//           <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
//             {recipe.difficulty}
//           </span>
//         </div>
//       </div>
//     </div>
  
//   );
// }

// export default ViewRecipe;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './viewrecipe.css';

function ViewRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/recipes/${id}`, {
        method: 'DELETE',
      });
      navigate('/'); // Redirect to homepage after delete
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (!recipe) return <div className="view-recipe-page">Loading...</div>;

  return (
    <div className="view-recipe-page">
      <div className="view-recipe-card">
        <h2>{recipe.title}</h2>
        <img
          src={`${process.env.REACT_APP_API_URL}/images/${recipe.image_url}`}
          alt={recipe.title}
        />

        <div className="section">
          <h3>Description</h3>
          <p>{recipe.description}</p>
        </div>

        <div className="section">
          <h3>Instructions</h3>
          <p>{recipe.instructions}</p>
        </div>

        <div className="section">
          <h3>Recipe Info</h3>
          <div className="recipe-info-row">
            <div className="recipe-info-box">
              <strong>Prep Time:</strong><br />{recipe.preparation_time} 
            </div>
            <div className="recipe-info-box">
              <strong>Cooking Time:</strong><br />{recipe.cooking_time} 
            </div>
            <div className="recipe-info-box">
              <strong>Nutrition:</strong><br />{recipe.nutrition_info}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Difficulty</h3>
          <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="section">
          <button className="delete-button" onClick={() => setShowModal(true)}>
            Delete Recipe
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this recipe?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleDelete}>Yes, Delete</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecipe;
