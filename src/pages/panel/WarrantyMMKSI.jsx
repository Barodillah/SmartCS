import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ShieldAlert, Check, FileText, X, Filter, ChevronLeft, ChevronRight, Calendar, Copy, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import SurveySearchModal from '../../components/panel/survey/SurveySearchModal';

const API_BASE = 'https://csdwindo.com/api/panel/sales_survey.php';

const getBadgeColor = (status) => {
    switch (status) {
        case 'PERLU FOLLOW UP': return 'bg-blue-100 text-blue-700';
        case 'PUAS': case 'PROMOTOR': case 'PKT': return 'bg-green-100 text-green-700';
        case 'SARAN': case 'BIASA SAJA': return 'bg-yellow-100 text-yellow-700';
        case 'TIDAK PUAS': case 'KOMPLEN': case 'DETRACTOR': return 'bg-red-100 text-red-700';
        case 'TIDAK DIANGKAT': case 'NOMOR SALAH': case 'SALAH SAMBUNG': case 'PASSIVER': return 'bg-gray-100 text-gray-700';
        case 'PERJANJIAN': case 'DITOLAK/REJECT': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const WarrantyModal = ({ isOpen, data, onClose, onSave, isLoading }) => {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-[#E60012] px-6 py-4 flex items-center justify-between text-white shrink-0 rounded-t-xl">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><ShieldAlert size={20} />Update Status PKT</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] flex-1 relative rounded-b-xl">
                    <p className="text-sm text-gray-600 mb-4">Ubah status PDI menjadi PKT untuk <strong>{data.nama}</strong>?</p>
                    <div className="relative" ref={datePickerRef}>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Warranty</label>
                        <div
                            className="flex items-center px-3 py-2 border border-gray-300 rounded cursor-pointer bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <Calendar size={16} className="text-[#E60012] mr-2" />
                            {tanggal}
                        </div>
                        <AnimatePresence>
                            {showDatePicker && (
                                <CustomDatePicker
                                    currentDate={tanggal}
                                    onSelect={(dateStr) => { setTanggal(dateStr); setShowDatePicker(false); }}
                                    onClose={() => setShowDatePicker(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Batal</button>
                    <button onClick={() => onSave({ ...data, wa_date: tanggal, status: 'PKT' })} disabled={isLoading}
                        className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Menyimpan...</> : 'Simpan'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const DetailKonsumenModal = ({ isOpen, data, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!isOpen || !data) return null;

    const ageInfo = calculateAge(data.pdi_date || data.tgl_pdi);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Detail Konsumen</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] overflow-y-auto flex-1">
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">ID</span>
                                <span className="font-mono font-bold text-base">{data.id}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Umur (dari PDI)</span>
                                <span className={`font-bold text-base ${getUmurColor(ageInfo.days)}`}>{ageInfo.text}</span>
                                {(data.pdi_date || data.tgl_pdi) && <span className="text-gray-400 text-[10px] mt-0.5">PDI: {data.pdi_date || data.tgl_pdi}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Nama Konsumen</span>
                            <span className="font-bold text-base">{data.nama}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">No. Telp / WhatsApp</span>
                            <span className="font-medium">0{data.telp}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Kendaraan</span><span className="font-medium">{data.kendaraan}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">No. Rangka</span>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:text-[#E60012] transition-colors group"
                                    onClick={() => handleCopy(data.rangka)}
                                    title="Klik untuk menyalin"
                                >
                                    <span className="font-mono font-medium">{data.rangka}</span>
                                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400 group-hover:text-[#E60012]" />}
                                </div>
                                {copied && <span className="text-[10px] text-green-500 font-bold animate-in fade-in slide-in-from-top-1">Berhasil disalin!</span>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Sales / SPV</span><span className="font-medium">{data.sales} / {data.spv}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Status</span>
                                <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 ${getBadgeColor(data.status)}`}>{data.status}</span></div>
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
                </div>
            </motion.div>
        </motion.div>
    );
};

const getUmurColor = (days) => {
    if (days > 30) return 'text-red-600 font-bold';
    if (days > 20) return 'text-orange-500 font-bold';
    return 'text-gray-600';
};

const ReminderModal = ({ isOpen, onClose, surveys }) => {
    const [copied, setCopied] = useState('');

    if (!isOpen) return null;

    const generateText = (filterType) => {
        const now = new Date();
        const filteredSurveys = surveys.filter(s => {
            const date = new Date(s.pdi_date || s.tgl_pdi);
            const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            if (filterType === 'all') return true;
            if (filterType === '>3') return days > 3 && days <= 20;
            if (filterType === '>20') return days > 20 && days < 30;
            if (filterType === 'expired') return days >= 30;
            return true;
        });

        filteredSurveys.sort((a, b) => {
            if (a.spv !== b.spv) return (a.spv || '').localeCompare(b.spv || '');
            return (a.sales || '').localeCompare(b.sales || '');
        });

        if (filteredSurveys.length === 0) return "Tidak ada data pada kategori ini.";

        let text = "";

        if (filterType === 'expired') {
            text += `*PDI EXPIRED - KONSUMEN TIDAK BISA SERVICE*\n\n`;
            let currentSpv = null;
            filteredSurveys.forEach(row => {
                const date = new Date(row.pdi_date || row.tgl_pdi);
                const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));

                if (currentSpv !== null && currentSpv !== row.spv) {
                    text += '\n';
                }
                currentSpv = row.spv;

                text += `- ${row.rangka} ${row.nama} *(${days} hari)* - ${row.sales}, ${row.spv}\n`;
            });
            return text;
        }

        let typeText = "Semua Data";
        if (filterType === '>3') typeText = "Lebih dari 3 Hari";
        if (filterType === '>20') typeText = "Lebih dari 20 Hari";

        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');

        text += `*REMINDER BELUM WA/PKT*\n\n`;
        text += `Siang semua,\n\n`;
        text += `_Data yang belum menyelesaikan Warranty Activation dan Lapor PKT (${typeText}) Per hari ini jam ${currentHour}:${currentMinute}_\n\n`;

        let currentSpv = null;
        filteredSurveys.forEach(row => {
            const date = new Date(row.pdi_date || row.tgl_pdi);
            const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));

            let mark = "";
            let prefix = "";
            let suffix = "";
            if (days > 5) { mark = "*"; prefix = "*"; suffix = "*"; }
            else if (days > 3) { mark = "_"; }

            if (currentSpv !== null && currentSpv !== row.spv) {
                text += '\n';
            }
            currentSpv = row.spv;

            text += `- ${prefix}${row.rangka} ${row.nama}${suffix} ${mark}(${days} hari)${mark} - ${row.sales}, ${row.spv}\n`;
        });

        text += `\n_Yang belum menyelesaikan Warranty Activation dan Lapor PKT harap segera, *dan diharapkan konsumen langsung yang menandatangani Warranty Activation.* Supaya tidak terjadi sesuatu yang tidak diinginkan kedepannya_\n\n`;
        text += `Semangat dan terima kasih! 💪`;

        return text;
    };

    const handleCopy = (filterType) => {
        const text = generateText(filterType);
        navigator.clipboard.writeText(text);
        setCopied(filterType);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><MessageCircle size={20} />Copy Reminder WA</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] flex flex-col gap-3">
                    <p className="text-sm text-gray-600 mb-2">Pilih kategori data yang ingin disalin untuk dikirim ke WhatsApp Group.</p>

                    <button onClick={() => handleCopy('all')} className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#E60012] hover:bg-red-50 transition-colors">
                        <span className="font-bold text-gray-700">Semua Data</span>
                        {copied === 'all' ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>

                    <button onClick={() => handleCopy('>3')} className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#E60012] hover:bg-red-50 transition-colors">
                        <span className="font-bold text-gray-700">&gt; 3 Hari</span>
                        {copied === '>3' ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>

                    <button onClick={() => handleCopy('>20')} className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#E60012] hover:bg-red-50 transition-colors">
                        <span className="font-bold text-gray-700">&gt; 20 Hari</span>
                        {copied === '>20' ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400" />}
                    </button>

                    <button onClick={() => handleCopy('expired')} className="flex items-center justify-between w-full p-3 bg-white border border-red-200 rounded-lg hover:border-[#E60012] hover:bg-red-50 transition-colors">
                        <span className="font-bold text-[#E60012]">Expired (&ge; 30 Hari)</span>
                        {copied === 'expired' ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-red-400" />}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const calculateAge = (pdiDate) => {
    if (!pdiDate) return { text: '-', days: 0 };
    const pdi = new Date(pdiDate + 'T00:00:00+07:00');
    if (isNaN(pdi.getTime())) return { text: '-', days: 0 };
    const now = new Date();
    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    nowJakarta.setHours(0, 0, 0, 0);
    pdi.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(nowJakarta - pdi);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { text: `${diffDays} Hari`, days: diffDays };
};

const WarrantyMMKSI = () => {
    const [surveys, setSurveys] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [warrantyData, setWarrantyData] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isReminderOpen, setIsReminderOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchSurveys = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `${API_BASE}?action=list&filter=pdi`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                const allData = data.data || [];
                const filteredData = allData.filter(item => item.status === 'PDI');
                const result = filteredData.length > 0 ? filteredData : allData;
                result.sort((a, b) => {
                    const dateA = new Date(a.pdi_date || a.tgl_pdi || '9999-12-31');
                    const dateB = new Date(b.pdi_date || b.tgl_pdi || '9999-12-31');
                    return dateA - dateB;
                });
                setSurveys(result);
            } else {
                showToast('Gagal memuat data survey', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

    const handleSave = async (updatedData) => {
        setIsSaving(true);
        try {
            const res = await fetch(API_BASE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: updatedData.id,
                    status: updatedData.status,
                    wa_date: updatedData.wa_date,
                    est: updatedData.est,
                    note: updatedData.note,
                    pkt: updatedData.pkt
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(data.message || 'Status berhasil diubah menjadi PKT');
                setWarrantyData(null);
                setSurveys(prev => prev.map(s => s.id === updatedData.id ? { ...s, status: updatedData.status, wa_date: updatedData.wa_date } : s));
            } else {
                showToast(data.message || 'Gagal menyimpan', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><ShieldAlert size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Cek Warranty MMKSI</h1>
                        <p className="text-gray-500 text-sm mt-1">Ubah status PDI menjadi PKT dan atur tanggal warranty.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative">
                        <button onClick={() => setIsSearchOpen(true)}
                            className="p-1.5 bg-red-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors border border-red-100 flex items-center gap-2 px-3"
                            title="Cari Data">
                            <Search size={16} />
                            <span className="text-sm font-bold">Cari Data</span>
                        </button>

                        <button onClick={() => setIsReminderOpen(true)}
                            className="p-1.5 bg-orange-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors border border-orange-100 flex items-center gap-2 px-3 ml-1"
                            title="Copy Reminder WA">
                            <MessageCircle size={16} />
                            <span className="text-sm font-bold">({surveys.length}) Belum Warranty</span>
                        </button>

                        {searchQuery && (
                            <div className="flex items-center gap-2 bg-red-50 text-[#E60012] px-3 py-1.5 rounded text-sm font-bold border border-red-100 whitespace-nowrap ml-1">
                                <span>Hasil: "{searchQuery}"</span>
                                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-red-200 rounded text-red-700 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-3">Nama</div>
                    <div className="col-span-3">Kendaraan / Rangka</div>
                    <div className="col-span-2">Sales / SPV</div>
                    <div className="col-span-2">Status / Umur</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div></div>
                    ) : surveys.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><ShieldAlert size={32} /></div>
                            <p className="text-gray-500 text-sm">Tidak ada data ditemukan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {surveys.map((item) => {
                                const ageInfo = calculateAge(item.pdi_date || item.tgl_pdi);
                                return (
                                    <div key={item.id} onClick={() => setDetailData(item)}
                                        className="p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start md:col-span-3 md:block">
                                            <div>
                                                <span className="text-xs font-medium text-gray-400 md:hidden block mb-0.5">Nama Konsumen</span>
                                                <div className="font-bold text-sm text-[#111111]">{item.nama}</div>
                                                <div className="font-mono text-xs text-gray-500 mt-0.5">0{item.telp}</div>
                                            </div>
                                            <div className="md:hidden flex flex-col items-end gap-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{item.status}</span>
                                                <span className={`text-[10px] ${getUmurColor(ageInfo.days)}`}>Umur: {ageInfo.text}</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Kendaraan / Rangka</span>
                                            <div className="font-bold text-gray-800">{item.kendaraan}</div>
                                            <div className="font-mono mt-0.5 text-gray-500">{item.rangka}</div>
                                        </div>

                                        <div className="md:col-span-2 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Sales / SPV</span>
                                            <div className="font-bold text-gray-800">{item.sales}</div>
                                            <div className="mt-0.5 text-gray-500">{item.spv}</div>
                                        </div>

                                        <div className="hidden md:flex md:col-span-2 flex-col gap-1 items-start">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{item.status}</span>
                                            <span className={`text-xs ${getUmurColor(ageInfo.days)}`}>{ageInfo.text}</span>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setWarrantyData(item); }}
                                                disabled={item.status === 'PKT'}
                                                className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition-colors ${item.status === 'PKT' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#111111] hover:bg-gray-800 text-white'}`}
                                            >
                                                Warranty
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {detailData && <DetailKonsumenModal isOpen={!!detailData} data={detailData} onClose={() => setDetailData(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {warrantyData && <WarrantyModal isOpen={!!warrantyData} data={warrantyData} onClose={() => setWarrantyData(null)} onSave={handleSave} isLoading={isSaving} />}
            </AnimatePresence>
            <AnimatePresence>
                {isReminderOpen && <ReminderModal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} surveys={surveys} />}
            </AnimatePresence>

            <SurveySearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={(item) => setDetailData(item)}
                onSearchSubmit={(q) => setSearchQuery(q)}
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

export default WarrantyMMKSI;
