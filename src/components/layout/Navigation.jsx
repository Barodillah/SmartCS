import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AngularButton from '../ui/AngularButton';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-[#111111]/95 backdrop-blur-md py-1' : 'bg-[#111111] py-2'} border-b border-white/5`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-4 group">
                    <img src="/logo/mitsubishi-motors/logo_text_white.png" alt="Mitsubishi Motors" className="h-12 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105" />
                    <div className="hidden md:flex items-center border-l border-white/20 pl-5 h-10">
                        <span className="block font-display font-bold text-[#E60012] text-[14px] md:text-[16px] tracking-[0.2em] uppercase">Dwindo Bintaro</span>
                    </div>
                </Link>

                {/* Links */}
                <div className="hidden lg:flex items-center gap-10">
                    <Link to="/" className="font-display font-semibold text-[11px] text-gray-400 hover:text-white tracking-[0.15em] uppercase transition-colors">
                        Home
                    </Link>
                    <Link to="/price-list" className="font-display font-semibold text-[11px] text-gray-400 hover:text-white tracking-[0.15em] uppercase transition-colors">
                        Price List
                    </Link>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link to="/lokasi-dealer" className="hidden sm:block font-display font-bold text-[11px] text-white border-b-2 border-[#E60012] pb-1 tracking-widest uppercase hover:text-[#E60012] transition-colors">
                        Cari Dealer
                    </Link>
                    <AngularButton 
                        variant="primary" 
                        className="!px-6 !py-2.5 !text-[10px]"
                        onClick={() => window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: 'Saya ingin melakukan Test Drive' } }))}
                    >
                        Test Drive
                    </AngularButton>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
