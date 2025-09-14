import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './viewrecipe.css';

function ViewRecipe({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchRecipeAndRating = async () => {
      try {
        // Fetch recipe details
        const resRecipe = await fetch(`http://localhost:5000/api/recipes/${id}`);
        const dataRecipe = await resRecipe.json();
        setRecipe(dataRecipe);

        // Fetch user's existing rating for this recipe
        if (user && user.user_id) { // Check if user is logged in
          const resRating = await fetch(`http://localhost:5000/api/ml/ratings/${user.user_id}?recipe_id=${id}`);
          const dataRating = await resRating.json();

          if (dataRating.success && dataRating.ratings.length > 0) {
            setRating(dataRating.ratings[0].rating);
          }
        }

      } catch (error) {
        console.error('Failed to fetch recipe or rating:', error);
      }
    };

    fetchRecipeAndRating();
  }, [id, user]); // Add user to dependency array

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
      });
      navigate('/'); // Redirect to homepage after delete
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleRating = async (newRating) => {
    if (!user || !user.user_id) {
      alert('Please log in to rate recipes.');
      return;
    }
    setRating(newRating);
    try {
      await fetch(`http://localhost:5000/api/ml/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_id: id, rating: newRating, user_id: user.user_id }),
      });
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  if (!recipe) return <div className="view-recipe-page">Loading...</div>;

  return (
    <div className="view-recipe-page">
      <div className="view-recipe-card">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
          style={{
            background: 'linear-gradient(135deg, #ff6600, #ff8533)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          ← Back
        </button>
        <h2>{recipe.title}</h2>
        <img
          src={`http://localhost:5000/images/${recipe.image_url}`}
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
          <h3>Recipe Details</h3>
          <div className="recipe-info-row">
            <div className="recipe-info-box">
              <strong>Difficulty:</strong><br />
              <span className={`difficulty-tag ${recipe.difficulty?.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            </div>
            <div className="recipe-info-box">
              <strong>Category:</strong><br />
              <span className="category-tag">
                {recipe.food_category?.replace('_', ' ').toUpperCase() || 'Main Course'}
              </span>
            </div>
            <div className="recipe-info-box">
              <strong>Diet Type:</strong><br />
              <span className={`diet-tag ${recipe.diet_type?.toLowerCase()}`}>
                {recipe.diet_type?.replace('_', ' ').toUpperCase() || 'Vegetarian'}
              </span>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Rate this recipe</h3>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'star-filled' : 'star-empty'}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
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