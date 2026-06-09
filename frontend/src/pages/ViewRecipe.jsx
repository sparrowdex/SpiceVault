import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ViewRecipe({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipeCardRef = useRef(null);

  const [recipe, setRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [healthCategory, setHealthCategory] = useState(null);

  // New state for review comment and rating input
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);


  // New state for reply box open and reply text
  const [replyBoxOpen, setReplyBoxOpen] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Pagination state for reviews
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // New state for intricate design features
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [cookMode, setCookMode] = useState(false);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleIngredient = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const scrollToRecipe = () => {
    recipeCardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleReplyBox = (reviewId) => {
    if (replyBoxOpen === reviewId) {
      setReplyBoxOpen(null);
      setReplyText('');
    } else {
      setReplyBoxOpen(reviewId);
      setReplyText('');
    }
  };

  const submitReview = async () => {
    if (!user || !user.user_id) {
      alert('Please log in to submit a review.');
      return;
    }
    if (newReviewRating === 0) {
      alert('Please select a rating.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          recipe_id: id,
          rating: newReviewRating,
          user_id: user.user_id,
          review_text: newReviewText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => [data.rating, ...prev]);
        setNewReviewText('');
        setNewReviewRating(0);
        setRating(newReviewRating); 
        setCurrentPage(1); 
      } else {
        alert('Failed to submit review.');
      }
    } catch (error) {
      console.error('Submit review failed:', error);
      alert('Failed to submit review.');
    }
  };

  const submitReply = async (reviewId) => {
    if (!user || !user.user_id) {
      alert('Please log in to submit a reply.');
      return;
    }
    if (!replyText.trim()) {
      alert('Reply text cannot be empty.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          review_id: reviewId,
          user_id: user.user_id,
          text: replyText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.review_id === reviewId
              ? { ...review, replies: [...(review.replies || []), data.newReply] }
              : review
          )
        );
        setReplyBoxOpen(null);
        setReplyText('');
      } else {
        alert('Failed to submit reply.');
      }
    } catch (error) {
      console.error('Submit reply failed:', error);
      alert('Failed to submit reply.');
    }
  };

  useEffect(() => {
    const fetchRecipeAndRating = async () => {
      try {
        const resRecipe = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`);
        const dataRecipe = await resRecipe.json();
        setRecipe(dataRecipe);

        if (user && user.user_id && user.token) {
          const resRating = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings/${user.user_id}?recipe_id=${id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (resRating.ok) {
            const dataRating = await resRating.json();
            if (dataRating.success && dataRating.ratings.length > 0) {
              setRating(dataRating.ratings[0].rating);
            } else {
              setRating(0); 
            }
          }
        } else {
          setRating(0);
        }

        setLoadingReviews(true);
        const headers = {};
        if (user && user.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }
        const resReviews = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings?recipe_id=${id}`, { headers });
        const dataReviews = await resReviews.json();
        if (dataReviews.success) {
          setReviews(dataReviews.ratings);
        } else {
          setErrorReviews('Failed to load reviews');
        }

        try {
          const resHealth = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/recipe-health-score/${id}`, { headers });
          const dataHealth = await resHealth.json();
          if (dataHealth.success) {
            setHealthScore(dataHealth.healthScore);
            setHealthCategory(dataHealth.category);
          }
        } catch (healthError) {
          console.warn('Failed to fetch health score:', healthError);
        }

        // Fetch related recipes
        try {
          const resRelated = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes?limit=4`);
          const dataRelated = await resRelated.json();
          if (resRelated.ok && dataRelated.success) {
            setRelatedRecipes(dataRelated.recipes.filter(r => r.recipe_id !== parseInt(id)).slice(0, 3));
          }
        } catch (err) {
          console.warn('Failed to fetch related recipes');
        }

      } catch (error) {
        console.error('Failed to fetch recipe or rating:', error);
        setErrorReviews('Failed to load recipe data');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchRecipeAndRating();
    window.scrollTo(0,0);
  }, [id, user]);

  const handleDelete = async () => {
    if (!user || !user.token) {
      alert('Please log in to delete recipes.');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate('/');
      } else {
        alert(data.error || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete recipe');
    }
  };

  const renderIngredientChecklist = (text) => {
    if (!text) return <p className="text-[#888] italic font-['Poppins',_sans-serif]">Not provided</p>;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return (
      <ul className="list-none p-0 m-0 mt-4 space-y-3">
        {lines.map((line, index) => {
          const cleanedLine = line.replace(/^[-*•]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
          const isChecked = checkedIngredients.has(index);
          return (
            <li key={index} className="flex items-start cursor-pointer group" onClick={() => toggleIngredient(index)}>
              <div className="mt-1 flex-shrink-0">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => toggleIngredient(index)}
                  className="w-5 h-5 accent-[#ff6600] cursor-pointer"
                />
              </div>
              <span className={`ml-3 text-lg font-['Poppins',_sans-serif] transition-all duration-200 ${isChecked ? 'text-gray-400 line-through' : 'text-[#333] group-hover:text-[#ff6600]'}`}>
                {cleanedLine}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderInstructions = (text) => {
    if (!text) return <p className="text-[#888] italic font-['Poppins',_sans-serif]">Not provided</p>;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return (
      <div className="mt-6 space-y-6">
        {lines.map((line, index) => {
          const cleanedLine = line.replace(/^[-*•]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
          return (
            <div key={index} className="flex items-start">
              <span className="font-['Nostalgia',_serif] font-bold text-2xl leading-none text-[#ff6600] w-10 flex-shrink-0 mt-1">{index + 1}.</span>
              <p className="font-['Poppins',_sans-serif] text-[15px] text-[#444] leading-relaxed m-0">{cleanedLine}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Overall average rating calculation
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(2)
    : "0";

  if (!recipe) return <div className="font-['Poppins',_sans-serif] min-h-screen py-10 px-5 flex justify-center items-start text-[#ff6600] bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99] font-bold text-xl">Loading delicious recipe...</div>;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FFE6CC] to-[#FFCC99] text-[#333] pb-20 ${cookMode ? 'bg-none bg-white' : ''} font-['Poppins',_sans-serif]`}>
      {/* Top Banner Navigation */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-orange-200 py-3 px-6 hidden md:block">
        <div className="max-w-screen-2xl mx-auto text-sm text-[#ff6600] font-semibold flex items-center space-x-2">
          <Link to="/" className="hover:text-[#e55a00] transition-colors">Home</Link>
          <span className="text-orange-300">»</span>
          <span className="capitalize">{recipe.food_category?.replace('_', ' ') || 'Recipes'}</span>
          <span className="text-orange-300">»</span>
          <span className="font-['Nostalgia',_serif] text-[#5C4033] text-base">{recipe.title}</span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        
        {/* Main Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-[0_10px_30px_rgba(255,102,0,0.1)] border border-white/50">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Nostalgia',_serif] text-[#ff6600] mb-6 leading-tight drop-shadow-sm">
            {recipe.title}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-semibold tracking-wider uppercase text-[#5C4033]">
            <span>By {recipe.user ? `${recipe.user.f_name} ${recipe.user.l_name}` : 'Unknown Author'}</span>
            <span className="hidden sm:inline text-orange-300">•</span>
            <span>{new Date(recipe.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={scrollToRecipe} className="px-6 py-2.5 border-2 border-[#ff6600] text-[#ff6600] rounded-[8px] hover:bg-[#ff6600] hover:text-white transition-all font-bold tracking-wide shadow-sm">
              Skip to Recipe
            </button>
            <button className="px-6 py-2.5 border-2 border-[#5C4033] text-[#5C4033] rounded-[8px] hover:bg-[#5C4033] hover:text-white transition-all font-bold tracking-wide shadow-sm">
              Save Recipe
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(255,102,0,0.2)] mb-12 border-4 border-white">
          <img
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
            alt={recipe.title}
          />
        </div>

        {/* Content Layout (Grid) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* LEFT: Main Story & Recipe Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-10 rounded-2xl shadow-[0_10px_30px_rgba(255,102,0,0.1)] border border-white/50 mb-10">
              <div className="prose prose-lg max-w-none text-[#444] font-['Poppins',_sans-serif] leading-relaxed text-justify sm:text-left text-[15px]">
                {recipe.description && (
                  <div>
                    <p className="text-xl mb-2 font-['Nostalgia',_serif] text-[#5C4033] whitespace-pre-line">
                      {isDescriptionExpanded || recipe.description.length <= 250 
                        ? recipe.description 
                        : `${recipe.description.substring(0, 250)}...`}
                    </p>
                    {recipe.description.length > 250 && (
                      <button 
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-[#ff6600] hover:underline font-semibold text-sm mb-6"
                      >
                        {isDescriptionExpanded ? "Show Less" : "Read More"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RECIPE CARD */}
            <div ref={recipeCardRef} className="bg-white rounded-[20px] p-6 sm:p-10 shadow-[0_15px_40px_rgba(255,102,0,0.15)] border-2 border-orange-100 relative">
              
              {/* Decorative top ribbon */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ff6600] to-[#ff8533] rounded-t-[18px]"></div>

              <h2 className="text-3xl md:text-4xl font-['Nostalgia',_serif] text-[#5C4033] mb-4 mt-2 text-center sm:text-left">{recipe.title}</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-6 border-b border-orange-100 pb-6">
                <div className="text-[#ff6600] text-xl">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</div>
                <span className="text-[#888] font-medium text-sm ml-2">({reviews.length} Ratings)</span>
              </div>

              {/* Cook Mode & Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-orange-100 gap-6">
                <div className="flex items-center space-x-3 justify-center sm:justify-start">
                  <button 
                    onClick={() => setCookMode(!cookMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${cookMode ? 'bg-[#ff6600]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${cookMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="font-bold text-[#5C4033]">Cook Mode</span>
                  <span className="text-xs text-gray-500 hidden sm:inline">(Keep screen awake)</span>
                </div>
                
                <div className="text-sm text-gray-600 text-center sm:text-right">
                  <span className="font-bold uppercase tracking-wider text-[#ff6600]">Chef:</span> {recipe.user ? `${recipe.user.f_name} ${recipe.user.l_name}` : 'SpiceVault Chef'}
                </div>
              </div>

              {/* Timing & Nutrition Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center sm:text-left bg-orange-50/50 p-6 rounded-xl border border-orange-100/50">
                <div>
                  <p className="font-bold uppercase text-xs tracking-wider text-[#ff6600] mb-1">Prep Time</p>
                  <p className="font-medium text-[#5C4033]">{recipe.preparation_time}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs tracking-wider text-[#ff6600] mb-1">Cook Time</p>
                  <p className="font-medium text-[#5C4033]">{recipe.cooking_time}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs tracking-wider text-[#ff6600] mb-1">Diet Type</p>
                  <p className="font-medium text-[#5C4033] capitalize">{recipe.diet_type?.replace('_', ' ') || 'Mixed'}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-xs tracking-wider text-[#ff6600] mb-1">Difficulty</p>
                  <p className="font-medium text-[#5C4033] capitalize">{recipe.difficulty || 'Medium'}</p>
                </div>
                {recipe.nutrition_info && (
                  <div className="col-span-2 md:col-span-4 mt-2 bg-white p-3 rounded-lg shadow-sm text-sm text-[#555] text-left border border-orange-100">
                    <span className="font-bold text-[#ff6600]">Nutrition Estimate: </span> 
                    {recipe.nutrition_info}
                  </div>
                )}
                {healthScore !== null && (
                  <div className="col-span-2 md:col-span-4 bg-white p-3 rounded-lg shadow-sm text-sm text-[#555] text-left border border-orange-100 mt-2">
                    <span className="font-bold text-[#ff6600]">Health Score: </span> 
                    {healthScore}/100 ({healthCategory})
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button className="flex-1 bg-gradient-to-br from-[#ff6600] to-[#ff8533] hover:from-[#e55a00] hover:to-[#ff6600] text-white py-3 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(255,102,0,0.3)] hover:-translate-y-1 text-[15px] font-bold tracking-wider uppercase">Save Recipe</button>
                <button className="flex-1 bg-white border-2 border-[#ff6600] text-[#ff6600] hover:bg-[#fff5f0] py-3 px-4 rounded-xl transition-all shadow-sm hover:-translate-y-1 text-[15px] font-bold tracking-wider uppercase" onClick={() => window.print()}>Print</button>
              </div>

              {/* Instructions */}
              <div className="mt-10">
                <h3 className="text-2xl font-['Nostalgia',_serif] text-[#5C4033] mb-4 border-b border-orange-200 pb-2">Instructions</h3>
                {renderInstructions(recipe.instructions)}
              </div>

            </div>

            {/* REVIEWS SECTION */}
            <div className="mt-12 bg-white rounded-[20px] p-6 sm:p-10 shadow-[0_15px_35px_rgba(255,102,0,0.1)] border border-orange-100">
              <h3 className="text-3xl font-['Nostalgia',_serif] text-[#5C4033] mb-6">Comments & Reviews</h3>
              <div className="flex items-center gap-3 mb-10 bg-orange-50 p-4 rounded-xl inline-flex border border-orange-100">
                <div className="text-2xl text-[#ff6600]">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</div>
                <span className="font-bold text-lg text-[#5C4033]">{averageRating} from {reviews.length} votes</span>
              </div>

              {/* Add Comment Form */}
              <div className="bg-gradient-to-br from-[#fff5f0] to-white border border-orange-200 p-6 sm:p-8 rounded-xl shadow-sm mb-12">
                <h4 className="text-xl font-['Nostalgia',_serif] font-bold text-[#ff6600] mb-4">Add a Comment</h4>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#5C4033] mb-2">Recipe Rating</label>
                  <div className="text-3xl cursor-pointer text-[#ccc] flex gap-1 drop-shadow-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`hover:text-[#ff6600] transition-colors ${star <= newReviewRating ? 'text-[#ff6600]' : 'text-[#ccc]'}`}
                        onClick={() => setNewReviewRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#5C4033] mb-2">Comment *</label>
                  <textarea
                    className="w-full min-h-[120px] resize-y p-4 border-2 border-orange-100 rounded-xl focus:border-[#ff6600] outline-none font-sans text-[#333] transition-colors"
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you think of the recipe?"
                  />
                </div>


                <button 
                  className="bg-gradient-to-br from-[#ff6600] to-[#ff8533] hover:from-[#e55a00] hover:to-[#ff6600] text-white py-3 px-8 rounded-xl transition-all shadow-[0_4px_12px_rgba(255,102,0,0.3)] hover:-translate-y-1 font-bold tracking-wider" 
                  onClick={submitReview}
                >
                  Post Comment
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-8">
                {loadingReviews ? (
                  <p className="italic text-gray-500 font-medium">Loading thoughtful reviews...</p>
                ) : currentReviews.length > 0 ? (
                  currentReviews.map((review) => (
                    <div key={review.review_id} className="border-b border-gray-100 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-lg text-[#5C4033]">{review.user ? `${review.user.f_name} ${review.user.l_name}` : 'Anonymous'}</div>
                        <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                          {review.datestamp ? new Date(review.datestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div className="text-[#ff6600] text-sm mb-3">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.review_text && (
                        <p className="text-[#444] leading-relaxed mb-3 bg-gray-50 p-4 rounded-xl border border-gray-100">{review.review_text}</p>
                      )}
                      
                      {/* Chef Reply logic */}
                      {user && user.user_id === recipe.chef_id && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleReplyBox(review.review_id)}
                            className="text-sm font-bold text-[#ff6600] hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Reply
                          </button>
                          {replyBoxOpen === review.review_id && (
                            <div className="mt-3">
                              <textarea
                                className="w-full min-h-[60px] resize-y p-3 border-2 border-orange-200 rounded-xl focus:border-[#ff6600] outline-none font-sans text-sm"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                              />
                              <button className="mt-2 py-2 px-6 bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white rounded-[8px] font-bold shadow-md hover:shadow-lg transition-all" onClick={() => submitReply(review.review_id)}>Submit Reply</button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Replies List */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="ml-8 mt-4 pl-4 border-l-[3px] border-[#ff6600] space-y-4">
                          {review.replies.map((reply) => (
                            <div key={reply.reply_id} className="bg-orange-50 p-4 rounded-xl">
                              <div className="font-bold text-sm text-[#5C4033]">
                                {reply.user ? `${reply.user.f_name} ${reply.user.l_name}` : 'Anonymous'} 
                                {reply.user && reply.user.user_type === 'chef' && <span className="bg-[#ff6600] text-white text-[10px] px-2 py-1 rounded-full ml-2 font-bold uppercase">Chef</span>}
                              </div>
                              <p className="text-sm text-[#444] mt-2 mb-0">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="italic text-gray-500 font-medium">No comments yet. Be the first to share your thoughts!</p>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      className="py-2 px-6 border-2 border-[#ff6600] rounded-xl bg-white text-[#ff6600] font-bold hover:bg-[#fff5f0] disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white transition-colors"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="font-bold text-[#5C4033]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="py-2 px-6 border-2 border-[#ff6600] rounded-xl bg-white text-[#ff6600] font-bold hover:bg-[#fff5f0] disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white transition-colors"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chef Admin Actions */}
            {user && user.user_id === recipe.user_id && (
              <div className="mt-12 text-center flex justify-center gap-4">
                <button className="bg-gradient-to-br from-[#ff6600] to-[#ff8533] hover:from-[#e55a00] hover:to-[#ff6600] text-white border-none py-3 px-8 rounded-xl font-bold tracking-wider transition-colors shadow-[0_4px_15px_rgba(255,102,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,102,0,0.4)] cursor-pointer" onClick={() => navigate(`/editrecipe/${recipe.recipe_id}`)}>
                  Edit Recipe
                </button>
                <button className="bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 py-3 px-8 rounded-xl font-bold tracking-wider transition-colors shadow-sm cursor-pointer" onClick={() => setShowModal(true)}>
                  Delete Recipe
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8 mt-8 lg:mt-0">
            {/* Meet the Author block */}
            <div className="bg-white rounded-[20px] p-6 text-center shadow-[0_10px_30px_rgba(255,102,0,0.1)] border border-white/50">
              <h3 className="text-2xl font-['Nostalgia',_serif] text-[#5C4033] mb-6 border-b border-orange-100 pb-4 mx-4">Meet {recipe.user ? recipe.user.f_name : 'the Author'}</h3>
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-[#ff6600] to-[#ffcc80] rounded-full overflow-hidden mb-6 border-4 border-white shadow-[0_5px_15px_rgba(255,102,0,0.2)] p-1">
                <img src={recipe.user?.profile_picture || 'https://via.placeholder.com/150'} alt="Author" className="w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-[#555] text-sm leading-relaxed px-4 font-medium">
                {recipe.user?.bio 
                  ? recipe.user.bio 
                  : `Hi! I'm ${recipe.user ? `${recipe.user.f_name} ${recipe.user.l_name}` : 'the chef behind this recipe'}. I love creating simple, wholesome, and incredibly flavorful dishes.`}
              </p>
              <button className="mt-6 bg-[#5C4033] text-white py-2.5 px-8 font-bold text-sm hover:bg-[#3d2a21] transition-colors rounded-xl shadow-md hover:-translate-y-1">
                Read More
              </button>
            </div>

            {/* Related Recipes block */}
            {relatedRecipes.length > 0 && (
              <div className="bg-white rounded-[20px] p-6 shadow-[0_10px_30px_rgba(255,102,0,0.1)] border border-white/50">
                <h3 className="text-xl font-['Nostalgia',_serif] text-[#ff6600] mb-6 border-b border-orange-100 pb-3">Looking for other recipes?</h3>
                <div className="space-y-4">
                  {relatedRecipes.map(rel => (
                    <Link key={rel.recipe_id} to={`/recipe/${rel.recipe_id}`} className="block group bg-orange-50/50 p-2 rounded-xl border border-transparent hover:border-orange-200 transition-colors">
                      <div className="flex gap-4 items-center">
                        <img src={rel.image_url?.startsWith('http') ? rel.image_url : `${import.meta.env.VITE_API_URL}/images/${rel.image_url}`} alt={rel.title} className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                        <span className="font-bold text-[#5C4033] group-hover:text-[#ff6600] transition-colors leading-tight text-sm">
                          {rel.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients block (Sticky) */}
            <div className="bg-[#fcfbf9] rounded-[20px] p-6 shadow-[0_10px_30px_rgba(255,102,0,0.1)] border border-orange-100/50 sticky top-24">
              <h3 className="text-2xl font-['Nostalgia',_serif] text-[#5C4033] mb-4 border-b border-orange-200 pb-2">Ingredients</h3>
              {renderIngredientChecklist(recipe.ingredients)}
            </div>

          </div>
          
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white py-8 px-10 rounded-2xl text-center max-w-md shadow-2xl border border-white/20">
            <h3 className="text-3xl font-['Nostalgia',_serif] text-[#5C4033] mb-4">Delete Recipe</h3>
            <p className="mb-8 font-medium text-gray-600">Are you sure you want to permanently delete this recipe? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button className="bg-red-500 text-white py-3 px-8 rounded-xl font-bold hover:bg-red-600 shadow-md hover:-translate-y-1 transition-all" onClick={handleDelete}>Yes, Delete</button>
              <button className="bg-gray-200 text-gray-800 py-3 px-8 rounded-xl font-bold hover:bg-gray-300 shadow-md hover:-translate-y-1 transition-all" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecipe;
