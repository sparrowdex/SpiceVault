import React, { useState, useEffect } from 'react';

const ReviewSlideshow = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return <p>No insights available.</p>;
  }

  const currentItem = items[currentIndex];

  if (currentItem.type === 'tips') {
    return (
      <div className="review-slideshow tips-slide" style={{ padding: '1rem', backgroundColor: '#e9f5ff', borderRadius: '8px' }}>
        <h4>Tips & Tricks</h4>
        <ul>
          {currentItem.content.map((tip, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>{tip}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (currentItem.type === 'popularRecipes') {
    return (
      <div className="review-slideshow popular-recipes-slide" style={{ padding: '1rem', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
        <h4>Popular Recipes</h4>
        {currentItem.content.length === 0 ? (
          <p>No popular recipes currently.</p>
        ) : (
          <ul>
            {currentItem.content.map((recipe) => (
              <li key={recipe.recipe_id} style={{ marginBottom: '0.5rem' }}>
                {recipe.title} - {parseFloat(recipe.avg_rating).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (currentItem.type === 'reviews') {
    return (
      <div className="review-slideshow reviews-slide" style={{ padding: '1rem', backgroundColor: '#f0f4c3', borderRadius: '8px' }}>
        <h4>Recent Reviews</h4>
        {currentItem.content.length === 0 ? (
          <p>No recent reviews.</p>
        ) : (
          <ul>
            {currentItem.content.map((review) => (
              <li key={review.review_id} style={{ marginBottom: '0.5rem' }}>
                "{review.text}" - {review.author}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return null;
};

export default ReviewSlideshow;
