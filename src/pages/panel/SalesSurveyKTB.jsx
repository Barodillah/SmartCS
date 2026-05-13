import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ShieldAlert, Check, FileText, X, Filter, ChevronLeft, ChevronRight, Calendar, MapPin, User, Car, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import SurveySearchModal from '../../components/panel/survey/SurveySearchModal';

const API_BASE = 'https://csdwindo.com/api/panel/warranty_ktb.php';

const displayStatus = (status) => status === 'PKT' ? 'PERLU FOLLOW UP' : status;

const getBadgeColor = (status) => {
    const s = displayStatus(status);
    switch (s) {
        case 'PERLU FOLLOW UP': return 'bg-blue-100 text-blue-700';
        case 'PUAS': case 'PROMOTOR': return 'bg-green-100 text-green-700';
        case 'SARAN': case 'BIASA SAJA': return 'bg-yellow-100 text-yellow-700';
        case 'TIDAK PUAS': case 'KOMPLEN': case 'DETRACTOR': return 'bg-red-100 text-red-700';
        case 'TIDAK DIANGKAT': case 'NOMOR SALAH': case 'SALAH SAMBUNG': case 'PASSIVER': return 'bg-gray-100 text-gray-700';
        case 'PERJANJIAN': case 'DITOLAK/REJECT': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const calculateWaAge = (waDate) => {
    if (!waDate) return { text: '', days: 0 };
    const wa = new Date(waDate + 'T00:00:00+07:00');
    if (isNaN(wa.getTime())) return { text: '', days: 0 };
    const now = new Date();
    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    nowJakarta.setHours(0, 0, 0, 0);
    wa.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(Math.abs(nowJakarta - wa) / (1000 * 60 * 60 * 24));
    return { text: `${diffDays} hari`, days: diffDays };
};

const getWaAgeColor = (days) => {
    if (days > 10) return 'text-red-600 font-bold';
    if (days > 7) return 'text-orange-500 font-bold';
    if (days >= 3) return 'text-green-600 font-bold';
    return 'text-gray-400';
};

const SalesSurveyFollowUpModal = ({ isOpen, data, onClose }) => {
    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#E60012] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Follow Up Survey KTB</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-900">
                        <p className="mb-2"><strong>Script Follow Up:</strong></p>
                        <p>Perkenalkan saya dari Mitsubishi Bintaro, benar saya bicara dengan Bapak/Ibu <strong>{data.nama}</strong>?</p>
                        <p className="mt-2">Pada data kami Bapak/Ibu melakukan pembelian kendaraan <strong>{data.kendaraan}</strong> bersama Sales kami <strong>{data.sales}</strong>, apakah benar pak/bu?</p>
                        <p className="mt-2">Saya ingin bertanya mengenai pelayanan sales kami ya pak/bu,</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Apakah sales kami sudah menjelaskan fitur-fitur kendaraannya?</li>
                            <li>Apakah bapak/ibu puas dan merasa terbantu dengan pelayanan sales kami?</li>
                            <li>Apakah bapak/ibu ada saran atau masukan untuk pelayanan sales kami?</li>
                        </ul>
                    </div>

                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white text-sm font-bold rounded shadow-md hover:bg-black transition-colors">
                        Tutup
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SalesSurveyDetailModal = ({ isOpen, data, onClose, onFollowUp }) => {
    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Detail Survey KTB</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Nama Konsumen</span>
                                <span className="font-bold text-base">{data.nama}</span>
                            </div>
                            {data.wa_date && (
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs">Umur (dari WA)</span>
                                    <span className={`font-bold text-base ${getWaAgeColor(calculateWaAge(data.wa_date).days)}`}>
                                        {calculateWaAge(data.wa_date).days} Hari
                                    </span>
                                    <span className="text-gray-400 text-[10px] mt-0.5">WA Date: {data.wa_date}</span>
                                </div>
                            )}
                            {data.pkt_date && !data.wa_date && (
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs">Umur (dari PKT)</span>
                                    <span className={`font-bold text-base ${getWaAgeColor(calculateWaAge(data.pkt_date).days)}`}>
                                        {calculateWaAge(data.pkt_date).days} Hari
                                    </span>
                                    <span className="text-gray-400 text-[10px] mt-0.5">PKT Date: {data.pkt_date}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">No. Telp / WhatsApp</span>
                            <span className="font-medium">{data.telp?.startsWith('0') ? data.telp : `0${data.telp}`}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Kendaraan</span><span className="font-medium">{data.kendaraan}</span></div>
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">No. Rangka</span><span className="font-medium">{data.rangka}</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Sales / SPV</span><span className="font-medium">{data.sales} / {data.spv}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Status Survey</span>
                                <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 ${getBadgeColor(data.status)}`}>{displayStatus(data.status)}</span></div>
                            </div>
                        </div>
                        {(data.est || data.note) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-col mb-2"><span className="text-gray-500 text-xs">Estimasi Nilai</span><span className="font-medium">{data.est || '-'}</span></div>
                                <div className="flex flex-col"><span className="text-gray-500 text-xs">Catatan</span><span className="font-medium">{data.note || '-'}</span></div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white items-center">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Tutup</button>
                    {!['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'NOMOR SALAH', 'SALAH SAMBUNG'].includes(data.status) && (
                        <button onClick={() => onFollowUp(data)}
                            className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                            Tindak Lanjut (Follow Up)
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const VehicleInfoIcon = ({ rangka, kendaraan, nama, telp, onClick }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!rangka) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetch(`https://runner.cuma.click/api/vehicles/${rangka}`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success' && res.data) {
                    setData(res.data);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [rangka]);

    if (loading) {
        return <div className="ml-2 w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#E60012] animate-spin inline-block"></div>;
    }

    if (data) {
        return (
            <button 
                onClick={(e) => { e.stopPropagation(); onClick(data); }} 
                className="inline-flex items-center justify-center p-1 bg-red-50 text-[#E60012] rounded hover:bg-[#E60012] hover:text-white transition-colors ml-2" 
                title="Lihat Data KTB Runner"
            >
                <MapPin size={14} />
            </button>
        );
    }

    const waText = encodeURIComponent(`Halo Bapak/Ibu ${nama},\n\nTerima kasih telah mempercayakan pembelian kendaraan Mitsubishi di Dealer kami.\n\nKami ingin menginformasikan bahwa untuk setiap pembelian Unit Canter, Bapak/Ibu mendapatkan fasilitas *GRATIS GPS Runner* untuk unit berikut:\n\nKendaraan: ${kendaraan}\nNo. Rangka: ${rangka}\n\nSangat disarankan untuk segera melakukan aktivasi, karena sayang sekali jika tidak dimanfaatkan mumpung masih gratis dan dilengkapi dengan berbagai fitur canggih untuk memantau kendaraan Bapak/Ibu.\n\nJika Bapak/Ibu ingin melakukan aktivasi, bisa langsung melalui link berikut:\nhttps://runner.csdwindo.com\n\nJika ada pertanyaan lebih lanjut atau butuh bantuan aktivasi, silakan balas pesan ini ya.\n\nTerima kasih dan salam hangat.`);
    const waNumber = telp?.startsWith('0') ? `62${telp.substring(1)}` : telp;

    return (
        <a 
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center p-1 bg-green-50 text-green-600 rounded hover:bg-green-600 hover:text-white transition-colors ml-2"
            title="Kirim WA Reminder Aktivasi GPS Runner"
        >
            <MessageCircle size={14} />
        </a>
    );
};

const RunnerDetailModal = ({ isOpen, data, onClose }) => {
    if (!isOpen || !data) return null;
    const { vehicle, customer } = data;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><MapPin size={20} className="text-[#E60012]" />Data Runner</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] flex flex-col gap-6">
                    {/* Vehicle Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#E60012]"></div>
                        <div className="flex items-center gap-2 mb-3 text-gray-800 border-b border-gray-100 pb-2">
                            <Car size={16} className="text-[#E60012]" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Detail Kendaraan</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">No. Rangka</span>
                                <span className="font-mono font-medium text-gray-800">{vehicle?.rangka || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Status</span>
                                <span className="font-medium text-gray-800">
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">{vehicle?.status || '-'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-800"></div>
                        <div className="flex items-center gap-2 mb-3 text-gray-800 border-b border-gray-100 pb-2">
                            <User size={16} className="text-gray-800" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Detail Customer</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Perusahaan</span>
                                <span className="font-bold text-gray-800">{customer?.company || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Nama PIC</span>
                                <span className="font-medium text-gray-800">{customer?.nama || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Username</span>
                                <span className="font-medium text-gray-600">{customer?.username || '-'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">No. Telp</span>
                                <span className="font-mono text-gray-600">{customer?.telp || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:col-span-2">
                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Email</span>
                                <span className="font-medium text-gray-600">{customer?.email || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white bg-gray-800 rounded shadow-md hover:bg-black transition-colors">
                        Tutup
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SalesSurveyKTB = () => {
    const [surveys, setSurveys] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterBelum, setFilterBelum] = useState(false);
    const [belumCount, setBelumCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [followUpData, setFollowUpData] = useState(null);
    const [runnerData, setRunnerData] = useState(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const monthPickerRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() - 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m); setSearchQuery(''); setFilterBelum(false);
    };

    const handleNextMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() + 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m); setSearchQuery(''); setFilterBelum(false);
    };

    const getMonthLabel = () => {
        if (!month) return 'Semua Data';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const fetchSurveys = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `${API_BASE}?action=list&source=survey`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                let fetchedData = data.data || [];

                // Filter data
                // Tampilkan data dengan status PKT (atau yang sudah disurvey)
                // Filter bulan: bulan ini adalah semua data PKT dengan pkt_date bulan sebelumnya
                fetchedData = fetchedData.filter(item => {
                    const isSurveyed = ['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN', 'SARAN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'PERJANJIAN', 'SALAH SAMBUNG'].includes(item.status);
                    
                    // We only want items that are at least PKT
                    if (item.status !== 'PKT' && !isSurveyed) return false;

                    if (month && !searchQuery) {
                        // Range: tanggal 26 bulan lalu s/d tanggal 25 bulan ini
                        // Contoh: data Mei = pkt_date 26 April - 25 Mei
                        const selected = new Date(month + '-01');
                        const startDate = new Date(selected.getFullYear(), selected.getMonth() - 1, 26); // 26 bulan lalu
                        const endDate = new Date(selected.getFullYear(), selected.getMonth(), 25); // 25 bulan ini

                        if (!item.pkt_date) return false;
                        const pktDate = new Date(item.pkt_date + 'T00:00:00');
                        if (pktDate < startDate || pktDate > endDate) return false;
                    }
                    return true;
                });

                // Calculate belum count
                const belum = fetchedData.filter(item => item.status === 'PKT').length;
                setBelumCount(belum);

                if (filterBelum) {
                    fetchedData = fetchedData.filter(item => item.status === 'PKT');
                }

                // Sort PKT to top or by pkt_date
                fetchedData.sort((a, b) => {
                    if (a.status === 'PKT' && b.status !== 'PKT') return -1;
                    if (a.status !== 'PKT' && b.status === 'PKT') return 1;
                    return new Date(b.pkt_date || 0) - new Date(a.pkt_date || 0);
                });

                setSurveys(fetchedData);
            } else {
                showToast('Gagal memuat data survey', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, month, filterBelum]);

    useEffect(() => { fetchSurveys(); }, [fetchSurveys]);



    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><FileText size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Sales Survey KTB</h1>
                        <p className="text-gray-500 text-sm mt-1">Lakukan follow up dan update data survey konsumen KTB.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative" ref={monthPickerRef}>
                        <button onClick={() => setIsSearchOpen(true)}
                            className="p-1.5 bg-red-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors mr-1 border border-red-100"
                            title="Cari Data Survey">
                            <Search size={16} />
                        </button>

                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>

                        {searchQuery ? (
                            <div className="flex items-center gap-2 bg-red-50 text-[#E60012] px-3 py-1.5 rounded text-sm font-bold border border-red-100 whitespace-nowrap">
                                <span>Hasil: "{searchQuery}"</span>
                                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-red-200 rounded text-red-700 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                                onClick={() => setShowMonthPicker(!showMonthPicker)}>
                                <Calendar size={16} className="text-[#E60012]" />
                                {getMonthLabel()}
                            </div>
                        )}

                        <AnimatePresence>
                            {showMonthPicker && (
                                <CustomMonthPicker
                                    currentMonth={month}
                                    onSelect={(m) => { setMonth(m); setShowMonthPicker(false); setSearchQuery(''); setFilterBelum(false); }}
                                    onClose={() => setShowMonthPicker(false)}
                                />
                            )}
                        </AnimatePresence>

                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button onClick={() => { setFilterBelum(!filterBelum); setSearchQuery(''); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-bold border transition-colors h-10 ${filterBelum ? 'bg-[#E60012] text-white border-[#E60012]' : 'bg-white text-gray-600 border-[#E5E5E5] hover:bg-gray-50'}`}>
                        <Filter size={14} />Belum FU {belumCount > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterBelum ? 'bg-white/20' : 'bg-[#E60012] text-white'}`}>{belumCount}</span>}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-3">Nama</div><div className="col-span-2">No. Telp</div>
                    <div className="col-span-3">Kendaraan / Rangka</div><div className="col-span-2">Sales / SPV</div><div className="col-span-2">Status</div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 md:p-0 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div></div>
                    ) : surveys.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><FileText size={32} /></div>
                            <p className="text-gray-500 text-sm">Tidak ada data survey ditemukan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {surveys.map((item) => (
                                <div key={item.id} onClick={() => setDetailData(item)}
                                    className="p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                >
                                    <div className="flex justify-between items-start md:col-span-3 md:block">
                                        <div>
                                            <span className="text-xs font-medium text-gray-400 md:hidden block mb-0.5">Nama Konsumen</span>
                                            <div className="font-bold text-sm text-[#111111]">{item.nama}</div>
                                        </div>
                                        <div className="md:hidden flex flex-col items-end gap-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{displayStatus(item.status)}</span>
                                            {item.pkt_date && <span className={`text-[10px] ${getWaAgeColor(calculateWaAge(item.pkt_date).days)}`}>{calculateWaAge(item.pkt_date).text}</span>}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 font-mono text-sm text-gray-600">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">No. Telp</span>
                                        {item.telp?.startsWith('0') ? item.telp : `0${item.telp}`}
                                    </div>

                                    <div className="md:col-span-3 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Kendaraan / Rangka</span>
                                        <div className="font-bold text-gray-800">{item.kendaraan}</div>
                                        <div className="font-mono mt-0.5 text-gray-500 flex items-center">
                                            {item.rangka}
                                            <VehicleInfoIcon rangka={item.rangka} kendaraan={item.kendaraan} nama={item.nama} telp={item.telp} onClick={(data) => setRunnerData(data)} />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Sales / SPV</span>
                                        <div className="font-bold text-gray-800">{item.sales}</div>
                                        <div className="mt-0.5 text-gray-500">{item.spv}</div>
                                    </div>

                                    <div className="hidden md:flex md:col-span-2 flex-col gap-1 items-start">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{displayStatus(item.status)}</span>
                                        {item.pkt_date && <span className={`text-[10px] ${getWaAgeColor(calculateWaAge(item.pkt_date).days)}`}>{calculateWaAge(item.pkt_date).text}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {detailData && <SalesSurveyDetailModal isOpen={!!detailData} data={detailData} onClose={() => setDetailData(null)}
                    onFollowUp={(d) => { setDetailData(null); setFollowUpData(d); }} />}
            </AnimatePresence>
            <AnimatePresence>
                {followUpData && <SalesSurveyFollowUpModal isOpen={!!followUpData} data={followUpData} onClose={() => setFollowUpData(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {runnerData && <RunnerDetailModal isOpen={!!runnerData} data={runnerData} onClose={() => setRunnerData(null)} />}
            </AnimatePresence>

            <SurveySearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={(item) => setDetailData(item)}
                onSearchSubmit={(q) => { setSearchQuery(q); setMonth(''); setFilterBelum(false); }}
                apiBase={`${API_BASE}?source=survey`}
            />

            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {toast.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}{toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalesSurveyKTB;
