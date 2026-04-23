import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import SectionTag from '../ui/SectionTag';

gsap.registerPlugin(ScrollTrigger);

const ARTICLES = [
    {
        id: 1,
        category: 'Berita',
        title: 'Peluncuran Model Terbaru Mitsubishi: Inovasi Tanpa Batas',
        date: '23 April 2026',
        readTime: '3 min read',
        image: '/images/updates/news.png',
        excerpt: 'Temukan fitur-fitur mutakhir dan desain revolusioner dari lini kendaraan terbaru kami yang dirancang khusus untuk kenyamanan dan keamanan keluarga Anda.',
    },
    {
        id: 2,
        category: 'Kegiatan',
        title: 'Gathering Komunitas Mitsubishi Bintaro 2026',
        date: '15 April 2026',
        readTime: '5 min read',
        image: '/images/updates/activity.png',
        excerpt: 'Kemeriahan acara kumpul bareng ratusan pemilik kendaraan Mitsubishi di Bintaro. Berbagi pengalaman, tips perawatan, hingga sesi test drive eksklusif.',
    },
    {
        id: 3,
        category: 'Insight',
        title: 'Pentingnya Perawatan Berkala di Bengkel Resmi',
        date: '10 April 2026',
        readTime: '4 min read',
        image: '/images/updates/insight.png',
        excerpt: 'Ketahui mengapa servis rutin dengan suku cadang asli di dealer resmi dapat memperpanjang umur kendaraan Anda dan menjaga performa selalu optimal.',
    }
];

const Updates = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.update-header', 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    }
                }
            );

            gsap.fromTo('.article-card',
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.articles-grid',
                        start: 'top 85%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="updates" className="relative w-full py-20 lg:py-28 bg-[#F8F9FA] border-y border-gray-100 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="update-header flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
                    <div className="max-w-2xl">
                        <SectionTag>Updates</SectionTag>
                        <h2 className="font-display font-extrabold text-[36px] sm:text-[42px] lg:text-[48px] text-[#111111] uppercase leading-tight mt-4">
                            Kabar Terbaru
                        </h2>
                        <p className="text-gray-600 mt-4 text-lg">
                            Dapatkan informasi terkini seputar berita, kegiatan komunitas, dan tips bermanfaat dari Dwindo Bintaro.
                        </p>
                    </div>
                    <button className="mt-6 md:mt-0 flex items-center gap-2 font-display font-bold text-[#E60012] uppercase tracking-wide group hover:text-[#111111] transition-colors">
                        Lihat Semua 
                        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ARTICLES.map((article) => (
                        <div key={article.id} className="article-card group drop-shadow-sm hover:drop-shadow-xl transition-all duration-500 cursor-pointer flex flex-col">
                            <div className="bg-white flex flex-col flex-1 relative overflow-hidden" style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                    <img 
                                        src={article.image} 
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
                                            {article.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {article.readTime}
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-display font-bold text-xl lg:text-2xl text-[#111111] leading-snug mb-3 group-hover:text-[#E60012] transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 line-clamp-3 mb-6 flex-1">
                                        {article.excerpt}
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
            </div>
        </section>
    );
};

export default Updates;
