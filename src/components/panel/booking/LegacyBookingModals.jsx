import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Car, Phone, User, Settings, AlertCircle, Loader2, Copy, Check, Hash, History, ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDatePicker from '../../ui/CustomDatePicker';

// Manual constants since they might not be in utils/constants.js
const LEGACY_VEHICLES = [
    "MITSUBISHI PAJERO", "MITSUBISHI XPANDER", "MITSUBISHI DESTINATOR", "MITSUBISHI XFORCE",
    "MITSUBISHI ECLIPSE CROSS", "MITSUBISHI TRITON", "MITSUBISHI OUTLANDER", "MITSUBISHI OUTLANDER PHEV",
    "MITSUBISHI MIRAGE", "MITSUBISHI LANCER", "MITSUBISHI DELICA", "MITSUBISHI GRANDIS",
    "MITSUBISHI L300", "FUSO COLT DIESEL", "FUSO CANTER", "MITSUBISHI COLT T120SS"
];

const LEGACY_SERVICE_TYPES = [
    "1.000 KM", "10.000 KM", "20.000 KM", "30.000 KM", "40.000 KM", "50.000 KM",
    "60.000 KM", "70.000 KM", "80.000 KM", "90.000 KM", "100.000 KM",
    "RSB2JAM", "RSB3JAM", "RSB4JAM", "RINGAN", "BERAT", "FUELPUMP",
    "KELUHAN", "SPAREPART", "PERBAIKAN", "SPOORING BALANCING", "GENERAL CHECK UP", "RUTIN"
];

