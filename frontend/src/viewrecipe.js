import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './viewrecipe.css';

function ViewRecipe({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(null);

  // New state for review comment and rating input
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);

  // New state for reply box open and reply text
  const [replyBoxOpen, setReplyBoxOpen] = useState(null);
  const [replyText, setReplyText] = useState('');

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
      const res = await fetch(`http://localhost:5000/api/ml/ratings`, {
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
        // Refresh reviews list
        setReviews((prev) => [...prev, data.rating]);
        setNewReviewText('');
        setNewReviewRating(0);
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
      const res = await fetch(`http://localhost:5000/api/ml/replies`, {
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
        const resRecipe = await fetch(`http://localhost:5000/api/recipes/${id}`);
      const dataRecipe = await resRecipe.json();
      setRecipe(dataRecipe);

      // Fetch user's existing rating for this recipe
      if (user && user.user_id && user.token) { // Check if user and token are present
    console.log('Fetching user rating with token:', user.token);
    const resRating = await fetch(`http://localhost:5000/api/ml/ratings/${user.user_id}?recipe_id=${id}`, {
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
    }
  } else {
    console.warn('User or token missing, skipping user rating fetch', user);
  }

    // Fetch reviews for this recipe
    setLoadingReviews(true);
    const resReviews = await fetch(`http://localhost:5000/api/ml/ratings?recipe_id=${id}`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    const dataReviews = await resReviews.json();
    if (dataReviews.success) {
      setReviews(dataReviews.ratings);
    } else {
      console.error('Failed to fetch reviews:', resReviews.status, dataReviews.error || 'Unknown error');
      setErrorReviews('Failed to load reviews: ' + (dataReviews.error || 'Unknown error'));
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
          'Authorization': `Bearer ${user.token}`
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
          <pre className="instructions-text">{recipe.instructions}</pre>
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
          <h3>Reviews</h3>
          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : errorReviews ? (
            <p className="error-message">{errorReviews}</p>
          ) : (
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.review_id} className="review-item">
                    <div className="review-header">
                      <span className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className="review-date">{review.datestamp}</span>
                    </div>
                    {review.review_text && (
                      <p className="review-text">{review.review_text}</p>
                    )}
                    <p className="review-user">
                      By: {review.user ? `${review.user.f_name} ${review.user.l_name}` : 'Anonymous'}
                      {review.user && review.user.user_type === 'chef' && ' (Chef)'}
                    </p>
                    {/* Reply section for chef who owns the recipe */}
                    {user && user.user_id === recipe.chef_id && (
                      <div className="reply-section">
                        <button
                          onClick={() => toggleReplyBox(review.review_id)}
                          className="reply-button"
                        >
                          Reply
                        </button>
                        {replyBoxOpen === review.review_id && (
                          <div className="reply-box">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                            />
                            <button onClick={() => submitReply(review.review_id)}>Submit Reply</button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Display replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="replies-list">
                        {review.replies.map((reply) => (
                          <div key={reply.reply_id} className="reply-item">
                            <p className="reply-text">{reply.text}</p>
                            <p className="reply-user">
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
            </div>
          )}
          {/* Add new review comment section */}
          {user && (
            <div className="add-review-section">
              <h4>Add Your Review</h4>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= newReviewRating ? 'star-filled' : 'star-empty'}
                    onClick={() => setNewReviewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Write your review here..."
              />
              <button onClick={submitReview}>Submit Review</button>
            </div>
          )}
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
