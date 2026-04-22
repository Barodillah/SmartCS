import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Wrench, MapPin } from 'lucide-react';
import SectionTag from '../ui/SectionTag';

gsap.registerPlugin(ScrollTrigger);

const ANGULAR_CLIP = "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";

const STEPS = [
    {
        id: '01',
        icon: Award,
        phase: 'Pengalaman',
        title: '20+ Tahun Pengalaman',
        description: 'Lebih dari dua dekade kami hadir melayani keluarga Indonesia. Dedikasi kami dalam menghadirkan standar global Mitsubishi Motors secara konsisten telah membuktikan bahwa kualitas, keamanan, dan kepuasan pelanggan adalah urat nadi layanan kami.',
        image: 'https://res.cloudinary.com/adiramoservice/q_50,f_auto/v1/prod/bengkel/bengkel-mitsubishi-mitsubishi-dwindo-bintaro-(pt.-dwindo-berlian-samjaya)--tangerang_1',
    },
    {
        id: '02',
        icon: Wrench,
        phase: 'Teknisi',
        title: 'Teknisi Tersertifikasi',
        description: 'Kendaraan Anda ditangani eksklusif oleh tim ahli profesional yang telah melewati kalibrasi keterampilan dan sertifikasi ketat langsung dari Mitsubishi Motors. Diagnosa presisi untuk menjaga setiap performa tetap optimal tanpa kompromi.',
        image: 'https://www.mitsubishi-motors.co.id/modules/aftersales/perawatan-kendaraan.webp',
    },
    {
        id: '03',
        icon: MapPin,
        phase: 'Lokasi',
        title: 'Lokasi Strategis',
        description: 'Terletak di jantung bisnis Bintaro dengan akses mobilitas yang sangat mudah. Lounge premium, ruang tunggu yang nyaman, hingga zona perawatan ekspres khusus kami rancang untuk kelancaran investasi waktu berharga Anda.',
        image: 'https://bintarojaya.id/strbintarojaya/aboutus/UBQM7efpxoN1GPLKclBLP1o04puviJzJR4MPu48O.png',
    }
];

