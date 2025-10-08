import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalRankingsPage.css';

const GlobalRankingsPage = ({ user }) => {
  const [rankings, setRankings] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    if (user) {
      fetchRankings(period);
    }
  }, [user, period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  const topThree = rankings.slice(0, 3);
  const remainingRankings = rankings.slice(3);

  return (
    <div className="global-rankings-page">
      <h1 className="page-title">Global Recipe Rankings</h1>

      {/* Period Filter */}
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
        <p className="loading">Loading rankings...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {/* Podium Section */}
          {topThree.length >= 3 && (
            <div className="podium-section">
              <div className="podium">
                {/* 2nd Place */}
                <div className="podium-position second-place">
                  <div className="podium-pedestal">
                    <span className="position-number">2</span>
                  </div>
                  <div className="recipe-card podium-card" onClick={() => handleRecipeClick(topThree[1].recipe_id)}>
                    <img
                      src={`http://localhost:5000/images/${topThree[1].image_url}`}
                      alt={topThree[1].title}
                      className="recipe-image"
                    />
                    <div className="recipe-info">
                      <h3>{topThree[1].title}</h3>
                      <p className="rating">⭐ {parseFloat(topThree[1].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-position first-place">
                  <div className="podium-pedestal">
                    <span className="position-number">1</span>
                    <div className="crown">👑</div>
                  </div>
                  <div className="recipe-card podium-card" onClick={() => handleRecipeClick(topThree[0].recipe_id)}>
                    <img
                      src={`http://localhost:5000/images/${topThree[0].image_url}`}
                      alt={topThree[0].title}
                      className="recipe-image"
                    />
                    <div className="recipe-info">
                      <h3>{topThree[0].title}</h3>
                      <p className="rating">⭐ {parseFloat(topThree[0].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-position third-place">
                  <div className="podium-pedestal">
                    <span className="position-number">3</span>
                  </div>
                  <div className="recipe-card podium-card" onClick={() => handleRecipeClick(topThree[2].recipe_id)}>
                    <img
                      src={`http://localhost:5000/images/${topThree[2].image_url}`}
                      alt={topThree[2].title}
                      className="recipe-image"
                    />
                    <div className="recipe-info">
                      <h3>{topThree[2].title}</h3>
                      <p className="rating">⭐ {parseFloat(topThree[2].avg_rating).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings List */}
          <div className="rankings-list-section">
            <h2>Complete Rankings</h2>
            <div className="rankings-list">
              {remainingRankings.map((recipe, index) => (
                <div
                  key={recipe.recipe_id}
                  className={`ranking-item ${recipe.chef_id === user?.user_id ? 'your-recipe' : ''}`}
                  onClick={() => handleRecipeClick(recipe.recipe_id)}
                >
                  <div className="rank-number">{index + 4}</div>
                  <img
                    src={`http://localhost:5000/images/${recipe.image_url}`}
                    alt={recipe.title}
                    className="ranking-image"
                  />
                  <div className="ranking-info">
                    <h4>{recipe.title}</h4>
                    <p className="rating">⭐ {parseFloat(recipe.avg_rating).toFixed(1)}</p>
                  </div>
                  <div className="rank-change">
                    {recipe.rankChange > 0 ? (
                      <span className="rank-up">▲</span>
                    ) : recipe.rankChange < 0 ? (
                      <span className="rank-down">▼</span>
                    ) : (
                      <span className="rank-same">▶</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalRankingsPage;
