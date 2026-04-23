import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AngularButton from '../ui/AngularButton';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Price List', path: '/price-list' },
        { name: 'Chat History', path: '/chat-history' }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-[#111111]/95 backdrop-blur-md py-2' : 'bg-[#111111] py-4'} border-b border-white/5`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="flex items-center gap-4 border-r border-white/10 pr-4 mr-0">
                        <img src="/logo/mitsubishi-motors/logo_text_white.png" alt="Mitsubishi Motors" className="h-8 md:h-10 object-contain transition-transform duration-300 group-hover:scale-105" />
                        <img src="/logo/mitsubishi-fuso/logo_white.png" alt="Mitsubishi Fuso" className="h-8 md:h-10 object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="hidden lg:flex items-center pl-0 h-8">
                        <span className="block font-display font-bold text-[#E60012] text-[24px] md:text-[24px] tracking-[0.2em] uppercase leading-none">CS Dwindo</span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.name}
                                to={link.path} 
                                className={`relative font-display font-semibold text-[11px] tracking-[0.15em] uppercase transition-colors py-2 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {link.name}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E60012] shadow-[0_0_8px_rgba(230,0,18,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA and Mobile Menu Toggle */}
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
                    <button 
                        className="lg:hidden flex items-center justify-center text-white ml-2 transition-transform duration-300" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#111111]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[400px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
                <div className="flex flex-col px-6 gap-6">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.name}
                                to={link.path} 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`font-display font-semibold text-[12px] tracking-[0.15em] uppercase transition-all duration-300 ${isActive ? 'text-[#E60012]' : 'text-gray-400 hover:text-white'}`}
                            >
                                <span className={isActive ? 'border-b border-[#E60012] pb-1 inline-block' : 'inline-block pb-1'}>
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}
                    <Link 
                        to="/lokasi-dealer" 
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-display font-semibold text-[12px] tracking-[0.15em] uppercase transition-all duration-300 ${location.pathname === '/lokasi-dealer' ? 'text-[#E60012]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <span className={location.pathname === '/lokasi-dealer' ? 'border-b border-[#E60012] pb-1 inline-block' : 'inline-block pb-1'}>
                            Cari Dealer
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
