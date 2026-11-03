import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANGULAR_CLIP } from '../../utils/constants';

/**
 * Komponen FAQ Kontekstual AEO-Ready (Bab 4.7 & Bab 8.3 Panduan)
 * Menggunakan elemen semantik <details> & <summary> dengan <h3> agar seluruh jawaban
 * selalu berada di dalam DOM dan mudah diekstrak oleh Google Featured Snippet & AI Crawler.
 */
const ContextualFAQ = ({
    title = 'Pertanyaan yang Sering Diajukan (FAQ)',
    subtitle = 'Informasi penting seputar layanan resmi Mitsubishi Motors Dwindo Bintaro.',
    faqs = [],
    dark = false,
    showMoreLink = true
}) => {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section
            aria-label={title}
            className={`py-16 px-6 border-t ${
                dark ? 'bg-[#151515] border-white/10 text-white' : 'bg-white border-gray-200 text-[#111111]'
            }`}
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-8 h-8 bg-[#E60012] flex items-center justify-center"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                <HelpCircle size={16} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[#E60012]">
                                Informasi &amp; Bantuan Cepat
                            </span>
                        </div>
                        <h2
                            className={`font-display font-extrabold text-2xl md:text-4xl uppercase tracking-tight ${
                                dark ? 'text-white' : 'text-[#111111]'
                            }`}
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className={`mt-2 text-sm md:text-base ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {showMoreLink && (
                        <Link
                            to="/faq"
                            className="text-xs font-display font-bold uppercase tracking-widest text-[#E60012] hover:underline whitespace-nowrap"
                        >
                            Lihat Semua FAQ &rarr;
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {faqs.map((item, idx) => (
                        <details
                            key={idx}
                            open={idx === 0}
                            className={`group rounded-xl border transition-all ${
                                dark
                                    ? 'bg-[#1D1D1D] border-white/10 open:border-[#E60012]/50'
                                    : 'bg-[#F8F9FA] border-gray-200 open:bg-white open:shadow-md open:border-[#E60012]/40'
                            }`}
                        >
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 select-none">
                                <h3
                                    className={`font-display font-bold text-base md:text-lg leading-snug ${
                                        dark ? 'text-white' : 'text-[#111111]'
                                    }`}
                                >
                                    {item.q}
                                </h3>
                                <ChevronDown
                                    size={20}
                                    className="text-[#E60012] shrink-0 transition-transform duration-300 group-open:rotate-180"
                                />
                            </summary>
                            <div
                                className={`px-5 pb-5 md:px-6 md:pb-6 pt-0 text-sm md:text-base leading-relaxed border-t ${
                                    dark ? 'text-gray-300 border-white/5' : 'text-gray-700 border-gray-100'
                                }`}
                            >
                                <p className="pt-4">{item.a}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ContextualFAQ;

