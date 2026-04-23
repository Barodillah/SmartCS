import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import dealerData from '../../knowledge/lokasi_dealer.json';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import AngularButton from '../components/ui/AngularButton';
import { ANGULAR_CLIP } from '../utils/constants';

const DealerLocation = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-16 bg-[#F5F5F5] font-body">
            {/* Header Section */}
            <div className="bg-[#111111] py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                    <div className="w-full h-full bg-[#E60012]" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
                </div>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                    <h1 className="font-display font-black text-4xl md:text-5xl text-white uppercase mb-4 tracking-tight">Lokasi Dealer Kami</h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest">{dealerData.dealer}</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
                <div className="flex flex-col gap-16 max-w-5xl mx-auto mb-20">
                    {dealerData.branches.map((branch, idx) => (
                        <motion.div
                            key={branch.slug}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden relative group"
                            style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}
                        >
                            <div className="p-8 md:p-12 flex-1 flex flex-col justify-center bg-white z-10">
                                <h3 className="font-display font-black text-2xl md:text-3xl uppercase text-[#111111] mb-8 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#E60012] to-[#ff4d4d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E60012]/30" style={{ clipPath: ANGULAR_CLIP }}>
                                        <MapPin size={24} className="text-white" />
                                    </div>
                                    {branch.name}
                                </h3>

                                <div className="space-y-6 mb-10 flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-[#E60012] bg-[#E60012]/10 p-2.5 rounded-full"><MapPin size={20} /></div>
                                        <p className="text-gray-600 text-[15px] leading-relaxed pt-2">{branch.address}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-[#E60012] bg-[#E60012]/10 p-2.5 rounded-full"><Phone size={20} /></div>
                                        <p className="text-gray-800 font-bold text-lg tracking-wide">{branch.phone}</p>
                                    </div>
                                </div>

                                <div>
                                    <a
                                        href={branch.maps_direction}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-[#111111] text-white px-8 py-4 font-display font-bold uppercase tracking-widest text-[11px] hover:bg-[#E60012] transition-colors whitespace-nowrap"
                                        style={{ clipPath: ANGULAR_CLIP }}
                                    >
                                        Petunjuk Arah
                                    </a>
                                </div>
                            </div>

                            {/* Map Iframe */}
                            <div className="w-full md:w-[45%] lg:w-[50%] h-80 md:h-auto bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="absolute inset-0 w-full h-full"
                                    dangerouslySetInnerHTML={{
                                        __html: branch.embed_map.replace('width="600"', 'width="100%"').replace('height="450"', 'height="100%"').replace('style="border:0;"', 'style="border:0; width:100%; height:100%; min-height:100%; position:absolute; top:0; left:0;"')
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-20 text-center pt-16">
                    <h3 className="font-display font-black text-2xl uppercase text-[#111111] mb-6">Mencari Dealer di Kota Lain?</h3>
                    <a
                        href="https://www.mitsubishi-motors.co.id/cari-dealer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <AngularButton variant="primary" className="!px-8 !py-4 !text-[12px] flex items-center gap-2">
                            Cari Dealer Lainnya <ExternalLink size={16} />
                        </AngularButton>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DealerLocation;
