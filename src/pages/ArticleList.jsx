import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ArticleList = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('https://csdwindo.com/api/artikel/list.php?status=published');
                const json = await res.json();
                if (json.status && json.data) {
                    setArticles(json.data);
                    // Filter featured articles
                    const featured = json.data.filter(a => a.is_featured);
                    // If no featured, use top 3 latest as fallback
                    setFeaturedArticles(featured.length > 0 ? featured : json.data.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch articles:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // Auto slider logic
    useEffect(() => {
        if (featuredArticles.length <= 1 || isPaused) return;
        
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [featuredArticles.length, isPaused]);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E60012] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            {/* Featured Auto Slider */}
            {featuredArticles.length > 0 && (
                <div 
                    className="relative w-full h-[85vh] min-h-[500px] md:min-h-[600px] bg-[#111111] overflow-hidden mt-[64px] lg:mt-[72px]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <div className="absolute inset-0 bg-black/50 z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/50 to-transparent z-10" />
                            <img 
                                src={featuredArticles[currentSlide].image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600'} 
                                alt={featuredArticles[currentSlide].title}
                                className="w-full h-full object-cover"
                            />
                            
                            <div className="absolute inset-0 w-full p-6 md:p-12 lg:p-16 pb-16 md:pb-24 z-20 flex flex-col justify-end pt-20 md:pt-32">
                                <div className="max-w-[1400px] mx-auto w-full px-2 sm:px-6 lg:px-12">
                                    <div className="max-w-4xl">
                                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                            <span className="bg-[#E60012] text-white px-2 py-1 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                Featured
                                            </span>
                                            <span className="bg-white/20 backdrop-blur text-white px-2 py-1 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                                {featuredArticles[currentSlide].category}
                                            </span>
                                        </div>
                                        <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 md:mb-4 leading-snug md:leading-tight line-clamp-3 md:line-clamp-4">
                                            {featuredArticles[currentSlide].title}
                                        </h1>
                                        <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 max-w-2xl">
                                            {featuredArticles[currentSlide].subtitle}
                                        </p>
                                        <button 
                                            onClick={() => navigate(`/artikel/${featuredArticles[currentSlide].slug || featuredArticles[currentSlide].id}`)}
                                            className="px-6 py-3 md:px-8 md:py-4 bg-[#E60012] text-white text-sm md:text-base font-bold rounded hover:bg-red-700 transition-colors flex items-center gap-2 w-fit"
                                        >
                                            Baca Artikel <ArrowRight size={16} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slider Controls */}
                    {featuredArticles.length > 1 && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-2 md:px-12 z-30 pointer-events-none">
                            <button 
                                onClick={prevSlide}
                                className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-[#E60012] border border-white/20 backdrop-blur text-white flex items-center justify-center transition-all"
                            >
                                <ChevronLeft size={20} className="md:w-6 md:h-6" />
                            </button>
                            <button 
                                onClick={nextSlide}
                                className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-[#E60012] border border-white/20 backdrop-blur text-white flex items-center justify-center transition-all"
                            >
                                <ChevronRight size={20} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    )}
                    
                    {/* Slider Indicators */}
                    {featuredArticles.length > 1 && (
                        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                            {featuredArticles.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 md:w-8 bg-[#E60012]' : 'w-3 md:w-4 bg-white/50 hover:bg-white/80'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Articles Grid */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className="mb-12">
                    <h2 className="font-display font-extrabold text-[36px] md:text-[42px] text-[#111111] uppercase leading-tight border-l-4 border-[#E60012] pl-6">
                        Kabar Terbaru
                    </h2>
                    <p className="text-gray-600 mt-4 text-lg ml-6 max-w-2xl">
                        Kumpulan artikel, berita terbaru, dan informasi menarik seputar Mitsubishi dan layanan dari Dwindo Bintaro.
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Belum ada artikel yang diterbitkan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <div 
                                key={article.id} 
                                onClick={() => navigate(`/artikel/${article.slug || article.id}`)}
                                className="article-card group drop-shadow-sm hover:drop-shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
                            >
                                <div className="bg-white flex flex-col flex-1 relative overflow-hidden" style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <img 
                                            src={article.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800'} 
                                            alt={article.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-5 left-5 z-20">
                                            <div 
                                                className="bg-white/95 backdrop-blur text-[#111111] font-display font-bold text-xs uppercase tracking-wider py-2 px-4 inline-block" 
                                                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                            >
                                                {article.category}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 lg:p-8 flex flex-col flex-1 border-t-0 border-gray-100/50">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {article.read_time || '3 min read'}
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-display font-bold text-xl lg:text-2xl text-[#111111] leading-snug mb-3 group-hover:text-[#E60012] transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 line-clamp-3 mb-6 flex-1">
                                            {article.subtitle}
                                        </p>
                                        
                                        <div className="mt-auto flex items-center font-display font-bold text-sm uppercase tracking-wide text-[#111111] group-hover:text-[#E60012] transition-colors">
                                            Baca Selengkapnya
                                            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleList;