const Advantage = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        let mm = gsap.matchMedia();

        // --- DESKTOP LOGIC ---
        mm.add("(min-width: 768px)", () => {
            gsap.set('.nav-step-0', { opacity: 1 });
            gsap.set('.step-bg-0', { opacity: 1 }); // Pastikan background pertama langsung muncul tanpa bug transparan

            STEPS.forEach((step, index) => {
                // Timeline & Triggers
                ScrollTrigger.create({
                    trigger: `.step-${index}`,
                    start: 'top 50%',
                    end: 'bottom 50%',
                    onToggle: (self) => {
                        if (self.isActive) {
                            activateStep(index);
                        }
                    }
                });

                // Content standard fade-in
                const targetContent = `.step-content-${index}`;
                gsap.fromTo(targetContent,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                        scrollTrigger: {
                            trigger: `.step-${index}`,
                            start: 'top 75%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });

            function activateStep(activeIndex) {
                gsap.to('.nav-item', { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
                gsap.to(`.nav-step-${activeIndex}`, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: true });

                STEPS.forEach((_, i) => {
                    gsap.to(`.step-bg-${i}`, {
                        opacity: i === activeIndex ? 1 : 0, duration: 0.8, ease: 'power2.inOut', overwrite: true
                    });
                });
            }
        }, sectionRef);

        // --- MOBILE LOGIC ---
        mm.add("(max-width: 767px)", () => {
            gsap.set('.nav-step-0', { opacity: 1 });

            function activateStepMobile(activeIndex) {
                gsap.to('.nav-item', { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
                gsap.to(`.nav-step-${activeIndex}`, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: true });
            }

            STEPS.forEach((step, index) => {
                // Nav triggers for mobile
                ScrollTrigger.create({
                    trigger: `.step-${index}`,
                    start: 'top 40%',
                    end: 'bottom 40%',
                    onToggle: (self) => {
                        if (self.isActive) {
                            activateStepMobile(index);
                        }
                    }
                });

                const targetContent = `.step-content-${index}`;

                // Simple, lightweight card slide-up for mobile
                gsap.fromTo(targetContent,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: {
                            trigger: `.step-${index}`,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        }, sectionRef);

        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} id="advantage" className="relative w-full border-y border-gray-100 bg-white">
            {/* Sticky Background Layers (Desktop Only) */}
            <div className="hidden md:block absolute inset-0 z-0 pointer-events-none bg-white">
                <div className="sticky top-0 h-screen w-full">
                    {STEPS.map((step, i) => (
                        <div
                            key={`bg-${i}`}
                            className={`step-bg-${i} absolute inset-0 opacity-0`}
                        >
                            <div className="absolute inset-0 bg-white/65 z-10" />
                            <img
                                src={step.image}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row relative z-10">

                {/* Left Sticky Column */}
                <div className="md:w-1/2 md:sticky md:top-0 h-auto md:h-screen flex flex-col justify-center py-16 md:py-0 pr-0 md:pr-12 mb-4 md:mb-0 relative">
                    {/* Stamp floating at the bottom right of the left section */}
                    <div className="absolute bottom-8 right-8 lg:bottom-16 lg:right-16 z-20 w-28 h-28 lg:w-32 lg:h-32 bg-[#E60012] hidden md:flex items-center justify-center p-5 lg:p-6 text-center transition-all" style={{ clipPath: ANGULAR_CLIP }}>
                        <span className="font-display font-black text-white text-[10px] lg:text-[12px] uppercase leading-none tracking-widest">Terpercaya di Bintaro</span>
                    </div>

                    <div className="relative z-10">
                        <div className="mb-4 md:mb-6">
                            <SectionTag>Keunggulan</SectionTag>
                        </div>
                        <h2 className="font-display font-extrabold text-[36px] sm:text-[42px] lg:text-[48px] text-[#111111] uppercase leading-tight mb-6 mt-4">
                            Mengapa Dwindo Bintaro?
                        </h2>

                        <div className="hidden md:flex flex-col gap-6 flex-1 md:flex-none pl-8 relative">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className={`nav-item nav-step-${index} font-display font-bold text-2xl md:text-3xl opacity-30 transition-all flex uppercase text-[#111111] ${index !== STEPS.length - 1 ? 'pb-6' : ''}`}>
                                    <span className="text-[#E60012] w-16">{step.id}</span> {step.phase}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Scroll Column */}
                <div className="md:w-1/2 flex flex-col pt-0 md:pt-[25vh] pb-16 md:pb-[25vh] relative z-10">

                    {/* Mobile Sticky Nav Items */}
                    <div className="sticky top-12 md:top-0 z-50 md:hidden bg-white/95 backdrop-blur-md flex gap-4 border-b border-gray-100 py-4 mb-4 -mx-6 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {STEPS.map((step, index) => (
                            <div key={step.id} className={`nav-item nav-step-${index} flex items-center shrink-0 opacity-30 font-display font-bold text-lg uppercase text-[#111111] transition-all`}>
                                {step.phase}
                            </div>
                        ))}
                    </div>

                    {STEPS.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step-${index} flex flex-col justify-center min-h-auto md:min-h-screen py-4 md:py-16`}
                        >
                            <div className={`step-content-${index} relative md:p-8 bg-white/90 md:bg-transparent border border-gray-100 md:border-none shadow-xl md:shadow-none p-6 md:p-8 overflow-hidden h-[70vh] md:h-auto md:min-h-0 flex flex-col justify-end group`}>

                                {/* Mobile Background Image Injection */}
                                <div className="absolute inset-0 z-0 md:hidden pointer-events-none">
                                    <div className="absolute inset-0 bg-black/60 z-10" />
                                    <img src={step.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                </div>

                                <div className="relative z-10 mt-auto md:mt-0 bg-white/80 md:bg-transparent p-6 md:p-0 backdrop-blur-md md:backdrop-blur-none border md:border-none border-gray-100 md:group-hover:translate-x-4 transition-all duration-300">
                                    <div className="w-14 h-14 bg-[#E60012] flex items-center justify-center mb-6" style={{ clipPath: ANGULAR_CLIP }}>
                                        <step.icon size={28} className="text-white" />
                                    </div>
                                    <h3
                                        className="font-display font-extrabold text-[#111111] text-2xl sm:text-3xl lg:text-4xl uppercase mb-3"
                                    >
                                        {step.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Advantage;
