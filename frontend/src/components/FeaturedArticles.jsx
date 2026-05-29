import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: "The Secret to Perfect Homemade Pasta",
    category: "Technique",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=400&fit=crop",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "10 Essential Spices Every Kitchen Needs",
    category: "Guide",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=400&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Mastering the Art of Sourdough Bread",
    category: "Baking",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop",
    readTime: "12 min read"
  }
];

const FeaturedArticles = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % articles.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-[40px] px-[20px] relative group">
      <div className="overflow-hidden rounded-[20px] relative h-[350px] md:h-[250px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] bg-[#333]">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            onClick={() => alert('Article viewing coming soon!')}
          >
            <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-[40px] md:p-[20px]">
              <span className="text-[#ff6600] font-bold text-[14px] uppercase tracking-wider mb-[8px]">{article.category} • {article.readTime}</span>
              <h2 className="text-white text-[2.5rem] md:text-[1.8rem] font-bold leading-tight max-w-[800px] font-['Nostalgia',_serif] m-0 drop-shadow-md">{article.title}</h2>
            </div>
          </div>
        ))}
      </div>
      <button className="absolute left-[35px] top-1/2 -translate-y-1/2 w-[45px] h-[45px] rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 z-20 cursor-pointer shadow-md" onClick={prevSlide}><ChevronLeft size={28} /></button>
      <button className="absolute right-[35px] top-1/2 -translate-y-1/2 w-[45px] h-[45px] rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 z-20 cursor-pointer shadow-md" onClick={nextSlide}><ChevronRight size={28} /></button>
      <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 flex gap-[8px] z-20">{articles.map((_, idx) => (<button key={idx} className={`w-[10px] h-[10px] rounded-full border-none cursor-pointer transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-[#ff6600] w-[30px]' : 'bg-white/60 hover:bg-white'}`} onClick={() => setCurrentIndex(idx)} />))}</div>
    </div>
  );
};

export default FeaturedArticles;