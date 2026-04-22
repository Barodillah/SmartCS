import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Calendar,
    Settings,
    Tag,
    ChevronRight,
    Menu,
    X,
    MapPin,
    Phone,
    Instagram,
    Facebook,
    ArrowRight,
    User,
    Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DESIGN TOKENS & UTILS ---
const COLORS = {
    brandRed: '#E60012',
    brandRedDark: '#B5000F',
    dark: '#111111',
    dark2: '#1A1A1A',
    gray700: '#444444',
    gray500: '#777777',
    gray100: '#E5E5E5',
    white: '#FFFFFF'
};

const ANGULAR_CLIP = "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";

const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
};

// --- COMPONENTS ---

const AngularButton = ({ children, variant = 'primary', className = '', onClick }) => {
    const styles = {
        primary: `bg-[#E60012] text-white hover:bg-[#B5000F]`,
        secondary: `bg-transparent border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white`,
        white: `bg-white text-[#111111] hover:bg-[#E5E5E5]`,
    };

    return (
        <button
            onClick={onClick}
            style={{ clipPath: ANGULAR_CLIP }}
            className={`relative px-8 py-3 font-display font-bold uppercase tracking-[0.2em] text-[12px] transition-all duration-300 ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const SectionTag = ({ children }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-[1px] bg-[#E60012]"></div>
        <span className="font-display font-bold text-[10px] tracking-[0.3em] text-[#E60012] uppercase">
            {children}
        </span>
    </div>
);

// --- VIRTUAL CS AI COMPONENT ---
const VirtualCS = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Halo! Selamat datang di Mitsubishi Dwindo Bintaro Virtual Hub. Saya asisten digital Anda.' },
        { id: 2, type: 'bot', text: 'Ada yang bisa saya bantu untuk Drive your Ambition hari ini?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simulated AI Logic
        setTimeout(() => {
            let botResponse = "";
            const input = text.toLowerCase();

            if (input.includes('service') || input.includes('booking')) {
                botResponse = "Tentu! Untuk Booking Service, mohon informasikan Nama, Model Mobil, dan No. Polisi Anda. Teknisi kami akan segera menjadwalkan kunjungan Anda.";
            } else if (input.includes('promo')) {
                botResponse = "Saat ini kami memiliki promo spesial 55th Anniversary! Dapatkan bunga 0% dan gratis asuransi untuk unit Xpander & Xforce. Apakah Anda ingin simulasi kredit?";
            } else if (input.includes('harga') || input.includes('xforce')) {
                botResponse = "Mitsubishi Xforce tersedia mulai dari Rp 381.900.000. Desain futuristik dan fitur driving mode siap menemani petualangan Anda.";
            } else {
                botResponse = "Terima kasih informasinya. Saya akan meneruskan pesan Anda ke tim spesialis kami di Dwindo Bintaro. Ada lagi yang bisa saya bantu?";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white shadow-2xl w-[350px] md:w-[400px] h-[500px] flex flex-col mb-4 overflow-hidden"
                        style={{ border: '1px solid #E5E5E5' }}
                    >
                        {/* Header */}
                        <div className="bg-[#111111] p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                                    <MessageSquare size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-[14px] tracking-widest uppercase">Virtual CS Hub</h3>
                                    <p className="text-[10px] text-gray-400">Dwindo Bintaro • Online</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#E60012]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F5]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] p-3 text-[13px] leading-relaxed ${msg.type === 'user'
                                                ? 'bg-[#111111] text-white'
                                                : 'bg-white text-[#444444] border border-[#E5E5E5]'
                                            }`}
                                        style={{ borderRadius: msg.type === 'user' ? '12px 12px 0 12px' : '0 12px 12px 12px' }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 flex gap-2 overflow-x-auto bg-white border-t border-[#E5E5E5]">
                            {['Booking Service', 'Promo Terbaru', 'Lokasi Dealer'].map(action => (
                                <button
                                    key={action}
                                    onClick={() => handleSend(action)}
                                    className="whitespace-nowrap px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-display font-bold uppercase tracking-wider text-[#444444] hover:border-[#E60012] hover:text-[#E60012] transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-[#E5E5E5] flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik pesan Anda..."
                                className="flex-1 bg-transparent text-[13px] outline-none focus:border-[#E60012] transition-colors"
                            />
                            <button onClick={() => handleSend()} className="text-[#E60012] hover:text-[#B5000F]">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#E60012] shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
                style={{ clipPath: ANGULAR_CLIP }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

// --- MAIN APP ---
export default function App() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const models = [
        { name: "Destinator", price: 397000000, img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", badge: "NEW" },
        { name: "Xforce", price: 391900000, img: "https://images.unsplash.com/photo-1606148332571-08f368021008?auto=format&fit=crop&q=80&w=800", badge: "POPULAR" },
        { name: "Xpander Cross", price: 345600000, img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", badge: "PROMO" }
    ];

    return (
        <div className="min-h-screen bg-white font-body text-[#444444] selection:bg-[#E60012] selection:text-white">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
        
        .font-display { font-family: 'Barlow Condensed', sans-serif; }
        .font-body { font-family: 'Barlow', sans-serif; }
      `}</style>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-[#111111]/95 backdrop-blur-md py-3' : 'bg-[#111111] py-4'} border-b border-white/5`}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                    {/* Logo Placeholder */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-6 h-6 bg-[#E60012]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></div>
                            ))}
                        </div>
                        <div className="hidden md:block ml-2">
                            <span className="block font-display font-black text-white text-[16px] leading-tight tracking-tighter">MITSUBISHI MOTORS</span>
                            <span className="block font-display font-bold text-[#E60012] text-[10px] tracking-[0.2em] uppercase">Dwindo Bintaro</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="hidden lg:flex items-center gap-10">
                        {['Model', 'Purna Jual', 'Kepemilikan', 'Promosi'].map(link => (
                            <a key={link} href="#" className="font-display font-semibold text-[11px] text-gray-400 hover:text-white tracking-[0.15em] uppercase transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block font-display font-bold text-[11px] text-white border-b-2 border-[#E60012] pb-1 tracking-widest uppercase hover:text-[#E60012] transition-colors">
                            Cari Dealer
                        </button>
                        <AngularButton variant="primary" className="!px-6 !py-2.5 !text-[10px]">
                            Test Drive
                        </AngularButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen min-h-[700px] bg-[#111111] overflow-hidden">
                {/* Background Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000"
                        alt="Mitsubishi Hero"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-[1400px] mx-auto h-full flex items-center px-6 lg:px-12">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-[2px] bg-[#E60012]"></div>
                                <span className="font-display font-bold text-[#E60012] tracking-[0.3em] uppercase text-[12px]">New Generation</span>
                            </div>
                            <h1 className="font-display font-black text-white text-[clamp(48px,8vw,90px)] leading-[0.9] uppercase mb-8 italic">
                                Drive your <br />
                                <span className="text-[#E60012]">Ambition</span>
                            </h1>
                            <p className="text-gray-300 font-light text-lg mb-10 max-w-lg leading-relaxed">
                                Jelajahi kenyamanan dan ketangguhan tanpa batas bersama Mitsubishi Dwindo Bintaro. Solusi mobilitas masa depan ada di tangan Anda.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <AngularButton variant="primary">Jelajahi Unit</AngularButton>
                                <AngularButton variant="white">Promo Spesial</AngularButton>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-[#E60012] to-transparent"></div>
                </div>
            </section>

            {/* Services Grid Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
                        <div>
                            <SectionTag>Layanan Kami</SectionTag>
                            <h2 className="font-display font-extrabold text-[40px] text-[#111111] uppercase leading-tight">Akses Cepat <br />Dwindo Bintaro</h2>
                        </div>
                        <p className="max-w-md text-gray-500 font-light">
                            Nikmati kemudahan layanan purna jual dan konsultasi pembelian melalui integrasi digital kami yang responsif.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Calendar, title: "Booking Service", desc: "Atur jadwal perawatan rutin kendaraan Anda tanpa antre." },
                            { icon: Settings, title: "Sparepart", desc: "Cek ketersediaan suku cadang asli Mitsubishi Motors." },
                            { icon: Tag, title: "Promo", desc: "Informasi program penjualan dan cicilan paling update." },
                            { icon: Phone, title: "Emergensi", desc: "Layanan bantuan 24 jam untuk kendala di perjalanan." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-8 border border-gray-100 bg-white hover:border-[#E60012] transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-[#F5F5F5] flex items-center justify-center mb-6 group-hover:bg-[#E60012] transition-colors" style={{ clipPath: ANGULAR_CLIP }}>
                                    <item.icon size={20} className="text-[#111111] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-display font-bold text-xl uppercase mb-3 text-[#111111] tracking-wide">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6 italic">"{item.desc}"</p>
                                <button className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-[#E60012] group-hover:gap-4 transition-all">
                                    Selengkapnya <ChevronRight size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Models */}
            <section className="py-24 px-6 bg-[#F5F5F5]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block">
                            <SectionTag>Lini Kendaraan</SectionTag>
                        </div>
                        <h2 className="font-display font-extrabold text-[40px] text-[#111111] uppercase">Pilihan Terbaik Untuk Anda</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {models.map((model, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="bg-white group"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img src={model.img} alt={model.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#E60012] text-white font-display font-bold text-[9px] tracking-widest uppercase px-3 py-1" style={{ clipPath: ANGULAR_CLIP }}>
                                            {model.badge}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-display font-black text-2xl uppercase text-[#111111] mb-2">{model.name}</h3>
                                    <div className="text-gray-400 text-xs mb-6 font-medium">Mulai Dari</div>
                                    <div className="font-display font-bold text-xl text-[#E60012] mb-8">
                                        {formatCurrency(model.price)}
                                    </div>
                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <button className="text-[10px] font-display font-bold uppercase tracking-widest text-[#111111] hover:text-[#E60012]">
                                            Lihat Detail
                                        </button>
                                        <AngularButton variant="primary" className="!px-4 !py-2 !text-[9px]">Pesan Sekarang</AngularButton>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Virtual CS Hub Section - Embedded Style */}
            <section className="py-24 px-6 bg-[#111111] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                    <div className="w-full h-full bg-[#E60012]" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
                </div>

                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16 relative z-10">
                    <div>
                        <SectionTag>Layanan Cerdas</SectionTag>
                        <h2 className="font-display font-black text-[48px] text-white uppercase leading-[1] mb-6 italic">
                            Virtual CS Hub <br />
                            <span className="text-[#E60012]">Dwindo Bintaro</span>
                        </h2>
                        <p className="text-gray-400 font-light text-lg mb-10 leading-relaxed">
                            Teknologi AI kami siap membantu Anda kapan saja. Mulai dari konsultasi unit, ketersediaan suku cadang, hingga penjadwalan servis dalam genggaman Anda.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {['Respon instan 24/7', 'Integrasi booking langsung', 'Informasi promo terupdate'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-white/80 font-display font-bold uppercase text-[12px] tracking-widest">
                                    <div className="w-4 h-4 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <AngularButton variant="white" onClick={() => document.getElementById('chat-trigger')?.click()}>Mulai Percakapan</AngularButton>
                    </div>
                    <div className="bg-white/5 p-8 backdrop-blur-sm border border-white/10" style={{ clipPath: ANGULAR_CLIP }}>
                        <div className="aspect-square max-w-[400px] mx-auto bg-gradient-to-br from-[#E60012]/20 to-transparent flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 bg-[#E60012] mb-6 animate-pulse" style={{ clipPath: ANGULAR_CLIP }}></div>
                            <h4 className="font-display font-bold text-white text-xl uppercase tracking-widest mb-4">AI Assistant Aktif</h4>
                            <p className="text-gray-400 text-sm">Gunakan widget chat di pojok kanan bawah untuk berinteraksi dengan asisten virtual kami.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantage Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2">
                        <div className="relative aspect-video">
                            <img src="https://images.unsplash.com/photo-1562519819-016930ada31b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E60012] hidden lg:flex items-center justify-center p-6 text-center" style={{ clipPath: ANGULAR_CLIP }}>
                                <span className="font-display font-black text-white text-[12px] uppercase leading-none tracking-widest">Terpercaya di Bintaro</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <SectionTag>Keunggulan</SectionTag>
                        <h2 className="font-display font-extrabold text-[36px] text-[#111111] uppercase mb-6">Mengapa Dwindo Bintaro?</h2>
                        <div className="space-y-8">
                            {[
                                { t: "Fasilitas Modern", d: "Showroom dan bengkel dengan standar global Mitsubishi Motors." },
                                { t: "Teknisi Tersertifikasi", d: "Tim ahli yang dilatih khusus untuk merawat kendaraan Mitsubishi Anda." },
                                { t: "Lokasi Strategis", d: "Terletak di jantung Bintaro untuk akses yang lebih mudah dan cepat." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="font-display font-black text-4xl text-[#E60012]/10 leading-none">0{i + 1}</div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg uppercase text-[#111111] mb-1">{item.t}</h4>
                                        <p className="text-sm text-gray-500">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#111111] pt-20 pb-10 px-6 border-t border-white/5">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-5 h-5 bg-[#E60012]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></div>
                                    ))}
                                </div>
                                <span className="font-display font-black text-white text-[14px] leading-tight tracking-tighter uppercase">Dwindo Bintaro</span>
                            </div>
                            <p className="text-gray-500 text-sm font-light leading-relaxed mb-6 italic">
                                Authorized Dealer Mitsubishi Motors yang melayani dengan dedikasi tinggi di area Bintaro dan sekitarnya.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Facebook, MapPin].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E60012] hover:text-white transition-all" style={{ clipPath: ANGULAR_CLIP }}>
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">Quick Links</h4>
                            <ul className="space-y-4">
                                {['Cari Dealer', 'Unduh Brosur', 'Test Drive', 'Simulasi Kredit'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">Layanan</h4>
                            <ul className="space-y-4">
                                {['Booking Service', 'Sparepart Asli', 'Warranty', 'Promo Servis'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">Hubungi Kami</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-[#E60012] mt-0.5" />
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7, Tangerang Selatan.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-[#E60012]" />
                                    <p className="text-gray-500 text-xs">(021) 745-XXXX</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] text-gray-600 font-display font-bold uppercase tracking-widest">
                            &copy; 2026 PT Mitsubishi Motors Krama Yudha Sales Indonesia. All Rights Reserved.
                        </p>
                        <div className="font-display font-black text-white text-[18px] italic tracking-tighter opacity-20">
                            DRIVE YOUR AMBITION
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Elements */}
            <VirtualCS id="chat-trigger" />
        </div>
    );
}