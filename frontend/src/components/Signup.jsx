import React, { useState } from 'react';

const Signup = ({ onLogin, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'Regular' // default to Regular user
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          f_name: formData.f_name,
          l_name: formData.l_name,
          email: formData.email,
          password: formData.password,
          user_type: formData.user_type
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        showNotification('Account created successfully!', 'success');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const inputClasses = "w-full p-[12px_15px] border-2 border-[#e0e0e0] rounded-[8px] text-[16px] transition-colors duration-300 box-border focus:outline-none focus:border-[#ff6600] focus:shadow-[0_0_0_3px_rgba(255,102,0,0.1)]";
  const labelClasses = "block mb-[8px] text-[#333] font-medium text-[14px]";
  const buttonClasses = "w-full p-[15px] bg-gradient-to-br from-[#ff6600] to-[#ff8533] text-white border-none rounded-[8px] text-[16px] font-semibold cursor-pointer transition-all duration-300 mt-[10px] hover:not(:disabled):from-[#e55a00] hover:not(:disabled):to-[#ff6600] hover:not(:disabled):-translate-y-[2px] hover:not(:disabled):shadow-[0_4px_12px_rgba(255,102,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none";
  const groupClasses = "mb-[20px] flex-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff6600] to-[#ff8533] p-[10px] sm:p-5">
      <div className="bg-white rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-[30px_20px] sm:p-10 w-full max-w-[500px]">
        <h2 className="text-center text-[#333] mb-[30px] text-[24px] sm:text-[28px] font-semibold">Join SpiceVault</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-0 sm:flex-row sm:gap-[15px]">
            <div className={groupClasses}>
              <label htmlFor="f_name" className={labelClasses}>First Name</label>
              <input
                type="text"
                id="f_name"
                name="f_name"
                value={formData.f_name}
                onChange={handleChange}
                required
                placeholder="First name"
                className={inputClasses}
              />
            </div>
            
            <div className={groupClasses}>
              <label htmlFor="l_name" className={labelClasses}>Last Name</label>
              <input
                type="text"
                id="l_name"
                name="l_name"
                value={formData.l_name}
                onChange={handleChange}
                required
                placeholder="Last name"
                className={inputClasses}
              />
            </div>
          </div>
          
          <div className={groupClasses}>
            <label htmlFor="email" className={labelClasses}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={inputClasses}
            />
          </div>
          
          <div className={groupClasses}>
            <label htmlFor="user_type" className={labelClasses}>Account Type</label>
          <select
            id="user_type"
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="Regular">Regular User</option>
            <option value="chef">Chef</option>
          </select>
          </div>
          
          <div className={groupClasses}>
            <label htmlFor="password" className={labelClasses}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min 6 characters)"
              className={inputClasses}
            />
          </div>
          
          <div className={groupClasses}>
            <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className={inputClasses}
            />
          </div>

          {error && <div className="bg-[#ffebee] text-[#d32f2f] p-[12px] rounded-[8px] mb-[20px] border-l-[4px] border-l-[#f44336] text-[14px]">{error}</div>}

          <button type="submit" className={buttonClasses} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-[25px] pt-[20px] border-t border-t-[#e0e0e0]">
          <p className="text-[#666] m-0">Already have an account? <button onClick={onSwitchToLogin} className="bg-transparent border-none text-[#ff6600] cursor-pointer font-semibold underline text-inherit hover:text-[#e55a00]">Login</button></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
