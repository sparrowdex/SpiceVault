import React, { useState } from 'react';
import './addrecipe.css';

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    difficulty: '',
    food_category: 'main_course',
    diet_type: 'vegetarian',
    image_url: '',
    preparation_time: '',
    cooking_time: '',
    nutrition_info: '',
    user_id: 1, // Example user_id for testing; replace with dynamic value if needed
    chef_id: 2  // Example chef_id; change according to app logic
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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

  return (
    <div className="add-recipe-page">
      <div className="add-recipe-container">
        <h2>Add a New Recipe</h2>
        <form className="add-recipe-form" onSubmit={handleSubmit}>
          <label>Recipe Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

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
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="mixed">Mixed (Both Options)</option>
          </select>

          <label>Preparation Time</label>
          <input type="text" name="preparation_time" value={formData.preparation_time} onChange={handleChange} />

          <label>Cooking Time</label>
          <input type="text" name="cooking_time" value={formData.cooking_time} onChange={handleChange} />

          <label>Nutrition Info</label>
          <input type="text" name="nutrition_info" value={formData.nutrition_info} onChange={handleChange} />

          <label>Image URL</label>
          <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />

          <button type="submit">Add Recipe</button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;



