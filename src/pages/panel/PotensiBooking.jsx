import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Calendar, Wrench, MessageSquare, Filter, ChevronRight, User, Phone, Store, X, Copy, Check, Hash, Info, Car, ChevronLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import { CustomSelect, LegacyFormModal } from '../../components/panel/booking/LegacyBookingModals';

const DetailModal = ({ isOpen, onClose, item, onProcess, onNext, mainFilter, onWhatsapp, onBooking }) => {
    const [copiedField, setCopiedField] = useState(null);
    const [fetchedRangka, setFetchedRangka] = useState(null);

    useEffect(() => {
        if (!isOpen || !item) {
            setFetchedRangka(null);
            return;
        }
        // Jika item sudah punya rangka (dari Data PKT), tidak perlu fetch
        if (item.rangka) {
            setFetchedRangka(null);
            return;
        }
        // Fetch rangka dari STNK data (untuk Data Booking yang tidak punya rangka)
        if (item.plate) {
            const cleanPlate = item.plate.replace(/\s/g, '').toUpperCase();
            fetch(`https://csdwindo.com/api/panel/sales_survey.php?action=list&search=${encodeURIComponent(cleanPlate)}`)
                .then(res => res.json())
                .then(json => {
                    if (json.status && json.data && json.data.length > 0) {
                        const match = json.data.find(d =>
                            d.stnk?.replace(/\s/g, '').toUpperCase() === cleanPlate ||
                            d.nopol?.replace(/\s/g, '').toUpperCase() === cleanPlate
                        );
                        if (match && match.rangka) {
                            setFetchedRangka(match.rangka);
                        } else {
                            setFetchedRangka(null);
                        }
                    } else {
                        setFetchedRangka(null);
                    }
                })
                .catch(() => setFetchedRangka(null));
        }
    }, [isOpen, item?.plate, item?.rangka]);

    if (!isOpen || !item) return null;

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const rangkaValue = item.rangka || fetchedRangka;

    const detailRows = [
        { label: 'Customer', value: item.name, icon: User },
        { label: 'Phone', value: item.phone, icon: Phone },
        { label: 'Kendaraan', value: item.model, icon: Car },
        { label: 'Nomor Polisi', value: item.plate, icon: Hash, copyable: true, field: 'plate' },
        ...(rangkaValue ? [{ label: 'No. Rangka', value: rangkaValue, icon: Wrench, copyable: true, field: 'rangka' }] : []),
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
                    <div className="mt-8 flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#F5F5F5] text-[#111111] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all border border-[#E5E5E5]"
                        >
                            Tutup
                        </button>
                        {mainFilter === 'clean' ? (
                            <>
                                {item.status === 'NEW' && (
                                    <button
                                        onClick={onWhatsapp}
                                        className="flex-1 py-3 bg-[#25D366] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={14} /> WhatsApp
                                    </button>
                                )}
                                {item.status === 'FOLLOW_UP' && (
                                    <button
                                        onClick={onBooking}
                                        className="flex-1 py-3 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={14} /> Booking
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={onProcess}
                                className="flex-1 py-3 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E60012] transition-colors flex items-center justify-center gap-2"
                            >
                                <Wrench size={14} /> Proses
                            </button>
                        )}
                        {onNext && (
                            <button
                                onClick={onNext}
                                className="flex-1 py-3 bg-[#E60012] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ProcessModal = ({ isOpen, onClose, item, onAction, mainFilter, isAlreadyCleaned }) => {
    const [activeAction, setActiveAction] = useState(null);

    // Form states
    const [potensiService, setPotensiService] = useState('');
    const [expiredDate, setExpiredDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [serviceDate, setServiceDate] = useState('');
    const [otherDealer, setOtherDealer] = useState('');
    const [rangka, setRangka] = useState('');

    const [showDatePicker1, setShowDatePicker1] = useState(false);
    const [showDatePicker2, setShowDatePicker2] = useState(false);

    // Auto-fetch rangka from STNK data (same logic as DetailModal)
    useEffect(() => {
        if (!isOpen || !item) {
            setRangka('');
            return;
        }
        // If item already has rangka (from PKT data), use it
        if (item.rangka) {
            setRangka(item.rangka);
            return;
        }
        // Fetch from STNK data
        if (item.plate) {
            const cleanPlate = item.plate.replace(/\s/g, '').toUpperCase();
            fetch(`https://csdwindo.com/api/panel/sales_survey.php?action=list&search=${encodeURIComponent(cleanPlate)}`)
                .then(res => res.json())
                .then(json => {
                    if (json.status && json.data && json.data.length > 0) {
                        const match = json.data.find(d =>
                            d.stnk?.replace(/\s/g, '').toUpperCase() === cleanPlate ||
                            d.nopol?.replace(/\s/g, '').toUpperCase() === cleanPlate
                        );
                        if (match && match.rangka) {
                            setRangka(match.rangka);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [isOpen, item?.plate, item?.rangka]);

    if (!isOpen || !item) return null;

    const actions = [
        { id: 'clean', label: 'Clean Data', icon: Check, color: 'bg-[#25D366]' },
        { id: 'dwindo', label: 'Service Dwindo', icon: Wrench, color: 'bg-blue-500' },
        { id: 'other', label: 'Other Dealer', icon: Store, color: 'bg-orange-500' },
        { id: 'invalid', label: 'Invalid Data', icon: X, color: 'bg-red-600' },
    ];

    const serviceOptions = [
        { value: '1.000 KM', label: '1.000 KM' },
        { value: '10.000 KM', label: '10.000 KM' },
        { value: '20.000 KM', label: '20.000 KM' },
        { value: '30.000 KM', label: '30.000 KM' },
        { value: '40.000 KM', label: '40.000 KM' },
        { value: '50.000 KM', label: '50.000 KM' },
        { value: '60.000 KM', label: '60.000 KM' },
        { value: '70.000 KM', label: '70.000 KM' },
        { value: '80.000 KM', label: '80.000 KM' },
        { value: '90.000 KM', label: '90.000 KM' },
        { value: '100.000 KM', label: '100.000 KM' },
    ];

    const handleRangkaChange = (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
        setRangka(val);
    };

    const handleSubmit = () => {
        let payload = {};
        if (activeAction === 'clean') {
            payload = { type: 'clean', potensiService, expiredDate, rangka, source: mainFilter?.toUpperCase() || '' };
        } else if (activeAction === 'dwindo') {
            payload = { type: 'dwindo', serviceDate };
        } else if (activeAction === 'other') {
            payload = { type: 'other', serviceDate, otherDealer };
        }
        onAction(activeAction, item, payload);
        setActiveAction(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-visible"
            >
                <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                        {activeAction && (
                            <button onClick={() => setActiveAction(null)} className="p-1 text-gray-400 hover:text-[#111111] transition-colors rounded">
                                <ChevronLeft size={16} />
                            </button>
                        )}
                        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                            {activeAction ? actions.find(a => a.id === activeAction)?.label : 'Proses Pontential Data'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#E60012] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    {isAlreadyCleaned && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 animate-pulse">
                            <ShieldAlert size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Perhatian</div>
                                <div className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
                                    Nopol ini sudah ada di daftar <b>Clean Data</b> dan sedang dalam proses follow-up.
                                </div>
                            </div>
                        </div>
                    )}
                    {!activeAction ? (
                        <>
                            <div className="mb-6 text-center">
                                <div className="text-sm font-bold text-[#111111]">{item.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{item.plate} • {item.model}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {actions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setActiveAction(action.id)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-white ${action.color} hover:opacity-90 transition-all shadow-sm group`}
                                    >
                                        <action.icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-center">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {activeAction === 'clean' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">No. Rangka</label>
                                        <input
                                            type="text"
                                            value={rangka}
                                            onChange={handleRangkaChange}
                                            maxLength={17}
                                            className={`w-full bg-white border ${rangka.length === 17 ? 'border-green-400' : 'border-[#E5E5E5]'} focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded p-2.5 text-sm transition-all outline-none font-mono uppercase tracking-wider`}
                                            placeholder="Contoh: MK2NCXTATPJ014580"
                                        />
                                        <p className={`text-[10px] mt-1 ${rangka.length === 17 ? 'text-green-500' : 'text-gray-400'}`}>{rangka.length}/17 karakter</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Potensi Service</label>
                                        <CustomSelect
                                            value={potensiService}
                                            onChange={setPotensiService}
                                            options={serviceOptions}
                                            placeholder="Pilih Potensi Service"
                                            allowCustom={true}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Date</label>
                                        <div
                                            onClick={() => setShowDatePicker1(!showDatePicker1)}
                                            className="w-full bg-white border border-[#E5E5E5] hover:border-gray-300 rounded p-2.5 text-left text-sm transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <Calendar size={16} className="text-[#E60012]" />
                                            <span className={expiredDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                                {expiredDate || 'Pilih Tanggal'}
                                            </span>
                                        </div>
                                        <AnimatePresence>
                                            {showDatePicker1 && (
                                                <CustomDatePicker
                                                    currentDate={expiredDate}
                                                    onSelect={(date) => { setExpiredDate(date); setShowDatePicker1(false); }}
                                                    onClose={() => setShowDatePicker1(false)}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}

                            {activeAction === 'dwindo' && (
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Date</label>
                                    <div
                                        onClick={() => setShowDatePicker2(!showDatePicker2)}
                                        className="w-full bg-white border border-[#E5E5E5] hover:border-gray-300 rounded p-2.5 text-left text-sm transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Calendar size={16} className="text-[#E60012]" />
                                        <span className={serviceDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                            {serviceDate || 'Pilih Tanggal'}
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {showDatePicker2 && (
                                            <CustomDatePicker
                                                currentDate={serviceDate}
                                                onSelect={(date) => { setServiceDate(date); setShowDatePicker2(false); }}
                                                onClose={() => setShowDatePicker2(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {activeAction === 'other' && (
                                <>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Date</label>
                                        <div
                                            onClick={() => setShowDatePicker2(!showDatePicker2)}
                                            className="w-full bg-white border border-[#E5E5E5] hover:border-gray-300 rounded p-2.5 text-left text-sm transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <Calendar size={16} className="text-[#E60012]" />
                                            <span className={serviceDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                                {serviceDate || 'Pilih Tanggal'}
                                            </span>
                                        </div>
                                        <AnimatePresence>
                                            {showDatePicker2 && (
                                                <CustomDatePicker
                                                    currentDate={serviceDate}
                                                    onSelect={(date) => { setServiceDate(date); setShowDatePicker2(false); }}
                                                    onClose={() => setShowDatePicker2(false)}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Other Dealer</label>
                                        <input
                                            type="text"
                                            value={otherDealer}
                                            onChange={(e) => setOtherDealer(e.target.value)}
                                            className="w-full bg-white border border-[#E5E5E5] focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded p-2.5 text-sm transition-all outline-none"
                                            placeholder="Nama Dealer Lain"
                                        />
                                    </div>
                                </>
                            )}

                            {activeAction === 'invalid' && (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X size={32} />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#111111] mb-2 uppercase">Konfirmasi Invalid</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Apakah Anda yakin ingin menandai data <b>{item.name}</b> sebagai Invalid?</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                className={`w-full mt-4 py-3 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${activeAction === 'invalid' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#E60012] hover:bg-red-700'}`}
                            >
                                {activeAction === 'invalid' ? 'Ya, Tandai Invalid!' : 'Submit'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const PotensiBooking = () => {
    const [mainFilter, setMainFilter] = useState('booking'); // 'booking', 'pkt', 'clean'
    const [activeTab, setActiveTab] = useState('6_bulan'); // for booking: 6, 12, 18, 24; for pkt: 1k, 10k...60k
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ booking: {}, pkt: {} });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // State for filtering
    const [allCleanNopols, setAllCleanNopols] = useState(new Set());

    // Clean data states
    const [cleanData, setCleanData] = useState([]);
    const [cleanFilterSA, setCleanFilterSA] = useState('');
    const [cleanFilterStatus, setCleanFilterStatus] = useState('');
    const [isLoadingClean, setIsLoadingClean] = useState(false);

    // Booking Form Modal states
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingFormData, setBookingFormData] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

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
        if (mainFilter !== 'clean' && mainFilter !== 'report') return;
        const fetchCleanData = async () => {
            setIsLoadingClean(true);
            try {
                let url = 'https://csdwindo.com/api/potensi_service.php?action=list';
                if (cleanFilterSA) url += `&sa=${encodeURIComponent(cleanFilterSA)}`;
                if (cleanFilterStatus) url += `&status=${encodeURIComponent(cleanFilterStatus)}`;
                const res = await fetch(url);
                const json = await res.json();
                if (json.status && json.data) {
                    const mappedData = json.data.map(d => ({
                        ...d,
                        name: d.nama,
                        phone: d.telp,
                        plate: d.nopol,
                        model: d.kendaraan,
                        last_service: d.service_terakhir,
                        potential: d.potensi_service,
                    }));
                    setCleanData(mappedData);
                } else {
                    setCleanData([]);
                }
            } catch (err) {
                console.error(err);
                setCleanData([]);
            } finally {
                setIsLoadingClean(false);
            }
        };
        fetchCleanData();
    }, [mainFilter, cleanFilterSA, cleanFilterStatus]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch All Clean Nopols first
                const cleanRes = await fetch('https://csdwindo.com/api/potensi_service.php?action=list');
                const cleanJson = await cleanRes.json();
                if (cleanJson.status && cleanJson.data) {
                    // Sembunyikan jika status BUKAN 'BOOKING'
                    const nopolsToHide = new Set(
                        cleanJson.data
                            .filter(d => d.status !== 'BOOKING')
                            .map(d => d.nopol?.replace(/\s/g, '').toUpperCase())
                    );
                    setAllCleanNopols(nopolsToHide);
                }

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

    const baseData = mainFilter === 'clean' ? cleanData : (data[mainFilter]?.[activeTab] || []);
    const currentData = mainFilter === 'clean'
        ? baseData
        : baseData.filter(item => {
            const plate = (item.plate || item.nopol || '').replace(/\s/g, '').toUpperCase();
            return !allCleanNopols.has(plate);
        });

    const handleAction = async (type, item, payload) => {
        if (type === 'clean') {
            setIsSubmitting(true);
            try {
                let cleanPayload = {
                    nopol: item.plate || '',
                    nama: item.name || '',
                    telp: item.phone || '',
                    kendaraan: item.model || '',
                    service_terakhir: item.last_service || '',
                    source: payload?.source || mainFilter?.toUpperCase() || '',
                    rangka: payload?.rangka || '',
                    potensi_service: payload?.potensiService || '',
                    expected_date: payload?.expiredDate || '',
                };

                const res = await fetch('https://csdwindo.com/api/potensi_service.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanPayload)
                });
                const result = await res.json();

                if (result.status) {
                    showToast(result.message || `Data ${item.name} berhasil diproses`);
                    const cleanPlate = (item.plate || item.nopol || '').replace(/\s/g, '').toUpperCase();
                    setAllCleanNopols(prev => {
                        const next = new Set(prev);
                        next.add(cleanPlate);
                        return next;
                    });
                } else {
                    showToast(result.message || 'Gagal memproses data', 'error');
                }
            } catch (err) {
                console.error('Action error:', err);
                showToast('Terjadi kesalahan jaringan', 'error');
            } finally {
                setIsSubmitting(false);
            }
            setShowModal(false);
            return;
        }

        // For dwindo and other, create a booking entry
        setIsSubmitting(true);
        const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        const userName = user.name || user.nama || 'STAFF';

        let bookingPayload = {
            tanggal: payload?.serviceDate || new Date().toISOString().split('T')[0],
            jam: '10:00',
            kendaraan: item.model || '',
            nopol: item.plate || '',
            nama: item.name || '',
            telp: item.phone || '',
            user: userName,
        };

        if (type === 'dwindo') {
            bookingPayload.jenis = 'WALK IN';
            bookingPayload.keluhan = '';
            bookingPayload.forceStatus = 'DATANG';
        } else if (type === 'other') {
            bookingPayload.jenis = payload?.otherDealer || 'OTHER DEALER';
            bookingPayload.keluhan = payload?.otherDealer || '';
            bookingPayload.forceStatus = 'OTHER DEALER';
        } else if (type === 'invalid') {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            bookingPayload.tanggal = d.toISOString().split('T')[0];
            bookingPayload.forceStatus = 'INVALID';
            bookingPayload.jenis = 'INVALID';
            bookingPayload.keluhan = 'DATA DISET INVALID DARI POTENSI';
        }

        try {
            const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            });
            const result = await res.json();
            if (result.status) {
                const typeLabels = { dwindo: 'Service Dwindo', other: 'Other Dealer', invalid: 'Invalid Data' };
                showToast(result.message || `${typeLabels[type] || type} berhasil diproses`);

                // Hide from list immediately
                const cleanPlate = (item.plate || item.nopol || '').replace(/\s/g, '').toUpperCase();
                setAllCleanNopols(prev => {
                    const next = new Set(prev);
                    next.add(cleanPlate);
                    return next;
                });
            } else {
                showToast(result.message || 'Gagal memproses data', 'error');
            }
        } catch (err) {
            console.error('Action error:', err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSubmitting(false);
        }
        setShowModal(false);
    };

    const handleSaveLegacyBooking = async (formData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (result.status) {
                showToast('Booking berhasil dibuat');
                setShowBookingForm(false);
                if (selectedItem?.id) {
                    await fetch('https://csdwindo.com/api/potensi_service.php', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedItem.id, status: 'BOOKING' })
                    });
                    setCleanData(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: 'BOOKING' } : item));

                    // Karena sudah BOOKING, maka jangan sembunyikan lagi dari list utama
                    const plate = (selectedItem.plate || selectedItem.nopol || '').replace(/\s/g, '').toUpperCase();
                    setAllCleanNopols(prev => {
                        const next = new Set(prev);
                        next.delete(plate);
                        return next;
                    });
                }
            } else {
                showToast(result.message || 'Gagal membuat booking', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                <button
                    onClick={() => {
                        setMainFilter('clean');
                        setActiveTab('');
                    }}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${mainFilter === 'clean' ? 'bg-[#E60012] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
                    style={mainFilter === 'clean' ? { clipPath: ANGULAR_CLIP } : {}}
                >
                    Clean Data
                </button>
                <button
                    onClick={() => {
                        setMainFilter('report');
                        setActiveTab('');
                    }}
                    className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${mainFilter === 'report' ? 'bg-[#E60012] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
                    style={mainFilter === 'report' ? { clipPath: ANGULAR_CLIP } : {}}
                >
                    Report
                </button>
            </div>

            {/* Sub Tabs or Filters */}
            {mainFilter !== 'clean' && mainFilter !== 'report' ? (
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
            ) : mainFilter === 'clean' ? (
                <div className="flex gap-4 mb-6">
                    <div className="w-56">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Filter SA</label>
                        <CustomSelect
                            value={cleanFilterSA}
                            onChange={(val) => setCleanFilterSA(val)}
                            options={[
                                { value: '', label: 'Semua SA' },
                                { value: 'Dimas', label: 'Dimas' },
                                { value: 'Ipral', label: 'Ipral' },
                                { value: 'Muti', label: 'Muti' },
                                { value: 'Rudi', label: 'Rudi' },
                                { value: 'Yuda', label: 'Yuda' },
                                { value: 'Ilham', label: 'Ilham' },
                            ]}
                            placeholder="Semua SA"
                        />
                    </div>
                    <div className="w-56">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Filter Status</label>
                        <CustomSelect
                            value={cleanFilterStatus}
                            onChange={(val) => setCleanFilterStatus(val)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'NEW', label: 'Belum Follow Up (NEW)' },
                                { value: 'FOLLOW_UP', label: 'Sudah Follow Up' },
                                { value: 'BOOKING', label: 'Success Booking' },
                                { value: 'INVALID', label: 'Invalid' },
                            ]}
                            placeholder="Semua Status"
                        />
                    </div>
                </div>
            ) : null}

            {/* Data Table or Report View */}
            {mainFilter === 'report' ? (
                <div className="bg-white border border-[#E5E5E5] p-6 rounded-xl shadow-sm mb-6">
                    <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm mb-6">Report Follow Up SA</h3>

                    {isLoadingClean ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : (
                        (() => {
                            const reportData = {};
                            cleanData.forEach(item => {
                                const sa = item.sa || 'Belum Diatur';
                                if (!reportData[sa]) {
                                    reportData[sa] = { NEW: 0, FOLLOW_UP: 0, BOOKING: 0, INVALID: 0, total: 0 };
                                }
                                const status = item.status || 'NEW';
                                if (reportData[sa][status] !== undefined) {
                                    reportData[sa][status]++;
                                    reportData[sa].total++;
                                }
                            });

                            const saList = Object.keys(reportData).sort((a, b) => reportData[b].total - reportData[a].total);
                            if (saList.length === 0) {
                                return <div className="h-64 flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">Tidak ada data</div>;
                            }

                            const maxCount = Math.max(...saList.map(sa => reportData[sa].total), 10);

                            return (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-end gap-2 w-full h-80 border-b border-l border-gray-200 p-4 pt-8">
                                        {saList.map((sa, idx) => {
                                            const data = reportData[sa];
                                            const newHeight = `${(data.NEW / maxCount) * 100}%`;
                                            const followUpHeight = `${(data.FOLLOW_UP / maxCount) * 100}%`;
                                            const bookingHeight = `${(data.BOOKING / maxCount) * 100}%`;
                                            const invalidHeight = `${(data.INVALID / maxCount) * 100}%`;

                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                                    <div className="w-full max-w-[24px] sm:max-w-[40px] flex flex-col justify-end h-full group-hover:opacity-80 transition-opacity mx-auto">
                                                        {data.INVALID > 0 && <div className="w-full bg-red-500 rounded-t-sm mb-px" style={{ height: invalidHeight }}></div>}
                                                        {data.NEW > 0 && <div className="w-full bg-amber-400 rounded-t-sm mb-px" style={{ height: newHeight }}></div>}
                                                        {data.FOLLOW_UP > 0 && <div className="w-full bg-blue-500 rounded-t-sm mb-px" style={{ height: followUpHeight }}></div>}
                                                        {data.BOOKING > 0 && <div className="w-full bg-green-500 rounded-t-sm" style={{ height: bookingHeight }}></div>}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-bold mt-2 text-center truncate w-full px-1">{sa}</span>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg transition-opacity pointer-events-none z-10 shadow-xl border border-gray-700 w-max min-w-[140px] left-1/2 transform -translate-x-1/2">
                                                        <div className="font-bold mb-1.5 border-b border-gray-700 pb-1.5 text-center text-gray-300">SA: {sa}</div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between items-center gap-4"><span className="text-green-400 font-bold">Booking:</span><span className="font-mono">{data.BOOKING}</span></div>
                                                            <div className="flex justify-between items-center gap-4"><span className="text-blue-400 font-bold">Follow Up:</span><span className="font-mono">{data.FOLLOW_UP}</span></div>
                                                            <div className="flex justify-between items-center gap-4"><span className="text-amber-400 font-bold">New:</span><span className="font-mono">{data.NEW}</span></div>
                                                            <div className="flex justify-between items-center gap-4"><span className="text-red-400 font-bold">Invalid:</span><span className="font-mono">{data.INVALID}</span></div>
                                                        </div>
                                                        <div className="mt-1.5 pt-1.5 border-t border-gray-700 font-bold flex justify-between items-center">
                                                            <span>Total:</span> <span className="font-mono">{data.total}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex flex-wrap justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="text-xs font-bold text-gray-600">BOOKING</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span className="text-xs font-bold text-gray-600">FOLLOW UP</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div><span className="text-xs font-bold text-gray-600">NEW</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div><span className="text-xs font-bold text-gray-600">INVALID</span></div>
                                    </div>
                                </div>
                            );
                        })()
                    )}
                </div>
            ) : (
                <div className="bg-white border border-[#E5E5E5] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                                    {mainFilter === 'clean' ? (
                                        <>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Kendaraan</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Potensi & Tanggal</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">SA & Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Customer</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Kendaraan</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">{mainFilter === 'booking' ? 'Service Terakhir' : 'Warranty Date'}</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">Potensi</th>
                                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Aksi</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {isLoadingClean && mainFilter === 'clean' ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">Loading data...</td>
                                    </tr>
                                ) : currentData.length > 0 ? (
                                    currentData.map((item) => (
                                        <tr
                                            key={item.id || item.plate || item.nopol}
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowDetailModal(true);
                                            }}
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                        >
                                            {mainFilter === 'clean' ? (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#E60012]/10 group-hover:text-[#E60012] transition-colors" style={{ clipPath: ANGULAR_CLIP }}>
                                                                <User size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-[#111111]">{item.nama}</div>
                                                                <div className="text-[11px] text-gray-500 font-medium">{item.telp}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-[#111111]">{item.nopol}</div>
                                                        <div className="text-[11px] text-gray-500">{item.kendaraan}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-[#111111]">{item.potensi_service}</div>
                                                        <div className="text-[11px] text-gray-500">{item.expected_date}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-[#111111]">{item.sa}</div>
                                                        <div className="text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full" style={{
                                                            backgroundColor: item.status === 'NEW' ? '#FFFBEB' : item.status === 'FOLLOW_UP' ? '#EFF6FF' : item.status === 'BOOKING' ? '#ECFDF5' : '#FEF2F2',
                                                            color: item.status === 'NEW' ? '#D97706' : item.status === 'FOLLOW_UP' ? '#3B82F6' : item.status === 'BOOKING' ? '#10B981' : '#EF4444'
                                                        }}>
                                                            {item.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="text-[11px] text-gray-500">{item.time}</div>
                                                        {item.note && <div className="text-[10px] text-red-500 mt-1 truncate max-w-[120px] ml-auto">{item.note}</div>}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
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
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            {item.last_service || item.warranty_date}
                                                        </div>
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
                                                </>
                                            )}
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
            )}

            <AnimatePresence>
                {showModal && (
                    <ProcessModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        item={selectedItem}
                        onAction={handleAction}
                        mainFilter={mainFilter}
                        isAlreadyCleaned={allCleanNopols.has((selectedItem?.plate || selectedItem?.nopol || '').replace(/\s/g, '').toUpperCase())}
                    />
                )}
                {showDetailModal && (
                    <DetailModal
                        isOpen={showDetailModal}
                        onClose={() => setShowDetailModal(false)}
                        item={selectedItem}
                        mainFilter={mainFilter}
                        onProcess={() => {
                            setShowDetailModal(false);
                            setShowModal(true);
                        }}
                        onWhatsapp={() => {
                            const p = selectedItem;
                            let phone = (p.phone || p.telp || '').replace(/\D/g, '');
                            if (phone.startsWith('0')) phone = '62' + phone.substring(1);

                            const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
                            const userName = user.name || user.nama || 'Staff';
                            const message = `Halo Bapak/Ibu ${p.name || p.nama},\n\nPerkenalkan saya ${userName} dari Mitsubishi Bintaro.\n\nKami ingin menginformasikan bahwa kendaraan *${p.model || p.kendaraan}* (${p.plate || p.nopol}) Anda sudah waktunya untuk melakukan Service Rutin *${p.potential || p.potensi_service}*.\n\nApakah Bapak/Ibu berkenan untuk booking jadwal service? Kami siap membantu menjadwalkan waktu yang paling nyaman untuk Anda.\n\nJika Bapak/Ibu ingin melakukan booking langsung, bisa melalui link berikut: https://booking.csdwindo.com\n\nTerima kasih.\n\nSalam,\n${userName}\nMitsubishi Bintaro`;

                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

                            if (p.id) {
                                fetch('https://csdwindo.com/api/potensi_service.php', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: p.id, status: 'FOLLOW_UP' })
                                }).then(() => {
                                    setCleanData(prev => prev.map(item => item.id === p.id ? { ...item, status: 'FOLLOW_UP' } : item));
                                    setSelectedItem(prev => ({ ...prev, status: 'FOLLOW_UP' }));
                                });
                            }
                        }}
                        onBooking={() => {
                            setShowDetailModal(false);
                            setBookingFormData({
                                nopol: selectedItem.plate || selectedItem.nopol,
                                nama: selectedItem.name || selectedItem.nama,
                                telp: selectedItem.phone || selectedItem.telp,
                                kendaraan: selectedItem.model || selectedItem.kendaraan,
                                jenis: selectedItem.potential || selectedItem.potensi_service,
                                user: 'CUSTOMER',
                                jam: '10:00'
                            });
                            setShowBookingForm(true);
                        }}
                        onNext={() => {
                            const idx = currentData.findIndex(i => (i.id || i.plate || i.nopol) === (selectedItem.id || selectedItem.plate || selectedItem.nopol));
                            if (idx >= 0 && idx < currentData.length - 1) {
                                setSelectedItem(currentData[idx + 1]);
                            }
                        }}
                    />
                )}
                {showBookingForm && (
                    <LegacyFormModal
                        isOpen={showBookingForm}
                        onClose={() => setShowBookingForm(false)}
                        initialData={bookingFormData}
                        onSave={handleSaveLegacyBooking}
                        isLoading={isSubmitting}
                        isNewBooking={true}
                    />
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
                        {toast.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PotensiBooking;
