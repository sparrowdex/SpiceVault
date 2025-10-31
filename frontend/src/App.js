import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import Home from './home';
import AddRecipe from './addrecipe';
import Recommendations from './recommendation';
import ChefCertifiedRecipesPage from './pages/ChefCertifiedRecipes';
import ChefInsightsPage from './pages/ChefInsightsPage';
import GlobalRankingsPage from './pages/GlobalRankingsPage';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import BackgroundGradient from './components/BackgroundGradient';


import './App.css';
import ViewRecipe from './viewrecipe';

function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const spiceVaultStyle = {
    fontFamily: 'ElegantWomanDemo, Poppins, sans-serif',
    fontWeight: '700',
    background: 'linear-gradient(90deg, red, orange)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent',
  };

  const isChef = user?.user_type === 'chef';

  return (
    <BackgroundGradient>
      <Router>
        <div className="navbar">
          <h1 className="nav-center" style={spiceVaultStyle} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>Spice Vault</h1>
          <nav className="nav-left">
            {user && <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>}
            {user && <NavLink to="/addrecipe" className={({ isActive }) => isActive ? "active" : ""}>Add Recipe</NavLink>}
            {user && <NavLink to="/recommendations" className={({ isActive }) => isActive ? "active" : ""}>Recommendations</NavLink>}
            {user && <NavLink to="/chef-certified-recipes" className={({ isActive }) => isActive ? "active" : ""}>Chef Certified Recipes</NavLink>}
            {user && <NavLink to="/global-rankings" className={({ isActive }) => isActive ? "active" : ""}>Global Rankings</NavLink>}
            {isChef && <NavLink to="/chef-insights" className={({ isActive }) => isActive ? "active" : ""}>Chef Insights</NavLink>}
          </nav>
          <nav className="nav-right">
            {user ? (
              <>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `auth-btn ${isActive ? "active" : ""}`}>Login</NavLink>
                <NavLink to="/signup" className={({ isActive }) => `auth-btn signup-btn ${isActive ? "active" : ""}`}>Sign Up</NavLink>
              </>
            )}
          </nav>
        </div>
        {isSidebarOpen && (
          <div className="sidebar">
            <div className="sidebar-content">
              {user && (
                <>
                  <NavLink to="/" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
                  <NavLink to="/addrecipe" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Add Recipe</NavLink>
                  <NavLink to="/recommendations" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Recommendations</NavLink>
                  <NavLink to="/chef-certified-recipes" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Chef Certified Recipes</NavLink>
                  <NavLink to="/global-rankings" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Global Rankings</NavLink>
                  {isChef && <NavLink to="/chef-insights" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Chef Insights</NavLink>}
                </>
              )}
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink>
                  <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `auth-btn ${isActive ? "active" : ""}`}>Login</NavLink>
                  <NavLink to="/signup" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `auth-btn signup-btn ${isActive ? "active" : ""}`}>Sign Up</NavLink>
                </>
              )}
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addrecipe" element={<AddRecipe />} />
          {user ? (
            <Route path="/recommendations" element={<Recommendations user={user} />} />
          ) : (
            <Route path="/recommendations" element={<Home />} />
          )}
          <Route path="/chef-certified-recipes" element={<ChefCertifiedRecipesPage />} />
          <Route path="/chef-insights" element={user && isChef ? <ChefInsightsPage user={user} /> : <Home />} />
          <Route path="/global-rankings" element={user ? <GlobalRankingsPage user={user} /> : <Home />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} /> : <Home />} />
          <Route path="/viewrecipe" element={<ViewRecipe user={user} />} />
          <Route path="/recipes/:id" element={<ViewRecipe user={user} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} onSwitchToLogin={() => {}} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToSignup={() => {}} />} />
        </Routes>
      </Router>
    </BackgroundGradient>
  );
}

export default App;
