import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Settings, Tag, Phone, Car, Calculator } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';
import AngularButton from '../ui/AngularButton';
import SimulasiKreditModal from '../SimulasiKreditModal';

const servicesData = [
    {
        id: "01",
        title: "Booking Service",
        desc: "Atur jadwal perawatan rutin kendaraan Anda tanpa antre.",
        img: "/media/services/booking-service.webp",
        icon: Calendar,
        cta: "Booking Sekarang"
    },
    {
        id: "02",
        title: "Sparepart",
        desc: "Cek ketersediaan suku cadang asli Mitsubishi Motors.",
        img: "/media/services/sparepart.webp",
        icon: Settings,
        cta: "Cek Suku Cadang"
    },
    {
        id: "03",
        title: "Promo",
        desc: "Informasi program penjualan dan cicilan paling update.",
        img: "/media/services/promo.jpg",
        icon: Tag,
        cta: "Lihat Promo"
    },
    {
        id: "04",
        title: "Emergensi",
        desc: "Layanan bantuan datang kelokasi Anda untuk kendala di perjalanan.",
        img: "/media/services/emergency.webp",
        icon: Phone,
        cta: "Hubungi Bantuan"
    },
    {
        id: "05",
        title: "Aksesoris",
        desc: "Temukan berbagai aksesoris untuk menunjang kenyamanan berkendara.",
        img: "/media/services/aksesoris.webp",
        icon: Settings,
        cta: "Temukan Aksesoris"
    },
    {
        id: "06",
        title: "Test Drive",
        desc: "Rasakan pengalaman berkendara dengan kendaraan Mitsubishi pilihan.",
        img: "/media/services/test-drive.jpg",
        icon: Car,
        cta: "Coba Sekarang"
    },
    {
        id: "07",
        title: "Simulasi Kredit",
        desc: "Hitung estimasi cicilan dan DP kendaraan Mitsubishi impian Anda.",
        img: "/media/services/simulasi-kredit.png",
        icon: Calculator,
        cta: "Hitung Simulasi"
    },
];

const Services = () => {
    const targetRef = useRef(null);
    const [isSimulasiOpen, setIsSimulasiOpen] = useState(false);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85.71%"]); // -85.71% for 7 panels (600/700)

    return (
        <>
            <section ref={targetRef} className="relative h-[700vh] bg-[#111111]">
                <div className="sticky top-0 h-screen overflow-hidden">
                    <motion.div style={{ x }} className="flex w-[700vw] h-full">
                        {servicesData.map((service, index) => (
                            <div key={index} className="w-screen h-screen flex-shrink-0 relative overflow-hidden group flex items-center">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${service.img})` }}
                                ></div>
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700"></div>

                                <div className="relative z-10 px-12 md:px-24 w-full">
                                    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
                                        <div className="max-w-3xl">
                                            <div className="flex items-center gap-6 mb-6">
                                                <div className="w-12 h-12 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                                                    <service.icon size={24} className="text-white" />
                                                </div>
                                            </div>
                                            <h2 className="text-5xl md:text-8xl font-display font-bold text-white mb-6 uppercase tracking-tighter leading-none">
                                                {service.title}
                                            </h2>
                                            <p className="text-xl md:text-3xl text-white/80 font-body font-light tracking-wide leading-relaxed">
                                                {service.desc}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col md:flex-row gap-4">
                                            {service.id === "05" ? (
                                                <>
                                                    <AngularButton variant="primary" className="!px-10 !py-4 !text-[14px]" onClick={() => window.location.href = '/aksesoris'}>
                                                        Temukan Aksesoris
                                                    </AngularButton>
                                                    <AngularButton variant="secondary" className="!px-10 !py-4 !text-[14px] !bg-white/10 !text-white hover:!bg-white/20" onClick={() => {
                                                        window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Tanya seputar Aksesoris` } }));
                                                    }}>
                                                        Tanya Aksesoris
                                                    </AngularButton>
                                                </>
                                            ) : (
                                                <AngularButton variant="primary" className="!px-10 !py-4 !text-[14px]" onClick={() => {
                                                    if (service.title === 'Simulasi Kredit') {
                                                        setIsSimulasiOpen(true);
                                                    } else {
                                                        window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Saya tertarik dengan layanan ${service.title}` } }));
                                                    }
                                                }}>
                                                    {service.cta}
                                                </AngularButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>
            <SimulasiKreditModal isOpen={isSimulasiOpen} onClose={() => setIsSimulasiOpen(false)} />
        </>
    );
};

export default Services;
