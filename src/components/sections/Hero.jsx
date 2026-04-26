import React from 'react';
import { motion } from 'framer-motion';
import AngularButton from '../ui/AngularButton';

const Hero = () => {
    return (
        <section className="relative h-screen min-h-[700px] bg-[#111111] overflow-hidden">
            {/* Background Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/media/hero.webp"
                    alt="Mitsubishi Hero"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto h-full flex items-center px-6 lg:px-12">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-[2px] bg-[#E60012]"></div>
                            <span className="font-display font-bold text-[#E60012] tracking-[0.3em] uppercase text-[12px]">Customer Satisfaction - Passion to Care</span>
                        </div>
                        <h1 className="font-display font-black text-white text-[clamp(48px,8vw,90px)] leading-[0.9] uppercase mb-8 italic">
                            Your Journey <br />
                            <span className="text-[#E60012]">Our Care</span>
                        </h1>
                        <p className="text-gray-300 font-light text-lg mb-10 max-w-lg leading-relaxed">
                            Dari pembelian hingga perawatan, kami hadir memastikan kendaraan Anda selalu siap di setiap perjalanan.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <AngularButton variant="primary" onClick={() => window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: 'Saya ingin booking service' } }))}>Booking Service</AngularButton>
                            <AngularButton variant="white" onClick={() => window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: 'Ada promo apa saat ini?' } }))}>Promo Spesial</AngularButton>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-[1px] h-12 bg-gradient-to-b from-[#E60012] to-transparent"></div>
            </div>
        </section>
    );
};

export default Hero;
