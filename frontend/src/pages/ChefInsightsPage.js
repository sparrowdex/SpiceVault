import React, { useState, useEffect } from 'react';
import UserInsightsBar from '../components/UserInsightsBar';
import './ChefInsightsPage.css';

const ChefInsightsPage = ({ user }) => {
  const [rankings, setRankings] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRankings = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ml/global-rankings?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch global rankings');
      }
      const data = await response.json();
      setRankings(data.rankings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.user_type === 'chef') {
      fetchRankings(period);
    }
  }, [user, period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="chef-insights-page">
      <h1>Chef Insights</h1>
      <UserInsightsBar user={user} />
      <div className="leaderboard-section">
        <h2>Global Leaderboard</h2>
        <div className="period-filter">
          <label>
            <input
              type="radio"
              value="daily"
              checked={period === 'daily'}
              onChange={handlePeriodChange}
            />
            Daily
          </label>
          <label>
            <input
              type="radio"
              value="weekly"
              checked={period === 'weekly'}
              onChange={handlePeriodChange}
            />
            Weekly
          </label>
          <label>
            <input
              type="radio"
              value="monthly"
              checked={period === 'monthly'}
              onChange={handlePeriodChange}
            />
            Monthly
          </label>
          <label>
            <input
              type="radio"
              value="all"
              checked={period === 'all'}
              onChange={handlePeriodChange}
            />
            All Time
          </label>
        </div>
        {loading ? (
          <p>Loading leaderboard...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Dish</th>
                <th>Name</th>
                <th>Avg Rating</th>
                <th>Rank Change</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((recipe, index) => (
                <tr key={recipe.recipe_id} className={recipe.chef_id === user.user_id ? 'your-recipe' : ''}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={`http://localhost:5000/images/${recipe.image_url}`}
                      alt={recipe.title}
                      className="dish-image"
                    />
                  </td>
                  <td>{recipe.title}</td>
                  <td>{parseFloat(recipe.avg_rating).toFixed(2)}</td>
                  <td>
                    {recipe.rankChange > 0 ? (
                      <span className="rank-up">&#9650;</span> // green up triangle
                    ) : recipe.rankChange < 0 ? (
                      <span className="rank-down">&#9660;</span> // red down triangle
                    ) : (
                      <span className="rank-same">&#9654;</span> // right arrow for no change
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ChefInsightsPage;
