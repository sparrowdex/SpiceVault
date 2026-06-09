import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddRecipe from './pages/AddRecipe';
import EditRecipe from './pages/EditRecipe';
import Recommendations from './pages/Recommendations';
import ChefCertifiedRecipesPage from './pages/ChefCertifiedRecipes';
import GlobalRankingsPage from './pages/GlobalRankingsPage';
import PopularRecipesPage from './pages/PopularRecipesPage';
import ViewRecipe from './pages/ViewRecipe';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import CulinaryFeed from './pages/CulinaryFeed';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import BackgroundGradient from './components/BackgroundGradient';
import { Menu, X } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleUserUpdate = (updatedFields) => {
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
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
    `text-gray-700 no-underline font-semibold py-[12px] px-[15px] border border-transparent bg-transparent text-left cursor-pointer rounded-xl transition-all duration-300 block w-full text-[1.05rem] hover:bg-orange-50 hover:text-orange-500 hover:border-orange-100 ${
      isActive
        ? 'bg-orange-100 text-orange-600 border-orange-200 shadow-sm'
        : ''
    }`;

  const dropdownItemClass = ({ isActive }) => `block px-[20px] py-[12px] font-medium transition-colors duration-200 border-b border-gray-100 last:border-none no-underline ${isActive ? 'bg-[#fff5f0] text-[#ff6600]' : 'text-[#555] hover:bg-[#fff5f0] hover:text-[#ff6600]'}`;

  const authBtnClasses = "bg-transparent text-[#ff6600] border-2 border-[#ff6600] py-[8px] px-[18px] rounded-[4px] cursor-pointer font-semibold transition-all duration-300 no-underline inline-block font-['Poppins',_sans-serif] hover:bg-[#ff6600] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,102,0,0.3)] text-center";
  
  const logoutBtnClasses = "bg-transparent text-[#ff6600] border-2 border-[#ff6600] py-[8px] px-[18px] rounded-none cursor-pointer font-semibold transition-all duration-200 hover:bg-[#ff6600] hover:text-white hover:shadow-[0_4px_12px_rgba(255,102,0,0.3)] active:bg-[#ff6600] active:text-white active:shadow-none font-['Poppins',_sans-serif] text-center inline-block";

  const isChef = user?.user_type === 'chef';

  return (
    <BackgroundGradient>
      <Router>
        <style>{`
          .desktop-navbar { display: none !important; }
          .mobile-navbar { display: flex !important; }
          @media (min-width: 768px) {
            .desktop-navbar { display: flex !important; }
            .mobile-navbar { display: none !important; }
          }
        `}</style>

        {/* DESKTOP NAVBAR (Restored Original Layout) */}
        <div className="desktop-navbar flex-wrap items-center justify-between px-[30px] py-[20px] mb-[20px] font-['Poppins',_sans-serif] gap-[15px] text-left md:flex-row md:gap-0">
          <h1 
            className="text-[2.5rem] mx-[20px] font-bold font-['ElegantWomanDemo',_'Poppins',_sans-serif] bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent cursor-pointer md:cursor-auto order-0 shrink-0"
            onClick={() => window.location.href = '/'}
          >
            Spice Vault
          </h1>
          <nav className="flex flex-wrap items-center gap-[10px] md:gap-[20px] order-0 shrink-0">
            {user && <NavLink to="/" className={getNavLinkClass}>Home</NavLink>}
            {user && <NavLink to="/feed" className={getNavLinkClass}>Feed</NavLink>}
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

        {/* MOBILE NAVBAR */}
        <div className="mobile-navbar items-center justify-between px-[15px] py-[12px] mb-[10px] font-['Poppins',_sans-serif]">
          <div className="flex items-center gap-[10px]">
            <button 
              className="bg-transparent border-none text-[#ff6600] flex items-center justify-center p-[5px] cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={28} strokeWidth={2.5} />
            </button>
            <h1 
              className="text-[1.8rem] sm:text-[2rem] font-bold font-['ElegantWomanDemo',_'Poppins',_sans-serif] bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent cursor-pointer m-0" 
              onClick={() => window.location.href = '/'}
            >
              Spice Vault
            </h1>
          </div>
        </div>

        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex justify-start md:hidden transition-all duration-300">
            <div className="bg-white w-[85%] max-w-[320px] h-full p-[20px_25px] flex flex-col gap-[10px] shadow-2xl overflow-y-auto transform transition-transform duration-300 animate-[slideIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent m-0 font-['Nostalgia',_serif] tracking-wide">SpiceVault</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="bg-gray-50 p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                  <X size={22} strokeWidth={2.5} />
                </button>
              </div>
              {user && (
                <>
                  <NavLink to="/" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Home</NavLink>
                  <NavLink to="/feed" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Feed</NavLink>
                  <NavLink to="/addrecipe" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Add Recipe</NavLink>
                  <NavLink to="/recommendations" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>Recommendations</NavLink>
                  <div className="text-orange-400 font-bold text-[0.8rem] mt-[15px] mb-[5px] px-[15px] uppercase tracking-wider">Discover</div>
                  <NavLink to="/chef-certified-recipes" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Chef Certified</NavLink>
                  <NavLink to="/global-rankings" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Global Rankings</NavLink>
                  <NavLink to="/popular-recipes" onClick={() => setIsSidebarOpen(false)} className={`${getSidebarLinkClass} pl-[15px]`}>Popular Recipes</NavLink>
                </>
              )}
              <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-3">
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setIsSidebarOpen(false)} className={getSidebarLinkClass}>My Profile</NavLink>
                  <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="w-full bg-red-50 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-colors text-center border-none cursor-pointer">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsSidebarOpen(false)} className="w-full bg-orange-100 text-orange-600 font-bold py-3.5 text-center rounded-xl hover:bg-orange-200 transition-colors no-underline">Login</NavLink>
                  <NavLink to="/signup" onClick={() => setIsSidebarOpen(false)} className="w-full bg-gradient-to-r from-orange-500 to-[#ff8533] text-white font-bold py-3.5 text-center rounded-xl hover:from-orange-600 hover:to-[#e55a00] transition-colors no-underline shadow-md">Sign Up</NavLink>
                </>
              )}
              </div>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/feed" element={user ? <CulinaryFeed user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/addrecipe" element={user ? <AddRecipe /> : <Navigate to="/login" replace />} />
          <Route path="/editrecipe/:id" element={user ? <EditRecipe /> : <Navigate to="/login" replace />} />
          <Route path="/recommendations" element={user ? <Recommendations user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/chef-certified-recipes" element={<ChefCertifiedRecipesPage />} />
          <Route path="/global-rankings" element={user ? <GlobalRankingsPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/popular-recipes" element={<PopularRecipesPage />} />
          <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="/user/:id" element={<PublicProfile currentUser={user} />} />
          <Route path="/settings" element={user ? <Settings user={user} onUpdate={handleUserUpdate} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
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
