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
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/recipes?fetchCategories=true');
      const data = await res.json();
      if (data.success && data.categories.length > 0) {
        setDynamicCategories(data.categories);
      } else {
        setDynamicCategories([
          { value: 'main_course', label: 'Main Course' },
          { value: 'dessert', label: 'Dessert' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === 'ADD_NEW') {
      setIsAddingNewCategory(true);
      setFormData({ ...formData, food_category: '' });
    } else {
      setIsAddingNewCategory(false);
      setFormData({ ...formData, food_category: e.target.value });
    }
  };

  const handleNewCategoryChange = (e) => {
    const val = e.target.value;
    setNewCategory(val);
    setFormData({ ...formData, food_category: val.toLowerCase().replace(/\s+/g, '_') });
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
        // Clear the form, preserving the user and chef IDs
        setFormData({
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
          user_id: user.user_id,
          chef_id: user.user_type === 'chef' ? user.user_id : null
        });
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

  const inputClasses = "px-[10px] py-[8px] md:px-[15px] md:py-[12px] border-2 border-[#e0e0e0] rounded-[8px] md:rounded-[10px] text-[13px] md:text-[15px] transition-all duration-300 bg-white font-['Poppins',_sans-serif] text-[#333] focus:outline-none focus:border-[#ff6600] focus:shadow-[0_0_0_3px_rgba(255,102,0,0.1)] focus:-translate-y-[1px]";
  const labelClasses = "m-0 mb-1 md:mb-2 font-semibold text-[#ff6600] text-[0.95rem] md:text-[1.15rem] font-['Nostalgia',_serif] tracking-[0.02em]";
  const textareaClasses = `${inputClasses} resize-y h-[80px] md:h-[120px] leading-relaxed`;

  if (!isChef) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] md:min-h-[80vh] p-3 md:p-5 bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99]">
        <div className="relative bg-gradient-to-br from-white to-[#f9f9f9] py-6 px-4 md:py-10 md:px-12 rounded-[15px] md:rounded-[20px] shadow-[0_15px_35px_rgba(255,102,0,0.1),0_5px_15px_rgba(0,0,0,0.05)] max-w-[800px] w-full border border-[rgba(255,102,0,0.1)] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#ff6600] before:to-[#ff8533]">
          <h2 className="text-center mb-[15px] md:mb-[30px] text-[#ff6600] text-[1.6rem] md:text-[2.2rem] font-bold drop-shadow-[0_2px_4px_rgba(255,102,0,0.1)] font-['ElegantWomanDemo',_cursive]">Add a New Recipe</h2>
          <p>You need to have a chef account to add a recipe. You can become a chef from your profile page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] md:min-h-[80vh] p-3 md:p-5 bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99]">
      <div className="relative bg-gradient-to-br from-white to-[#f9f9f9] py-6 px-4 md:py-10 md:px-12 rounded-[15px] md:rounded-[20px] shadow-[0_15px_35px_rgba(255,102,0,0.1),0_5px_15px_rgba(0,0,0,0.05)] max-w-[800px] w-full border border-[rgba(255,102,0,0.1)] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#ff6600] before:to-[#ff8533]">
        <h2 className="text-center mb-[15px] md:mb-[30px] text-[#ff6600] text-[1.6rem] md:text-[2.2rem] font-bold drop-shadow-[0_2px_4px_rgba(255,102,0,0.1)] font-['ElegantWomanDemo',_cursive]">Add a New Recipe</h2>
        <form className="flex flex-col gap-[10px] md:gap-[15px]" onSubmit={handleSubmit}>
          <label className={labelClasses}>Recipe Title</label>
          <input className={inputClasses} type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label className={labelClasses}>Description</label>
          <textarea className={textareaClasses} name="description" value={formData.description} onChange={handleChange}></textarea>

          <div className="flex items-center gap-[8px] mb-[-7px]">
            <label className={`${labelClasses} !mb-0`}>Ingredients</label>
            <div className="relative group cursor-help flex items-center justify-center">
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#ffe6cc] text-[#ff6600] text-[12px] font-bold font-['Poppins',_sans-serif] transition-colors group-hover:bg-[#ff6600] group-hover:text-white">i</span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[140%] w-[260px] p-[12px] bg-[#333] text-white text-[12px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 text-center font-['Poppins',_sans-serif] leading-relaxed">
                Enter each ingredient on a new line (press Enter). You can use bullets (-, *, •) or numbers (1., 2.), which will be automatically formatted into a neat list!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#333]"></div>
              </div>
            </div>
          </div>
          <textarea className={textareaClasses} name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="List ingredients, one per line"></textarea>

          <div className="flex items-center gap-[8px] mb-[-7px]">
            <label className={`${labelClasses} !mb-0`}>Instructions</label>
            <div className="relative group cursor-help flex items-center justify-center">
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#ffe6cc] text-[#ff6600] text-[12px] font-bold font-['Poppins',_sans-serif] transition-colors group-hover:bg-[#ff6600] group-hover:text-white">i</span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[140%] w-[260px] p-[12px] bg-[#333] text-white text-[12px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 text-center font-['Poppins',_sans-serif] leading-relaxed">
                Enter each instruction step on a new line (press Enter). You can use numbers (1., 2.) or bullets (-, *, •), which will be automatically formatted into a neat list!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#333]"></div>
              </div>
            </div>
          </div>
          <textarea className={textareaClasses} name="instructions" value={formData.instructions} onChange={handleChange}></textarea>

          <label className={labelClasses}>Difficulty</label>
          <select className={inputClasses} name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label className={labelClasses}>Food Category</label>
          {isAddingNewCategory ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  className={`${inputClasses} flex-1`} 
                  type="text" 
                  placeholder="Enter new category name (e.g. Seafood)" 
                  value={newCategory} 
                  onChange={handleNewCategoryChange} 
                  required 
                />
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-700 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsAddingNewCategory(false);
                    setNewCategory('');
                    setFormData({ ...formData, food_category: dynamicCategories[0]?.value || 'main_course' });
                  }}
                >
                  Cancel
                </button>
              </div>
              {newCategory && dynamicCategories.find(c => c.value === formData.food_category || c.label.toLowerCase() === newCategory.toLowerCase()) && (
                <span className="text-orange-500 text-sm mt-[-4px] ml-1">This category already exists in the list!</span>
              )}
            </div>
          ) : (
            <select className={inputClasses} name="food_category" value={formData.food_category} onChange={handleCategoryChange}>
              {dynamicCategories.length > 0 ? (
                dynamicCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))
              ) : (
                <option value="main_course">Main Course</option>
              )}
              <option value="ADD_NEW" className="font-bold text-[#ff6600]">+ Add New Category</option>
            </select>
          )}

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

          <div>
            <label className={labelClasses}>Nutrition Information</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-[10px] mt-1">
              <div className="flex flex-col">
                <span className="text-[0.85rem] text-[#666] mb-[4px] ml-[5px] font-medium">Calories</span>
                <input className={inputClasses} type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="kcal" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.85rem] text-[#666] mb-[4px] ml-[5px] font-medium">Protein (g)</span>
                <input className={inputClasses} type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="g" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.85rem] text-[#666] mb-[4px] ml-[5px] font-medium">Carbs (g)</span>
                <input className={inputClasses} type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="g" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.85rem] text-[#666] mb-[4px] ml-[5px] font-medium">Fat (g)</span>
                <input className={inputClasses} type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="g" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.85rem] text-[#666] mb-[4px] ml-[5px] font-medium">Fiber (g)</span>
                <input className={inputClasses} type="number" name="fiber" value={formData.fiber} onChange={handleChange} placeholder="g" />
              </div>
            </div>
          </div>

          <label className={labelClasses}>Recipe Image</label>
          {formData.image_url ? (
            <div className="relative w-full h-[180px] md:h-[200px] rounded-[10px] overflow-hidden border-2 border-[#ff6600]">
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
                setFormData({ ...formData, image_url: res[0].ufsUrl || res[0].url });
              }}
              onUploadError={(error) => {
                alert(`Upload failed: ${error.message}`);
              }}
              content={{
                allowedContent: "Image up to 4MB (4:3 aspect ratio recommended)"
              }}
              appearance={{
                    container: "border-2 border-dashed border-[#ff6600] bg-gradient-to-b from-[#fff5f0] to-white rounded-[12px] py-[15px] px-[10px] md:py-[20px] md:px-[15px] h-[180px] md:h-[220px] cursor-pointer transition-all duration-300 hover:border-[#e55a00] hover:bg-[#fff0e6]",
                uploadIcon: "text-[#ff6600] w-[45px] h-[45px] mb-[10px]",
                label: "text-[#333] font-semibold text-[1.1rem] hover:text-[#ff6600] transition-colors",
                allowedContent: "text-[#888] text-[0.85rem] mt-[5px]",
                    button: "bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white text-[0.8rem] md:text-[0.9rem] font-semibold py-[6px] px-[12px] md:py-[8px] md:px-[16px] rounded-[8px] mt-[10px] md:mt-[15px] shadow-[0_2px_8px_rgba(255,102,0,0.3)] transition-all hover:shadow-[0_4px_12px_rgba(255,102,0,0.4)]"
              }}
            />
          )}

          <button className="mt-[20px] md:mt-[30px] bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white py-[12px] md:py-[15px] px-[30px] border-none rounded-[12px] cursor-pointer text-[16px] md:text-[18px] font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(255,102,0,0.3)] hover:bg-gradient-to-br hover:from-[#e55a00] hover:to-[#ff6600] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(255,102,0,0.4)] active:translate-y-0" type="submit">Add Recipe</button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
