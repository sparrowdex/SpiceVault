import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './home';
import AddRecipe from './addrecipe';
import Recommendations from './recommendation';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import './App.css';
import ViewRecipe from './viewrecipe';

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

  return (
    <Router>
      <div className="navbar">
        <h1>Spice Vault</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/addrecipe">Add Recipe</Link>
          <Link to="/recommendation">Recommendations</Link>
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleShowAuth('login')} className="auth-btn">
                Login
              </button>
              <button onClick={() => handleShowAuth('signup')} className="auth-btn signup-btn">
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addrecipe" element={<AddRecipe />} />
        <Route path="/recommendation" element={<Recommendations user={user} />} />
        <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} /> : <Home />} />
        <Route path="/viewrecipe" element={<ViewRecipe />} />
        <Route path="/recipes/:id" element={<ViewRecipe />} />
      </Routes>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <button className="close-auth" onClick={handleCloseAuth}>×</button>
            {authMode === 'login' ? (
              <Login 
                onLogin={handleLogin} 
                onSwitchToSignup={() => setAuthMode('signup')} 
              />
            ) : (
              <Signup 
                onLogin={handleLogin} 
                onSwitchToLogin={() => setAuthMode('login')} 
              />
            )}
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;

