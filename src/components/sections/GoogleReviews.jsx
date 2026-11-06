import React, { useEffect } from 'react';
import SectionTag from '../ui/SectionTag';
import { Star } from 'lucide-react';

const GoogleReviews = () => {
    useEffect(() => {
        const scriptSrc = 'https://widgets.sociablekit.com/google-reviews/widget.js';
        const scriptId = 'sociablekit-google-reviews-script';

        // Remove any prior script instance to ensure clean re-initialization on navigation
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = scriptSrc;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            const s = document.getElementById(scriptId);
            if (s) {
                s.remove();
            }
        };
    }, []);

    return (
        <section id="ulasan-google" className="relative w-full py-16 lg:py-24 bg-white border-y border-gray-100 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-14">
                    <div className="max-w-2xl">
                        <SectionTag>Google Reviews</SectionTag>
                        <h2 className="font-display font-extrabold text-[32px] sm:text-[40px] lg:text-[46px] text-[#111111] uppercase leading-tight mt-3">
                            Ulasan Pelanggan
                        </h2>
                        <p className="text-gray-600 mt-3 text-base sm:text-lg">
                            Transparansi dan kepuasan Anda adalah prioritas kami. Simak ulasan serta penilaian langsung dari para pelanggan dealer resmi Mitsubishi Motors Dwindo.
                        </p>
                    </div>

                    {/* Badge Google Review */}
                    <div className="mt-6 md:mt-0 flex items-center gap-2.5 bg-[#F8F9FA] border border-gray-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-700 shadow-sm self-start md:self-auto">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                            ))}
                        </div>
                        <span className="font-display font-bold text-[#111111] uppercase tracking-wide">
                            Ulasan Resmi Google
                        </span>
                    </div>
                </div>

                {/* Google Reviews SociableKIT Embed */}
                <div className="w-full min-h-[300px]">
                    <div className="sk-ww-google-reviews" data-embed-id="25727817"></div>
                </div>
            </div>
        </section>
    );
};

export default GoogleReviews;

