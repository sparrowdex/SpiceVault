import React, { useState, useEffect } from 'react';
import './addrecipe.css';

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    ingredients: '',
    difficulty: '',
    food_category: 'main_course',
    diet_type: 'vegetarian',
    image_url: '',
    preparation_time: '',
    cooking_time: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    nutrition_info: '',
    user_id: null,
    chef_id: null
  });

  const [user, setUser] = useState(null);
  const [isChef, setIsChef] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        user_id: parsedUser.user_id,
        chef_id: parsedUser.user_type === 'chef' ? parsedUser.user_id : null
      }));
      setIsChef(parsedUser.user_type === 'chef');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isChef) {
      alert('You need a chef account to add recipes. Please become a chef from your profile.');
      return;
    }

    // Construct nutrition_info from individual fields
    const nutritionInfo = `calories: ${formData.calories}, protein: ${formData.protein}g, carbs: ${formData.carbs}g, fat: ${formData.fat}g, fiber: ${formData.fiber}g`;

    const updatedFormData = {
      ...formData,
      nutrition_info: nutritionInfo
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFormData)
      });

      const data = await res.json();
      if (res.ok) {
        alert('Recipe added successfully!');
        console.log(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!user) {
    return <p>Please log in to add a recipe.</p>;
  }

  if (!isChef) {
    return (
      <div className="add-recipe-page">
        <div className="add-recipe-container">
          <h2>Add a New Recipe</h2>
          <p>You need to have a chef account to add a recipe. You can become a chef from your profile page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <h2>Add a New Recipe</h2>
        <form className="add-recipe-form" onSubmit={handleSubmit}>
          <label>Recipe Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

          <label>Ingredients</label>
          <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="List ingredients, one per line"></textarea>

          <label>Instructions</label>
          <textarea name="instructions" value={formData.instructions} onChange={handleChange}></textarea>

          <label>Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label>Food Category</label>
          <select name="food_category" value={formData.food_category} onChange={handleChange}>
            <option value="main_course">Main Course</option>
            <option value="appetizer">Appetizer</option>
            <option value="dessert">Dessert</option>
            <option value="breakfast">Breakfast</option>
            <option value="italian">Italian</option>
            <option value="asian">Asian</option>
            <option value="mexican">Mexican</option>
            <option value="healthy">Healthy</option>
            <option value="comfort_food">Comfort Food</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="beverage">Beverage</option>
            <option value="soup">Soup</option>
            <option value="salad">Salad</option>
            <option value="side_dish">Side Dish</option>
          </select>

          <label>Diet Type</label>
          <select name="diet_type" value={formData.diet_type} onChange={handleChange}>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="mixed">Mixed (Both Options)</option>
          </select>

          <label>Preparation Time</label>
          <input type="text" name="preparation_time" value={formData.preparation_time} onChange={handleChange} />

          <label>Cooking Time</label>
          <input type="text" name="cooking_time" value={formData.cooking_time} onChange={handleChange} />

          <label>Calories</label>
          <input type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="e.g., 420" />

          <label>Protein (g)</label>
          <input type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="e.g., 18" />

          <label>Carbs (g)</label>
          <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="e.g., 45" />

          <label>Fat (g)</label>
          <input type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="e.g., 12" />

          <label>Fiber (g)</label>
          <input type="number" name="fiber" value={formData.fiber} onChange={handleChange} placeholder="e.g., 8" />

          <label>Image URL</label>
          <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />

          <button type="submit">Add Recipe</button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;



