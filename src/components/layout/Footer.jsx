import React, { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimulasiKreditModal from '../SimulasiKreditModal';

const Instagram = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const Youtube = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);
import { ANGULAR_CLIP } from '../../utils/constants';

const Footer = () => {
    const [isSimulasiOpen, setIsSimulasiOpen] = useState(false);

    const handleTestDriveClick = (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: 'Saya ingin melakukan Test Drive' } }));
    };

    const handleLayananChat = (e, item) => {
        e.preventDefault();
        let message = '';
        switch (item) {
            case 'Booking Service': message = 'Saya ingin melakukan booking service'; break;
            case 'Sparepart Asli': message = 'Saya ingin menanyakan ketersediaan sparepart asli Mitsubishi'; break;
            case 'Warranty': message = 'Saya ingin bertanya mengenai informasi garansi (warranty) kendaraan'; break;
            case 'Promo Servis': message = 'Saya ingin tahu promo servis yang sedang berlangsung'; break;
            default: message = `Saya ingin bertanya mengenai ${item}`;
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
                                <img src="/logo/logo_dwindo_white.png" alt="Dwindo Bintaro" className="h-6 md:h-7 object-contain" />
                                <div className="border-l border-white/20 pl-3">
                                    <span className="block font-display font-bold text-white text-[10px] tracking-[0.2em] uppercase">PT Dwindo Berlian Samjaya</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm font-light leading-relaxed mb-6 italic">
                                Authorized Dealer Mitsubishi Motors yang melayani dengan dedikasi tinggi di area Bintaro dan sekitarnya.
                            </p>
                            <div className="flex gap-4">
                                {[
                                    { Icon: Instagram, link: 'https://www.instagram.com/dwindoberliansamjaya/' },
                                    { Icon: Youtube, link: 'https://www.youtube.com/@dwindoberliansamjaya635' }
                                ].map((item, i) => (
                                    <a
                                        key={i}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E60012] hover:text-white transition-all"
                                        style={{ clipPath: ANGULAR_CLIP }}
                                    >
                                        <item.Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">Quick Links</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link to="/lokasi-dealer" className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">Cari Dealer</Link>
                                </li>
                                <li>
                                    <a href="https://www.mitsubishi-motors.co.id/brosur" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">Unduh Brosur</a>
                                </li>
                                <li>
                                    <a href="#" onClick={handleTestDriveClick} className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">Test Drive</a>
                                </li>
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setIsSimulasiOpen(true); }} className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors">Simulasi Kredit</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-white uppercase text-[12px] tracking-[0.2em] mb-8">Layanan</h4>
                            <ul className="space-y-4">
                                {['Booking Service', 'Sparepart Asli', 'Warranty', 'Promo Servis'].map(item => (
                                    <li key={item}>
                                        <a 
                                            href="#" 
                                            onClick={(e) => handleLayananChat(e, item)}
                                            className="text-gray-500 text-xs uppercase font-display font-semibold hover:text-white transition-colors"
                                        >
                                            {item}
                                        </a>
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
                                    <p className="text-gray-500 text-xs">(021) 745-8383</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] text-gray-600 font-display font-bold uppercase tracking-widest">
                            &copy; 2026 PT Dwindo Berlian Samjaya - CS Dept. All Rights Reserved.
                        </p>
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
