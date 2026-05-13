import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ChevronRight, MessageCircle, Home } from 'lucide-react';

const API_BASE = 'https://csdwindo.com/api/panel/sales_survey_link.php';

const CustomerSurvey = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    
    const [pkt, setPkt] = useState('Yes');
    const [est, setEst] = useState('');
    const [note, setNote] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const res = await fetch(`${API_BASE}?action=get_survey_link&uuid=${uuid}`);
                const result = await res.json();
                
                if (result.status) {
                    setData(result.data);
                } else {
                    setError(result.message || 'Link survey tidak valid');
                }
            } catch (err) {
                setError('Gagal menghubungi server. Periksa koneksi internet Anda.');
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            fetchSurveyData();
        } else {
            setError('Link survey tidak lengkap');
            setLoading(false);
        }
    }, [uuid]);

    useEffect(() => {
        // We can communicate with PublicLayout via URL parameters or standard events, but since we are modifying PublicLayout anyway, we'll just let PublicLayout check the path. 
        // Here we just handle the completed state
        if (completed) {
            // If completed, update the URL so PublicLayout knows to show VirtualCS again
            navigate(`/survey/${uuid}?completed=1`, { replace: true });
        }
    }, [completed, navigate, uuid]);

    const maskPhone = (phone) => {
        if (!phone) return '';
        const p = phone.toString();
        if (p.length <= 4) return p;
        return '****-****-' + p.slice(-4);
    };

    const getNoteLabel = () => {
        if (!est) return 'Catatan Tambahan';
        const score = parseInt(est);
        if (score >= 9) return 'Apa yang membuat Bapak/Ibu puas?';
        if (score >= 7) return 'Apakah ada saran untuk pelayanan sales kami?';
        return 'Apakah ada kendala yang dialami?';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!est) {
            alert('Mohon pilih nilai rekomendasi terlebih dahulu.');
            return;
        }

        setSubmitting(true);
        let statusStr = 'KOMPLEN';
        const score = parseInt(est);
        if (score >= 9) statusStr = 'PUAS';
        else if (score >= 7) statusStr = 'BIASA SAJA';

        try {
            const res = await fetch(`${API_BASE}?action=submit_survey_link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid,
                    status: statusStr,
                    est: est,
                    note: note,
                    pkt: pkt
                })
            });
            const result = await res.json();
            if (result.status) {
                setCompleted(true);
            } else {
                alert(result.message || 'Gagal mengirim survey');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSubmitting(false);
        }
    };

    const triggerDina = () => {
        // VirtualCS relies on a specific state, we will add an event to window to open it
        const event = new CustomEvent('openDinaChat');
        window.dispatchEvent(event);
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#E60012] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium text-sm animate-pulse">Memuat data survey...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Dapat Mengakses Survey</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="bg-[#E60012] text-white px-6 py-2.5 rounded-lg font-bold w-full hover:bg-red-700 transition-colors">
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-red-500/5 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E60012] to-red-400"></div>
                    
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                        className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </motion.div>
                    
                    <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Terima Kasih!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Survey Anda telah berhasil dikirim. Tanggapan Anda sangat berharga bagi kami untuk terus meningkatkan pelayanan di <strong>Mitsubishi Dwindo Bintaro</strong>.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button onClick={triggerDina} className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors group">
                            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                            Tanya DINA (Customer Service)
                        </button>
                        <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-50 text-[#E60012] rounded-xl font-bold hover:bg-red-100 transition-colors">
                            <Home size={18} />
                            Kembali ke Beranda
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-body">
            <div className="max-w-2xl mx-auto">
                
                <div className="mb-8 text-center">
                    <img src="/logo/mitsubishi_logo.svg" alt="Mitsubishi" className="h-10 mx-auto mb-4" />
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Survey Pelayanan Sales</h1>
                    <p className="text-gray-500 mt-2">PT Dwindo Berlian Samjaya Bintaro</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gray-900 px-6 py-4 flex items-center justify-between text-white">
                        <h2 className="font-bold text-sm uppercase tracking-wider">Data Pembelian</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nama Konsumen</span>
                            <span className="font-medium text-gray-900">{data.nama}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nomor Telepon</span>
                            <span className="font-mono text-gray-900">0{maskPhone(data.telp)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Kendaraan</span>
                            <span className="font-medium text-gray-900">{data.kendaraan}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">No. Rangka</span>
                            <span className="font-mono text-gray-900">{data.rangka}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg shadow-red-500/5 border border-red-100 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">
                        
                        {/* Question 1 */}
                        <div className="space-y-3">
                            <label className="block text-base font-bold text-gray-900">
                                1. Apakah sales mengikuti proses penyerahan kendaraan Bapak/Ibu?
                            </label>
                            <div className="flex gap-3">
                                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-all ${pkt === 'Yes' ? 'border-[#E60012] bg-red-50 text-[#E60012] font-bold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                    <input type="radio" name="pkt" value="Yes" checked={pkt === 'Yes'} onChange={() => setPkt('Yes')} className="sr-only" />
                                    Ya, Mengikuti
                                </label>
                                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-all ${pkt === 'No' ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                    <input type="radio" name="pkt" value="No" checked={pkt === 'No'} onChange={() => setPkt('No')} className="sr-only" />
                                    Tidak
                                </label>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Question 2 */}
                        <div className="space-y-4">
                            <label className="block text-base font-bold text-gray-900">
                                2. Apakah bapak/ibu puas dan merasa terbantu dengan pelayanan sales kami?
                                <span className="block text-sm font-normal text-gray-500 mt-1">Beri nilai dari 1 (Sangat Tidak Puas) hingga 10 (Sangat Puas).</span>
                            </label>
                            
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                    const isSelected = est === String(num);
                                    
                                    // Determine color based on value
                                    let colorClass = 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50';
                                    if (isSelected) {
                                        if (num >= 9) colorClass = 'border-[#25D366] bg-[#25D366] text-white shadow-md scale-110 z-10';
                                        else if (num >= 7) colorClass = 'border-[#FFC107] bg-[#FFC107] text-white shadow-md scale-110 z-10';
                                        else colorClass = 'border-[#E60012] bg-[#E60012] text-white shadow-md scale-110 z-10';
                                    }

                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setEst(String(num))}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-sm md:text-base font-bold transition-all border-2 ${colorClass}`}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                                <span>Sangat Tidak Puas</span>
                                <span>Sangat Puas</span>
                            </div>
                        </div>

                        {/* Question 3 */}
                        <AnimatePresence>
                            {est && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    className="space-y-3 overflow-hidden"
                                >
                                    <label className="block text-base font-bold text-gray-900">
                                        3. {getNoteLabel()}
                                    </label>
                                    <textarea 
                                        value={note} 
                                        onChange={(e) => setNote(e.target.value)} 
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#E60012] focus:ring-4 focus:ring-red-50 text-gray-800 transition-all resize-none" 
                                        placeholder="Ketik jawaban Anda di sini..." 
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className="px-6 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting || !est}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#E60012] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {submitting ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Mengirim...</>
                            ) : (
                                <>Kirim Survey <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="mt-8 text-center text-xs text-gray-400">
                    &copy; 2026 PT Dwindo Berlian Samjaya. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default CustomerSurvey;
