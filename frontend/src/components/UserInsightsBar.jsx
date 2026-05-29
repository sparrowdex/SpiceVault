import React, { useState, useEffect, useCallback } from 'react';
import ReviewSlideshow from './ReviewSlideshow';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ml/chef-stats/${user.user_id}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/popular/${user.user_id}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/chef/${user.user_id}`, {
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
      type: 'performanceAnalytics',
      content: userStats,
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
    <div className="bg-gradient-to-br from-[#f6d365] to-[#fda085] p-6 rounded-xl mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] font-['Poppins',_sans-serif]">
      <h3 className="text-[1.75rem] mb-5 text-[#333] font-bold border-b-2 border-b-[#007bff] pb-2">Chef Insights</h3>
      {loading ? (
        <p>Loading insights...</p>
      ) : error ? (
        <p className="text-red-600 font-semibold">{error}</p>
      ) : (
        <ReviewSlideshow items={slideshowItems} />
      )}
    </div>
  );
};

export default UserInsightsBar;
