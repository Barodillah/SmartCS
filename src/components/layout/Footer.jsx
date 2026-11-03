import React, { useState } from 'react';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimulasiKreditModal from '../SimulasiKreditModal';
import dealerData from '../../../knowledge/lokasi_dealer.json';
import { ANGULAR_CLIP } from '../../utils/constants';
import { trackConversion } from '../../utils/analytics';

const Instagram = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const Youtube = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);

const Footer = () => {
    const [isSimulasiOpen, setIsSimulasiOpen] = useState(false);
    const mainBranch = dealerData?.branches?.[0] || {
        name: 'Dwindo Bintaro',
        address: 'Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7 (Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren), Kota Tangerang Selatan, Banten 15220',
        phone: '021-7458383'
    };

    const handleTestDriveClick = (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: 'Saya ingin melakukan Test Drive' } }));
    };

    const handleLayananChat = (e, item) => {
        e.preventDefault();
        let message = '';
        switch (item) {
            case 'Sparepart Asli':
                message = 'Saya ingin menanyakan ketersediaan sparepart asli Mitsubishi';
                break;
            case 'Warranty':
                message = 'Saya ingin bertanya mengenai informasi garansi (warranty) kendaraan';
                break;
            case 'Promo Servis':
                message = 'Saya ingin tahu promo servis yang sedang berlangsung';
                break;
            default:
                message = `Saya ingin bertanya mengenai ${item}`;
        }
        window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message } }));
    };

    return (
        <>
            <footer className="bg-[#111111] pt-20 pb-10 px-6 border-t border-white/5">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-8">
                                <img
                                    src="/logo/logo_dwindo_white.png"
                                    alt="Logo PT Dwindo Berlian Samjaya"
                                    width="120"
                                    height="28"
                                    loading="lazy"
                                    className="h-6 md:h-7 w-auto object-contain"
                                />
                                <div className="border-l border-white/20 pl-3">
                                    <span className="block font-display font-bold text-white text-[10px] tracking-[0.2em] uppercase">
                                        {dealerData?.dealer || 'PT Dwindo Berlian Samjaya'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                                Authorized Dealer 3S (Sales, Service, Sparepart) Mitsubishi Motors &amp; Mitsubishi Fuso yang melayani area Bintaro, Radin Inten, dan Cakung.
                            </p>
                            <div className="flex gap-4">
                                {[
                                    { Icon: Instagram, link: 'https://www.instagram.com/dwindoberliansamjaya/', label: 'Instagram Resmi PT Dwindo Berlian Samjaya' },
                                    { Icon: Youtube, link: 'https://www.youtube.com/@dwindoberliansamjaya635', label: 'YouTube Resmi PT Dwindo Berlian Samjaya' }
                                ].map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={item.label}
                                        className="w-10 h-10 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E60012] hover:text-white transition-all"
                                        style={{ clipPath: ANGULAR_CLIP }}
                                    >
                                        <item.Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">
                                Navigasi &amp; Katalog
                            </h2>
                            <ul className="space-y-4">
                                <li>
                                    <Link to="/price-list" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Daftar Harga (Price List)
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/aksesoris" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Aksesoris Resmi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/lokasi-dealer" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Lokasi Cabang Dealer
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/artikel" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Berita &amp; Promo Otomotif
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">
                                Layanan &amp; Kepercayaan
                            </h2>
                            <ul className="space-y-4">
                                <li>
                                    <Link to="/booking" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Booking Service Online
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/faq" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Pusat Bantuan (FAQ)
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/kanal-resmi" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-[#E60012]" />Tentang Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chat-history" className="text-gray-400 text-xs uppercase font-display font-semibold hover:text-white transition-colors">
                                        Riwayat Chat DINA
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">
                                Hubungi Kami (NAP Resmi)
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-[#E60012] mt-0.5 shrink-0" />
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        <strong className="text-white block mb-0.5">{mainBranch.name}:</strong>
                                        {mainBranch.address}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-[#E60012] shrink-0" />
                                    <a
                                        href={`tel:${mainBranch.phone.replace(/[^0-9+]/g, '')}`}
                                        onClick={() => trackConversion('click_dealer_phone', { branch: mainBranch.name })}
                                        className="text-gray-300 hover:text-white font-semibold text-xs transition-colors"
                                    >
                                        {mainBranch.phone}
                                    </a>
                                </div>
                                <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 space-y-1">
                                    <div>
                                        <strong className="text-gray-300">Radin Inten:</strong> 021-29483888
                                    </div>
                                    <div>
                                        <strong className="text-gray-300">Cakung:</strong> 021-22461888
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] text-gray-500 font-display font-bold uppercase tracking-widest">
                            <span>&copy; {new Date().getFullYear()} PT Dwindo Berlian Samjaya - CS Dept. All Rights Reserved.</span>
                        </div>
                        <div className="font-display font-black text-white text-[18px] italic tracking-tighter opacity-20">
                            DRIVE YOUR AMBITION
                        </div>
                    </div>
                </div>
            </footer>
            <SimulasiKreditModal isOpen={isSimulasiOpen} onClose={() => setIsSimulasiOpen(false)} />
        </>
    );
};

export default Footer;
