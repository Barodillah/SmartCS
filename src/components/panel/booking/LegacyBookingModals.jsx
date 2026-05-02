import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Car, Phone, User, Settings, AlertCircle, Loader2, Copy, Check, Hash } from 'lucide-react';
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
                {Icon && <Icon size={12}/>} {label}
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
        } else {
            setFormData({
                tanggal: new Date().toISOString().split('T')[0],
                jam: '', kendaraan: '', nopol: '', nama: '', telp: '', jenis: '', keluhan: ''
            });
            setOriginalData(null);
            setUbahStatus(false);
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, ubahStatus: initialData ? ubahStatus : false });
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
                                        className="flex items-center justify-between w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] cursor-pointer transition-all"
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                    >
                                        <span>
                                            {formData.tanggal 
                                                ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                                : '- Pilih Tanggal -'}
                                        </span>
                                        <Calendar size={16} className="text-[#E60012]" />
                                    </div>
                                    <AnimatePresence>
                                        {showDatePicker && (
                                            <CustomDatePicker 
                                                currentDate={formData.tanggal || new Date().toISOString().split('T')[0]} 
                                                onSelect={(dateStr) => { 
                                                    setFormData(prev => ({...prev, tanggal: dateStr})); 
                                                    setShowDatePicker(false);
                                                    if (initialData && originalData) {
                                                        setUbahStatus(prev => {
                                                            const hasChanged = dateStr !== originalData.tanggal || formData.jam !== originalData.jam || formData.nama !== originalData.nama;
                                                            return hasChanged;
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
                                    <select required name="jam" value={formData.jam} onChange={handleChange} className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all">
                                        <option value="">- Pilih Jam -</option>
                                        {LEGACY_TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Kendaraan</label>
                                    <select required name="kendaraan" value={formData.kendaraan} onChange={handleChange} className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all">
                                        <option value="">- Pilih Kendaraan -</option>
                                        {LEGACY_VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nomor Polisi</label>
                                    <div className="relative">
                                        <input required type="text" name="nopol" value={formData.nopol} onChange={handleChange} placeholder="B 1234 ABC" className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] font-mono text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all pr-10" />
                                        {isFetchingNopol && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Loader2 size={16} className="animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nama Konsumen</label>
                                    <input required type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="NAMA LENGKAP" className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Telepon / WhatsApp</label>
                                    <input required type="text" name="telp" value={formData.telp} onChange={handleChange} placeholder="08123456789" className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all" />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Jenis Service</label>
                                    <select required name="jenis" value={formData.jenis} onChange={handleChange} className="w-full bg-white border border-[#E5E5E5] rounded p-2.5 text-[#111111] text-sm focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] outline-none transition-all">
                                        <option value="">- Pilih Jenis Service -</option>
                                        {LEGACY_SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
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
            </div>
        </AnimatePresence>
    );
};
