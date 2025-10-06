import React, { useState, useEffect, useCallback } from 'react';
import ReviewSlideshow from './ReviewSlideshow';
import './UserInsightsBar.css';

const UserInsightsBar = ({ user }) => {
  const [userStats, setUserStats] = useState(null);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tipsAndTricks = [
    "Keep adding diverse recipes to improve your ranking!",
    "Focus on quality to increase your average rating.",
    "Engage with reviewers to get more feedback.",
    "Use the app's features to promote your recipes.",
    "Regularly update your recipes to keep them fresh."
  ];

  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ml/chef-stats/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      setError(err.message);
    }
  }, [user.user_id]);

  const fetchPopularRecipes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipes/popular/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch popular recipes');
      }
      const data = await response.json();
      setPopularRecipes(data.recipes);
    } catch (err) {
      console.error(err.message);
    }
  }, [user.user_id]);

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/chef/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error(err.message);
    }
  }, [user.user_id]);

  useEffect(() => {
    if (user && user.role === 'chef') {
      setLoading(true);
      Promise.all([fetchUserStats(), fetchPopularRecipes(), fetchReviews()])
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user, fetchUserStats, fetchPopularRecipes, fetchReviews]);

  if (!user || user.user_type !== 'chef') {
    return null;
  }

  const slideshowItems = [
    {
      type: 'tips',
      content: tipsAndTricks,
    },
    {
      type: 'popularRecipes',
      content: popularRecipes,
    },
    {
      type: 'reviews',
      content: reviews,
    },
  ];

  return (
    <div className="user-insights-bar">
      <h3 className="insights-title">Chef Insights</h3>
      {loading ? (
        <p>Loading insights...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ReviewSlideshow items={slideshowItems} />
      )}
    </div>
  );
};

export default UserInsightsBar;
