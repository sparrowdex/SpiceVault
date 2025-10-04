import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import Home from './home';
import AddRecipe from './addrecipe';
import Recommendations from './recommendation';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import './App.css';
import ViewRecipe from './viewrecipe';

import ElegantWomanFont from './assets/fonts/ElegantWomanDemo-2O9Ve.ttf';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

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
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
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

  return (
    <Router>
      <div className="navbar">
        <h1 className="nav-center" style={spiceVaultStyle}>Spice Vault</h1>
        <nav className="nav-left">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          {user && <NavLink to="/addrecipe" className={({ isActive }) => isActive ? "active" : ""}>Add Recipe</NavLink>}
          {user && <NavLink to="/recommendations" className={({ isActive }) => isActive ? "active" : ""}>Recommendations</NavLink>}
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

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addrecipe" element={<AddRecipe />} />
        {user ? (
          <Route path="/recommendations" element={<Recommendations user={user} />} />
        ) : (
          <Route path="/recommendations" element={<Home />} />
        )}
        <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} /> : <Home />} />
        <Route path="/viewrecipe" element={<ViewRecipe user={user} />} />
        <Route path="/recipes/:id" element={<ViewRecipe user={user} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />} />
      </Routes>
    </Router>
  );
}

export default App;