const CustomSelect = ({ value, onChange, options, placeholder, allowCustom = false, customPlaceholder = "Ketik manual..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : value;

    if (isCustom || (value && !selectedOption && allowCustom)) {
        return (
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={customPlaceholder}
                    className="w-full bg-white border border-red-300 rounded p-2.5 text-gray-900 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all pr-10 shadow-sm"
                    autoFocus
                />
                <button
                    type="button"
                    onClick={() => {
                        setIsCustom(false);
                        onChange('');
                    }}
                    className="absolute right-3 p-1 bg-red-50 rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border ${isOpen ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E5E5E5] hover:border-gray-300'} rounded p-2.5 text-left text-sm transition-all flex justify-between items-center`}
            >
                <span className={displayLabel ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {displayLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        <div className="py-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0 ${String(value) === String(opt.value) ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                            {allowCustom && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustom(true);
                                        setIsOpen(false);
                                        onChange('');
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-100 flex items-center justify-between"
                                >
                                    Lainnya (Input Manual) <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LEGACY_TIME_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "14:00"];

const DetailItem = ({ icon: Icon, label, value, displayValue, fieldName, colSpan = 1 }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value || value === '-') return;
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div
            onClick={handleCopy}
            className={`group cursor-pointer hover:bg-gray-100 p-2.5 -m-2.5 rounded transition-colors flex flex-col col-span-${colSpan}`}
            title="Klik untuk copy"
        >
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                {Icon && <Icon size={12} />} {label}
            </p>
            <div className="flex items-center justify-between gap-2">
                <p className={`text-sm ${fieldName === 'keluhan' ? 'font-medium bg-white p-2 rounded border border-[#E5E5E5] w-full' : 'font-bold'} ${fieldName === 'nopol' ? 'font-mono' : ''} ${fieldName === 'jam' ? 'text-[#E60012]' : 'text-[#111111]'}`}>
                    {displayValue || value || '-'}
                </p>
                {copied ? <Check size={14} className="text-green-500 shrink-0" /> : <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />}
            </div>
        </div>
    );
};

export const LegacyDetailModal = ({ isOpen, onClose, data, onEdit, onDelete }) => {
    const [logs, setLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isLogExpanded, setIsLogExpanded] = useState(false);

    useEffect(() => {
        if (isOpen && data?.id) {
            fetchLogs();
        } else {
            setLogs([]);
        }
        // Always collapse logs when modal is closed or data changes
        setIsLogExpanded(false);
    }, [isOpen, data?.id]);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch(`https://csdwindo.com/api/chat/booking_record.php?booking_id=${data.id}`);
            const result = await res.json();
            if (result.status) {
                setLogs(result.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    if (!isOpen || !data) return null;

    let formattedDate = data.tanggal;
    if (data.tanggal) {
        const d = new Date(data.tanggal);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    const adminUser = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
    const isPkl = adminUser.role === 'pkl';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50">
                        <h3 className="text-lg font-bold text-[#111111] font-display">Detail Booking</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-[#E60012] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <DetailItem icon={User} label="Nama" value={data.nama} fieldName="nama" />
                            <DetailItem icon={Phone} label="Telepon" value={data.telp} fieldName="telp" />
                            <DetailItem icon={Car} label="Kendaraan" value={data.kendaraan} fieldName="kendaraan" />
                            <DetailItem icon={Hash} label="Nopol" value={data.nopol} fieldName="nopol" />
                            <DetailItem icon={Calendar} label="Tanggal" value={data.tanggal} displayValue={formattedDate} fieldName="tanggal" />
                            <DetailItem icon={Clock} label="Jam" value={data.jam} fieldName="jam" />

                            <div className="col-span-2">
                                <DetailItem icon={Settings} label="Jenis Service" value={data.jenis} fieldName="jenis" />
                            </div>
                            <div className="col-span-2">
                                <DetailItem icon={AlertCircle} label="Keluhan" value={data.keluhan} fieldName="keluhan" />
                            </div>
                        </div>

                        {/* Booking Logs Section */}
                        {/* Collapsible Log Section */}
                        <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                            <button
                                onClick={() => setIsLogExpanded(!isLogExpanded)}
                                className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg transition-colors ${isLogExpanded ? 'bg-blue-50' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
                                        <History size={16} className={isLogExpanded ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'} />
                                    </div>
                                    <h4 className={`text-sm font-bold transition-colors ${isLogExpanded ? 'text-[#111111]' : 'text-gray-500 group-hover:text-[#111111]'}`}>
                                        Riwayat / Log Booking
                                    </h4>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={`text-gray-400 transition-transform duration-300 ${isLogExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {isLogExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        {isLoadingLogs ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                                <Loader2 size={24} className="animate-spin mb-2" />
                                                <p className="text-xs">Mengambil riwayat...</p>
                                            </div>
                                        ) : logs.length > 0 ? (
                                            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar py-2">
                                                {logs.map((log, index) => (
                                                    <div key={log.id} className="relative pl-6 pb-2 group/log">
                                                        {/* Timeline Line */}
                                                        {index !== logs.length - 1 && (
                                                            <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-gray-100 group-last:hidden" />
                                                        )}
                                                        {/* Timeline Dot */}
                                                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10" />

                                                        <div className="bg-gray-50 rounded-lg p-3 border border-[#E5E5E5] group-hover/log:border-blue-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase">
                                                                    {log.status}
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                    <Clock size={10} /> {new Date(log.time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                {log.before && log.before !== log.after && (
                                                                    <div className="text-[11px] text-gray-500 line-through decoration-red-300">
                                                                        {log.before}
                                                                    </div>
                                                                )}
                                                                <div className="text-xs text-[#111111] font-medium leading-relaxed">
                                                                    {log.after || 'Tidak ada keterangan detail'}
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-[10px] text-gray-400">
                                                                <User size={10} />
                                                                <span>Oleh: <span className="font-bold text-gray-600">{log.user}</span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 my-2">
                                                <p className="text-xs text-gray-500 italic">Belum ada riwayat untuk booking ini</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {!isPkl && (
                        <div className="p-4 border-t border-[#E5E5E5] flex justify-end gap-2 bg-gray-50">
                            <button onClick={() => onDelete(data.id)} className="px-4 py-2 text-sm font-bold text-[#E60012] hover:bg-red-50 rounded transition-colors border border-red-200">
                                Hapus
                            </button>
                            <button onClick={() => onEdit(data)} className="px-6 py-2 text-sm font-bold text-white bg-[#E60012] hover:bg-red-700 rounded transition-colors">
                                Ubah
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export const LegacyFormModal = ({ isOpen, onClose, initialData, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        tanggal: '',
        jam: '',
        kendaraan: '',
        nopol: '',
        nama: '',
        telp: '',
        jenis: '',
        keluhan: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);
    const [isFetchingNopol, setIsFetchingNopol] = useState(false);
    const [ubahStatus, setUbahStatus] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [duplicateAlert, setDuplicateAlert] = useState(null);
    const duplicateCheckRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!formData.nopol || formData.nopol.length < 3) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsFetchingNopol(true);
            try {
                const res = await fetch(`https://csdwindo.com/api/panel/data_booking.php?nopol=${formData.nopol}`);
                const data = await res.json();
                if (data.status && data.data) {
                    setFormData(prev => ({
                        ...prev,
                        kendaraan: data.data.kendaraan || prev.kendaraan,
                        nama: data.data.nama || prev.nama,
                        telp: data.data.telp || prev.telp
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetchingNopol(false);
            }
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [formData.nopol]);

    // Duplicate nopol check: fires when tanggal or nopol changes
    useEffect(() => {
        if (!formData.tanggal || !formData.nopol || formData.nopol.length < 3) {
            setDuplicateAlert(null);
            return;
        }

        if (duplicateCheckRef.current) clearTimeout(duplicateCheckRef.current);

        duplicateCheckRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://csdwindo.com/api/panel/data_booking.php?date=${formData.tanggal}`);
                const result = await res.json();
                if (result.status && result.data) {
                    const match = result.data.find(b => {
                        const sameNopol = b.nopol.replace(/\s/g, '').toUpperCase() === formData.nopol.replace(/\s/g, '').toUpperCase();
                        if (initialData) {
                            // Edit mode: only flag if different ID
                            return sameNopol && String(b.id) !== String(initialData.id);
                        }
                        return sameNopol;
                    });
                    if (match) {
                        const dateFormatted = new Date(formData.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                        setDuplicateAlert({
                            nopol: match.nopol,
                            tanggal: dateFormatted,
                            nama: match.nama,
                            jam: match.jam
                        });
                    } else {
                        setDuplicateAlert(null);
                    }
                }
            } catch (err) {
                console.error('Duplicate check failed:', err);
            }
        }, 600);

        return () => {
            if (duplicateCheckRef.current) clearTimeout(duplicateCheckRef.current);
        };
    }, [formData.tanggal, formData.nopol, initialData]);

    useEffect(() => {
        if (initialData) {
            const data = {
                id: initialData.id,
                tanggal: initialData.tanggal || '',
                jam: initialData.jam || '',
                kendaraan: initialData.kendaraan || '',
                nopol: initialData.nopol || '',
                nama: initialData.nama || '',
                telp: initialData.telp || '',
                jenis: initialData.jenis || '',
                keluhan: initialData.keluhan || ''
            };
            setFormData(data);
            setOriginalData({ tanggal: data.tanggal, jam: data.jam, nama: data.nama });
            setUbahStatus(false);
            setDuplicateAlert(null);
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setFormData({
                tanggal: tomorrow.toISOString().split('T')[0],
                jam: '', kendaraan: '', nopol: '', nama: '', telp: '', jenis: '', keluhan: ''
            });
            setOriginalData(null);
            setUbahStatus(false);
            setDuplicateAlert(null);
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'nopol' ? value.toUpperCase().replace(/\s/g, '') :
            name === 'nama' || name === 'keluhan' ? value.toUpperCase() : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            // Auto-check ubah status if tanggal, jam, or nama changed from original
            if (initialData && originalData && ['tanggal', 'jam', 'nama'].includes(name)) {
                const hasChanged =
                    (name === 'tanggal' ? newValue : updated.tanggal) !== originalData.tanggal ||
                    (name === 'jam' ? newValue : updated.jam) !== originalData.jam ||
                    (name === 'nama' ? newValue : updated.nama) !== originalData.nama;
                setUbahStatus(hasChanged);
            }
            return updated;
        });

        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        const required = ['tanggal', 'jam', 'kendaraan', 'nopol', 'nama', 'telp', 'jenis'];
        const newErrors = {};

        required.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === '') {
                newErrors[field] = 'Field ini wajib diisi';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setShowConfirm(true);
    };

    const handleConfirmSave = () => {
        onSave({ ...formData, ubahStatus: initialData ? ubahStatus : false });
        setShowConfirm(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50 shrink-0">
                        <h3 className="text-lg font-bold text-[#111111] font-display">
                            {initialData ? 'Ubah Booking' : 'Tambah Booking'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-[#E60012] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <form id="legacy-booking-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative" ref={datePickerRef}>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal Booking</label>
                                    <div
                                        className={`flex items-center justify-between w-full bg-white border ${errors.tanggal ? 'border-red-500' : 'border-[#E5E5E5]'} rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] cursor-pointer transition-all`}
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                    >
                                        <span>
                                            {formData.tanggal
                                                ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '- Pilih Tanggal -'}
                                        </span>
                                        <Calendar size={16} className={errors.tanggal ? 'text-red-500' : 'text-[#E60012]'} />
                                    </div>
                                    {errors.tanggal && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.tanggal}</p>}
                                    <AnimatePresence>
                                        {showDatePicker && (
                                            <CustomDatePicker
                                                currentDate={formData.tanggal || new Date().toISOString().split('T')[0]}
                                                onSelect={(dateStr) => {
                                                    setFormData(prev => ({ ...prev, tanggal: dateStr }));
                                                    setShowDatePicker(false);
                                                    if (initialData && originalData) {
                                                        setUbahStatus(prev => {
                                                            const hasChanged = dateStr !== originalData.tanggal || formData.jam !== originalData.jam || formData.nama !== originalData.nama;
                                                            return hasChanged;
                                                        });
                                                    }
                                                    if (errors.tanggal) {
                                                        setErrors(prev => {
                                                            const next = { ...prev };
                                                            delete next.tanggal;
                                                            return next;
                                                        });
                                                    }
                                                }}
                                                onClose={() => setShowDatePicker(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Jam Booking</label>
                                    <CustomSelect
                                        value={formData.jam}
                                        onChange={(val) => {
                                            const name = 'jam';
                                            const newValue = val;
                                            setFormData(prev => {
                                                const updated = { ...prev, [name]: newValue };
                                                if (initialData && originalData && ['tanggal', 'jam', 'nama'].includes(name)) {
                                                    const hasChanged =
                                                        (name === 'tanggal' ? newValue : updated.tanggal) !== originalData.tanggal ||
                                                        (name === 'jam' ? newValue : updated.jam) !== originalData.jam ||
                                                        (name === 'nama' ? newValue : updated.nama) !== originalData.nama;
                                                    setUbahStatus(hasChanged);
                                                }
                                                return updated;
                                            });
                                            if (errors.jam) {
                                                setErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next.jam;
                                                    return next;
                                                });
                                            }
                                        }}
                                        options={LEGACY_TIME_SLOTS.map(t => ({ label: t, value: t }))}
                                        placeholder="- Pilih Jam -"
                                        error={errors.jam}
                                    />
                                    {errors.jam && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.jam}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Kendaraan</label>
                                    <CustomSelect
                                        value={formData.kendaraan}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, kendaraan: val }));
                                            if (errors.kendaraan) {
                                                setErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next.kendaraan;
                                                    return next;
                                                });
                                            }
                                        }}
                                        options={LEGACY_VEHICLES.map(v => ({ label: v, value: v }))}
                                        placeholder="- Pilih Kendaraan -"
                                        allowCustom={true}
                                        error={errors.kendaraan}
                                    />
                                    {errors.kendaraan && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.kendaraan}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nomor Polisi</label>
                                    <div className="relative">
                                        <input type="text" name="nopol" value={formData.nopol} onChange={handleChange} placeholder="B 1234 ABC" className={`w-full bg-white border ${errors.nopol ? 'border-red-500' : 'border-[#E5E5E5]'} rounded p-2.5 text-[#111111] font-mono text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all pr-10`} />
                                        {errors.nopol && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.nopol}</p>}
                                        {isFetchingNopol && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Loader2 size={16} className="animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nama Konsumen</label>
                                    <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="NAMA LENGKAP" className={`w-full bg-white border ${errors.nama ? 'border-red-500' : 'border-[#E5E5E5]'} rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all`} />
                                    {errors.nama && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.nama}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Telepon / WhatsApp</label>
                                    <input type="text" name="telp" value={formData.telp} onChange={handleChange} placeholder="08123456789" className={`w-full bg-white border ${errors.telp ? 'border-red-500' : 'border-[#E5E5E5]'} rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all`} />
                                    {errors.telp && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.telp}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Jenis Service</label>
                                    <CustomSelect
                                        value={formData.jenis}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, jenis: val }));
                                            if (errors.jenis) {
                                                setErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next.jenis;
                                                    return next;
                                                });
                                            }
                                        }}
                                        options={LEGACY_SERVICE_TYPES.map(s => ({ label: s, value: s }))}
                                        placeholder="- Pilih Jenis Service -"
                                        allowCustom={true}
                                        error={errors.jenis}
                                    />
                                    {errors.jenis && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.jenis}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Keluhan / Catatan</label>
                                    <textarea name="keluhan" value={formData.keluhan} onChange={handleChange} rows="3" placeholder="Tulis keluhan jika ada..." className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none resize-none transition-all" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 border-t border-[#E5E5E5] flex items-center justify-between bg-gray-50 shrink-0">
                        {initialData ? (
                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                <input
                                    type="checkbox"
                                    checked={ubahStatus}
                                    onChange={(e) => setUbahStatus(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#E60012] focus:ring-[#E60012] cursor-pointer accent-[#E60012]"
                                />
                                <span className="text-xs font-medium text-gray-500 group-hover:text-[#111111] transition-colors">
                                    Ubah status ke <span className="font-bold text-orange-600">UBAH</span>
                                </span>
                            </label>
                        ) : <div />}
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#111111] transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="legacy-booking-form" disabled={isLoading} className="px-6 py-2 text-sm font-bold text-white bg-[#E60012] hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md">
                                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Simpan
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Duplicate Nopol Alert Modal */}
                <AnimatePresence>
                    {duplicateAlert && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDuplicateAlert(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-orange-200"
                            >
                                <div className="p-5 text-center bg-gradient-to-b from-orange-50 to-white border-b border-orange-100">
                                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-orange-200 shadow-sm">
                                        <ShieldAlert size={28} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[#111111]">Booking Duplikat!</h4>
                                    <p className="text-xs text-gray-500 mt-1">Nopol ini sudah terdaftar pada tanggal yang dipilih.</p>
                                </div>

                                <div className="p-5 space-y-3">
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Nopol</span>
                                            <span className="text-sm font-bold text-[#111111] font-mono bg-white px-2 py-0.5 rounded border border-orange-200">{duplicateAlert.nopol}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Tanggal</span>
                                            <span className="text-sm font-medium text-[#111111]">{duplicateAlert.tanggal}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Nama</span>
                                            <span className="text-sm font-medium text-[#111111]">{duplicateAlert.nama}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Jam</span>
                                            <span className="text-sm font-bold text-[#E60012]">{duplicateAlert.jam}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                                        Anda tetap bisa menyimpan data ini, namun pastikan booking tidak terduplikasi.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => setDuplicateAlert(null)}
                                        className="w-full px-4 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 transition-all"
                                    >
                                        Saya Mengerti
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100"
                            >
                                <div className="p-5 text-center bg-gray-50 border-b border-gray-100">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[#111111]">Konfirmasi Data</h4>
                                    <p className="text-xs text-gray-500 mt-1">Pastikan data berikut sudah benar sebelum disimpan.</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama</p>
                                            <p className="text-sm font-bold text-[#111111] truncate">{formData.nama}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nopol</p>
                                            <p className="text-sm font-bold text-[#111111] font-mono">{formData.nopol}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal</p>
                                            <p className="text-sm font-bold text-[#111111]">
                                                {formData.tanggal ? new Date(formData.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jam</p>
                                            <p className="text-sm font-bold text-red-600 font-mono">{formData.jam}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jenis Service</p>
                                            <p className="text-sm font-bold text-[#111111]">{formData.jenis}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Keluhan / Catatan</p>
                                            <p className="text-sm font-medium text-[#111111] whitespace-pre-wrap">{formData.keluhan || '-'}</p>
                                        </div>
                                    </div>

                                    {initialData && ubahStatus && (
                                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-2">
                                            <ShieldAlert size={16} className="text-orange-600 shrink-0" />
                                            <p className="text-[11px] font-medium text-orange-700">
                                                Status akan diubah menjadi <span className="font-bold">UBAH</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        onClick={handleConfirmSave}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                                        Ya, Simpan
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatePresence>
    );
};
