import React, { useState, useEffect } from 'react';
import ChefCertifiedRecipes from '../components/ChefCertifiedRecipes';

const ChefCertifiedRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChefCertifiedRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/recipes/chef-certified');
        if (!response.ok) {
          throw new Error('Failed to fetch chef certified recipes');
        }
        const data = await response.json();
        if (data.success) {
          setRecipes(data.recipes);
        } else {
          throw new Error('Failed to get chef certified recipes');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChefCertifiedRecipes();
  }, []);

  if (loading) {
    return <div>Loading chef certified recipes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="chef-certified-title">Chef Certified Recipes</h1>
      <p className="chef-certified-description">Explore top-rated recipes created by our certified chefs.</p>
      <ChefCertifiedRecipes recipes={recipes} />
    </div>
  );
};

export default ChefCertifiedRecipesPage;
