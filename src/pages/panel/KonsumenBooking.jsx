import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Users, ChevronLeft, ChevronRight, RefreshCw, Car, X, Save, Calendar, Star, Copy, Check, UploadCloud, FileSpreadsheet, Download, Trash2, CheckCircle2, AlertCircle, History, Clock, ChevronDown, ChevronUp, ExternalLink, Globe, UserMinus, BarChart, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import * as XLSX from 'xlsx';
import kodePajak from '../../data/kode_pajak.json';

const KonsumenBooking = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ empty_pajak: 0, priority: { biasa: 0, loyal: 0, prioritas: 0 } });
    const [filter, setFilter] = useState('all');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedKonsumen, setSelectedKonsumen] = useState(null);
    const [formData, setFormData] = useState({ one_year: '', five_year: '', prioritas: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [showOneYearPicker, setShowOneYearPicker] = useState(false);
    const [showFiveYearPicker, setShowFiveYearPicker] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadPreview, setUploadPreview] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPajakDropdown, setShowPajakDropdown] = useState(false);

    // Alert Modal state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', message: '', results: null });

    // History state
    const [historyData, setHistoryData] = useState(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hari ini';
        if (diffDays < 30) return `${diffDays} hari yang lalu`;
        
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
        
        const diffYears = Math.floor(diffMonths / 12);
        return `${diffYears} tahun yang lalu`;
    };

    const getBadgeColor = (status) => {
        const s = (status || 'REQUEST').toUpperCase();
        switch (s) {
            case 'REQUEST': return 'bg-blue-100 text-blue-700';
            case 'BOOKING': return 'bg-purple-100 text-purple-700';
            case 'UBAH': return 'bg-orange-100 text-orange-700';
            case 'DATANG': return 'bg-green-100 text-green-700';
            case 'CANCEL': return 'bg-red-100 text-red-700';
            case 'SELESAI': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const displayAlert = (type, title, message, results = null) => {
        setAlertConfig({ type, title, message, results });
        setShowAlert(true);
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Debounce search state
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on new search
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
    }, []);

    const getRegionInfo = (nopol) => {
        if (!nopol) return null;
        const cleanNopol = nopol.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const match = cleanNopol.match(/^([A-Z]{1,2})(\d+)([A-Z]*)$/);
        if (!match) return null;

        const prefix = match[1];
        const suffix = match[3];
        const firstSuffix = suffix ? suffix[0] : '';

        const prefixInfo = kodePajak.prefix_codes.find(c => c.kode === prefix);
        if (!prefixInfo) return null;

        let detail = prefixInfo.wilayah;
        if (kodePajak.sub_codes[prefix] && firstSuffix) {
            const subRegion = kodePajak.sub_codes[prefix][firstSuffix];
            if (subRegion) detail = subRegion;
        }

        return { detail, provinsi: prefixInfo.provinsi };
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = `https://csdwindo.com/api/panel/data_konsumen.php?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(debouncedSearch)}&filter=${filter}`;
            const res = await fetch(url);
            const result = await res.json();

            if (result.status) {
                setData(result.data);
                setPagination(result.pagination);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching konsumen data:", error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchStats = async () => {
        try {
            const res = await fetch('https://csdwindo.com/api/panel/konsumen_stats.php');
            const result = await res.json();
            if (result.status) {
                setStats(result.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'staff') {
            fetchStats();
        }
    }, [user]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    const handleRowClick = (item) => {
        setSelectedKonsumen(item);
        setFormData({
            one_year: item.one_year || '',
            five_year: item.five_year || '',
            prioritas: parseInt(item.prioritas) || 0
        });
        setHistoryData(null);
        setIsHistoryExpanded(false);
        setShowModal(true);
        fetchHistory(item.nopol);
    };

    const handleNextData = () => {
        if (!selectedKonsumen || data.length === 0) return;
        const currentIndex = data.findIndex(item => item.id === selectedKonsumen.id);
        if (currentIndex !== -1 && currentIndex < data.length - 1) {
            handleRowClick(data[currentIndex + 1]);
        }
    };

    const fetchHistory = async (nopol) => {
        if (!nopol) return;
        setIsHistoryLoading(true);
        try {
            const res = await fetch(`https://csdwindo.com/api/panel/konsumen_history.php?nopol=${nopol.replace(/\s/g, '')}`);
            const result = await res.json();
            if (result.status) {
                setHistoryData(result);
                
                // Auto promote to Loyal if bookings >= 4
                if (result.summary?.total_booking >= 4) {
                    setFormData(prev => {
                        if (prev.prioritas < 2) {
                            return { ...prev, prioritas: 2 };
                        }
                        return prev;
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedKonsumen) return;
        setIsSaving(true);
        
        try {
            const res = await fetch('https://csdwindo.com/api/panel/data_konsumen.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedKonsumen.id,
                    one_year: formData.one_year,
                    five_year: formData.five_year,
                    prioritas: formData.prioritas
                })
            });
            const result = await res.json();
            
            if (result.status) {
                setShowModal(false);
                fetchData(); // Refresh data to show updates
            } else {
                alert(result.message || 'Gagal menyimpan data');
            }
        } catch (err) {
            console.error('Error saving:', err);
            alert('Terjadi kesalahan koneksi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            // Map keys to lowercase to be safe (rangka, stnk)
            const normalizedData = data.map(row => {
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    const lowKey = key.toLowerCase().trim();
                    if (lowKey.includes('rangka')) normalizedRow.rangka = row[key];
                    if (lowKey.includes('stnk') || lowKey.includes('nopol')) normalizedRow.stnk = row[key];
                });
                return normalizedRow;
            }).filter(item => item.rangka && item.stnk);

            setUploadPreview(normalizedData);
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkUpload = async () => {
        if (uploadPreview.length === 0) return;
        setIsProcessing(true);
        try {
            const res = await fetch('https://csdwindo.com/api/panel/upload_stnk.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: uploadPreview })
            });
            const result = await res.json();
            if (result.status) {
                setShowUploadModal(false);
                setUploadPreview([]);
                displayAlert(
                    'success', 
                    'Upload Berhasil!', 
                    'Data STNK telah berhasil diproses ke sistem.',
                    result.results
                );
                fetchData();
            } else {
                displayAlert('error', 'Gagal Upload', result.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
            displayAlert('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat memproses data ke server.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { Rangka: 'MHMM3...', STNK: 'B1234...' }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "template_upload_stnk.xlsx");
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#E60012]/10 text-[#E60012] rounded-none flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 font-display">Data Konsumen Booking</h1>
                    </div>
                    <p className="text-gray-500">Kelola dan pantau seluruh data pelanggan booking dari chatbot maupun manual.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowPajakDropdown(!showPajakDropdown)}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-none font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        >
                            <Globe size={18} className="text-blue-500" />
                            Cek Pajak
                            <ChevronDown size={14} className={`transition-transform ${showPajakDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showPajakDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPajakDropdown(false)}></div>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-none shadow-xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                            {kodePajak.samsat_urls.map((item, idx) => (
                                                <React.Fragment key={idx}>
                                                    <a 
                                                        href={item.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center justify-between px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-[#E60012] rounded-none transition-colors group"
                                                    >
                                                        <span className="text-sm font-medium">Samsat {item.provinsi}</span>
                                                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                    {idx < kodePajak.samsat_urls.length - 1 && <div className="h-px bg-gray-50 mx-2"></div>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {user?.role === 'admin' && (
                        <button 
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#E60012] text-white rounded-none font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            <UploadCloud size={20} />
                            Upload STNK
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Section for Admin & Staff */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Card 1: Data Pajak Kosong */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                            setFilter(filter === 'empty_pajak' ? 'all' : 'empty_pajak');
                            setPage(1);
                        }}
                        className={`p-5 rounded-none border transition-all cursor-pointer flex items-center gap-4 ${
                            filter === 'empty_pajak' 
                            ? 'bg-[#E60012] border-[#E60012] text-white shadow-lg shadow-red-500/30' 
                            : 'bg-white border-gray-100 shadow-sm hover:border-red-200 group'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-none flex items-center justify-center shrink-0 transition-colors ${
                            filter === 'empty_pajak' ? 'bg-white/20 text-white' : 'bg-red-50 text-[#E60012] group-hover:bg-red-100'
                        }`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${filter === 'empty_pajak' ? 'text-white/70' : 'text-gray-400'}`}>Pajak Belum Update</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black">{stats.empty_pajak || 0}</span>
                                <span className="text-[10px] font-bold opacity-70">Data</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Priority Biasa */}
                    {[
                        { label: 'Biasa', key: 'biasa', color: 'bg-gray-400', textColor: 'text-gray-500', bgColor: 'bg-gray-50' },
                        { label: 'Loyal', key: 'loyal', color: 'bg-blue-500', textColor: 'text-blue-500', bgColor: 'bg-blue-50' },
                        { label: 'Prioritas', key: 'prioritas', color: 'bg-[#E60012]', textColor: 'text-[#E60012]', bgColor: 'bg-red-50' }
                    ].map((item, idx) => {
                        const total = Object.values(stats.priority).reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? (stats.priority[item.key] / total) * 100 : 0;
                        return (
                            <motion.div 
                                key={item.key}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * (idx + 1) }}
                                className="bg-white p-5 rounded-none border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-gray-200 transition-all"
                            >
                                <div className={`w-12 h-12 ${item.bgColor} ${item.textColor} rounded-none flex items-center justify-center shrink-0`}>
                                    <Star size={24} fill="currentColor" className="opacity-20" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                                        <span className={`text-[10px] font-black ${item.textColor}`}>{percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-gray-900">{stats.priority[item.key]}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Orang</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nopol, nama, atau no telp..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        {filter !== 'all' && (
                            <button 
                                onClick={() => {
                                    setFilter('all');
                                    setPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#E60012] hover:underline bg-white px-2"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-none hover:bg-gray-50 hover:text-gray-900 transition-colors w-full sm:w-auto justify-center"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">No</th>
                                <th className="px-6 py-4 font-bold">Kendaraan & Nopol</th>
                                <th className="px-6 py-4 font-bold">Data Pelanggan</th>
                                <th className="px-6 py-4 font-bold text-center">Pajak STNK (1 Yr)</th>
                                <th className="px-6 py-4 font-bold text-center">Pajak TNKB (5 Yr)</th>
                                <th className="px-6 py-4 font-bold text-center">Prioritas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-500">Memuat data konsumen...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Tidak ada data konsumen yang ditemukan.</p>
                                        {search && <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id} onClick={() => handleRowClick(item)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 text-gray-500">
                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-none bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Car className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.kendaraan || '-'}</p>
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-none text-[10px] font-bold font-mono tracking-wider bg-gray-100 text-gray-600">
                                                        {item.nopol}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{item.nama}</p>
                                            <p className="text-gray-500 mt-0.5 text-xs">{item.telp}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.one_year ? (
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-none bg-blue-50 text-blue-700 border border-blue-100">{item.one_year}</span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.five_year ? (
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-none bg-purple-50 text-purple-700 border border-purple-100">{item.five_year}</span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.prioritas > 0 ? (
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-none bg-orange-50 text-orange-600 border border-orange-100">{item.prioritas}</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Normal</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> hingga <span className="font-semibold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-semibold text-gray-900">{pagination.total}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 border border-gray-200 rounded-none text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    // Complex logic to show a window of pages around current page
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-none text-sm font-medium transition-colors ${pagination.page === pageNum
                                                    ? 'bg-[#E60012] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-gray-200 rounded-none text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail & Edit Konsumen */}
            <AnimatePresence>
                {showModal && selectedKonsumen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-none shadow-2xl w-full max-w-lg overflow-visible flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900">Detail Konsumen</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {/* Info Data Diri */}
                                <div className="bg-gray-50 rounded-none p-3 border border-gray-100 grid grid-cols-2 gap-3 text-sm">
                                    <div 
                                        onClick={() => handleCopy(selectedKonsumen.nama, 'nama')}
                                        className="group cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-gray-200/50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-gray-500 block text-xs">Nama:</span>
                                            <span className="font-bold text-gray-900 group-hover:text-[#E60012] transition-colors">{selectedKonsumen.nama}</span>
                                        </div>
                                        {copiedField === 'nama' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                    <div 
                                        onClick={() => handleCopy(selectedKonsumen.telp, 'telp')}
                                        className="group cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-gray-200/50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-gray-500 block text-xs">Telepon:</span>
                                            <span className="font-bold text-gray-900 group-hover:text-[#E60012] transition-colors">{selectedKonsumen.telp}</span>
                                        </div>
                                        {copiedField === 'telp' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                    <div 
                                        onClick={() => handleCopy(selectedKonsumen.kendaraan, 'kendaraan')}
                                        className="group cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-gray-200/50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-gray-500 block text-xs">Kendaraan:</span>
                                            <span className="font-bold text-gray-900 group-hover:text-[#E60012] transition-colors">{selectedKonsumen.kendaraan}</span>
                                        </div>
                                        {copiedField === 'kendaraan' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                    <div 
                                        onClick={() => handleCopy(selectedKonsumen.nopol, 'nopol')}
                                        className="group cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-gray-200/50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-gray-500 block text-xs">Nopol:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 font-mono bg-white px-1.5 py-0.5 rounded-none border border-gray-200 group-hover:border-[#E60012]/30 group-hover:text-[#E60012] transition-colors">{selectedKonsumen.nopol}</span>
                                                {getRegionInfo(selectedKonsumen.nopol) && (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {getRegionInfo(selectedKonsumen.nopol).detail}, {getRegionInfo(selectedKonsumen.nopol).provinsi}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {copiedField === 'nopol' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </div>

                                {/* Form Editable */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4 relative z-20">
                                        <label className="text-sm font-bold text-gray-700">Pajak STNK (1 Tahun)</label>
                                        <div className="relative w-44">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setShowOneYearPicker(!showOneYearPicker);
                                                    setShowFiveYearPicker(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-none text-left text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                                            >
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span className={formData.one_year ? "text-gray-900 font-medium" : "text-gray-400"}>
                                                    {formData.one_year || "Pilih Tanggal"}
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {showOneYearPicker && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setShowOneYearPicker(false)}></div>
                                                        <div className="relative z-50">
                                                            <CustomDatePicker
                                                                currentDate={formData.one_year}
                                                                onSelect={(date) => {
                                                                    setFormData(prev => ({ ...prev, one_year: date }));
                                                                    setShowOneYearPicker(false);
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 relative z-10">
                                        <label className="text-sm font-bold text-gray-700">Pajak TNKB (5 Tahun)</label>
                                        <div className="relative w-44">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setShowFiveYearPicker(!showFiveYearPicker);
                                                    setShowOneYearPicker(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-none text-left text-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                                            >
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span className={formData.five_year ? "text-gray-900 font-medium" : "text-gray-400"}>
                                                    {formData.five_year || "Pilih Tanggal"}
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {showFiveYearPicker && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setShowFiveYearPicker(false)}></div>
                                                        <div className="relative z-50">
                                                            <CustomDatePicker
                                                                currentDate={formData.five_year}
                                                                onSelect={(date) => {
                                                                    setFormData(prev => ({ ...prev, five_year: date }));
                                                                    setShowFiveYearPicker(false);
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Tingkat Prioritas</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, prioritas: 1 }))}
                                                className={`py-2 px-3 rounded-none text-sm font-medium border-2 flex flex-col items-center gap-1 transition-colors ${
                                                    formData.prioritas === 1 ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                            >
                                                <Star size={16} className={formData.prioritas === 1 ? 'fill-blue-500 text-blue-500' : ''} />
                                                Biasa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, prioritas: 2 }))}
                                                className={`py-2 px-3 rounded-none text-sm font-medium border-2 flex flex-col items-center gap-1 transition-colors ${
                                                    formData.prioritas === 2 ? 'bg-orange-50 border-orange-500 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                            >
                                                <Star size={16} className={formData.prioritas === 2 ? 'fill-orange-500 text-orange-500' : ''} />
                                                Loyal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, prioritas: 3 }))}
                                                className={`py-2 px-3 rounded-none text-sm font-medium border-2 flex flex-col items-center gap-1 transition-colors ${
                                                    formData.prioritas === 3 ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                            >
                                                <Star size={16} className={formData.prioritas === 3 ? 'fill-red-500 text-red-500' : ''} />
                                                Prioritas
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Stats & History */}
                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <History size={16} className="text-gray-400" />
                                        Riwayat Booking
                                    </h4>

                                    {isHistoryLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 size={20} className="animate-spin text-gray-400" />
                                        </div>
                                    ) : historyData?.summary ? (
                                        <div className="space-y-3">
                                            <div 
                                                onClick={() => historyData.summary.total_booking > 0 && setIsHistoryExpanded(!isHistoryExpanded)}
                                                className={`p-3 rounded-none border transition-all flex items-center justify-between ${
                                                    historyData.summary.total_booking > 0 
                                                    ? 'bg-gray-50 border-gray-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30' 
                                                    : 'bg-gray-50/50 border-gray-100 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <span className="block text-[10px] text-gray-400 font-bold uppercase">Total</span>
                                                        <span className="text-lg font-bold text-gray-900">{historyData.summary.total_booking}x</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200"></div>
                                                    <div>
                                                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-tight">Terakhir</span>
                                                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                            <Clock size={12} className="text-gray-400" />
                                                            {getTimeAgo(historyData.summary.last_booking_date) || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {historyData.summary.total_booking > 0 && (
                                                    <div className="text-gray-400">
                                                        {isHistoryExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {isHistoryExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-2 pt-1">
                                                            {historyData.history.map((booking, idx) => (
                                                                <div key={idx} className="p-3 bg-white border border-gray-100 rounded-none text-xs space-y-2 shadow-sm">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-bold text-gray-900">{new Date(booking.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                        <span className={`px-2 py-0.5 rounded-none-[4px] text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(booking.status)}`}>
                                                                            {booking.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="text-gray-500">
                                                                            <p>{booking.jam} • {booking.jenis}</p>
                                                                            <p className="mt-0.5 line-clamp-1 italic text-[10px]">"{booking.keluhan || 'Tanpa keluhan'}"</p>
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{booking.user}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">Belum ada riwayat booking.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    {data.findIndex(item => item.id === selectedKonsumen?.id) < data.length - 1 && (
                                        <button
                                            onClick={handleNextData}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-none transition-colors"
                                        >
                                            Next Data
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#E60012] hover:bg-red-700 rounded-none transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Upload STNK */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-none shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Upload Data STNK</h3>
                                        <p className="text-xs text-gray-500">Update data survey dan konsumen via Excel</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-none text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {/* Instructions & Template */}
                                <div className="bg-blue-50 border border-blue-100 rounded-none p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 text-blue-600">
                                            <Download size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900">Download Template</h4>
                                            <p className="text-xs text-blue-700 mt-0.5">Gunakan format Excel yang sesuai agar data terbaca dengan benar.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={downloadTemplate}
                                        className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-none text-xs font-bold hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        Unduh Excel
                                    </button>
                                </div>

                                {/* File Dropzone */}
                                {uploadPreview.length === 0 ? (
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-none p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-blue-400 transition-all group">
                                        <input 
                                            type="file" 
                                            accept=".xlsx, .xls, .csv" 
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="w-16 h-16 bg-white shadow-sm rounded-none flex items-center justify-center text-gray-400 group-hover:text-blue-500 mb-4 transition-colors">
                                            <UploadCloud size={32} />
                                        </div>
                                        <h4 className="font-bold text-gray-900">Pilih file Excel Anda</h4>
                                        <p className="text-sm text-gray-500 mt-1">atau tarik dan lepas file di sini</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-gray-900">Preview Data ({uploadPreview.length} baris)</h4>
                                            <button 
                                                onClick={() => setUploadPreview([])}
                                                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Trash2 size={12} />
                                                Hapus & Ulangi
                                            </button>
                                        </div>
                                        <div className="border border-gray-100 rounded-none overflow-hidden max-h-60 overflow-y-auto shadow-inner bg-gray-50/30 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-white border-b border-gray-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold text-gray-500">No</th>
                                                        <th className="px-4 py-3 font-bold text-gray-500">Rangka</th>
                                                        <th className="px-4 py-3 font-bold text-gray-500">STNK / Nopol</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {uploadPreview.map((row, idx) => (
                                                        <tr key={idx} className="bg-white/50">
                                                            <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                            <td className="px-4 py-3 font-medium text-gray-900">{row.rangka}</td>
                                                            <td className="px-4 py-3 font-mono font-bold text-blue-600">{row.stnk}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadPreview([]);
                                    }}
                                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleBulkUpload}
                                    disabled={isProcessing || uploadPreview.length === 0}
                                    className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-none transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-500/20 active:scale-95"
                                >
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Upload Data
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Alert (Success/Error) */}
            <AnimatePresence>
                {showAlert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-none shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-none flex items-center justify-center mb-6 ${
                                    alertConfig.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                                }`}>
                                    {alertConfig.type === 'success' ? <CheckCircle2 size={48} strokeWidth={1.5} /> : <AlertCircle size={48} strokeWidth={1.5} />}
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{alertConfig.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">{alertConfig.message}</p>

                                {alertConfig.results && (
                                    <div className="w-full grid grid-cols-3 gap-2 mb-8 p-3 bg-gray-50 rounded-none border border-gray-100">
                                        <div className="text-center">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Survey</span>
                                            <span className="text-lg font-bold text-blue-600">+{alertConfig.results.updated_survey}</span>
                                        </div>
                                        <div className="text-center border-x border-gray-200">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Baru</span>
                                            <span className="text-lg font-bold text-green-600">+{alertConfig.results.inserted_konsumen}</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Skip</span>
                                            <span className="text-lg font-bold text-gray-400">{alertConfig.results.skipped}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowAlert(false)}
                                    className={`w-full py-4 rounded-none font-bold text-white transition-all shadow-lg active:scale-95 ${
                                        alertConfig.type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                    }`}
                                >
                                    Selesai
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KonsumenBooking;


