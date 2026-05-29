import React, { useState, useEffect, useCallback } from 'react';
import { UploadButton } from '../utils/uploadthing';
import { Image, Send, User, Star, Clock, Search, UserPlus, BookOpen, Trash2, X, Heart, MessageCircle, ChevronLeft, ChevronRight, Globe, Lock, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "@uploadthing/react/styles.css";

const CulinaryFeed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [mediaItems, setMediaItems] = useState([]); // array of {url, type}
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  
  // Search & Follow states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  
  // Story Modal states
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyFile, setStoryFile] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  
  // Article Modal states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articleData, setArticleData] = useState({ title: '', category: 'Guide', read_time: '5 min read', image_url: '', content: '' });
  const [isPublishing, setIsPublishing] = useState(false);

  // Post Interaction states
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editAllowComments, setEditAllowComments] = useState(true);

  const [activeMediaIndex, setActiveMediaIndex] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToReplyId, setReplyingToReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; color: white; font-weight: 500;
      z-index: 9999; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateX(100%);
      transition: transform 0.3s ease; background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 3000);
  };

  const fetchFeed = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/social/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  }, []);

  const fetchRecommendedUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/social/recommended-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setRecommendedUsers(data.users);
    } catch (error) { console.error('Error fetching recommendations:', error); }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/social/stories/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStories(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFeed();
      fetchStories();
      fetchRecommendedUsers();
    }
  }, [user, fetchFeed, fetchStories, fetchRecommendedUsers]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/users?search=${query}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.filter(u => u.user_id !== user.user_id));
        }
      } catch (err) { console.error('Search failed:', err); }
    } else {
      setSearchResults([]);
    }
  };

  const handleFollow = async (targetUser) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/social/follow/${targetUser.user_id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const msg = targetUser.user_type === 'chef' ? `You are now following Chef ${targetUser.f_name}!` : `You are now culinary pals with ${targetUser.f_name}!`;
        showNotification(msg, 'success');
        setSearchQuery('');
        setSearchResults([]);
        fetchFeed(); 
        fetchStories(); 
        fetchRecommendedUsers();
      } else {
        showNotification(data.error || 'Failed to follow', 'error');
      }
    } catch (err) { showNotification('Network error', 'error'); }
  };

  const handleStorySubmit = async () => {
    if (!storyFile) return;
    setIsUploadingStory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/social/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image_url: storyFile, content: storyText })
      });
      if (res.ok) {
        showNotification('Story posted successfully!', 'success');
        setShowStoryModal(false);
        setStoryFile('');
        setStoryText('');
        fetchStories();
      }
    } catch (err) { showNotification('Error posting story', 'error'); }
    finally { setIsUploadingStory(false); }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/social/stories/${storyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Story deleted!', 'success');
        setActiveStoryIndex(null);
        fetchStories();
      }
    } catch (err) { showNotification('Failed to delete', 'error'); }
  };

  const handleArticleSubmit = async () => {
    if (!articleData.title || !articleData.content || !articleData.image_url) return showNotification('Please fill all fields and upload an image.', 'error');
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/social/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(articleData)
      });
      if (res.ok) {
        showNotification('Article published successfully! Check the Homepage Slideshow.', 'success');
        setShowArticleModal(false);
        setArticleData({ title: '', category: 'Guide', read_time: '5 min read', image_url: '', content: '' });
      } else {
        showNotification('Failed to publish article.', 'error');
      }
    } catch (err) { showNotification('Network error', 'error'); }
    finally { setIsPublishing(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/social/feed/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Post deleted!', 'success');
        fetchFeed();
      } else {
        showNotification('Failed to delete post.', 'error');
      }
    } catch (err) { showNotification('Network error', 'error'); }
  };

  const handleEditPost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/social/feed/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editPostContent, allow_comments: editAllowComments })
      });
      if (res.ok) {
        showNotification('Post updated!', 'success');
        setEditingPostId(null);
        fetchFeed();
      } else showNotification('Failed to update post.', 'error');
    } catch (err) { showNotification('Network error', 'error'); }
  };

  const handleLike = async (postId) => {
    setPosts(posts.map(p => {
      if (p.post_id === postId) {
        const currentLikes = p.likes || [];
        const hasLiked = currentLikes.some(l => l.user_id === user.user_id);
        return { ...p, likes: hasLiked ? currentLikes.filter(l => l.user_id !== user.user_id) : [...currentLikes, { user_id: user.user_id }] };
      }
      return p;
    }));
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/social/feed/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
    } catch (err) { console.error(err); }
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/social/feed/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyText, parent_id: replyingToReplyId })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => p.post_id === postId ? { ...p, replies: [...(p.replies || []), data.reply] } : p));
        setReplyText('');
        setReplyingTo(null);
        setReplyingToReplyId(null);
      }
    } catch(e) { console.error(e); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && mediaItems.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/social/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          is_public: isPublic,
          allow_comments: allowComments,
          media: mediaItems
        })
      });
      
      if (response.ok) {
        setNewPostContent('');
        setIsPublic(true);
        setAllowComments(true);
        setMediaItems([]);
        fetchFeed(); // Refresh feed immediately
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPostMedia = (post) => {
    if (!post.media_url) return [];
    try {
      const parsed = JSON.parse(post.media_url);
      return Array.isArray(parsed) ? parsed : [{ url: post.media_url, type: post.media_type || 'image' }];
    } catch(e) {
      return [{ url: post.media_url, type: post.media_type || 'image' }];
    }
  };

  if (!user) return <div className="text-center p-10 font-['Poppins',_sans-serif]">Please login to view the feed.</div>;

  return (
    <div className="max-w-[1000px] mx-auto p-[20px] font-['Poppins',_sans-serif] min-h-screen">
      <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#5C4033] mb-[15px] font-['Nostalgia',_serif]">Culinary Feed</h1>

      {/* User Search & Follow Bar */}
      <div className="relative mb-[30px] z-30">
        <div className="relative">
          <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#ff8533]" size={20} />
          <input
            type="text"
            placeholder="Find chefs and friends to follow..."
            className="w-full bg-white border-2 border-[#f0e0d0] rounded-[25px] py-[12px] pl-[45px] pr-[15px] outline-none focus:border-[#ff6600] shadow-sm font-['Poppins',_sans-serif] text-[15px] transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-[110%] left-0 w-full bg-white border border-[#eee] rounded-[15px] shadow-xl max-h-[300px] overflow-y-auto z-40">
            {searchResults.map(resultUser => (
              <div key={resultUser.user_id} className="flex items-center justify-between p-[15px] border-b border-[#f9f9f9] last:border-none hover:bg-[#fffaf5] transition-colors">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-[#fff5f0] flex items-center justify-center border border-[#ffcc80] cursor-pointer" onClick={() => navigate(`/user/${resultUser.user_id}`)}>
                    {resultUser.profile_picture ? <img src={resultUser.profile_picture.startsWith('http') ? resultUser.profile_picture : `http://localhost:5000/images/${resultUser.profile_picture}`} className="w-full h-full object-cover" /> : <User size={24} className="text-[#ff8533]" />}
                  </div>
                  <div className="cursor-pointer group" onClick={() => navigate(`/user/${resultUser.user_id}`)}>
                    <h4 className="font-bold text-[#333] m-0 text-[15px] group-hover:text-[#ff6600] transition-colors">{resultUser.f_name} {resultUser.l_name}</h4>
                    <span className="text-[#888] text-[12px] font-medium mr-2 group-hover:text-[#ff6600] transition-colors">@{resultUser.username || resultUser.f_name.toLowerCase()}</span><span className="text-[#ff6600] text-[11px] font-bold uppercase tracking-wider">{resultUser.user_type}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(resultUser)}
                  className="flex items-center gap-[6px] bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white px-[18px] py-[8px] rounded-full text-[13px] font-bold hover:shadow-md hover:-translate-y-[1px] transition-all border-none cursor-pointer"
                >
                  <UserPlus size={14} /> Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Chefs to Follow */}
      {recommendedUsers.length > 0 && (
        <div className="w-full bg-transparent overflow-hidden mb-[25px]">
          <h2 className="font-bold text-[1.2rem] text-[#5C4033] mb-[15px] font-['Nostalgia',_serif]">Suggested Chefs</h2>
          <div className="flex gap-[15px] overflow-x-auto pb-[10px] snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {recommendedUsers.map(recUser => (
              <div key={recUser.user_id} className="flex flex-col items-center justify-between p-[15px] shrink-0 snap-start bg-white rounded-[15px] shadow-sm border border-[#f0e0d0] w-[140px] text-center hover:shadow-md transition-shadow">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#fff5f0] flex items-center justify-center border border-[#ffcc80] mb-[10px] cursor-pointer" onClick={() => navigate(`/user/${recUser.user_id}`)}>
                  {recUser.profile_picture ? <img src={recUser.profile_picture.startsWith('http') ? recUser.profile_picture : `http://localhost:5000/images/${recUser.profile_picture}`} className="w-full h-full object-cover" /> : <User size={24} className="text-[#ff8533]" />}
                </div>
                <h4 className="font-bold text-[#333] m-0 text-[14px] truncate w-full cursor-pointer hover:text-[#ff6600] transition-colors" onClick={() => navigate(`/user/${recUser.user_id}`)}>{recUser.f_name} {recUser.l_name}</h4>
                <span className="text-[#888] text-[11px] font-medium mb-[10px] truncate w-full cursor-pointer hover:text-[#ff6600] transition-colors" onClick={() => navigate(`/user/${recUser.user_id}`)}>@{recUser.username || recUser.f_name?.toLowerCase()}</span>
                <button 
                  onClick={() => handleFollow(recUser)}
                  className="flex items-center justify-center gap-[4px] bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white w-full py-[6px] rounded-full text-[12px] font-bold hover:shadow-md hover:-translate-y-[1px] transition-all border-none cursor-pointer"
                >
                  <UserPlus size={14} /> Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chef Updates / Stories Bar */}
      <div className="w-full bg-transparent py-[5px] overflow-hidden mb-[25px]">
        <h2 className="font-bold text-[1.2rem] text-[#5C4033] mb-[15px] font-['Nostalgia',_serif]">Updates & Stories</h2>
        <div className="flex gap-[15px] overflow-x-auto pb-[5px] snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {user.user_type === 'chef' && (
            <div className="flex flex-col items-center gap-[6px] shrink-0 snap-start cursor-pointer group" onClick={() => setShowStoryModal(true)}>
               <div className="w-[60px] h-[60px] rounded-full border-[2px] border-dashed border-[#ff6600] flex items-center justify-center bg-[#fff5f0] transition-colors group-hover:bg-[#ffe6d6]">
                  <span className="text-[#ff6600] text-[20px] font-light">+</span>
               </div>
               <span className="text-[11px] font-semibold text-[#555]">Add Update</span>
            </div>
          )}
          {user.user_type === 'chef' && (
            <div className="flex flex-col items-center gap-[6px] shrink-0 snap-start cursor-pointer group" onClick={() => setShowArticleModal(true)}>
               <div className="w-[60px] h-[60px] rounded-full border-[2px] border-solid border-[#8B4513] flex items-center justify-center bg-[#fdf5e6] transition-colors group-hover:bg-[#f5deb3]">
                  <BookOpen className="text-[#8B4513]" size={24} strokeWidth={1.5} />
               </div>
               <span className="text-[11px] font-semibold text-[#555]">Write Article</span>
            </div>
          )}
          {stories.length === 0 && user.user_type !== 'chef' && (
            <p className="text-[13px] text-[#888] italic h-[60px] flex items-center">No updates right now. Follow chefs to see their stories!</p>
          )}
          {stories.map(story => (
            <div key={story.story_id} className="flex flex-col items-center gap-[6px] shrink-0 snap-start cursor-pointer group" onClick={() => setActiveStoryIndex(stories.indexOf(story))}>
              <div className={`w-[60px] h-[60px] rounded-full p-[2px] ${story.user?.user_type === 'chef' ? 'bg-gradient-to-tr from-[#ff6600] to-[#ffcc80]' : 'bg-gradient-to-tr from-[#4caf50] to-[#a8e063]'}`}>
                <img src={story.image_url?.startsWith('http') ? story.image_url : `http://localhost:5000/images/${story.image_url}`} alt={story.user?.f_name} className="w-full h-full rounded-full object-cover border-[2px] border-white transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-[11px] font-semibold text-[#555] max-w-[65px] truncate">{story.user?.f_name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Create Post Box */}
      <div className="bg-white rounded-[20px] p-[20px] shadow-sm border border-[#f0e0d0] mb-[30px]">
        <form onSubmit={handlePostSubmit}>
          <div className="flex gap-[15px]">
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden shrink-0 bg-[#fff5f0] flex items-center justify-center border border-[#ffcc80]">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.f_name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-[#ff8533]" size={24} />
              )}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[15px] p-[15px] outline-none focus:border-[#ff6600] focus:bg-white transition-all resize-y min-h-[80px] text-[15px] text-[#333]"
                placeholder="Share your culinary journey..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              
              {mediaItems.length > 0 && (
                <div className="flex gap-[10px] mt-[10px] overflow-x-auto pb-[5px] scrollbar-hide">
                  {mediaItems.map((media, idx) => (
                    <div key={idx} className="relative rounded-[15px] overflow-hidden bg-black/5 border border-[#ddd] shrink-0 w-[150px] h-[150px]">
                      {media.type === 'video' ? (
                        <video src={media.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => setMediaItems(prev => prev.filter((_, i) => i !== idx))} className="absolute top-[5px] right-[5px] bg-red-500 text-white rounded-full w-[24px] h-[24px] flex items-center justify-center font-bold shadow-md hover:bg-red-600 cursor-pointer border-none text-[12px]">✕</button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-[15px] pt-[15px] border-t border-[#f0f0f0]">
                <UploadButton
                  endpoint="mediaUploader"
                  onClientUploadComplete={(res) => {
                    const newMedia = res.map(file => ({ url: file.ufsUrl || file.url, type: file.name.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image' }));
                    setMediaItems(prev => [...prev, ...newMedia].slice(0, 5));
                  }}
                  onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                  appearance={{
                    button: `bg-[#fff5f0] text-[#ff6600] border border-[#ffcc80] rounded-[20px] px-[15px] py-[6px] text-[13px] font-semibold hover:bg-[#ffe6d6] transition-colors flex items-center gap-[6px] m-0 focus-within:ring-2 focus-within:ring-orange-500/50 outline-none w-auto ${mediaItems.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`,
                    allowedContent: "hidden"
                  }}
                  content={{ button: <div><Image size={16} className="inline mr-1" /> Media</div> }}
                />
                
                <div className="flex items-center gap-[15px]">
                  <label className="flex items-center gap-[6px] text-[13px] text-[#666] cursor-pointer font-medium select-none hover:text-[#ff6600] transition-colors">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-[16px] h-[16px] accent-[#ff6600] cursor-pointer" />
                    Public
                  </label>
                  <label className="flex items-center gap-[6px] text-[13px] text-[#666] cursor-pointer font-medium select-none hover:text-[#ff6600] transition-colors ml-[5px]">
                    <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="w-[16px] h-[16px] accent-[#ff6600] cursor-pointer" />
                    Comments
                  </label>
                  <button type="submit" disabled={loading || (!newPostContent.trim() && mediaItems.length === 0)} className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white px-[25px] py-[8px] rounded-[20px] font-semibold flex items-center gap-[8px] hover:-translate-y-[1px] hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 transition-all cursor-pointer border-none text-[14px]">
                    <Send size={16} /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed Posts List */}
      <div className="flex flex-col gap-[20px]">
        {posts.length === 0 ? (
          <div className="text-center p-[40px] bg-white rounded-[20px] border border-[#f0e0d0] text-[#888] shadow-sm">
            No posts yet. Follow chefs or share your first culinary update!
          </div>
        ) : (
          posts.map(post => (
            <div key={post.post_id} className="bg-white rounded-[20px] p-[20px] shadow-sm border border-[#f0e0d0] transition-all hover:shadow-md">
              <div className="flex items-center gap-[12px] mb-[15px]">
                <div className="w-[45px] h-[45px] rounded-full overflow-hidden bg-[#fff5f0] flex items-center justify-center border border-[#ffcc80] cursor-pointer" onClick={() => navigate(`/user/${post.user_id}`)}>
                  {post.user?.profile_picture ? <img src={post.user.profile_picture.startsWith('http') ? post.user.profile_picture : `http://localhost:5000/images/${post.user.profile_picture}`} alt={post.user.f_name} className="w-full h-full object-cover" /> : <User className="text-[#ff8533]" size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#333] text-[15px] m-0 leading-tight flex items-center cursor-pointer hover:text-[#ff6600] transition-colors inline-flex" onClick={() => navigate(`/user/${post.user_id}`)}>
                    {post.user?.f_name} {post.user?.l_name}
                    {post.user?.user_type === 'chef' && <span className="ml-[8px] text-[10px] bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white px-[8px] py-[2px] rounded-full font-bold uppercase tracking-wider shadow-sm">Chef</span>}
                  </h3>
                  <div className="flex items-center gap-[6px] text-[12px] text-[#888] mt-[4px] font-medium">
                    <span className="text-[#ff6600] cursor-pointer hover:underline" onClick={() => navigate(`/user/${post.user_id}`)}>@{post.user?.username || post.user?.f_name?.toLowerCase()}</span> • <Clock size={12} /> {formatTimeAgo(post.createdAt)} • {post.is_public ? <Globe size={12} title="Public (Visible to everyone)" /> : <Lock size={12} title="Private (Followers only)" />}
                  </div>
                </div>
                {post.user_id === user?.user_id && editingPostId !== post.post_id && (
                  <div className="flex items-center">
                    <button onClick={() => { setEditingPostId(post.post_id); setEditPostContent(post.content || ''); setEditAllowComments(post.allow_comments); }} className="bg-transparent border-none text-[#ccc] hover:text-[#ff6600] cursor-pointer transition-colors p-[8px] rounded-full hover:bg-orange-50 flex items-center justify-center"><Edit3 size={18} /></button>
                    <button onClick={() => handleDeletePost(post.post_id)} className="bg-transparent border-none text-[#ccc] hover:text-red-500 cursor-pointer transition-colors p-[8px] rounded-full hover:bg-red-50 flex items-center justify-center"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>
              
              {editingPostId === post.post_id ? (
                <div className="mb-[15px] animate-[fadeIn_0.2s_ease-out]">
                  <textarea className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[15px] p-[15px] outline-none focus:border-[#ff6600] transition-all resize-y min-h-[80px] text-[15px] text-[#333] mb-[10px]" value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-[6px] text-[13px] text-[#666] cursor-pointer font-medium select-none hover:text-[#ff6600] transition-colors">
                      <input type="checkbox" checked={editAllowComments} onChange={(e) => setEditAllowComments(e.target.checked)} className="w-[16px] h-[16px] accent-[#ff6600] cursor-pointer" /> Allow Comments
                    </label>
                    <div className="flex gap-[10px]">
                      <button onClick={() => setEditingPostId(null)} className="px-[15px] py-[6px] rounded-[20px] font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors border-none cursor-pointer text-[13px]">Cancel</button>
                      <button onClick={() => handleEditPost(post.post_id)} className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white px-[15px] py-[6px] rounded-[20px] font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer border-none text-[13px]">Save</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[#444] leading-relaxed whitespace-pre-wrap mb-[15px] text-[15px]">{post.content}</div>
              )}
              
              {(() => {
                const mediaArray = getPostMedia(post);
                const currentMediaIdx = activeMediaIndex[post.post_id] || 0;
                if (mediaArray.length === 0) return null;
                
                return (
                  <div className="relative rounded-[12px] overflow-hidden bg-[#f9f9f9] mb-[15px] border border-[#eee] flex justify-center shadow-sm group/media">
                    {mediaArray[currentMediaIdx].type === 'video' ? (
                      <video src={mediaArray[currentMediaIdx].url} controls className="max-w-full max-h-[450px]" />
                    ) : (
                      <img src={mediaArray[currentMediaIdx].url} alt="Post media" className="max-w-full max-h-[450px] object-contain" />
                    )}
                    
                    {mediaArray.length > 1 && (
                      <>
                        <button onClick={() => setActiveMediaIndex(prev => ({ ...prev, [post.post_id]: Math.max(0, currentMediaIdx - 1) }))} disabled={currentMediaIdx === 0} className="absolute left-[10px] top-1/2 -translate-y-1/2 bg-white/70 text-[#333] border-none rounded-full w-[35px] h-[35px] flex items-center justify-center cursor-pointer shadow-md disabled:opacity-30 opacity-0 group-hover/media:opacity-100 transition-opacity"><ChevronLeft size={20}/></button>
                        <button onClick={() => setActiveMediaIndex(prev => ({ ...prev, [post.post_id]: Math.min(mediaArray.length - 1, currentMediaIdx + 1) }))} disabled={currentMediaIdx === mediaArray.length - 1} className="absolute right-[10px] top-1/2 -translate-y-1/2 bg-white/70 text-[#333] border-none rounded-full w-[35px] h-[35px] flex items-center justify-center cursor-pointer shadow-md disabled:opacity-30 opacity-0 group-hover/media:opacity-100 transition-opacity"><ChevronRight size={20}/></button>
                        <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[5px]">
                          {mediaArray.map((_, i) => (
                            <div key={i} className={`w-[6px] h-[6px] rounded-full shadow-sm transition-all ${currentMediaIdx === i ? 'bg-[#ff6600] w-[12px]' : 'bg-white/70'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
              
              {/* Linked Recipe/Review Card */}
              {(post.recipe || post.review) && (
                <div className="mt-[10px] border border-[#ffcc80] rounded-[12px] p-[12px] bg-[#fffaf5] cursor-pointer hover:bg-[#fff5f0] transition-colors flex gap-[15px] items-center group shadow-sm" onClick={() => navigate(`/recipes/${post.recipe_id}`)}>
                  {(post.recipe?.image_url || post.review?.recipe?.image_url) && (
                    <img src={(post.recipe?.image_url || post.review?.recipe?.image_url)?.startsWith('http') ? (post.recipe?.image_url || post.review?.recipe?.image_url) : `http://localhost:5000/images/${(post.recipe?.image_url || post.review?.recipe?.image_url)}`} alt="Recipe" className="w-[60px] h-[60px] rounded-[8px] object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-[#333] text-[15px] m-0 mb-[4px] leading-tight">{post.recipe?.title || post.review?.recipe?.title}</h4>
                    {post.review && (
                      <div className="flex items-center gap-[2px] text-[#ff6600] mb-[4px]">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < post.review.rating ? "fill-current" : "text-[#ddd] fill-[#ddd]"} />))}
                      </div>
                    )}
                    <span className="text-[12px] text-[#ff6600] font-bold uppercase tracking-wider group-hover:underline">View Recipe →</span>
                  </div>
                </div>
              )}
          
              {/* Post Interactions */}
              <div className="flex items-center gap-[20px] mt-[15px] pt-[15px] border-t border-[#f0f0f0]">
                <button onClick={() => handleLike(post.post_id)} className="flex items-center gap-[6px] bg-transparent border-none cursor-pointer text-[#666] hover:text-[#ff4081] transition-colors text-[14px] font-semibold">
                  <Heart size={20} className={(post.likes || []).some(l => l.user_id === user.user_id) ? "fill-[#ff4081] text-[#ff4081]" : ""} /> 
                  {post.likes?.length || 0}
                </button>
                {post.allow_comments ? (
                  <button onClick={() => setReplyingTo(replyingTo === post.post_id ? null : post.post_id)} className="flex items-center gap-[6px] bg-transparent border-none cursor-pointer text-[#666] hover:text-[#007bff] transition-colors text-[14px] font-semibold">
                    <MessageCircle size={20} /> 
                    {post.replies?.length || 0}
                  </button>
                ) : (
                  <span className="flex items-center gap-[6px] text-[#aaa] text-[14px] font-semibold cursor-not-allowed select-none"><MessageCircle size={20} className="opacity-50" /> Comments Disabled</span>
                )}
              </div>
              
              {/* Replies Section */}
              {replyingTo === post.post_id && post.allow_comments && (
                <div className="mt-[15px] bg-[#f9f9f9] rounded-[15px] p-[15px] border border-[#eee] animate-[fadeIn_0.2s_ease-out]">
                  {(() => {
                    const renderReply = (reply, depth = 0) => {
                      const childReplies = (post.replies || []).filter(r => r.parent_id === reply.id);
                      return (
                        <div key={reply.id} className={`mb-[10px] ${depth > 0 ? 'ml-[15px] sm:ml-[20px] pl-[10px] border-l-2 border-[#eee]' : ''}`}>
                          <div className="flex items-center gap-[8px] mb-[4px]">
                            <span className="font-bold text-[13px] text-[#333] cursor-pointer hover:text-[#ff6600] transition-colors" onClick={() => navigate(`/user/${reply.user_id}`)}>{reply.user?.f_name} {reply.user?.l_name}</span>
                            <span className="text-[12px] text-[#ff6600] cursor-pointer hover:underline" onClick={() => navigate(`/user/${reply.user_id}`)}>@{reply.user?.username || reply.user?.f_name?.toLowerCase()}</span>
                            <span className="text-[11px] text-[#aaa] ml-auto">{formatTimeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="m-0 text-[14px] text-[#555]">{reply.content}</p>
                          <button onClick={() => { setReplyingToReplyId(reply.id); setReplyText(`@${reply.user?.username || reply.user?.f_name?.toLowerCase()} `); }} className="text-[11px] text-[#ff6600] bg-transparent border-none cursor-pointer mt-1 hover:underline p-0">Reply</button>
                          {childReplies.map(c => renderReply(c, depth + 1))}
                        </div>
                      );
                    };
                    return (post.replies || []).filter(r => !r.parent_id).map(r => renderReply(r, 0));
                  })()}
                  <div className="flex items-center gap-[10px] mt-[15px] pt-[10px] border-t border-[#ddd]">
                    {replyingToReplyId && <button onClick={() => { setReplyingToReplyId(null); setReplyText(''); }} className="text-red-500 bg-transparent border-none cursor-pointer text-[12px] px-2 hover:underline shrink-0">Cancel</button>}
                    <input type="text" placeholder={replyingToReplyId ? "Write a reply..." : "Write a comment..."} value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 bg-white border border-[#ddd] rounded-[20px] py-[8px] px-[15px] text-[14px] outline-none focus:border-[#ff6600]" onKeyDown={e => e.key === 'Enter' && handleReply(post.post_id)} />
                    <button onClick={() => handleReply(post.post_id)} disabled={!replyText.trim()} className="bg-[#ff6600] text-white border-none rounded-full w-[35px] h-[35px] flex items-center justify-center cursor-pointer disabled:opacity-50 hover:bg-[#e55a00] transition-colors"><Send size={14}/></button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Story Upload Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[20px] p-[30px] w-full max-w-[400px] shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
            <button className="absolute top-[15px] right-[15px] text-[#888] hover:text-red-500 cursor-pointer border-none bg-transparent text-[20px]" onClick={() => setShowStoryModal(false)}>✕</button>
            <h2 className="text-[1.5rem] font-bold text-[#5C4033] mb-[20px] font-['Nostalgia',_serif] m-0">Post an Update</h2>
            <div className="flex flex-col gap-[15px]">
              {storyFile ? (
                <div className="relative rounded-[15px] overflow-hidden bg-gray-100 h-[200px] flex items-center justify-center border border-[#ddd]">
                  <img src={storyFile} className="max-h-full max-w-full object-contain" alt="Story preview" />
                  <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold cursor-pointer border-none shadow-md hover:bg-red-600" onClick={() => setStoryFile('')}>✕</button>
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => setStoryFile(res[0].ufsUrl || res[0].url)}
                  appearance={{ button: "bg-[#fff5f0] text-[#ff6600] border border-[#ffcc80] rounded-[15px] w-full py-[20px] font-semibold text-[16px] outline-none hover:bg-[#ffe6d6] transition-colors" }}
                  content={{ button: "Upload Photo" }}
                />
              )}
              <textarea
                className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[15px] p-[15px] outline-none focus:border-[#ff6600] resize-none h-[80px] text-[14px] font-['Poppins',_sans-serif]"
                placeholder="Add a caption..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />
              <button 
                className="w-full bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white rounded-[15px] py-[12px] font-bold shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer border-none transition-all"
                disabled={isUploadingStory || !storyFile}
                onClick={handleStorySubmit}
              >
                {isUploadingStory ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[20px] p-[30px] w-full max-w-[600px] shadow-2xl relative animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <button className="absolute top-[15px] right-[15px] text-[#888] hover:text-red-500 cursor-pointer border-none bg-transparent text-[24px]" onClick={() => setShowArticleModal(false)}>✕</button>
            <h2 className="text-[1.8rem] font-bold text-[#5C4033] mb-[20px] font-['Nostalgia',_serif] m-0 flex items-center gap-2"><BookOpen /> Write an Article</h2>
            
            <div className="flex flex-col gap-[15px]">
              <input type="text" placeholder="Article Title..." className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[12px] p-[12px] outline-none focus:border-[#ff6600] text-[15px] font-bold" value={articleData.title} onChange={e => setArticleData({...articleData, title: e.target.value})} />
              
              <div className="flex gap-[10px]">
                <select className="flex-1 bg-[#f9f9f9] border border-[#ddd] rounded-[12px] p-[12px] outline-none focus:border-[#ff6600] text-[14px]" value={articleData.category} onChange={e => setArticleData({...articleData, category: e.target.value})}>
                  <option value="Guide">Guide</option>
                  <option value="Technique">Technique</option>
                  <option value="Recipe Focus">Recipe Focus</option>
                  <option value="Story">Story</option>
                </select>
                <select className="flex-1 bg-[#f9f9f9] border border-[#ddd] rounded-[12px] p-[12px] outline-none focus:border-[#ff6600] text-[14px]" value={articleData.read_time} onChange={e => setArticleData({...articleData, read_time: e.target.value})}>
                  <option value="3 min read">3 min read</option>
                  <option value="5 min read">5 min read</option>
                  <option value="10 min read">10 min read</option>
                </select>
              </div>

              {articleData.image_url ? (
                <div className="relative rounded-[15px] overflow-hidden bg-gray-100 h-[200px] flex items-center justify-center border border-[#ddd]">
                  <img src={articleData.image_url} className="w-full h-full object-cover" alt="Article cover" />
                  <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 font-bold cursor-pointer border-none shadow-md hover:bg-red-600" onClick={() => setArticleData({...articleData, image_url: ''})}>✕</button>
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => setArticleData({...articleData, image_url: res[0].ufsUrl || res[0].url})}
                  appearance={{ button: "bg-[#fff5f0] text-[#ff6600] border border-[#ffcc80] rounded-[15px] w-full py-[20px] font-semibold text-[16px] outline-none hover:bg-[#ffe6d6] transition-colors" }}
                  content={{ button: "Upload Cover Image" }}
                />
              )}

              <textarea placeholder="Write your article content here..." className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-[15px] p-[15px] outline-none focus:border-[#ff6600] resize-y min-h-[150px] text-[14px] leading-relaxed" value={articleData.content} onChange={e => setArticleData({...articleData, content: e.target.value})} />

              <button onClick={handleArticleSubmit} disabled={isPublishing} className="w-full bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-[15px] py-[15px] font-bold shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:opacity-50 cursor-pointer border-none transition-all text-[16px]">
                {isPublishing ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Story Viewer */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 bg-[#111] z-[3000] flex flex-col items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          {/* Top Header */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              {stories[activeStoryIndex].user?.profile_picture ? (
                <img src={stories[activeStoryIndex].user.profile_picture.startsWith('http') ? stories[activeStoryIndex].user.profile_picture : `http://localhost:5000/images/${stories[activeStoryIndex].user.profile_picture}`} className="w-10 h-10 rounded-full object-cover border border-white/30" alt="Avatar"/>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6600] to-[#ffcc80] flex items-center justify-center text-white font-bold border border-white/30">{stories[activeStoryIndex].user?.f_name?.[0] || 'S'}</div>
              )}
              <div className="text-white shadow-sm">
                <p className="font-bold text-sm m-0 drop-shadow-md">{stories[activeStoryIndex].user?.f_name} {stories[activeStoryIndex].user?.l_name}</p>
                <p className="text-xs opacity-80 m-0 drop-shadow-md">{formatTimeAgo(stories[activeStoryIndex].createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {stories[activeStoryIndex].user_id === user.user_id && (
                <button className="bg-black/40 p-2 rounded-full text-white hover:bg-red-500 transition border-none cursor-pointer" onClick={() => handleDeleteStory(stories[activeStoryIndex].story_id)}>
                  <Trash2 size={20} />
                </button>
              )}
              <button className="bg-black/40 p-2 rounded-full text-white hover:bg-white/30 transition border-none cursor-pointer" onClick={() => setActiveStoryIndex(null)}>
                <X size={24} />
              </button>
            </div>
          </div>
          {/* Navigation Layers */}
          <div className="absolute inset-0 flex z-40">
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setActiveStoryIndex(prev => prev > 0 ? prev - 1 : prev)} />
            <div className="w-1/2 h-full cursor-pointer" onClick={() => setActiveStoryIndex(prev => prev < stories.length - 1 ? prev + 1 : prev)} />
          </div>
          <img src={stories[activeStoryIndex].image_url?.startsWith('http') ? stories[activeStoryIndex].image_url : `http://localhost:5000/images/${stories[activeStoryIndex].image_url}`} className="max-h-[100vh] max-w-full object-contain pointer-events-none z-20" alt="Story" />
          {stories[activeStoryIndex].content && (
            <div className="absolute bottom-[10%] left-0 w-full text-center z-50 pointer-events-none px-4">
              <span className="bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-[15px] font-medium inline-block max-w-[80%]">{stories[activeStoryIndex].content}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CulinaryFeed;