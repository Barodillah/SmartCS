import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, MapPin, Phone, CheckCircle2, Globe, Building2 } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import dealerData from '../../knowledge/lokasi_dealer.json';
import { ANGULAR_CLIP } from '../utils/constants';
import {
    SITE_URL,
    LEGAL_NAME,
    BRAND_NAME,
    getBreadcrumbNode,
    getAutoDealerGraphNodes
} from '../utils/seoConfig';

/**
 * Halaman Tentang Kami & Kanal Resmi (Bab 6.6, Bab 11.2 Brand Protection, Bab 11.3 E-E-A-T, Bab 19.7)
 */
const OfficialChannels = () => {
    const schemaNodes = [
        getBreadcrumbNode([
            { name: 'Beranda', path: '/' },
            { name: 'Tentang Kami & Kanal Resmi' }
        ]),
        {
            '@type': 'AboutPage',
            '@id': `${SITE_URL}/kanal-resmi#aboutpage`,
            url: `${SITE_URL}/kanal-resmi`,
            name: `Tentang Kami & Kanal Resmi ${LEGAL_NAME}`,
            description: `Profil perusahaan ${LEGAL_NAME} (${BRAND_NAME}), daftar cabang resmi 3S Mitsubishi Motors & Fuso, serta verifikasi kanal resmi dan keamanan transaksi.`,
            mainEntity: { '@id': `${SITE_URL}/#organization` }
        },
        ...getAutoDealerGraphNodes()
    ];

    return (
        <main className="min-h-screen pt-16 bg-[#F8F9FA] font-body text-[#111111]">
            <SEOHead
                title="Tentang Kami & Kanal Resmi PT Dwindo Berlian Samjaya"
                description="Profil resmi PT Dwindo Berlian Samjaya (Authorized Dealer 3S Mitsubishi Motors & Fuso), daftar kanal komunikasi resmi, alamat 3 cabang, dan panduan transaksi aman."
                canonicalPath="/kanal-resmi"
                schemaNodes={schemaNodes}
            />

            {/* Header */}
            <header className="bg-[#111111] py-16 md:py-20 px-6 relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <nav aria-label="breadcrumb" className="text-xs text-gray-400 mb-6 flex items-center gap-2">
                        <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
                        <span>/</span>
                        <span className="text-[#E60012] font-semibold">Tentang Kami &amp; Kanal Resmi</span>
                    </nav>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xs uppercase tracking-[0.25em] text-[#E60012]">
                            Identitas Entitas &amp; Perlindungan Konsumen
                        </span>
                    </div>
                    <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight mb-4">
                        Tentang {LEGAL_NAME}
                    </h1>
                    <p className="text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed">
                        Untuk keamanan dan kenyamanan seluruh pelanggan, halaman ini memuat informasi terverifikasi mengenai profil badan hukum, jaringan cabang resmi 3S, serta daftar kanal komunikasi resmi <strong>{BRAND_NAME}</strong>.
                    </p>
                </div>
            </header>

            <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 space-y-14">
                {/* Profil Perusahaan (E-E-A-T) */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 className="text-[#E60012]" size={24} />
                        <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase">
                            Profil Resmi {LEGAL_NAME}
                        </h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        <strong>{LEGAL_NAME}</strong> adalah dealer resmi berstandar <strong>3S (Sales, Service, Sparepart)</strong> untuk kendaraan penumpang dan niaga ringan <strong>PT Mitsubishi Motors Krama Yudha Sales Indonesia (MMKSI)</strong> serta kendaraan niaga <strong>PT Krama Yudha Tiga Berlian Motors (KTB / Mitsubishi Fuso)</strong>. Dengan pengalaman lebih dari 20 tahun melayani pelanggan di wilayah Jabodetabek, kami mengoperasikan 3 cabang utama di Bintaro (Tangerang Selatan), Radin Inten (Jakarta Timur), dan Cakung (Jakarta Timur).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        {[
                            { label: 'Nama Badan Hukum', val: LEGAL_NAME },
                            { label: 'Nama Brand & Unit Layanan', val: BRAND_NAME },
                            { label: 'Otorisasi Resmi', val: 'Authorized Dealer 3S MMKSI & KTB (Mitsubishi Fuso)' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{item.label}</div>
                                <div className="font-display font-bold text-sm md:text-base text-[#111111]">{item.val}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tabel Kanal Resmi (Bab 19.7) */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="text-[#E60012]" size={24} />
                        <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase">
                            Daftar Kanal Digital &amp; Kontak Resmi
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm md:text-base">
                        Pastikan Anda hanya mengakses informasi dan berinteraksi melalui kanal resmi di bawah ini:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-200 text-sm md:text-base">
                            <thead>
                                <tr className="bg-[#111111] text-white font-display uppercase text-xs tracking-wider">
                                    <th className="p-4 border border-gray-200">Platform / Kanal</th>
                                    <th className="p-4 border border-gray-200">Alamat / URL Resmi</th>
                                    <th className="p-4 border border-gray-200">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="p-4 font-bold">Website Utama</td>
                                    <td className="p-4 text-[#E60012] font-semibold">https://csdwindo.com</td>
                                    <td className="p-4">Portal resmi daftar harga, aksesoris, berita &amp; asisten AI DINA 24/7</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">Portal Booking Service</td>
                                    <td className="p-4 text-[#E60012] font-semibold">https://csdwindo.com/booking (booking.csdwindo.com)</td>
                                    <td className="p-4">Penjadwalan servis berkala bengkel resmi online</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">Instagram Resmi</td>
                                    <td className="p-4">
                                        <a href="https://www.instagram.com/dwindoberliansamjaya/" target="_blank" rel="noopener noreferrer" className="text-[#E60012] hover:underline">
                                            @dwindoberliansamjaya
                                        </a>
                                    </td>
                                    <td className="p-4">Informasi kegiatan, promo bulanan &amp; serah terima unit</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">YouTube Resmi</td>
                                    <td className="p-4">
                                        <a href="https://www.youtube.com/@dwindoberliansamjaya635" target="_blank" rel="noopener noreferrer" className="text-[#E60012] hover:underline">
                                            @dwindoberliansamjaya635
                                        </a>
                                    </td>
                                    <td className="p-4">Dokumentasi video &amp; ulasan produk resmi</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Waspada Peniruan / Anti-Fraud */}
                <section className="bg-red-50 rounded-2xl border-2 border-[#E60012]/30 p-6 md:p-10">
                    <div className="flex items-center gap-3 mb-4 text-[#E60012]">
                        <AlertTriangle size={28} />
                        <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase">
                            Peringatan Keamanan Transaksi &amp; Waspada Penipuan
                        </h2>
                    </div>
                    <ul className="space-y-3 text-gray-800 text-sm md:text-base">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-[#E60012] shrink-0 mt-0.5" />
                            <span>
                                <strong>Rekening Resmi Perusahaan:</strong> Seluruh pembayaran tanda jadi (<em>booking fee</em>), uang muka (DP), pelunasan pembelian kendaraan, maupun pembayaran layanan bengkel wajib ditujukan ke rekening bank resmi atas nama <strong>{LEGAL_NAME}</strong>.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-[#E60012] shrink-0 mt-0.5" />
                            <span>
                                <strong>Dilarang Transfer ke Rekening Pribadi:</strong> Kami tidak pernah meminta atau mengizinkan pembayaran transaksi kendaraan ke rekening pribadi oknum sales atau pihak ketiga mana pun.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-[#E60012] shrink-0 mt-0.5" />
                            <span>
                                <strong>Verifikasi Cepat:</strong> Apabila Anda menerima penawaran mencurigakan yang mengatasnamakan Dwindo Bintaro, segera hubungi nomor telepon resmi cabang kami di bawah ini atau konfirmasi melalui asisten virtual <strong>DINA</strong>.
                            </span>
                        </li>
                    </ul>
                </section>

                {/* Jaringan 3 Cabang Resmi */}
                <section className="space-y-6">
                    <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase border-l-4 border-[#E60012] pl-4">
                        Jaringan Cabang Resmi {LEGAL_NAME}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(dealerData.branches || []).map((branch) => (
                            <div key={branch.slug} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-black text-xl uppercase text-[#111111] mb-4">
                                        {branch.name}
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                                        <p className="flex items-start gap-2.5">
                                            <MapPin size={16} className="text-[#E60012] shrink-0 mt-1" />
                                            <span>{branch.address}</span>
                                        </p>
                                        <p className="flex items-center gap-2.5 font-bold text-[#111111]">
                                            <Phone size={16} className="text-[#E60012] shrink-0" />
                                            <a href={`tel:${branch.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#E60012]">
                                                {branch.phone}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={branch.maps_direction}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-center bg-[#111111] hover:bg-[#E60012] text-white font-display font-bold text-xs uppercase tracking-widest py-3 px-4 transition-colors"
                                    style={{ clipPath: ANGULAR_CLIP }}
                                >
                                    Buka Peta Lokasi
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default OfficialChannels;

