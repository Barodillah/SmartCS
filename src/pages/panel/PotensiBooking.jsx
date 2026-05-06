import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Calendar, Wrench, MessageSquare, Filter, ChevronRight, User, Phone, Store, X, Copy, Check, Hash, Info, Car } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const DetailModal = ({ isOpen, onClose, item }) => {
    const [copiedField, setCopiedField] = useState(null);

    if (!isOpen || !item) return null;

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const detailRows = [
        { label: 'Customer', value: item.name, icon: User },
        { label: 'Phone', value: item.phone, icon: Phone },
        { label: 'Kendaraan', value: item.model, icon: Car },
        { label: 'Nomor Polisi', value: item.plate, icon: Hash, copyable: true, field: 'plate' },
        ...(item.rangka ? [{ label: 'No. Rangka', value: item.rangka, icon: Wrench, copyable: true, field: 'rangka' }] : []),
        { label: 'Service', value: item.last_service, icon: Calendar },
        { label: 'Potensi', value: item.potential, icon: Info },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-[#E5E5E5]"
            >
                <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F9F9F9]">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-[#E60012]"></div>
                        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Detail Customer</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-[#E60012] transition-all rounded-full">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="space-y-1">
                        {detailRows.map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-2.5 min-w-[120px]">
                                    <div className="text-gray-400">
                                        <row.icon size={14} />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{row.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-right">
                                    <div className={`text-sm font-bold text-[#111111] ${row.copyable ? 'font-mono' : ''}`}>
                                        {row.value || '-'}
                                    </div>
                                    {row.copyable && (
                                        <button
                                            onClick={() => handleCopy(row.value, row.field)}
                                            className="p-1.5 hover:bg-white border border-transparent hover:border-red-100 rounded-md transition-all flex items-center gap-1 text-[#E60012] bg-red-50/30"
                                            title="Klik untuk copy"
                                        >
                                            {copiedField === row.field ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} className="opacity-60 group-hover:opacity-100" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#F5F5F5] text-[#111111] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all border border-[#E5E5E5]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ProcessModal = ({ isOpen, onClose, item, onAction }) => {
    if (!isOpen || !item) return null;

    const actions = [
        { id: 'whatsapp', label: 'Whatsapp', icon: MessageSquare, color: 'bg-[#25D366]' },
        { id: 'invalid', label: 'Invalid', icon: X, color: 'bg-red-500' },
        { id: 'booking', label: 'Booking', icon: Calendar, color: 'bg-blue-500' },
        { id: 'dealer', label: 'Dealer Lain', icon: Store, color: 'bg-orange-500' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Proses Customer</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#E60012] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 text-center">
                        <div className="text-sm font-bold text-[#111111]">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.plate} • {item.model}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => onAction(action.id, item)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-white ${action.color} hover:opacity-90 transition-all shadow-sm group`}
                            >
                                <action.icon size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const PotensiBooking = () => {
    const [mainFilter, setMainFilter] = useState('booking'); // 'booking' or 'pkt'
    const [activeTab, setActiveTab] = useState('6_bulan'); // for booking: 6, 12, 18, 24; for pkt: 1k, 10k...60k
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ booking: {}, pkt: {} });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const bookingTabs = [
        { id: '6_bulan', label: '6 Bulan' },
        { id: '12_bulan', label: '12 Bulan' },
        { id: '18_bulan', label: '18 Bulan' },
        { id: '24_bulan', label: '24 Bulan' },
    ];

    const pktTabs = [
        { id: '1k', label: '1.000 KM' },
        { id: '10k', label: '10.000 KM' },
        { id: '20k', label: '20.000 KM' },
        { id: '30k', label: '30.000 KM' },
        { id: '40k', label: '40.000 KM' },
        { id: '50k', label: '50.000 KM' },
        { id: '60k', label: '60.000 KM' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://csdwindo.com/api/panel/potensi_booking.php');
                const json = await res.json();
                if (json.status) {
                    setData(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch potensi booking data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentData = data[mainFilter][activeTab] || [];

    const handleAction = (type, item) => {
        if (type === 'whatsapp') {
            const message = `Halo Bapak/Ibu ${item.name}, kami dari dealer Mitsubishi ingin menginformasikan bahwa kendaraan Anda memiliki ${item.potential}. Ingin dibantu untuk booking service?`;
            window.open(`https://wa.me/62${item.phone.substring(1)}?text=${encodeURIComponent(message)}`, '_blank');
        } else if (type === 'telpon') {
            window.open(`tel:${item.phone}`, '_self');
        } else if (type === 'booking') {
            alert(`Booking untuk ${item.name} (${item.plate}) sedang diproses...`);
        } else if (type === 'dealer') {
            alert(`Customer ${item.name} dicatat service di Dealer Lain.`);
        } else if (type === 'invalid') {
            alert(`Customer ${item.name} ditandai sebagai Invalid.`);
        }
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E60012] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Potensi Booking Service</h1>
                <p className="text-gray-500 text-sm mt-1">Daftar customer yang berpotensi melakukan booking service berdasarkan waktu atau kilometer.</p>
            </div>

            {/* Main Filter Toggle */}
            <div className="flex bg-white border border-[#E5E5E5] p-1 mb-6 inline-flex rounded-sm">
                <button
                    onClick={() => {
                        setMainFilter('booking');
                        setActiveTab('6_bulan');
                    }}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${mainFilter === 'booking' ? 'bg-[#E60012] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
                    style={mainFilter === 'booking' ? { clipPath: ANGULAR_CLIP } : {}}
                >
                    Data Booking
                </button>
                <button
                    onClick={() => {
                        setMainFilter('pkt');
                        setActiveTab('1k');
                    }}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${mainFilter === 'pkt' ? 'bg-[#E60012] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
                    style={mainFilter === 'pkt' ? { clipPath: ANGULAR_CLIP } : {}}
                >
                    Data PKT
                </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 mb-6 scrollbar-hide">
                {(mainFilter === 'booking' ? bookingTabs : pktTabs).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-none px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === tab.id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-500 border-[#E5E5E5] hover:border-gray-400'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="bg-white border border-[#E5E5E5] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Kendaraan</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">{mainFilter === 'booking' ? 'Service Terakhir' : 'Warranty Date'}</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Potensi</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {currentData.length > 0 ? (
                                currentData.map((item) => (
                                    <tr 
                                        key={item.id || item.plate} 
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowDetailModal(true);
                                        }}
                                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#E60012]/10 group-hover:text-[#E60012] transition-colors" style={{ clipPath: ANGULAR_CLIP }}>
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-[#111111]">{item.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-medium">{item.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-[#111111]">{item.plate}</div>
                                            <div className="text-[11px] text-gray-500">{item.model}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {item.last_service}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-blue-100">
                                                {item.potential}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItem(item);
                                                    setShowModal(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-[#E60012] transition-colors"
                                            >
                                                <Wrench size={12} />
                                                Proses
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Search size={48} />
                                            <p className="font-bold uppercase tracking-widest text-xs">Belum ada data untuk kategori ini</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <ProcessModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        item={selectedItem}
                        onAction={handleAction}
                    />
                )}
                {showDetailModal && (
                    <DetailModal
                        isOpen={showDetailModal}
                        onClose={() => setShowDetailModal(false)}
                        item={selectedItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PotensiBooking;
