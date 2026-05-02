import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ShieldAlert, Check, FileText, X, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import SurveySearchModal from '../../components/panel/survey/SurveySearchModal';

const API_BASE = 'https://csdwindo.com/api/panel/sales_survey.php';

const getBadgeColor = (status) => {
    switch (status) {
        case 'PERLU FOLLOW UP': return 'bg-blue-100 text-blue-700';
        case 'PUAS': case 'PROMOTOR': return 'bg-green-100 text-green-700';
        case 'SARAN': case 'BIASA SAJA': return 'bg-yellow-100 text-yellow-700';
        case 'TIDAK PUAS': case 'KOMPLEN': case 'DETRACTOR': return 'bg-red-100 text-red-700';
        case 'TIDAK DIANGKAT': case 'NOMOR SALAH': case 'SALAH SAMBUNG': case 'PASSIVER': return 'bg-gray-100 text-gray-700';
        case 'PERJANJIAN': case 'DITOLAK/REJECT': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const SalesSurveyFollowUpModal = ({ isOpen, data, onClose, onSave, isLoading }) => {
    const [status, setStatus] = useState('');
    const [est, setEst] = useState('');
    const [note, setNote] = useState('');
    const [pkt, setPkt] = useState('No');

    useEffect(() => {
        if (data) {
            setStatus(data.status);
            setEst(data.est || '');
            setNote(data.note || '');
            setPkt(data.pkt || 'No');
        }
    }, [data]);

    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#E60012] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Follow Up Survey</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 bg-[#FAFAFA]">
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
                    <form id="surveyForm" onSubmit={(e) => {
                        e.preventDefault();
                        const isPktApplicable = ['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN'].includes(status);
                        onSave({ ...data, status, est, note, pkt: isPktApplicable ? pkt : 'No' });
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status Follow Up</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E60012] text-sm">
                                {['PERLU FOLLOW UP', 'PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN', 'SARAN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'PERJANJIAN', 'SALAH SAMBUNG'].map(s =>
                                    <option key={s} value={s}>{s}</option>
                                )}
                            </select>
                        </div>
                        {['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN'].includes(status) && (
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex gap-3 items-start cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setPkt(pkt === 'Yes' ? 'No' : 'Yes')}>
                                <input
                                    type="checkbox"
                                    id="pktCheck"
                                    className="mt-0.5 w-4 h-4 text-[#E60012] bg-white border-gray-300 rounded focus:ring-[#E60012] focus:ring-2 cursor-pointer"
                                    checked={pkt === 'Yes'}
                                    onChange={(e) => { e.stopPropagation(); setPkt(e.target.checked ? 'Yes' : 'No'); }}
                                />
                                <label htmlFor="pktCheck" className="text-sm font-bold text-gray-700 cursor-pointer select-none leading-tight flex-1" onClick={(e) => e.preventDefault()}>
                                    Apakah sales mengikuti proses penyerahan kendaraan?
                                </label>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Estimasi Nilai (1-10)</label>
                            <input type="text" value={est} onChange={(e) => setEst(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E60012] text-sm" placeholder="Estimasi nilai..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Catatan</label>
                            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E60012] text-sm" placeholder="Saran/keluhan konsumen..." />
                        </div>
                    </form>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Batal</button>
                    <button form="surveyForm" type="submit" disabled={isLoading}
                        className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Menyimpan...</> : 'Simpan Hasil'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SalesSurveyDetailModal = ({ isOpen, data, onClose, onFollowUp }) => {
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (data?.id) {
            setLoadingLogs(true);
            fetch(`${API_BASE}?action=logs&unit_id=${data.id}`)
                .then(r => r.json())
                .then(res => { if (res.status) setLogs(res.data || []); })
                .catch(() => { })
                .finally(() => setLoadingLogs(false));
        }
    }, [data]);

    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Detail Survey</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] overflow-y-auto flex-1">
                    <div className="space-y-4 text-sm">
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
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">No. Rangka</span><span className="font-medium">{data.rangka}</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Sales / SPV</span><span className="font-medium">{data.sales} / {data.spv}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Status Survey</span>
                                <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 ${getBadgeColor(data.status)}`}>{data.status}</span></div>
                            </div>
                        </div>
                        {(data.est || data.note) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-col mb-2"><span className="text-gray-500 text-xs">Estimasi Nilai</span><span className="font-medium">{data.est || '-'}</span></div>
                                <div className="flex flex-col"><span className="text-gray-500 text-xs">Catatan</span><span className="font-medium">{data.note || '-'}</span></div>
                            </div>
                        )}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Log Tindak Lanjut</h3>
                            {loadingLogs ? (
                                <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-2 border-[#E60012] border-t-transparent"></div></div>
                            ) : logs.length > 0 ? (
                                <div className="space-y-4">
                                    {logs.map((log, index) => (
                                        <div key={log.id || index} className="flex gap-3 text-xs relative">
                                            {index !== logs.length - 1 && <div className="absolute left-1 top-4 bottom-[-16px] w-[1px] bg-gray-200"></div>}
                                            <div className="w-2 h-2 mt-1 rounded-full bg-[#E60012] shrink-0 relative z-10"></div>
                                            <div className="flex-1 pb-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <span className="font-bold text-gray-800">{log.status}</span>
                                                    <span className="text-gray-400 text-[10px]">{log.date}</span>
                                                </div>
                                                {log.pkt && log.pkt !== 'No' && <div className="text-green-600 text-[10px] mb-1">PKT: {log.pkt}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-100 text-center">Belum ada riwayat follow up.</p>
                            )}
                        </div>
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

const SalesSurvey = () => {
    const [surveys, setSurveys] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterBelum, setFilterBelum] = useState(false);
    const [belumCount, setBelumCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [followUpData, setFollowUpData] = useState(null);
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
            let url = `${API_BASE}?action=list`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            else if (filterBelum) url += `&filter=belum`;
            else if (month) url += `&month=${month}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                setSurveys(data.data || []);
                setBelumCount(data.belum_follow_up || 0);
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

    const handleSave = async (updatedData) => {
        setIsSaving(true);
        try {
            const res = await fetch(API_BASE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: updatedData.id,
                    status: updatedData.status,
                    est: updatedData.est,
                    note: updatedData.note,
                    pkt: updatedData.pkt
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(data.message);
                setFollowUpData(null);
                fetchSurveys();
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
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><FileText size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Sales Survey</h1>
                        <p className="text-gray-500 text-sm mt-1">Lakukan follow up dan update data survey konsumen.</p>
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

                    <button onClick={() => { setFilterBelum(!filterBelum); setSearchQuery(''); setMonth(''); }}
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
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
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
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{item.status}</span>
                                            {item.est && <span className="text-[10px] text-gray-500 font-bold">Nilai: {item.est}</span>}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 font-mono text-sm text-gray-600">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">No. Telp</span>
                                        0{item.telp}
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
                                        {item.est && <span className="text-[10px] text-gray-500 font-bold">Nilai: {item.est}</span>}
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
                {followUpData && <SalesSurveyFollowUpModal isOpen={!!followUpData} data={followUpData} onClose={() => setFollowUpData(null)}
                    onSave={handleSave} isLoading={isSaving} />}
            </AnimatePresence>

            <SurveySearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={(item) => setDetailData(item)}
                onSearchSubmit={(q) => { setSearchQuery(q); setMonth(''); setFilterBelum(false); }}
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

export default SalesSurvey;
