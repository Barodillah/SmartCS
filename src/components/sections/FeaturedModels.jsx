import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionTag from '../ui/SectionTag';
import AngularButton from '../ui/AngularButton';
import { ANGULAR_CLIP, formatCurrency, models } from '../../utils/constants';

const FeaturedModels = () => {
    return (
        <section className="py-24 px-6 bg-[#F5F5F5]">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block">
                        <SectionTag>Lini Kendaraan</SectionTag>
                    </div>
                    <h2 className="font-display font-extrabold text-[40px] text-[#111111] uppercase">Pilihan Terbaik Untuk Anda</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {models.map((model, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="bg-white group"
                        >
                            <div className="relative h-64 bg-gray-50/50 group-hover:bg-gray-100/50 transition-colors duration-500 rounded-t-xl">
                                <img 
                                    src={model.img} 
                                    alt={model.name} 
                                    className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.15] group-hover:-translate-y-6 group-hover:-rotate-1 group-hover:drop-shadow-2xl" 
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className={`${model.name === 'Fuso Canter' ? 'bg-[#FE5E00]' : 'bg-[#E60012]'} text-white font-display font-bold text-[9px] tracking-widest uppercase px-3 py-1 shadow-sm`} style={{ clipPath: ANGULAR_CLIP }}>
                                        {model.badge}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-display font-black text-2xl uppercase text-[#111111] mb-2">{model.name}</h3>
                                <div className="text-gray-400 text-xs mb-6 font-medium">Mulai Dari</div>
                                <div className={`font-display font-bold text-xl ${model.name === 'Fuso Canter' ? 'text-[#FE5E00]' : 'text-[#E60012]'} mb-8`}>
                                    {formatCurrency(model.price)}
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <Link to="/price-list" className={`text-[10px] font-display font-bold uppercase tracking-widest text-[#111111] ${model.name === 'Fuso Canter' ? 'hover:text-[#FE5E00]' : 'hover:text-[#E60012]'}`}>
                                        Lihat Detail
                                    </Link>
                                    <AngularButton variant="primary" className={`!px-4 !py-2 !text-[9px] ${model.name === 'Fuso Canter' ? '!bg-[#FE5E00] hover:!bg-[#cc4b00]' : ''}`} onClick={() => window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Saya ingin memesan ${model.name}` } }))}>Pesan Sekarang</AngularButton>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link to="/price-list">
                        <AngularButton variant="secondary">Lihat Model Lainnya</AngularButton>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedModels;
