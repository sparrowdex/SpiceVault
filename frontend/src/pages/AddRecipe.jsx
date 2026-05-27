import React, { useState, useEffect } from 'react';
import { UploadDropzone } from '../utils/uploadthing';
import "@uploadthing/react/styles.css";

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

  const inputClasses = "px-[15px] py-[12px] border-2 border-[#e0e0e0] rounded-[10px] text-[15px] transition-all duration-300 bg-white font-['TropicalCalm',_serif] focus:outline-none focus:border-[#ff6600] focus:shadow-[0_0_0_3px_rgba(255,102,0,0.1)] focus:-translate-y-[1px]";
  const labelClasses = "m-0 mb-2 font-semibold text-[#ff6600] text-base font-['SweetHipster',_cursive]";
  const textareaClasses = `${inputClasses} resize-y h-[120px] leading-relaxed`;

  if (!isChef) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] p-5 bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99]">
        <div className="relative bg-gradient-to-br from-white to-[#f9f9f9] py-10 px-12 rounded-[20px] shadow-[0_15px_35px_rgba(255,102,0,0.1),0_5px_15px_rgba(0,0,0,0.05)] max-w-[800px] w-full border border-[rgba(255,102,0,0.1)] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#ff6600] before:to-[#ff8533]">
          <h2 className="text-center mb-[30px] text-[#ff6600] text-[2.2rem] font-bold drop-shadow-[0_2px_4px_rgba(255,102,0,0.1)] font-['ElegantWomanDemo',_cursive]">Add a New Recipe</h2>
          <p>You need to have a chef account to add a recipe. You can become a chef from your profile page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-5 bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99]">
      <div className="relative bg-gradient-to-br from-white to-[#f9f9f9] py-10 px-12 rounded-[20px] shadow-[0_15px_35px_rgba(255,102,0,0.1),0_5px_15px_rgba(0,0,0,0.05)] max-w-[800px] w-full border border-[rgba(255,102,0,0.1)] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#ff6600] before:to-[#ff8533]">
        <h2 className="text-center mb-[30px] text-[#ff6600] text-[2.2rem] font-bold drop-shadow-[0_2px_4px_rgba(255,102,0,0.1)] font-['ElegantWomanDemo',_cursive]">Add a New Recipe</h2>
        <form className="flex flex-col gap-[15px]" onSubmit={handleSubmit}>
          <label className={labelClasses}>Recipe Title</label>
          <input className={inputClasses} type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label className={labelClasses}>Description</label>
          <textarea className={textareaClasses} name="description" value={formData.description} onChange={handleChange}></textarea>

          <label className={labelClasses}>Ingredients</label>
          <textarea className={textareaClasses} name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="List ingredients, one per line"></textarea>

          <label className={labelClasses}>Instructions</label>
          <textarea className={textareaClasses} name="instructions" value={formData.instructions} onChange={handleChange}></textarea>

          <label className={labelClasses}>Difficulty</label>
          <select className={inputClasses} name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label className={labelClasses}>Food Category</label>
          <select className={inputClasses} name="food_category" value={formData.food_category} onChange={handleChange}>
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

          <label className={labelClasses}>Diet Type</label>
          <select className={inputClasses} name="diet_type" value={formData.diet_type} onChange={handleChange}>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="mixed">Mixed (Both Options)</option>
          </select>

          <label className={labelClasses}>Preparation Time</label>
          <input className={inputClasses} type="text" name="preparation_time" value={formData.preparation_time} onChange={handleChange} />

          <label className={labelClasses}>Cooking Time</label>
          <input className={inputClasses} type="text" name="cooking_time" value={formData.cooking_time} onChange={handleChange} />

          <label className={labelClasses}>Calories</label>
          <input className={inputClasses} type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="e.g., 420" />

          <label className={labelClasses}>Protein (g)</label>
          <input className={inputClasses} type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="e.g., 18" />

          <label className={labelClasses}>Carbs (g)</label>
          <input className={inputClasses} type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="e.g., 45" />

          <label className={labelClasses}>Fat (g)</label>
          <input className={inputClasses} type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="e.g., 12" />

          <label className={labelClasses}>Fiber (g)</label>
          <input className={inputClasses} type="number" name="fiber" value={formData.fiber} onChange={handleChange} placeholder="e.g., 8" />

          <label className={labelClasses}>Recipe Image</label>
          {formData.image_url ? (
            <div className="relative w-full h-[200px] rounded-[10px] overflow-hidden border-2 border-[#ff6600]">
              <img src={formData.image_url} alt="Recipe preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, image_url: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer shadow-md hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setFormData({ ...formData, image_url: res[0].url });
              }}
            />
          )}

          <button className="mt-[30px] bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white py-[15px] px-[30px] border-none rounded-[12px] cursor-pointer text-[18px] font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(255,102,0,0.3)] hover:bg-gradient-to-br hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(255,102,0,0.4)] active:translate-y-0" type="submit">Add Recipe</button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
