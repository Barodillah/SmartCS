import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, User, Car } from 'lucide-react';

const API_BASE = 'https://csdwindo.com/api/panel/sales_survey.php';

const getBadgeColor = (status) => {
    switch (status) {
        case 'PERLU FOLLOW UP': return 'bg-blue-100 text-blue-700';
        case 'PUAS': case 'PROMOTOR': return 'bg-green-100 text-green-700';
        case 'SARAN': case 'BIASA SAJA': return 'bg-yellow-100 text-yellow-700';
        case 'TIDAK PUAS': case 'KOMPLEN': case 'DETRACTOR': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const SurveySearchModal = ({ isOpen, onClose, onSelect, onSearchSubmit }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 3) { setResults([]); return; }

        let active = true;
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}?action=list&search=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (active && data.status) setResults(data.data || []);
            } catch (e) { console.error(e); }
            finally { if (active) setLoading(false); }
        };

        const timeoutId = setTimeout(fetchResults, 400);
        return () => { active = false; clearTimeout(timeoutId); };
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim().length >= 3) {
            onSearchSubmit(query.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[80vh]"
                    initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Header */}
                    <div className="relative border-b border-[#E5E5E5] p-4 flex items-center gap-3 bg-gray-50">
                        <Search className="text-gray-400" size={20} />
                        <input
                            ref={inputRef} type="text"
                            className="flex-1 bg-transparent border-none outline-none text-[#111111] text-lg placeholder:text-gray-400 font-display"
                            placeholder="Cari nama, rangka, kendaraan, atau sales..."
                            value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                        />
                        {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-[#E60012] transition-colors"><X size={20} /></button>}
                        {loading && <Loader2 className="animate-spin text-[#E60012] ml-2" size={20} />}
                    </div>

                    {/* Results */}
                    {query.trim().length >= 3 && (
                        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                            {!loading && results.length === 0 && (
                                <div className="p-8 text-center text-gray-500 text-sm">Tidak ada data survey ditemukan untuk "{query}"</div>
                            )}
                            {results.length > 0 && (
                                <div className="space-y-1">
                                    {results.slice(0, 10).map((item) => (
                                        <div key={item.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group border border-transparent hover:border-[#E5E5E5]"
                                            onClick={() => { onSelect(item); onClose(); }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-[#111111] font-bold text-base truncate group-hover:text-[#E60012] transition-colors">{item.nama}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getBadgeColor(item.status)}`}>{item.status}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Car size={12} /> {item.kendaraan}</span>
                                                    <span className="flex items-center gap-1"><User size={12} /> {item.sales}</span>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-xs">
                                                <span className="font-bold text-[#E60012]">0{item.telp}</span>
                                                <span className="text-gray-500">{item.rangka}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {results.length > 10 && (
                                        <div className="p-3 text-center text-sm text-[#E60012] font-bold hover:bg-red-50 rounded-lg cursor-pointer transition-colors mt-2"
                                            onClick={() => { onSearchSubmit(query.trim()); onClose(); }}>
                                            Lihat semua {results.length} hasil (Tekan Enter)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SurveySearchModal;
