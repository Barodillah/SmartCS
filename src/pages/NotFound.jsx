import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, Calendar, MapPin, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import AngularButton from '../components/ui/AngularButton';
import { ANGULAR_CLIP } from '../utils/constants';

/**
 * Halaman 404 Informatif (Bab 3.3 & Bab 16.1 Panduan)
 * Menyediakan navigasi ke halaman utama, katalog, booking service, dan bantuan DINA untuk menurunkan bounce rate.
 */
const NotFound = () => {
    const quickLinks = [
        { name: 'Beranda Utama', desc: 'Kembali ke halaman depan Mitsubishi Dwindo Bintaro', path: '/', icon: Home },
        { name: 'Daftar Harga (Price List)', desc: 'Cek harga OTR terbaru Xpander, Xforce, Pajero Sport & Fuso', path: '/price-list', icon: Car },
        { name: 'Booking Service Online', desc: 'Jadwalkan perawatan berkala di bengkel resmi tanpa antre', path: '/booking', icon: Calendar },
        { name: 'Lokasi & Kontak Dealer', desc: 'Alamat lengkap cabang Bintaro, Radin Inten, dan Cakung', path: '/lokasi-dealer', icon: MapPin },
        { name: 'Berita & Promo', desc: 'Artikel tips perawatan dan promo penjualan terbaru', path: '/artikel', icon: FileText },
        { name: 'Pusat FAQ', desc: 'Jawaban cepat seputar kredit, garansi & SMART Package', path: '/faq', icon: HelpCircle }
    ];

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 bg-[#F8F9FA] flex items-center justify-center font-body">
            <SEOHead
                title="Halaman Tidak Ditemukan (404) | Mitsubishi Dwindo Bintaro"
                description="Halaman yang Anda cari tidak ditemukan. Jelajahi daftar harga terbaru, booking service online, atau hubungi asisten AI DINA Mitsubishi Dwindo Bintaro."
                noindex={true}
            />

            <div className="max-w-4xl w-full bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-xl">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <div
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-[#E60012] text-white font-display font-black text-xs uppercase tracking-widest mb-4"
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        Error 404
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[#111111] uppercase tracking-tight mb-4">
                        Halaman Tidak Ditemukan
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        Maaf, tautan yang Anda kunjungi mungkin telah dipindahkan atau tidak tersedia. Silakan gunakan pintasan halaman resmi di bawah ini atau tanyakan langsung kepada asisten AI <strong>DINA</strong>.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="group p-5 rounded-xl border border-gray-200 hover:border-[#E60012] hover:shadow-md transition-all bg-[#F8F9FA] hover:bg-white flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-[#E60012]/10 text-[#E60012] flex items-center justify-center mb-3 group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <h2 className="font-display font-bold text-base text-[#111111] group-hover:text-[#E60012] transition-colors mb-1">
                                        {item.name}
                                    </h2>
                                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-100">
                    <Link to="/">
                        <AngularButton variant="secondary">Kembali ke Beranda</AngularButton>
                    </Link>
                    <AngularButton
                        variant="primary"
                        onClick={() =>
                            window.dispatchEvent(
                                new CustomEvent('openDinaChat', {
                                    detail: { message: 'Halo DINA, bantu saya mencari informasi di situs Dwindo Bintaro' }
                                })
                            )
                        }
                    >
                        <span className="flex items-center gap-2">
                            <MessageSquare size={16} /> Bantuan Asisten DINA
                        </span>
                    </AngularButton>
                </div>
            </div>
        </main>
    );
};

export default NotFound;

