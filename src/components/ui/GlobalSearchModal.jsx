import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, FileText, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/constants';

const GlobalSearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [priceListData, setPriceListData] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            
            // Lock body scroll
            document.body.style.overflow = 'hidden';
            
            // Fetch pricelist once
            if (!priceListData) {
                fetch('https://csdwindo.com/api/pricelist/index.php')
                    .then(r => r.json())
                    .then(d => {
                        if (d.status) setPriceListData(d.data);
                    })
                    .catch(e => console.error('Failed to fetch pricelist for search', e));
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }

        let active = true;
        const fetchResults = async () => {
            setLoading(true);
            let artResults = [];
            let plResults = [];

            // 1. Search Articles
            try {
                const artRes = await fetch(`https://csdwindo.com/api/artikel/ai_list.php?keyword=${encodeURIComponent(query)}`);
                const artData = await artRes.json();
                if (artData.status && artData.data) {
                    artResults = artData.data.map(a => ({
                        id: `art-${a.slug}`,
                        type: 'article',
                        title: a.title,
                        subtitle: a.subtitle,
                        image: a.image,
                        link: `/artikel/${a.slug}`
                    }));
                }
            } catch (e) {
                console.error(e);
            }

            // 2. Search PriceList
            if (priceListData) {
                const q = query.toLowerCase();

                Object.entries(priceListData).forEach(([category, models]) => {
                    Object.entries(models).forEach(([modelKey, modelData]) => {
                        const modelName = modelKey.replace(/_/g, ' ').toUpperCase();
                        let matches = false;
                        
                        if (modelName.toLowerCase().includes(q)) matches = true;

                        let matchedItems = [];
                        if (modelData.items) {
                            matchedItems = modelData.items.filter(item => item.type.toLowerCase().includes(q));
                        }
                        if (modelData.categories) {
                            Object.values(modelData.categories).forEach(catItems => {
                                const found = catItems.filter(item => item.type.toLowerCase().includes(q) || (item.spec && item.spec.toLowerCase().includes(q)));
                                matchedItems = [...matchedItems, ...found];
                            });
                        }

                        if (matches && matchedItems.length === 0) {
                            if (modelData.items && modelData.items.length > 0) {
                                matchedItems = [modelData.items[0]];
                            } else if (modelData.categories) {
                                const firstCat = Object.values(modelData.categories)[0];
                                if (firstCat && firstCat.length > 0) {
                                    matchedItems = [firstCat[0]];
                                }
                            }
                        }

                        if (matches || matchedItems.length > 0) {
                            const priceText = matchedItems.length > 0 ? `Mulai ${formatCurrency(matchedItems[0].price)}` : 'Harga tidak tersedia';
                            plResults.push({
                                id: `pl-${modelKey}`,
                                type: 'product',
                                title: modelName,
                                subtitle: priceText,
                                image: modelData.image,
                                link: '/price-list',
                                price: null
                            });
                        }
                    });
                });
            }

            let combinedResults = [...plResults, ...artResults];

            if (active) {
                setResults(combinedResults);
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 400);
        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [query, priceListData]);

    const handleResultClick = (link) => {
        onClose();
        navigate(link);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="w-full max-w-2xl bg-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[80vh]"
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Header */}
                    <div className="relative border-b border-white/10 p-4 flex items-center gap-3 bg-[#222222]">
                        <Search className="text-gray-400" size={20} />
                        <input 
                            ref={inputRef}
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-500 font-display"
                            placeholder="Cari artikel, mobil, spesifikasi..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        )}
                        {loading && <Loader2 className="animate-spin text-[#E60012] ml-2" size={20} />}
                    </div>

                    {/* Results Area */}
                    {query.trim().length >= 3 && (
                        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar border-t border-white/5">
                            {!loading && results.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Tidak ada hasil ditemukan untuk "{query}"
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="space-y-2">
                                    {results.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                                            onClick={() => handleResultClick(item.link)}
                                        >
                                            {/* Image or Icon */}
                                            <div className="w-16 h-16 rounded overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    item.type === 'article' ? <FileText className="text-gray-400" /> : <Car className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase tracking-wider">
                                                        {item.type === 'article' ? 'Artikel' : 'Produk'}
                                                    </span>
                                                    {item.price && (
                                                        <span className="text-[10px] font-bold text-[#E60012]">
                                                            Mulai {formatCurrency(item.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-white font-bold text-base truncate group-hover:text-[#E60012] transition-colors">
                                                    {item.title}
                                                </h4>
                                                {item.subtitle && (
                                                    <p className="text-gray-400 text-xs truncate">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GlobalSearchModal;
