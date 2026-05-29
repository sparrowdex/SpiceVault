import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ViewRecipe({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
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
        // Refresh reviews list, add to top since we sort by newest
        setReviews((prev) => [data.rating, ...prev]);
        setNewReviewText('');
        setNewReviewRating(0);
        setRating(newReviewRating); // Update the rating state to persist the star rating
        setCurrentPage(1); // Jump to first page to see the new review
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
        // Update the specific review with new reply
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
        // Fetch recipe details
        const resRecipe = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`);
      const dataRecipe = await resRecipe.json();
      setRecipe(dataRecipe);

      // Fetch user's existing rating for this recipe
      if (user && user.user_id && user.token) { // Check if user and token are present
    console.log('Fetching user rating with token:', user.token);
    const resRating = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings/${user.user_id}?recipe_id=${id}`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    if (!resRating.ok) {
      const errorText = await resRating.text();
      console.error('Failed to fetch user rating:', resRating.status, errorText);
      throw new Error(`Failed to fetch user rating: ${resRating.status}`);
    }
    const dataRating = await resRating.json();

    if (dataRating.success && dataRating.ratings.length > 0) {
      setRating(dataRating.ratings[0].rating);
    } else {
      setRating(0); // Reset rating if no rating found
    }
  } else {
    console.warn('User or token missing, skipping user rating fetch', user);
    setRating(0); // Reset rating if user or token missing
  }

      // Fetch reviews for this recipe
    setLoadingReviews(true);
    const headers = {};
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    const resReviews = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings?recipe_id=${id}`, {
      headers
    });
    const dataReviews = await resReviews.json();
    if (dataReviews.success) {
      setReviews(dataReviews.ratings);
    } else {
      console.error('Failed to fetch reviews:', resReviews.status, dataReviews.error || 'Unknown error');
      setErrorReviews('Failed to load reviews: ' + (dataReviews.error || 'Unknown error'));
    }

    // Fetch health score for this recipe
    try {
      const resHealth = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/recipe-health-score/${id}`, {
        headers
      });
      const dataHealth = await resHealth.json();
      if (dataHealth.success) {
        setHealthScore(dataHealth.healthScore);
        setHealthCategory(dataHealth.category);
      }
    } catch (healthError) {
      console.warn('Failed to fetch health score:', healthError);
    }
  } catch (error) {
    console.error('Failed to fetch recipe or rating:', error);
    setErrorReviews('Failed to load reviews');
  } finally {
    setLoadingReviews(false);
  }
};

    fetchRecipeAndRating();
  }, [id, user]); // Add user to dependency array

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
        navigate('/'); // Redirect to homepage after delete
      } else {
        alert(data.error || 'Failed to delete recipe');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete recipe');
    }
  };

  const handleRating = async (newRating) => {
    if (!user || !user.user_id) {
      alert('Please log in to rate recipes.');
      return;
    }
    setRating(newRating);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/ml/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ recipe_id: id, rating: newRating, user_id: user.user_id }),
      });
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

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

  const getHealthClass = (health) => {
    switch(health?.toLowerCase()) {
      case 'excellent': return 'bg-[#d4edda] text-[#155724]';
      case 'good': return 'bg-[#d1ecf1] text-[#0c5460]';
      case 'fair': return 'bg-[#fff3cd] text-[#856404]';
      case 'poor': return 'bg-[#f8d7da] text-[#721c24]';
      default: return 'bg-[#f0f0f0] text-[#555]';
    }
  };

  const renderListOrText = (text, listType = 'ul') => {
    if (!text) return <p className="text-[#888] italic text-center">Not provided</p>;
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length > 1) {
      const ListTag = listType;
      const listClasses = listType === 'ol' 
        ? "text-left m-0 p-0 pl-[25px] list-decimal leading-[1.8] text-[1rem] max-w-[600px] w-full marker:text-[#ff6600] marker:font-bold"
        : "text-left m-0 p-0 pl-[25px] list-disc leading-[1.8] text-[1rem] max-w-[600px] w-full marker:text-[#ff6600]";
      return (
        <ListTag className={listClasses}>
          {lines.map((line, index) => {
            // Only strip standard list markers (e.g. "- ", "* ", "1. ", "2) ") so we don't accidentally strip ingredient quantities like "1 cup"
            const cleanedLine = line.replace(/^[-*•]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
            return (
              <li key={index} className="pl-[5px] mb-[8px] text-[#444]">
                {cleanedLine}
              </li>
            );
          })}
        </ListTag>
      );
    }
    return <p className={`leading-[1.8] text-[1rem] text-[#444] max-w-[600px] w-full mx-auto ${text.length > 100 ? 'text-justify' : 'text-center'}`}>{text}</p>;
  };

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  if (!recipe) return <div className="font-['Poppins',_sans-serif] min-h-screen py-10 px-5 flex justify-center items-start">Loading...</div>;

  return (
    <div className="font-['Poppins',_sans-serif] min-h-screen py-10 px-5 flex justify-center items-start">
      <div className="w-[90%] md:w-[95%] max-w-[800px] my-5 bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-center">
        <button 
          className="bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white border-none py-[10px] px-[20px] rounded-lg cursor-pointer mb-5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5" 
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h2 className="text-[28px] mb-[15px] text-[#bc8f8e] text-center">{recipe.title}</h2>
        <img
          className="w-full rounded-lg mb-5 object-cover"
          src={recipe.image_url?.startsWith('http') ? recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${recipe.image_url}`}
          alt={recipe.title}
        />

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Description</h3>
          <p className="text-center leading-[1.6]">{recipe.description}</p>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Ingredients</h3>
          {renderListOrText(recipe.ingredients, 'ul')}
        </div>

        <div className="mt-5 flex flex-col items-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Instructions</h3>
          {renderListOrText(recipe.instructions, 'ol')}
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Recipe Info</h3>
          <div className="flex flex-wrap gap-5 mt-2.5 justify-center">
            <div className="flex-[1_1_40%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
              <strong>Prep Time:</strong><br />{recipe.preparation_time}
            </div>
            <div className="flex-[1_1_40%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
              <strong>Cooking Time:</strong><br />{recipe.cooking_time}
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Nutrition Info</h3>
          <div className="flex flex-wrap gap-[10px] justify-center mt-2.5">
            {recipe.nutrition_info ? recipe.nutrition_info.split(', ').map((item, index) => {
              const parts = item.split(':');
              if (parts.length >= 2) {
                return (
                  <span key={index} className="inline-block py-[6px] px-[12px] bg-[#f9f9f9] border border-[#ddd] rounded-lg text-[13px] shadow-sm whitespace-nowrap">
                    <span className="font-bold text-[#ff6600] capitalize">{parts[0].trim()}:</span> <span className="text-[#444] font-medium">{parts[1].trim()}</span>
                  </span>
                );
              }
              return <span key={index} className="inline-block py-[6px] px-[12px] bg-[#f9f9f9] border border-[#ddd] rounded-lg text-[13px] shadow-sm">{item}</span>;
            }) : <span className="text-[#777] text-[13px] italic">Not provided</span>}
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Recipe Details</h3>
          <div className="flex flex-wrap gap-5 mt-2.5 justify-center">
            <div className="flex-[1_1_30%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
              <strong>Difficulty:</strong><br />
              <span className={`inline-block py-1.5 px-2.5 rounded-[15px] text-[11px] font-semibold tracking-[0.5px] uppercase ${getDifficultyClass(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            </div>
            <div className="flex-[1_1_30%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
              <strong>Category:</strong><br />
              <span className="inline-block py-1.5 px-3 bg-[#e6f3ff] rounded-[5px] font-bold text-[#0066cc] capitalize text-[11px]">
                {recipe.food_category?.replace('_', ' ').toUpperCase() || 'Main Course'}
              </span>
            </div>
            <div className="flex-[1_1_30%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
              <strong>Diet Type:</strong><br />
              <span className={`inline-block py-1.5 px-3 rounded-[5px] font-bold capitalize text-[11px] ${getDietClass(recipe.diet_type)}`}>
                {recipe.diet_type?.replace('_', ' ').toUpperCase() || 'Vegetarian'}
              </span>
            </div>
            {healthScore !== null && (
              <div className="flex-[1_1_30%] bg-[#f9f9f9] py-2.5 px-[15px] rounded-lg text-[14px] shadow-sm">
                <strong>Health Score:</strong><br />
                <span className={`inline-block py-1.5 px-3 rounded-[5px] font-bold capitalize text-[11px] ${getHealthClass(healthCategory)}`}>
                  {healthScore}/100 ({healthCategory})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Rate this recipe</h3>
          <div className="text-[24px] cursor-pointer text-[#ccc] mb-[10px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'text-[#f5a623]' : 'text-[#ccc]'}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-[22px] text-[#bc8f8e] mb-2.5 text-center">Reviews</h3>
          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : errorReviews ? (
            <p className="text-red-600 font-semibold">{errorReviews}</p>
          ) : (
            <div className="mt-2.5 text-left">
              {currentReviews.length > 0 ? (
                currentReviews.map((review) => (
                  <div key={review.review_id} className="border-b border-[#ddd] py-2.5 px-0">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-[#f5a623]">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className="text-[0.85em] text-[#999]">
                        {review.datestamp ? new Date(review.datestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="my-1 mx-0">{review.review_text}</p>
                    )}
                    <p className="italic text-[0.9em] text-[#555]">
                      By: {review.user ? `${review.user.f_name} ${review.user.l_name}` : 'Anonymous'}
                      {review.user && review.user.user_type === 'chef' && ' (Chef)'}
                    </p>
                    {/* Reply section for chef who owns the recipe */}
                    {user && user.user_id === recipe.chef_id && (
                      <div className="mt-1">
                        <button
                          onClick={() => toggleReplyBox(review.review_id)}
                          className="bg-transparent border-none text-[#007bff] cursor-pointer text-[0.9em] p-0 hover:underline"
                        >
                          Reply
                        </button>
                        {replyBoxOpen === review.review_id && (
                          <div className="mt-1 flex flex-col items-start">
                            <textarea
                              className="w-full min-h-[50px] resize-y p-2 border border-gray-300 rounded"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                            />
                            <button className="mt-1 py-1 px-2.5 bg-[#007bff] border-none text-white rounded cursor-pointer hover:bg-blue-600" onClick={() => submitReply(review.review_id)}>Submit Reply</button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Display replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="ml-5 mt-1 border-l-2 border-[#eee] pl-2.5">
                        {review.replies.map((reply) => (
                          <div key={reply.reply_id} className="mb-2.5">
                            <p className="m-0">{reply.text}</p>
                            <p className="italic text-[0.85em] text-[#666]">
                              By: {reply.user ? `${reply.user.f_name} ${reply.user.l_name}` : 'Anonymous'}
                              {reply.user && reply.user.user_type === 'chef' && ' (Chef)'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to rate this recipe!</p>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-[15px] mt-[20px]">
                  <button
                    className="py-[6px] px-[12px] border border-[#ddd] rounded-[6px] bg-[#f9f9f9] text-[#555] cursor-pointer transition-colors duration-200 hover:bg-[#eee] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-[0.9em]"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-[0.9em] text-[#666] font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="py-[6px] px-[12px] border border-[#ddd] rounded-[6px] bg-[#f9f9f9] text-[#555] cursor-pointer transition-colors duration-200 hover:bg-[#eee] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-[0.9em]"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Add new review comment section */}
          {user && (
            <div className="mt-5 text-left">
              <h4 className="mb-1 font-bold">Add Your Review</h4>
              <div className="text-2xl cursor-pointer text-[#ccc] mb-2.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= newReviewRating ? 'text-[#f5a623]' : 'text-[#ccc]'}
                    onClick={() => setNewReviewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="w-full min-h-[70px] resize-y mt-1 mb-2.5 p-2 text-[1em] border border-gray-300 rounded"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Write your review here..."
              />
              <button className="py-2 px-4 bg-[#28a745] border-none text-white rounded-md cursor-pointer hover:bg-green-600" onClick={submitReview}>Submit Review</button>
            </div>
          )}
        </div>

        {user && user.user_id === recipe.user_id && (
          <div className="mt-5 text-center">
            <button className="bg-[#d9534f] text-white border-none py-2.5 px-4 rounded-md font-bold cursor-pointer mt-5 hover:bg-[#c9302c]" onClick={() => setShowModal(true)}>
              Delete Recipe
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white py-6 px-8 rounded-xl text-center max-w-[400px] shadow-lg">
            <p className="mb-4">Are you sure you want to delete this recipe?</p>
            <div className="mt-5 flex justify-around">
              <button className="bg-[#d9534f] text-white py-2 px-4 border-none rounded-md cursor-pointer hover:bg-[#c9302c]" onClick={handleDelete}>Yes, Delete</button>
              <button className="bg-[#ccc] text-[#333] py-2 px-4 border-none rounded-md cursor-pointer hover:bg-[#bbb]" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRecipe;
