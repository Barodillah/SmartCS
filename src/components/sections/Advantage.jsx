import React from 'react';
import SectionTag from '../ui/SectionTag';
import { ANGULAR_CLIP } from '../../utils/constants';

const Advantage = () => {
    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-16">
                <div className="w-full md:w-1/2">
                    <div className="relative aspect-video">
                        <img src="https://images.unsplash.com/photo-1562519819-016930ada31b?auto=format&fit=crop&q=80&w=1000" alt="Showroom" className="w-full h-full object-cover" />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E60012] hidden lg:flex items-center justify-center p-6 text-center" style={{ clipPath: ANGULAR_CLIP }}>
                            <span className="font-display font-black text-white text-[12px] uppercase leading-none tracking-widest">Terpercaya di Bintaro</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <SectionTag>Keunggulan</SectionTag>
                    <h2 className="font-display font-extrabold text-[36px] text-[#111111] uppercase mb-6">Mengapa Dwindo Bintaro?</h2>
                    <div className="space-y-8">
                        {[
                            { t: "Fasilitas Modern", d: "Showroom dan bengkel dengan standar global Mitsubishi Motors." },
                            { t: "Teknisi Tersertifikasi", d: "Tim ahli yang dilatih khusus untuk merawat kendaraan Mitsubishi Anda." },
                            { t: "Lokasi Strategis", d: "Terletak di jantung Bintaro untuk akses yang lebih mudah dan cepat." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="font-display font-black text-4xl text-[#E60012]/75 leading-none">0{i + 1}</div>
                                <div>
                                    <h4 className="font-display font-bold text-lg uppercase text-[#111111] mb-1">{item.t}</h4>
                                    <p className="text-sm text-gray-500">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Advantage;
