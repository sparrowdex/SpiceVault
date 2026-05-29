import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, UserPlus, UserCheck, Star, Bookmark, BookOpen, Clock, Globe, Heart, Eye } from 'lucide-react';

const PublicProfile = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const requesterParam = currentUser ? `?requesterId=${currentUser.user_id}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/profile/${id}${requesterParam}`);
      const json = await res.json();
      if (json.success) setData(json);
      else setData({ error: 'User not found' });
    } catch(e) { console.error(e); setData({ error: 'Network error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const toggleFollow = async () => {
    if (!currentUser) return alert('Please login to follow users.');
    try {
      const token = localStorage.getItem('token');
      const method = data.isFollowing ? 'DELETE' : 'POST';
      const endpoint = data.isFollowing ? `unfollow` : `follow`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/${endpoint}/${id}`, {
        method, headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(prev => ({ 
          ...prev, 
          isFollowing: !prev.isFollowing, 
          profile: { ...prev.profile, _count: { ...prev.profile._count, followers: prev.profile._count.followers + (data.isFollowing ? -1 : 1) } } 
        }));
      }
    } catch(e) { console.error(e); }
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPostMedia = (post) => {
    if (!post.media_url) return [];
    try {
      const parsed = JSON.parse(post.media_url);
      return Array.isArray(parsed) ? parsed : [{ url: post.media_url, type: post.media_type || 'image' }];
    } catch(e) { return [{ url: post.media_url, type: post.media_type || 'image' }]; }
  };

  if (loading) return <div className="p-10 text-center font-['Poppins',_sans-serif]">Loading profile...</div>;
  if (!data || data.error) return <div className="p-10 text-center font-['Poppins',_sans-serif] text-red-500">{data?.error || 'Error loading profile'}</div>;

  const { profile, stats, recipes, articles, feed_posts, isFollowing } = data;
  const isMe = currentUser?.user_id === profile.user_id;

  return (
    <div className="max-w-[1000px] mx-auto p-[20px] font-['Poppins',_sans-serif] min-h-screen">
       {isMe && (
         <div className="bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white p-[12px_20px] rounded-[15px] mb-[20px] flex flex-col md:flex-row items-center justify-between shadow-md gap-[10px]">
           <div className="flex items-center gap-[8px] font-semibold text-[14px]"><Eye size={18} /> Disclaimer: You are previewing your Public Profile. You can change your visibility anytime in the settings.</div>
           <button onClick={() => navigate('/settings')} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-[15px] py-[8px] rounded-[10px] text-[13px] font-bold transition-colors cursor-pointer backdrop-blur-sm whitespace-nowrap">Edit Visibility Toggles</button>
         </div>
       )}
       
       {/* Profile Header */}
       <div className="bg-white rounded-[20px] p-[30px] shadow-sm border border-[#eee] mb-[20px] flex flex-col md:flex-row items-center md:items-start gap-[20px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-md shrink-0 bg-gray-100 flex items-center justify-center z-10">
            {profile.profile_picture ? <img src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${import.meta.env.VITE_API_URL}/images/${profile.profile_picture}`} className="w-full h-full object-cover" /> : <User size={50} className="text-gray-400" />}
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-[2.2rem] font-bold text-[#333] m-0 leading-tight font-['Nostalgia',_serif]">{profile.f_name} {profile.l_name}</h1>
            <p className="text-[#ff6600] font-bold text-[14px] m-0 mb-[10px] uppercase tracking-wider">@{profile.username || profile.f_name.toLowerCase()} • {profile.user_type}</p>
            {profile.bio && <p className="text-[#555] text-[15px] max-w-[600px] mb-[15px] leading-relaxed mx-auto md:mx-0">{profile.bio}</p>}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-[15px] text-[14px] text-[#666]">
              <div className="bg-[#f9f9f9] px-[15px] py-[8px] rounded-[10px] shadow-sm border border-[#eee]"><strong>{profile._count.followers}</strong> Followers</div>
              <div className="bg-[#f9f9f9] px-[15px] py-[8px] rounded-[10px] shadow-sm border border-[#eee]"><strong>{profile._count.following}</strong> Following</div>
              {profile.show_recipes && <div className="bg-[#f9f9f9] px-[15px] py-[8px] rounded-[10px] shadow-sm border border-[#eee]"><strong>{profile._count.recipes}</strong> Recipes</div>}
              <div className="bg-[#f9f9f9] px-[15px] py-[8px] rounded-[10px] shadow-sm border border-[#eee]"><strong>{profile._count.feed_posts}</strong> Posts</div>
            </div>
          </div>
          
          <div className="shrink-0 z-10 mt-[15px] md:mt-0">
            {isMe ? (
              <button onClick={() => navigate('/settings')} className="bg-white border border-[#ddd] text-[#333] px-[20px] py-[10px] rounded-xl font-bold hover:bg-[#f5f5f5] transition-colors shadow-sm cursor-pointer">Edit Profile</button>
            ) : (
              <button onClick={toggleFollow} className={`flex items-center gap-[6px] px-[24px] py-[12px] rounded-xl font-bold transition-all border-none cursor-pointer shadow-sm ${isFollowing ? 'bg-white border border-[#ddd] text-[#333] hover:bg-[#ffebee] hover:text-red-500 hover:border-red-200' : 'bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white hover:shadow-md hover:-translate-y-[1px]'}`}>
                {isFollowing ? <><UserCheck size={18}/> Following</> : <><UserPlus size={18}/> Follow</>}
              </button>
            )}
          </div>
       </div>

       {/* Public Stats */}
       {profile.show_stats && stats && (
         <div className="flex gap-[15px] mb-[20px]">
           <div className="flex-1 bg-gradient-to-br from-[#ffe6cc] to-[#ffcc99] p-[20px] rounded-[15px] text-center shadow-sm relative overflow-hidden">
             <Heart size={24} className="text-[#ff4081] mb-[5px] mx-auto relative z-10" />
             <div className="text-[1.8rem] font-bold text-[#5c4033] relative z-10">{stats.totalPostLikes}</div>
             <div className="text-[12px] uppercase tracking-wider text-[#8b4513] font-semibold relative z-10">Post Likes</div>
           </div>
           <div className="flex-1 bg-gradient-to-br from-[#e6f3ff] to-[#b3d9ff] p-[20px] rounded-[15px] text-center shadow-sm relative overflow-hidden">
             <Bookmark size={24} className="text-[#0066cc] mb-[5px] mx-auto relative z-10" />
             <div className="text-[1.8rem] font-bold text-[#004080] relative z-10">{stats.totalRecipeSaves}</div>
             <div className="text-[12px] uppercase tracking-wider text-[#0055b3] font-semibold relative z-10">Recipe Saves</div>
           </div>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
          {/* Recent Recipes */}
          {profile.show_recipes && recipes.length > 0 && (
            <div className="bg-white rounded-[20px] p-[20px] shadow-sm border border-[#eee]">
              <h3 className="font-bold text-[1.2rem] mb-[15px] flex items-center gap-[8px]"><Star className="text-[#ff6600]"/> Published Recipes</h3>
              <div className="grid grid-cols-2 gap-[15px]">
                {recipes.map(r => (
                  <div key={r.recipe_id} onClick={() => navigate(`/recipes/${r.recipe_id}`)} className="cursor-pointer group">
                    <img src={r.image_url?.startsWith('http') ? r.image_url : `${import.meta.env.VITE_API_URL}/images/${r.image_url}`} className="w-full h-[120px] object-cover rounded-[12px] shadow-sm group-hover:opacity-80 transition-opacity" />
                    <h4 className="m-0 mt-[8px] text-[14px] font-semibold text-[#333] truncate">{r.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Articles */}
          {profile.show_articles && articles.length > 0 && (
            <div className="bg-white rounded-[20px] p-[20px] shadow-sm border border-[#eee]">
              <h3 className="font-bold text-[1.2rem] mb-[15px] flex items-center gap-[8px]"><BookOpen className="text-[#8b4513]"/> Featured Articles</h3>
              <div className="flex flex-col gap-[10px]">
                {articles.map(a => (
                  <div key={a.article_id} onClick={() => alert('View from feed or homepage!')} className="flex gap-[12px] p-[12px] rounded-[12px] bg-[#f9f9f9] border border-[#eee] cursor-pointer hover:border-[#ffcc80] transition-colors">
                    <img src={a.image_url?.startsWith('http') ? a.image_url : `${import.meta.env.VITE_API_URL}/images/${a.image_url}`} className="w-[70px] h-[70px] object-cover rounded-[8px] shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="m-0 text-[14px] font-bold text-[#333] truncate mb-[4px]">{a.title}</h4>
                      <p className="m-0 text-[12px] text-[#ff6600] font-semibold">{a.category} • {a.read_time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
       </div>

       {/* Feed Posts */}
       <div className="mt-[30px]">
          <h3 className="font-bold text-[1.5rem] mb-[20px] flex items-center gap-[8px]"><Globe className="text-[#0066cc]"/> Public Posts</h3>
          <div className="flex flex-col gap-[20px]">
            {feed_posts.length === 0 ? (
              <div className="text-center p-[40px] bg-white rounded-[20px] border border-[#f0e0d0] text-[#888] shadow-sm">No public posts yet.</div>
            ) : (
              feed_posts.map(post => {
                const media = getPostMedia(post);
                return (
                <div key={post.post_id} className="bg-white rounded-[20px] p-[20px] shadow-sm border border-[#eee] hover:shadow-md transition-all">
                  <div className="flex items-center gap-[6px] text-[12px] text-[#888] mb-[10px] font-medium"><Clock size={12} /> {formatTimeAgo(post.createdAt)}</div>
                  <div className="text-[#444] leading-relaxed whitespace-pre-wrap mb-[15px] text-[15px]">{post.content}</div>
                  
                  {media.length > 0 && (
                    <div className="rounded-[12px] overflow-hidden bg-[#f9f9f9] mb-[15px] border border-[#eee] flex justify-center shadow-sm">
                      {media[0].type === 'video' ? <video src={media[0].url} controls className="max-w-full max-h-[300px]" /> : <img src={media[0].url} alt="Post media" className="max-w-full max-h-[300px] object-contain" />}
                    </div>
                  )}
                  
                  {post.recipe && (
                    <div className="border border-[#ffcc80] rounded-[12px] p-[12px] bg-[#fffaf5] flex gap-[15px] items-center cursor-pointer hover:bg-[#fff5f0] transition-colors shadow-sm" onClick={() => navigate(`/recipes/${post.recipe_id}`)}>
                      <img src={post.recipe.image_url?.startsWith('http') ? post.recipe.image_url : `${import.meta.env.VITE_API_URL}/images/${post.recipe.image_url}`} className="w-[50px] h-[50px] rounded-[8px] object-cover shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-bold text-[#333] text-[14px] m-0 mb-[2px]">{post.recipe.title}</h4>
                        <span className="text-[11px] text-[#ff6600] font-bold uppercase tracking-wider">View Recipe →</span>
                      </div>
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
       </div>
    </div>
  )
}
export default PublicProfile;