import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = () => {
    const sectionRef = useRef(null);
    const bgRef = useRef(null);
    const carRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=150%', // Tambah sedikit durasi agar teks punya waktu muncul
                    scrub: true,
                    pin: true,
                    anticipatePin: 1
                }
            });

            // Animasi mobil
            tl.fromTo(carRef.current,
                {
                    x: '70vw',
                    scale: 0.6,
                },
                {
                    x: '0vw',
                    scale: 1.6,
                    ease: 'none'
                }
            );

            // Animasi teks muncul di akhir
            tl.fromTo(textRef.current,
                {
                    y: -50,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    ease: 'power2.out'
                },
                "-=0.3" // Mulai sedikit sebelum mobil benar-benar berhenti
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full h-screen overflow-hidden bg-black"
        >
            {/* Background */}
            <div
                ref={bgRef}
                className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat"
                style={{
                    backgroundImage: `url('/media/paralax/bg.png')`,
                }}
            />

            {/* Title Text - DRIVE YOUR AMBITION */}
            <div
                ref={textRef}
                className="absolute top-[15%] md:top-[12%] left-0 w-full z-20 flex justify-center px-6 pointer-events-none text-center"
            >
                <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold text-white tracking-[0.1em] md:tracking-[0.3em] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] italic leading-[1.1] uppercase">
                    WELCOME TO <br className="md:hidden" /> DWINDO
                </h2>
            </div>

            {/* Car Container - Increased pb on mobile to move car up */}
            <div
                className="absolute inset-0 w-full h-full flex items-end justify-center pb-40 md:pb-32 pointer-events-none"
            >
                <img
                    ref={carRef}
                    src="/media/paralax/car.png"
                    alt="Mitsubishi Car Parallax"
                    className="max-w-[400px] md:max-w-[700px] object-contain drop-shadow-2xl"
                />
            </div>

            {/* Overlay if needed for text */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none opacity-0">
                <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    Experience The Journey
                </h2>
            </div>
        </section>
    );
};

export default ParallaxSection;
