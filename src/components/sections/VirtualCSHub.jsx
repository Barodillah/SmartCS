import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import SectionTag from '../ui/SectionTag';
import AngularButton from '../ui/AngularButton';
import { ANGULAR_CLIP } from '../../utils/constants';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const VirtualCSHub = () => {
    return (
        <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
            {/* High-tech Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E60012] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, #E60012 0px, #E60012 1px, transparent 1px, transparent 10px)' }}></div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

                {/* Left Column - Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={itemVariants}>
                        <SectionTag>Layanan Cerdas</SectionTag>
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="font-display font-black text-[40px] md:text-[56px] text-white uppercase leading-[1.1] mb-6 tracking-tighter">
                        DINA<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E60012] to-[#ff4d4d] italic pr-2 text-[20px] md:text-[28px] block mt-2">Dwindo Intelligent Assistant</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-gray-400 font-light text-lg mb-10 leading-relaxed max-w-lg">
                        Teknologi AI kami siap memberikan asisten eksklusif 24/7. Mulai dari konsultasi model terbaru, ketersediaan suku cadang, hingga penjadwalan servis—semuanya dalam satu ketukan cerdas.
                    </motion.p>

                    <motion.ul variants={itemVariants} className="space-y-4 mb-10">
                        {['Respon Instan Tanpa Antre', 'Integrasi Booking Langsung', 'Info Promo Terkini & Akurat'].map((item, idx) => (
                            <motion.li
                                key={item}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-4 text-white/90 font-display font-semibold text-[14px] tracking-wide p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-default"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#E60012]/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={16} className="text-[#E60012]" />
                                </div>
                                {item}
                            </motion.li>
                        ))}
                    </motion.ul>

                    <motion.div variants={itemVariants}>
                        <AngularButton variant="primary" onClick={() => document.getElementById('chat-trigger')?.click()} className="group">
                            <span className="flex items-center gap-2">
                                Tanya DINA Sekarang
                                <Sparkles size={16} className="group-hover:animate-pulse" />
                            </span>
                        </AngularButton>
                    </motion.div>
                </motion.div>

                {/* Right Column - Mock UI */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="relative perspective-[1000px]"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden"
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        {/* Mock UI Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#E60012] to-[#800000] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(230,0,18,0.5)]">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full"></div>
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-white text-sm tracking-widest uppercase">DINA</h4>
                                    <p className="text-[10px] text-green-400 font-mono">Dwindo Intelligent Assistant</p>
                                </div>
                            </div>
                            <MessageSquare size={20} className="text-white/20" />
                        </div>

                        {/* Mock Chat Sequence */}
                        <div className="space-y-6">
                            {/* User Bubble */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="flex justify-end"
                            >
                                <div className="bg-white/10 text-white/90 text-sm p-4 rounded-2xl rounded-tr-sm max-w-[80%] font-light">
                                    Kapan jadwal servis Xforce tersedia besok?
                                </div>
                            </motion.div>

                            {/* Typing Indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: [0, 1, 0] }}
                                transition={{ delay: 1.5, duration: 1.5 }}
                                className="flex justify-start"
                            >
                                <div className="bg-[#E60012]/20 border border-[#E60012]/30 p-4 rounded-2xl rounded-tl-sm w-16 flex justify-center gap-1">
                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#E60012] rounded-full"></motion.div>
                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#E60012] rounded-full"></motion.div>
                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#E60012] rounded-full"></motion.div>
                                </div>
                            </motion.div>

                            {/* Bot Bubble */}
                            <motion.div
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                whileInView={{ opacity: 1, x: 0, height: 'auto' }}
                                transition={{ delay: 3, duration: 0.5 }}
                                className="flex justify-start overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-[#E60012]/20 to-transparent border-l-2 border-[#E60012] text-white/90 text-sm p-4 max-w-[90%] font-light">
                                    Tersedia slot pada pukul 10:00 WIB dan 14:00 WIB besok. Ingin saya bantu <b>booking</b> sekarang untuk Xforce Anda?
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Floating Decorative Elements */}
                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-md p-4 flex items-center gap-3 border border-white/5"
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-white text-xs font-mono">24/7 AI ACTIVE</span>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
};

export default VirtualCSHub;
