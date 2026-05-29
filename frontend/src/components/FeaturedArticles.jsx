import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const defaultArticles = [
  {
    article_id: 'default_1',
    title: "The Secret to Perfect Homemade Pasta",
    category: "Technique",
    image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=400&fit=crop",
    read_time: "5 min read",
    author: { f_name: "Spice", l_name: "Vault" },
    content: "Making pasta from scratch is one of the most rewarding culinary experiences. All you need is flour, eggs, and a little bit of patience. The key is in the kneading process, which develops the gluten and gives the pasta its signature chew.\n\nStart by creating a mound of flour on your work surface and making a well in the center. Crack your eggs into the well and slowly incorporate the flour from the edges. Once a dough forms, knead it for about 10 minutes until smooth and elastic. Let it rest for 30 minutes before rolling it out."
  },
  {
    article_id: 'default_2',
    title: "10 Essential Spices Every Kitchen Needs",
    category: "Guide",
    image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=400&fit=crop",
    read_time: "8 min read",
    author: { f_name: "Spice", l_name: "Vault" },
    content: "Spices are the soul of any dish. Building a solid spice rack is the first step to elevating your home cooking. Here are the top 10 essential spices you should always have on hand:\n\n1. Black Peppercorns\n2. Cumin\n3. Coriander\n4. Cinnamon\n5. Paprika\n6. Turmeric\n7. Garlic Powder\n8. Chili Flakes\n9. Oregano\n10. Cardamom\n\nFreshly toasting and grinding whole spices will yield the most vibrant flavors!"
  },
  {
    article_id: 'default_3',
    title: "Mastering the Art of Sourdough Bread",
    category: "Baking",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop",
    read_time: "12 min read",
    author: { f_name: "Spice", l_name: "Vault" },
    content: "Sourdough baking is equal parts science and art. It relies on a wild yeast starter instead of commercial yeast, giving the bread its complex, tangy flavor and incredibly chewy crumb.\n\nThe most important ingredient in sourdough is time. A long, cold fermentation in the refrigerator not only develops deep flavors but also makes the dough easier to score and bake.\n\nRemember: Don't rush the bulk fermentation. Watch the dough, not the clock!"
  }
];

const FeaturedArticles = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [articles, setArticles] = useState(defaultArticles);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/social/articles/featured?limit=5`);
        const data = await res.json();
        if (data.success && data.articles.length > 0) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [articles.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % articles.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);

  return (
    <div className="w-full max-w-[1400px] mx-auto mb-[40px] px-[20px] relative group">
      <div className="overflow-hidden rounded-[20px] relative h-[600px] md:h-[430px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] bg-[#333]">
        {articles.map((article, index) => (
          <div
            key={article.article_id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            onClick={() => setSelectedArticle(article)}
          >
            <img src={article.image_url?.startsWith('http') ? article.image_url : `${import.meta.env.VITE_API_URL}/images/${article.image_url}`} alt={article.title} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-[40px] md:p-[20px]">
              <span className="text-[#ff6600] font-bold text-[14px] uppercase tracking-wider mb-[8px]">{article.category} • {article.read_time} • By {article.author?.f_name}</span>
              <h2 className="text-white text-[2.5rem] md:text-[1.8rem] font-bold leading-tight max-w-[800px] font-['Nostalgia',_serif] m-0 drop-shadow-md">{article.title}</h2>
            </div>
          </div>
        ))}
      </div>
      
      {articles.length > 1 && (
        <>
          <button className="absolute left-[35px] top-1/2 -translate-y-1/2 w-[45px] h-[45px] rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 z-20 cursor-pointer shadow-md" onClick={prevSlide}><ChevronLeft size={28} /></button>
          <button className="absolute right-[35px] top-1/2 -translate-y-1/2 w-[45px] h-[45px] rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 z-20 cursor-pointer shadow-md" onClick={nextSlide}><ChevronRight size={28} /></button>
          <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 flex gap-[8px] z-20">{articles.map((_, idx) => (<button key={idx} className={`w-[10px] h-[10px] rounded-full border-none cursor-pointer transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-[#ff6600] w-[30px]' : 'bg-white/60 hover:bg-white'}`} onClick={() => setCurrentIndex(idx)} />))}</div>
        </>
      )}

      {/* Article Viewing Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[4000] flex items-center justify-center p-[15px] sm:p-[20px] md:p-[40px] opacity-100 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[20px] w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button 
              className="absolute top-[15px] right-[15px] w-[35px] h-[35px] bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-20 cursor-pointer border-none"
              onClick={(e) => { e.stopPropagation(); setSelectedArticle(null); }}
            >
              <X size={20} />
            </button>
            
            <div className="w-full h-[200px] md:h-[300px] shrink-0 relative">
              <img src={selectedArticle.image_url?.startsWith('http') ? selectedArticle.image_url : `${import.meta.env.VITE_API_URL}/images/${selectedArticle.image_url}`} alt={selectedArticle.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-[20px] md:p-[30px]">
                <span className="text-[#ff6600] font-bold text-[12px] md:text-[14px] uppercase tracking-wider mb-[5px] md:mb-[8px]">{selectedArticle.category} • {selectedArticle.read_time}</span>
                <h2 className="text-white text-[1.5rem] md:text-[2.2rem] font-bold leading-tight font-['Nostalgia',_serif] m-0 drop-shadow-md">{selectedArticle.title}</h2>
              </div>
            </div>
            
            <div className="p-[20px] md:p-[40px] overflow-y-auto bg-[#fafafa]">
              <div className="flex items-center gap-[12px] mb-[25px] pb-[20px] border-b border-[#eee]">
                <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-[#ff6600] to-[#ffcc80] flex items-center justify-center text-white font-bold text-[18px] shadow-sm overflow-hidden">
                  {selectedArticle.author?.profile_picture ? (
                    <img src={selectedArticle.author.profile_picture.startsWith('http') ? selectedArticle.author.profile_picture : `${import.meta.env.VITE_API_URL}/images/${selectedArticle.author.profile_picture}`} alt={selectedArticle.author.f_name} className="w-full h-full object-cover" />
                  ) : (
                    selectedArticle.author?.f_name?.[0] || 'S'
                  )}
                </div>
                <div>
                  <p className="m-0 font-bold text-[#333] text-[15px] md:text-[16px]">By {selectedArticle.author?.f_name} {selectedArticle.author?.l_name}</p>
                  <p className="m-0 text-[#888] text-[12px] md:text-[13px]">{new Date(selectedArticle.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="text-[#444] text-[15px] md:text-[16px] leading-[1.8] whitespace-pre-wrap font-['Poppins',_sans-serif]">
                {selectedArticle.content || "Content coming soon..."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedArticles;