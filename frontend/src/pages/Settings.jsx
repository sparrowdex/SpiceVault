import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Settings as SettingsIcon, User as UserIcon, Eye } from 'lucide-react';
import { UploadButton } from '../utils/uploadthing';
import "@uploadthing/react/styles.css";

const Settings = ({ user, onUpdate, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    f_name: user?.f_name || '',
    l_name: user?.l_name || '',
    username: user?.username || '',
    email: user?.email || '',
    profile_picture: user?.profile_picture || '',
    bio: user?.bio || '',
    show_stats: user?.show_stats ?? true,
    show_articles: user?.show_articles ?? true,
    show_recipes: user?.show_recipes ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState(null);

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
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate(updatedUser);
        showNotification('Profile updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-[20px] font-['Poppins',_sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          className="bg-white border border-gray-200 text-gray-700 py-2.5 px-5 rounded-xl font-semibold flex items-center gap-2 transition-colors hover:bg-gray-50 shadow-sm cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          ← Back to Profile
        </button>
        <button 
          className="bg-orange-50 border border-orange-200 text-orange-600 py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 transition-colors hover:bg-orange-100 shadow-sm cursor-pointer"
          onClick={() => navigate(`/user/${user.user_id}`)}
        >
          <Eye size={18} /> Preview Public Profile
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><UserIcon className="text-orange-500" /> Edit Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative group">
              {formData.profile_picture ? (
                <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} className="text-gray-400" />
              )}
            </div>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setFormData({ ...formData, profile_picture: res[0].ufsUrl || res[0].url });
                showNotification('Image uploaded successfully! Remember to save changes.', 'success');
              }}
              onUploadError={(error) => {
                showNotification(`Upload failed: ${error.message}`, 'error');
              }}
              appearance={{
                button: "bg-orange-100 text-orange-600 text-sm font-semibold py-2 px-4 rounded-xl hover:bg-orange-200 transition-colors focus-within:ring-2 focus-within:ring-orange-500/50 outline-none w-auto",
                allowedContent: "text-xs text-gray-500 mt-2 font-medium"
              }}
              content={{
                button: "Change Picture",
                allowedContent: "Max file size: 4MB"
              }}
            />
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 flex-1 w-full">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" name="f_name" value={formData.f_name} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" name="l_name" value={formData.l_name} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 m-0">Bio</label>
                <span className={`text-xs font-medium ${(formData.bio || '').length >= 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {(formData.bio || '').length}/160
                </span>
              </div>
              <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength={160} placeholder="Tell the community about yourself..." className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-gray-50 focus:bg-white h-24 resize-none" />
            </div>
            
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col gap-3">
              <label className="block text-sm font-bold text-gray-800 m-0">Public Profile Privacy</label>
              <p className="text-xs text-orange-800 mt-[-5px] mb-2 font-medium">Disclaimer: You can toggle exactly what followers see on your profile here.</p>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="show_stats" checked={formData.show_stats} onChange={handleChange} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                Show my total likes & saves
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="show_recipes" checked={formData.show_recipes} onChange={handleChange} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                Show my published recipes
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="show_articles" checked={formData.show_articles} onChange={handleChange} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                Show my featured articles
              </label>
            </div>

            <button type="submit" disabled={loading} className="mt-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 w-full md:w-max cursor-pointer">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-3"><Trash2 /> Danger Zone</h2>
        <p className="text-gray-600 mb-6">These actions are permanent and cannot be undone. Please be certain before proceeding.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => { setModalType('deleteInteractions'); setShowDeleteModal(true); }} className="bg-white text-red-600 border border-red-200 py-3 px-6 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-sm cursor-pointer">
            Clear All Data
          </button>
          <button onClick={() => { setModalType('deleteAccount'); setShowDeleteModal(true); }} className="bg-red-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30 cursor-pointer">
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${modalType === 'deleteAccount' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
              {modalType === 'deleteAccount' ? <Trash2 size={32} /> : <SettingsIcon size={32} />}
            </div>
            <h3 className="m-0 mb-3 text-2xl font-bold text-gray-800">{modalType === 'deleteAccount' ? 'Delete Account' : 'Clear Data'}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {modalType === 'deleteAccount' 
                ? 'Are you absolutely sure you want to delete your account? This action cannot be undone and will erase all your recipes, reviews, and saved data.' 
                : 'This will permanently delete all your saved, liked, and rated interactions. Your account and added recipes will remain safe.'}
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => { setShowDeleteModal(false); setModalType(null); }}>Cancel</button>
              <button 
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-colors shadow-lg cursor-pointer ${modalType === 'deleteAccount' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'}`}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const url = modalType === 'deleteAccount' ? `${import.meta.env.VITE_API_URL}/api/users/${user.user_id}` : `${import.meta.env.VITE_API_URL}/api/user-interactions/delete-all`;
                    const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    if (!response.ok) throw new Error((await response.json()).message || 'Failed to process request');
                    showNotification(modalType === 'deleteAccount' ? 'Account deleted successfully.' : 'All interactions deleted successfully.', 'success');
                    modalType === 'deleteAccount' ? onLogout() : setShowDeleteModal(false);
                  } catch (error) {
                    showNotification(`Error: ${error.message}`, 'error');
                  }
                }}
              >
                {modalType === 'deleteAccount' ? 'Yes, Delete' : 'Clear Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Settings;