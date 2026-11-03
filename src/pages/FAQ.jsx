import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ShieldCheck, MessageSquare, Calendar, Car } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import AngularButton from '../components/ui/AngularButton';
import { ANGULAR_CLIP } from '../utils/constants';
import {
    ALL_FAQS_CATEGORIZED,
    getBreadcrumbNode,
    getFaqNode
} from '../utils/seoConfig';

const FAQ = () => {
    const flatFaqs = ALL_FAQS_CATEGORIZED.flatMap((group) => group.items);
    const schemaNodes = [
        getBreadcrumbNode([
            { name: 'Beranda', path: '/' },
            { name: 'FAQ (Pertanyaan Umum)' }
        ]),
        getFaqNode(flatFaqs)
    ];

    return (
        <main className="min-h-screen pt-16 bg-[#F8F9FA] font-body text-[#111111]">
            <SEOHead
                title="FAQ Pembelian, Kredit & Servis Mitsubishi | Dwindo Bintaro"
                description="Jawaban langsung seputar daftar harga OTR Mitsubishi, simulasi kredit, gratis servis berkala SMART Package, Extended SMART Package, dan asisten AI DINA."
                canonicalPath="/faq"
                schemaNodes={schemaNodes}
            />

            {/* Header Hero */}
            <header className="bg-[#111111] py-16 md:py-20 px-6 relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto relative z-10">
                    <nav aria-label="breadcrumb" className="text-xs text-gray-400 mb-6 flex items-center gap-2">
                        <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
                        <span>/</span>
                        <span className="text-[#E60012] font-semibold">FAQ</span>
                    </nav>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                            <HelpCircle size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xs uppercase tracking-[0.25em] text-[#E60012]">
                            Pusat Informasi Resmi
                        </span>
                    </div>
                    <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight mb-4">
                        Pertanyaan yang Sering Diajukan (FAQ)
                    </h1>
                    <p className="text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed">
                        Ringkasan jawaban faktual seputar pembelian kendaraan penumpang &amp; niaga Mitsubishi, simulasi kredit, layanan bengkel resmi, paket perawatan berkala <strong>SMART Package</strong>, hingga transaksi aman di <strong>PT Dwindo Berlian Samjaya</strong>.
                    </p>
                </div>
            </header>

            <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 space-y-16">
                {/* Kategori FAQ (H2 -> H3 -> Jawaban Langsung) */}
                {ALL_FAQS_CATEGORIZED.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-6">
                        <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase text-[#111111] border-l-4 border-[#E60012] pl-4">
                            {group.category}
                        </h2>
                        <div className="space-y-4">
                            {group.items.map((item, idx) => (
                                <details
                                    key={idx}
                                    open={idx === 0}
                                    className="group bg-white rounded-xl border border-gray-200 open:border-[#E60012]/50 open:shadow-md transition-all"
                                >
                                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 select-none">
                                        <h3 className="font-display font-bold text-base md:text-lg text-[#111111] leading-snug">
                                            {item.q}
                                        </h3>
                                        <ChevronDown
                                            size={20}
                                            className="text-[#E60012] shrink-0 transition-transform duration-300 group-open:rotate-180"
                                        />
                                    </summary>
                                    <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 text-gray-700 text-sm md:text-base leading-relaxed border-t border-gray-100">
                                        <p className="pt-4">{item.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Tabel Perbandingan Paket Perawatan (Bab 8.2 & 8.3 AEO Table) */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <h2 className="font-display font-extrabold text-2xl md:text-3xl uppercase text-[#111111] mb-3">
                        Tabel Perbandingan Extended SMART Package Mitsubishi
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base mb-6">
                        Bagi kendaraan Mitsubishi Xpander, Xpander Cross, Xforce, dan Pajero Sport yang telah memasuki kilometer 50.000 KM ke atas, tersedia paket perpanjangan servis berkala resmi dengan penghematan hingga 25%:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-200 text-sm md:text-base">
                            <thead>
                                <tr className="bg-[#111111] text-white font-display uppercase text-xs tracking-wider">
                                    <th className="p-4 border border-gray-200">Tipe Paket</th>
                                    <th className="p-4 border border-gray-200">Durasi / Cakupan</th>
                                    <th className="p-4 border border-gray-200">Harga Xpander Series</th>
                                    <th className="p-4 border border-gray-200">Harga Pajero Sport</th>
                                    <th className="p-4 border border-gray-200">Keuntungan Tambahan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">1XPM (1x Servis Berkala)</td>
                                    <td className="p-4">6 Bulan / 10.000 KM</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 1.387.500</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 2.497.500</td>
                                    <td className="p-4">Gratis Jasa &amp; Suku Cadang Berkala</td>
                                </tr>
                                <tr className="hover:bg-gray-50 bg-red-50/30">
                                    <td className="p-4 font-bold">2XPM (2x Servis Berkala)</td>
                                    <td className="p-4">12 Bulan (1 Tahun) / 20.000 KM</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 2.386.500</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 4.662.000</td>
                                    <td className="p-4">+ Garansi 1 Thn/30.000 KM &amp; Emergency 24 Jam</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">4XPM (4x Servis Berkala)</td>
                                    <td className="p-4">24 Bulan (2 Tahun) / 40.000 KM</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 4.551.000</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 9.102.000</td>
                                    <td className="p-4">+ Diskon Ban s/d 30% &amp; Diskon Aki Rp 50.000</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">6XPM (6x Servis Berkala)</td>
                                    <td className="p-4">36 Bulan (3 Tahun) / 60.000 KM</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 6.660.000</td>
                                    <td className="p-4 font-semibold text-[#E60012]">Rp 13.320.000</td>
                                    <td className="p-4">Penghematan Maksimal s/d 25–27%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Internal Links & CTA */}
                <section className="bg-[#111111] text-white rounded-2xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="font-display font-black text-2xl md:text-3xl uppercase mb-3">
                            Masih Punya Pertanyaan Spesifik?
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                            Tanyakan langsung kepada asisten AI <strong>DINA</strong> 24/7 atau jelajahi halaman layanan utama kami di bawah ini:
                        </p>
                        <div className="flex flex-wrap gap-4 mt-6 text-xs font-display font-bold uppercase tracking-wider">
                            <Link to="/price-list" className="text-[#E60012] hover:underline flex items-center gap-1">
                                <Car size={14} /> Daftar Harga OTR
                            </Link>
                            <Link to="/booking" className="text-[#E60012] hover:underline flex items-center gap-1">
                                <Calendar size={14} /> Booking Service Online
                            </Link>
                            <Link to="/kanal-resmi" className="text-[#E60012] hover:underline flex items-center gap-1">
                                <ShieldCheck size={14} /> Verifikasi Kanal Resmi
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 shrink-0">
                        <AngularButton
                            variant="primary"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent('openDinaChat', {
                                        detail: { message: 'Halo DINA, saya ingin berkonsultasi mengenai layanan Mitsubishi Dwindo' }
                                    })
                                )
                            }
                        >
                            <span className="flex items-center gap-2">
                                <MessageSquare size={16} /> Tanya DINA Sekarang
                            </span>
                        </AngularButton>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default FAQ;

