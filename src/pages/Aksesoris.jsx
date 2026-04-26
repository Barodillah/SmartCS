import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, X } from 'lucide-react';
import aksesorisData from '../../knowledge/aksesoris.json';
import AngularButton from '../components/ui/AngularButton';
import { ANGULAR_CLIP } from '../utils/constants';

const AksesorisCard = ({ item, isBento = false, index, modelName, onClick }) => {
    // For Bento Grid styling
    const spanClasses = isBento ? (
        index % 3 === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"
    ) : "";

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`cursor-pointer group relative overflow-hidden bg-[#1A1A1A] border border-white/5 hover:border-[#E60012]/30 transition-all duration-500 ${spanClasses}`}
        >
            <div className={`relative w-full overflow-hidden ${isBento ? "h-full min-h-[200px]" : "aspect-[3/2]"}`}>
                {item.img ? (
                    <img
                        src={item.img}
                        alt={item.item}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Settings className="w-12 h-12 text-zinc-700" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end ${isBento ? 'h-full' : ''}`}>
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2">{item.item}</h3>
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <p className="text-[#E60012] font-bold text-lg">
                            Rp {item.price.toLocaleString('id-ID')}
                        </p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Saya tertarik memesan ${item.item} untuk model ${modelName}` } }));
                            }}
                            className="bg-white/10 hover:bg-[#E60012] p-2 rounded-full transition-colors duration-300 backdrop-blur-sm"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Aksesoris = () => {
    const data = aksesorisData.mitsubishi_accessories;
    const models = Object.keys(data).map(k => k.replace(/_/g, ' '));
    const [activeTab, setActiveTab] = useState(models[0]);
    const [selectedAksesoris, setSelectedAksesoris] = useState(null);

    const activeKey = activeTab.replace(/ /g, '_');
    const currentData = data[activeKey];

    return (
        <div className="min-h-screen bg-[#111111] pt-32 pb-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                {/* Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <div className="w-12 h-12 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                            <Settings size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-tight">
                            Aksesoris <span className="text-[#E60012]">Resmi</span>
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/60 max-w-2xl font-light"
                    >
                        Tingkatkan kenyamanan dan tampilan kendaraan Mitsubishi Anda dengan aksesoris resmi yang dirancang khusus untuk durabilitas dan presisi.
                    </motion.p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-4">
                    {models.map((model) => (
                        <button
                            key={model}
                            onClick={() => setActiveTab(model)}
                            className={`px-6 py-3 font-display text-sm md:text-base font-bold tracking-wider uppercase transition-all duration-300 relative ${
                                activeTab === model ? 'text-white' : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {model}
                            {activeTab === model && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#E60012]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-24"
                    >
                        {/* Paket Aksesoris (Bento Grid) */}
                        {currentData.paket_aksesoris && currentData.paket_aksesoris.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-display font-bold text-white uppercase border-l-4 border-[#E60012] pl-4">
                                        Paket Aksesoris
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                                    {currentData.paket_aksesoris.map((item, idx) => (
                                        <AksesorisCard key={idx} item={item} isBento={true} index={idx} modelName={activeTab} onClick={() => setSelectedAksesoris(item)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Eksterior */}
                        {currentData.exterior && currentData.exterior.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-display font-bold text-white uppercase border-l-4 border-[#E60012] pl-4">
                                        Eksterior
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentData.exterior.map((item, idx) => (
                                        <AksesorisCard key={idx} item={item} index={idx} modelName={activeTab} onClick={() => setSelectedAksesoris(item)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Interior */}
                        {currentData.interior && currentData.interior.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-display font-bold text-white uppercase border-l-4 border-[#E60012] pl-4">
                                        Interior
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentData.interior.map((item, idx) => (
                                        <AksesorisCard key={idx} item={item} index={idx} modelName={activeTab} onClick={() => setSelectedAksesoris(item)} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Modal Detail Aksesoris */}
                <AnimatePresence>
                    {selectedAksesoris && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
                            onClick={() => setSelectedAksesoris(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative bg-[#111111] w-full max-w-5xl overflow-hidden shadow-2xl"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                <div className="absolute inset-0 border border-white/10 pointer-events-none" style={{ clipPath: ANGULAR_CLIP }}></div>
                                
                                <button
                                    onClick={() => setSelectedAksesoris(null)}
                                    className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] p-2 bg-black/50 hover:bg-[#E60012] text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <X size={24} />
                                </button>
                                
                                <div className="flex flex-col md:flex-row h-full max-h-[85vh] overflow-y-auto custom-scrollbar">
                                    <div className="w-full md:w-3/5 bg-[#1A1A1A] flex items-center justify-center p-8 md:p-12 relative min-h-[40vh]">
                                        {/* Background gradient effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#E60012]/10 to-transparent opacity-50"></div>
                                        
                                        {selectedAksesoris.img ? (
                                            <img 
                                                src={selectedAksesoris.img} 
                                                alt={selectedAksesoris.item} 
                                                className="relative z-10 max-w-full max-h-[40vh] md:max-h-[60vh] object-contain drop-shadow-2xl" 
                                            />
                                        ) : (
                                            <Settings className="w-32 h-32 text-zinc-800 relative z-10" />
                                        )}
                                    </div>
                                    <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-b from-[#151515] to-[#111111]">
                                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/50 tracking-wider uppercase mb-4 w-fit">
                                            {activeTab}
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 leading-tight">
                                            {selectedAksesoris.item}
                                        </h3>
                                        <p className="text-white/60 mb-6 font-light leading-relaxed text-lg">
                                            Tingkatkan fungsionalitas dan estetika {activeTab} Anda dengan {selectedAksesoris.item} resmi dari Mitsubishi Motors. Didesain secara presisi untuk menjamin kualitas dan durabilitas maksimal.
                                        </p>

                                        {selectedAksesoris.include && selectedAksesoris.include.length > 0 && (
                                            <div className="mb-8 bg-white/5 p-4 border border-white/10" style={{ clipPath: ANGULAR_CLIP }}>
                                                <h4 className="text-white/80 font-bold mb-3 text-sm uppercase tracking-wider">Item Termasuk:</h4>
                                                <ul className="space-y-2">
                                                    {selectedAksesoris.include.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-white/60 text-sm">
                                                            <div className="w-1.5 h-1.5 bg-[#E60012] mt-1.5 shrink-0 transform rotate-45"></div>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-8 border-t border-white/10">
                                            <div className="text-sm text-white/50 mb-2 font-medium uppercase tracking-wider">Estimasi Harga (Pricelist)</div>
                                            <div className="text-3xl md:text-4xl font-bold text-[#E60012] mb-8 font-display">
                                                Rp {selectedAksesoris.price.toLocaleString('id-ID')}
                                            </div>
                                            <AngularButton 
                                                variant="primary" 
                                                className="w-full !py-4"
                                                onClick={() => {
                                                    setSelectedAksesoris(null);
                                                    window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Saya tertarik memesan ${selectedAksesoris.item} untuk model ${activeTab}` } }));
                                                }}
                                            >
                                                Pesan via DINA Sekarang
                                            </AngularButton>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Aksesoris;
