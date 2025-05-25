import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './home';
import AddRecipe from './addrecipe';
import Recommendations from './recommendation';
import './App.css';
import ViewRecipe from './viewrecipe';


function App() {
  return (
    <Router>
      <div className="navbar">
        <h1>Spice Vault</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/addrecipe">Add Recipe</Link>
          <Link to="/recommendation">Recommendations</Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addrecipe" element={<AddRecipe />} />
        <Route path="/recommendation" element={<Recommendations />} />
        <Route path="/viewrecipe" element={<ViewRecipe />} />
        <Route path="/recipes/:id" element={<ViewRecipe />} />

      </Routes>
    </Router>
  );
}

export default App;

