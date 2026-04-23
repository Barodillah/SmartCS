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
        img: "https://www.mitsubishi-motors.co.id/modules/aftersales/perawatan-kendaraan.webp",
        icon: Calendar,
        cta: "Booking Sekarang"
    },
    {
        id: "02",
        title: "Sparepart",
        desc: "Cek ketersediaan suku cadang asli Mitsubishi Motors.",
        img: "https://www.mitsubishi-motors.co.id/modules/aftersales/suku-cadang.webp",
        icon: Settings,
        cta: "Cek Suku Cadang"
    },
    {
        id: "03",
        title: "Promo",
        desc: "Informasi program penjualan dan cicilan paling update.",
        img: "https://storage.googleapis.com/gcmkscsp001/public/media-assets/142e1dda-587a-46bb-8229-dab465db0030/new-xpander-banner-desktop.jpg?GoogleAccessId=bsidevops%40gp-prod-mmksi-web-01.iam.gserviceaccount.com&Expires=1777439768&Signature=E3JWl6cH76aXsnqqQD5H7LkgsLTOIZC5QEPopvt2binfCduj8F3McT6zoQrxI0iIqFffIXTXQY2yDevzmVTix6pYLO4gXNE6LLgGgZNikvv1mnxAnFcf769Xj9bEniHGOpmWkWWrNmht7B7SO1Km6kkoBuMETdsneX5%2BL2wdE6Y2jTt3vpcOd%2BPYws77xzhHg6BiGx8CVRrZeS038JpYPyJaHqrW5YngYmcwdoxtOi1SS9IXg6o%2FEDfRyFI5gMeQBNydYx%2FN0CllZ9x80jhxvQ1o%2BZtntpwOWBEPTPMZtFosExhzePmVcsXp7eLOrf09in%2F3Kq3OYaUJyW5X1SYlJw%3D%3D",
        icon: Tag,
        cta: "Lihat Promo"
    },
    {
        id: "04",
        title: "Emergensi",
        desc: "Layanan bantuan datang kelokasi Anda untuk kendala di perjalanan.",
        img: "https://www.mitsubishi-motors.co.id/images/banner3.webp",
        icon: Phone,
        cta: "Hubungi Bantuan"
    },
    {
        id: "05",
        title: "Aksesoris",
        desc: "Temukan berbagai aksesoris untuk menunjang kenyamanan berkendara.",
        img: "https://www.mitsubishi-motors.co.id/images/company/layanan-kami-aksesoris.webp",
        icon: Settings,
        cta: "Temukan Aksesoris"
    },
    {
        id: "06",
        title: "Test Drive",
        desc: "Rasakan pengalaman berkendara dengan kendaraan Mitsubishi pilihan.",
        img: "https://i.pinimg.com/1200x/6b/99/8d/6b998d00f36a0bef771ba1d39f024c96.jpg",
        icon: Car,
        cta: "Coba Sekarang"
    },
    {
        id: "07",
        title: "Simulasi Kredit",
        desc: "Hitung estimasi cicilan dan DP kendaraan Mitsubishi impian Anda.",
        img: "https://www.mitsubishi-motors.co.id/images/cars/pajero/promo-grid2.png",
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
                                        <div className="flex-shrink-0">
                                            <AngularButton variant="primary" className="!px-10 !py-4 !text-[14px]" onClick={() => {
                                                if (service.title === 'Simulasi Kredit') {
                                                    setIsSimulasiOpen(true);
                                                } else {
                                                    window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Saya tertarik dengan layanan ${service.title}` } }));
                                                }
                                            }}>
                                                {service.cta}
                                            </AngularButton>
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
