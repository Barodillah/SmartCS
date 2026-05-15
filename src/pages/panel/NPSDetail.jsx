import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Calendar, Search, Car, User, FileText, Info, Trash2, Loader2, Check, AlertTriangle, BrainCircuit, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import NPSSearchModal from '../../components/panel/nps/NPSSearchModal';
import { parseChatMarkdown } from '../../utils/markdownParser';

const NPSDetail = () => {
    const navigate = useNavigate();
    const [month, setMonth] = useState('2026-04');
    const [cabang, setCabang] = useState('All');
    const [divisi, setDivisi] = useState('Sales');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const monthPickerRef = useRef(null);

    const [summary, setSummary] = useState({ promoters: 0, passives: 0, detractors: 0, total: 0, nps: 0 });
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null); // null | 'Promotor' | 'Passive' | 'Detractor'
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [isInsightOpen, setIsInsightOpen] = useState(false);
    const [insightResult, setInsightResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [regenContext, setRegenContext] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ bulan: month, divisi, cabang });
            const res = await fetch(`https://csdwindo.com/api/panel/nps_detail.php?${params}`);
            const json = await res.json();

            if (json.status && json.data) {
                setSummary(json.data.summary);
                setListData(json.data.list);
            } else {
                setSummary({ promoters: 0, passives: 0, detractors: 0, total: 0, nps: 0 });
                setListData([]);
            }
        } catch (err) {
            console.error('Failed to fetch NPS detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [month, cabang, divisi]);

    const handlePrevMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() - 1);
        setMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() + 1);
        setMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    };

    const getMonthLabel = () => {
        if (!month) return 'Pilih Bulan';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const getBadgeColor = (status) => {
        switch (status) {
            case 'Promotor': return 'bg-green-100 text-green-700';
            case 'Passive': return 'bg-yellow-100 text-yellow-700';
            case 'Detractor': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleSearchSubmit = (query) => {
        console.log("Search trigger if we want to filter main list, but currently modal handles it.");
    };

    const handleSelectResult = (item) => {
        setSelectedDetail(item);
    };

    const handleDelete = async (item) => {
        setDeleting(true);
        try {
            const res = await fetch('https://csdwindo.com/api/panel/nps_detail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: item.id })
            });
            const json = await res.json();
            if (json.status) {
                setDeleteConfirm(null);
                setSelectedDetail(null);
                fetchData();
                setToast({ show: true, message: `Data ${item.nama || 'NPS'} berhasil dihapus`, type: 'success' });
                setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
            } else {
                setToast({ show: true, message: 'Gagal menghapus: ' + json.message, type: 'error' });
                setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
            }
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: 'Terjadi kesalahan saat menghapus data.', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        } finally {
            setDeleting(false);
        }
    };

    const generateInsight = async (context = '') => {
        setIsGenerating(true);
        setShowRegenModal(false);
        try {
            const systemPrompt = `Anda adalah AI asisten Customer Satisfaction Manager.
Tugas Anda adalah memberikan "Rekomendasi Tindak lanjut", cara penanganan komplain, perbaikan, dan hal lain yang relevan berdasarkan data komplain pelanggan (DETRACTOR) berikut.
Berikan jawaban yang singkat, profesional, dan gunakan Markdown untuk formatting.`;

            let userMsg = `Data Pelanggan:
Nama: ${selectedDetail.nama || '-'}
Rangka: ${selectedDetail.rangka || '-'}
Kendaraan: ${selectedDetail.kendaraan || '-'}
Cabang: ${selectedDetail.cabang || '-'}

Detail Penilaian:
Score NPS: ${selectedDetail.score}
Status NPS: ${selectedDetail.status_nps}
Catatan/Note: ${selectedDetail.note || '-'}`;

            if (context) {
                userMsg += `\n\nKonteks tambahan dari user: ${context}`;
            }

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "xiaomi/mimo-v2-flash",
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMsg }
                    ]
                })
            });
            const result = await res.json();
            if (result.choices?.[0]?.message?.content) {
                let content = result.choices[0].message.content;
                content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                setInsightResult(content);
                localStorage.setItem(`ai_insight_nps_${selectedDetail.id}`, content);
            } else {
                throw new Error('No response content');
            }
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: "Gagal men-generate AI Insight", type: "error" });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenInsight = () => {
        setIsInsightOpen(true);
        const cached = localStorage.getItem(`ai_insight_nps_${selectedDetail.id}`);
        if (cached) {
            setInsightResult(cached);
        } else {
            generateInsight();
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            {/* Header & Filters */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">NPS Data Detail</h1>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">NPS {divisi} Cabang {cabang === 'All' ? 'Semua' : cabang} - {getMonthLabel()}</p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 h-[42px] bg-white border border-[#E5E5E5] text-gray-500 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center sm:justify-start"
                    >
                        <Search size={16} /> <span className="hidden sm:inline">Cari Data</span>
                    </button>

                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        {[
                            { id: 'All', label: 'Dwindo' },
                            { id: 'Bintaro', label: 'Bintaro' },
                            { id: 'Radin Inten', label: 'Radin Inten' },
                            { id: 'Cakung', label: 'Cakung' }
                        ].map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCabang(c.id)}
                                className={`whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${cabang === c.id
                                    ? 'bg-white text-[#E60012] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative h-[42px] shrink-0" ref={monthPickerRef}>
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                            onClick={() => setShowMonthPicker(!showMonthPicker)}>
                            <Calendar size={16} className="text-[#E60012]" />
                            {getMonthLabel()}
                        </div>

                        <AnimatePresence>
                            {showMonthPicker && (
                                <CustomMonthPicker
                                    currentMonth={month}
                                    onSelect={(m) => { setMonth(m); setShowMonthPicker(false); }}
                                    onClose={() => setShowMonthPicker(false)}
                                />
                            )}
                        </AnimatePresence>

                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                        {[
                            { id: 'Sales', label: 'Sales' },
                            { id: 'Service', label: 'Service' }
                        ].map((d) => (
                            <button
                                key={d.id}
                                onClick={() => setDivisi(d.id)}
                                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${divisi === d.id
                                    ? 'bg-white text-[#E60012] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
                <div onClick={() => setStatusFilter(null)}
                    className={`rounded-xl p-4 shadow-sm relative overflow-hidden group cursor-pointer transition-all ${!statusFilter ? 'bg-[#111111] border-2 border-[#111111] ring-2 ring-[#E60012]/30' : 'bg-white border border-[#E5E5E5] hover:border-gray-300'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#E60012]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${!statusFilter ? 'text-gray-300' : 'text-gray-500'}`}>Total NPS</div>
                    <div className="flex items-end gap-2">
                        <div className={`text-3xl font-black ${!statusFilter ? 'text-white' : summary.nps > 0 ? 'text-green-600' : summary.nps < 0 ? 'text-red-600' : 'text-gray-700'}`}>{summary.nps}%</div>
                        <div className={`text-sm font-medium pb-1 ${!statusFilter ? 'text-gray-400' : 'text-gray-400'}`}>dari {summary.total}</div>
                    </div>
                </div>
                <div onClick={() => setStatusFilter(statusFilter === 'Promotor' ? null : 'Promotor')}
                    className={`rounded-xl p-4 shadow-sm relative overflow-hidden group cursor-pointer transition-all ${statusFilter === 'Promotor' ? 'bg-green-600 border-2 border-green-600 ring-2 ring-green-300' : 'bg-white border border-green-200 hover:border-green-300'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusFilter === 'Promotor' ? 'text-green-100' : 'text-green-600'}`}>Promoters (9-10)</div>
                    <div className="flex items-end gap-2">
                        <div className={`text-3xl font-black ${statusFilter === 'Promotor' ? 'text-white' : 'text-green-700'}`}>{summary.promoters}</div>
                        <div className={`text-sm font-medium pb-1 px-1.5 rounded ${statusFilter === 'Promotor' ? 'bg-green-500 text-green-100' : 'bg-green-100 text-green-600'}`}>{summary.total > 0 ? Math.round((summary.promoters / summary.total) * 100) : 0}%</div>
                    </div>
                </div>
                <div onClick={() => setStatusFilter(statusFilter === 'Passive' ? null : 'Passive')}
                    className={`rounded-xl p-4 shadow-sm relative overflow-hidden group cursor-pointer transition-all ${statusFilter === 'Passive' ? 'bg-amber-500 border-2 border-amber-500 ring-2 ring-amber-300' : 'bg-white border border-amber-200 hover:border-amber-300'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusFilter === 'Passive' ? 'text-amber-100' : 'text-amber-600'}`}>Passives (7-8)</div>
                    <div className="flex items-end gap-2">
                        <div className={`text-3xl font-black ${statusFilter === 'Passive' ? 'text-white' : 'text-amber-700'}`}>{summary.passives}</div>
                        <div className={`text-sm font-medium pb-1 px-1.5 rounded ${statusFilter === 'Passive' ? 'bg-amber-400 text-amber-100' : 'bg-amber-100 text-amber-600'}`}>{summary.total > 0 ? Math.round((summary.passives / summary.total) * 100) : 0}%</div>
                    </div>
                </div>
                <div onClick={() => setStatusFilter(statusFilter === 'Detractor' ? null : 'Detractor')}
                    className={`rounded-xl p-4 shadow-sm relative overflow-hidden group cursor-pointer transition-all ${statusFilter === 'Detractor' ? 'bg-red-500 border-2 border-red-500 ring-2 ring-red-300' : 'bg-white border border-red-200 hover:border-red-300'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${statusFilter === 'Detractor' ? 'text-red-100' : 'text-red-600'}`}>Detractors (0-6)</div>
                    <div className="flex items-end gap-2">
                        <div className={`text-3xl font-black ${statusFilter === 'Detractor' ? 'text-white' : 'text-red-700'}`}>{summary.detractors}</div>
                        <div className={`text-sm font-medium pb-1 px-1.5 rounded ${statusFilter === 'Detractor' ? 'bg-red-400 text-red-100' : 'bg-red-100 text-red-600'}`}>{summary.total > 0 ? Math.round((summary.detractors / summary.total) * 100) : 0}%</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-xl border border-[#E5E5E5] shadow-sm flex flex-col min-h-0 overflow-hidden relative">
                <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                            <tr className="text-sm font-black uppercase tracking-wider">
                                <th className="p-4 border-b border-gray-200">Nama Konsumen</th>
                                <th className="p-4 border-b border-gray-200 text-center">Score</th>
                                <th className="p-4 border-b border-gray-200 text-center">Status</th>
                                <th className="p-4 border-b border-gray-200 text-center">Kendaraan</th>
                                <th className="p-4 border-b border-gray-200 text-center">Cabang</th>
                            </tr>
                        </thead>
                        <tbody className="text-base relative">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 font-bold">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : listData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400 font-bold">
                                        Tidak ada data penilaian untuk periode ini.
                                    </td>
                                </tr>
                            ) : (
                                listData.filter(item => !statusFilter || item.status_nps === statusFilter).map((item, idx) => (
                                    <tr 
                                        key={item.id || idx} 
                                        onClick={() => setSelectedDetail(item)}
                                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-red-50/50 transition-colors cursor-pointer group`}
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-[#111111] group-hover:text-[#E60012] transition-colors">{item.nama || '-'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{item.rangka || '-'}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-black text-lg">{item.score}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeColor(item.status_nps)}`}>
                                                {item.status_nps}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-sm font-medium text-gray-600">
                                            {item.kendaraan || '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                {item.cabang === 'Dwindo' ? 'DWINDO GROUP' : item.cabang}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Search Modal */}
            <NPSSearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                filters={{ bulan: month, divisi, cabang }}
                onSelect={handleSelectResult}
                onSearchSubmit={handleSearchSubmit}
            />

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5E5E5]"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gray-50 border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
                                <h3 className="font-display font-bold text-lg text-[#111111]">Detail Penilaian NPS</h3>
                                <button onClick={() => setSelectedDetail(null)} className="text-gray-400 hover:text-[#E60012] transition-colors p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 shadow-inner
                                        ${selectedDetail.score >= 9 ? 'bg-green-100 text-green-700 border-green-200' : 
                                          selectedDetail.score >= 7 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                          'bg-red-100 text-red-700 border-red-200'}`}
                                    >
                                        {selectedDetail.score}
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Status NPS</div>
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getBadgeColor(selectedDetail.status_nps)}`}>
                                            {selectedDetail.status_nps}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1"><User size={12}/> Nama Konsumen</div>
                                        <div className="font-bold text-[#111111]">{selectedDetail.nama || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1"><FileText size={12}/> Rangka</div>
                                        <div className="font-bold text-[#111111] text-sm break-all">{selectedDetail.rangka || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1"><Car size={12}/> Kendaraan</div>
                                        <div className="font-bold text-[#111111]">{selectedDetail.kendaraan || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1"><Info size={12}/> Cabang</div>
                                        <div className="font-bold text-[#111111]">{selectedDetail.cabang}</div>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1"><FileText size={12}/> Catatan / Note</div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap min-h-[60px] border border-gray-200">
                                        {selectedDetail.note || <span className="text-gray-400 italic">Tidak ada catatan</span>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-gray-100 flex justify-between gap-3">
                                    {selectedDetail.status_nps?.toUpperCase() === 'DETRACTOR' ? (
                                        <button onClick={handleOpenInsight} className="px-4 py-2 bg-[#00B2A9] hover:bg-teal-600 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                                            <BrainCircuit size={16} /> AI Insight
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}
                                    <button
                                        onClick={() => setDeleteConfirm(selectedDetail)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                    >
                                        <Trash2 size={14} /> Hapus Data
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Insight Modal Overlay */}
                        {isInsightOpen && (
                            <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 rounded-xl backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                    <div className="bg-gradient-to-r from-[#00B2A9] to-teal-700 px-6 py-4 flex items-center justify-between border-b rounded-t-lg shrink-0">
                                        <h3 className="font-bold text-white flex items-center gap-2"><BrainCircuit size={18} /> AI Insight - Rekomendasi Tindak Lanjut</h3>
                                        <button onClick={() => setIsInsightOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
                                    </div>
                                    <div className="p-6 overflow-y-auto bg-[#F8FAFA] flex-1">
                                        {isGenerating ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                                <Loader2 size={32} className="animate-spin text-[#00B2A9] mb-4" />
                                                <p className="font-bold text-gray-700">AI sedang memproses...</p>
                                                <p className="text-sm text-gray-500">Menganalisis case komplain ini</p>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: parseChatMarkdown(insightResult) }} />
                                        )}
                                    </div>
                                    <div className="px-6 py-4 border-t bg-white flex justify-between gap-3 shrink-0 rounded-b-lg">
                                        <button onClick={() => setShowRegenModal(true)} disabled={isGenerating} className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                            <RefreshCw size={14} /> Generate Ulang
                                        </button>
                                        <button onClick={() => setIsInsightOpen(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm">Tutup</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Regenerate Confirmation Modal Overlay */}
                        {showRegenModal && (
                            <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 rounded-xl backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                                    <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b rounded-t-lg">
                                        <h3 className="font-bold text-gray-800">Generate Ulang Insight</h3>
                                        <button onClick={() => setShowRegenModal(false)} className="text-gray-500 hover:text-gray-800"><X size={18} /></button>
                                    </div>
                                    <div className="p-4 space-y-4 bg-white">
                                        <p className="text-sm text-gray-600">Anda dapat memberikan konteks tambahan kepada AI untuk fokus ke hal tertentu, atau biarkan kosong untuk default.</p>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Konteks Tambahan (Opsional)</label>
                                            <textarea
                                                rows="3"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00B2A9] resize-none"
                                                value={regenContext}
                                                onChange={e => setRegenContext(e.target.value)}
                                                placeholder="Contoh: Fokus ke penjelasan ke teknisi..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                                        <button onClick={() => setShowRegenModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                                        <button onClick={() => generateInsight(regenContext)} className="px-4 py-2 text-sm font-bold bg-[#00B2A9] text-white hover:bg-teal-600 rounded-lg transition-colors flex items-center gap-2">
                                            <RefreshCw size={14} /> Generate
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => !deleting && setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-[#E60012]" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Hapus Data NPS?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus data penilaian dari <strong>{deleteConfirm.nama || '-'}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded font-bold text-sm bg-gray-100 text-[#444444] hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded font-bold text-sm bg-[#E60012] text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Ya, Hapus'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        {toast.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NPSDetail;
