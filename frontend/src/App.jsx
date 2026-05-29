import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddRecipe from './pages/AddRecipe';
import Recommendations from './pages/Recommendations';
import ChefCertifiedRecipesPage from './pages/ChefCertifiedRecipes';
import ChefInsightsPage from './pages/ChefInsightsPage';
import GlobalRankingsPage from './pages/GlobalRankingsPage';
import PopularRecipesPage from './pages/PopularRecipesPage';
import ViewRecipe from './pages/ViewRecipe';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import BackgroundGradient from './components/BackgroundGradient';

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
    window.location.href = '/';
  };

  const getNavLinkClass = ({ isActive }) =>
    `text-[#ff6600] no-underline font-semibold px-[18px] py-[10px] rounded-[8px] font-['Poppins',_sans-serif] relative hover:bg-transparent transition-all duration-300 block ${
      isActive
        ? 'pb-[8px] after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-[#ff6600] after:rounded-[4px] after:transition-all after:duration-300'
        : 'after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:bg-[#ff6600] after:rounded-[4px] after:transition-all after:duration-300'
    }`;

  const getSidebarLinkClass = ({ isActive }) =>
    `text-[#ff6600] no-underline font-semibold py-[10px] px-0 border-none bg-transparent text-left cursor-pointer relative transition-all duration-300 block w-max ${
      isActive
        ? 'pb-[8px] after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-[#ff6600] after:rounded-[4px] after:transition-all after:duration-300'
        : 'after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:bg-[#ff6600] after:rounded-[4px] after:transition-all after:duration-300'
    }`;

  const dropdownItemClass = ({ isActive }) => `block px-[20px] py-[12px] font-medium transition-colors duration-200 border-b border-gray-100 last:border-none no-underline ${isActive ? 'bg-[#fff5f0] text-[#ff6600]' : 'text-[#555] hover:bg-[#fff5f0] hover:text-[#ff6600]'}`;

  const authBtnClasses = "bg-transparent text-[#ff6600] border-2 border-[#ff6600] py-[8px] px-[18px] rounded-[4px] cursor-pointer font-semibold transition-all duration-300 no-underline inline-block font-['Poppins',_sans-serif] hover:bg-[#ff6600] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,102,0,0.3)] text-center";
  
  const logoutBtnClasses = "bg-transparent text-[#ff6600] border-2 border-[#ff6600] py-[8px] px-[18px] rounded-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#ff6600] hover:text-white hover:shadow-[0_4px_12px_rgba(255,102,0,0.3)] active:bg-[#ff6600] active:text-white active:shadow-none font-['Poppins',_sans-serif] text-center inline-block";

  const isChef = user?.user_type === 'chef';

  return (
    <BackgroundGradient>
      <Router>
        <div className="flex flex-wrap items-center justify-between px-[30px] py-[20px] mb-[20px] font-['Poppins',_sans-serif] gap-[15px] text-left md:flex-row md:gap-0">
          <h1 
            className="text-[2.5rem] mx-[20px] font-bold font-['ElegantWomanDemo',_'Poppins',_sans-serif] bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent cursor-pointer md:cursor-auto order-0 shrink-0" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            Spice Vault
          </h1>
          <nav className="flex flex-wrap items-center gap-[10px] md:gap-[20px] order-0 shrink-0">
            {user && <NavLink to="/" className={getNavLinkClass}>Home</NavLink>}
            {user && <NavLink to="/addrecipe" className={getNavLinkClass}>Add Recipe</NavLink>}
            {user && <NavLink to="/recommendations" className={getNavLinkClass}>Recommendations</NavLink>}
            {user && (
              <div className="relative group py-[10px]">
                <span className="text-[#ff6600] no-underline font-semibold px-[18px] py-[10px] cursor-pointer flex items-center gap-[5px]">Discover ▾</span>
                <div className="absolute left-0 top-[100%] mt-[-5px] w-[220px] bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] flex flex-col overflow-hidden border border-[#f0f0f0] transform translate-y-[10px] group-hover:translate-y-0">
                  <NavLink to="/chef-certified-recipes" className={dropdownItemClass}>Chef Certified</NavLink>
                  <NavLink to="/global-rankings" className={dropdownItemClass}>Global Rankings</NavLink>
                  <NavLink to="/popular-recipes" className={dropdownItemClass}>Popular Recipes</NavLink>
                </div>
              </div>
            )}
            {isChef && <NavLink to="/chef-insights" className={getNavLinkClass}>Chef Insights</NavLink>}
          </nav>
          <nav className="flex flex-wrap order-2 items-center gap-[10px] md:gap-[15px]">
            {user ? (
              <>
                <NavLink to="/profile" className={getNavLinkClass}>Profile</NavLink>
                <button onClick={handleLogout} className={logoutBtnClasses}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={authBtnClasses}>Login</NavLink>
                <NavLink to="/signup" className={authBtnClasses}>Sign Up</NavLink>
              </>
            )}
          </nav>
        </div>
        {isSidebarOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1000] flex justify-start md:hidden">
            <div className="bg-white w-[250px] h-full p-[20px] flex flex-col gap-[15px] shadow-[2px_0_5px_rgba(0,0,0,0.3)] overflow-y-auto">
              {user && (
                <>
                  <NavLink to="/" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Home</NavLink>
                  <NavLink to="/addrecipe" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Add Recipe</NavLink>
                  <NavLink to="/recommendations" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Recommendations</NavLink>
                  <div className="text-[#ff6600] font-bold text-[1.1rem] mt-[10px] border-b-2 border-[#ff6600]/20 pb-[5px]">Discover</div>
                  <NavLink to="/chef-certified-recipes" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Chef Certified</NavLink>
                  <NavLink to="/global-rankings" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Global Rankings</NavLink>
                  <NavLink to="/popular-recipes" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Popular Recipes</NavLink>
                  {isChef && <NavLink to="/chef-insights" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Chef Insights</NavLink>}
                </>
              )}
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Profile</NavLink>
                  <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className={`${logoutBtnClasses} w-max`}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsSidebarOpen(false)} className={`${authBtnClasses} w-max`}>Login</NavLink>
                  <NavLink to="/signup" onClick={() => setIsSidebarOpen(false)} className={`${authBtnClasses} w-max`}>Sign Up</NavLink>
                </>
              )}
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/addrecipe" element={user ? <AddRecipe /> : <Navigate to="/login" replace />} />
          <Route path="/recommendations" element={user ? <Recommendations user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/chef-certified-recipes" element={<ChefCertifiedRecipesPage />} />
          <Route path="/chef-insights" element={user && isChef ? <ChefInsightsPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/global-rankings" element={user ? <GlobalRankingsPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/popular-recipes" element={<PopularRecipesPage />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          {/* The route below is likely obsolete as /recipes/:id handles viewing recipes. */}
          {/* <Route path="/viewrecipe" element={<ViewRecipe user={user} />} /> */}
          <Route path="/recipes/:id" element={<ViewRecipe user={user} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} onSwitchToLogin={() => {}} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} onSwitchToSignup={() => {}} />} />
        </Routes>
      </Router>
    </BackgroundGradient>
  );
}

export default App;
