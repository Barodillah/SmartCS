import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, Calendar, CheckCircle, Search, AlertCircle, Phone, Info, Clock, Wrench, ChevronRight, Check, X, ChevronDown, MessageSquare } from 'lucide-react';
import CustomDatePicker from '../components/ui/CustomDatePicker';

const steps = [
    { id: 1, title: 'Kendaraan', icon: Car },
    { id: 2, title: 'Service', icon: Wrench },
    { id: 3, title: 'Jadwal', icon: Calendar },
    { id: 4, title: 'Selesai', icon: CheckCircle },
];

const LEGACY_VEHICLES = [
    "MITSUBISHI PAJERO", "MITSUBISHI XPANDER", "MITSUBISHI DESTINATOR", "MITSUBISHI XFORCE",
    "MITSUBISHI ECLIPSE CROSS", "MITSUBISHI TRITON", "MITSUBISHI OUTLANDER", "MITSUBISHI OUTLANDER PHEV",
    "MITSUBISHI MIRAGE", "MITSUBISHI LANCER", "MITSUBISHI DELICA", "MITSUBISHI GRANDIS",
    "MITSUBISHI L300", "FUSO COLT DIESEL", "FUSO CANTER", "MITSUBISHI COLT T120SS"
];

const CustomSelect = ({ value, onChange, options, placeholder, allowCustom = false, customPlaceholder = "Ketik manual..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
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
                    className="w-full bg-white border border-red-300 rounded-lg p-3 text-gray-900 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all pr-10 shadow-sm"
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
                className={`w-full bg-gray-50 border ${isOpen ? 'border-red-500 ring-1 ring-red-500 bg-white' : 'border-gray-200 hover:border-gray-300'} rounded-lg p-3 text-left text-sm transition-all flex justify-between items-center`}
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
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto hide-scrollbar"
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

export default function BookingService() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Update Title and Favicon
    useEffect(() => {
        document.title = "Booking Service Mitsubishi Bintaro";
        let link = document.querySelector("link[rel~='icon']");
        let originalHref = '/logo/logo_dwindo.png';
        
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        } else {
            originalHref = link.href;
        }
        
        link.href = '/logo/mitsubishi-motors/logo_text_black.png';
        
        return () => {
            // Restore defaults on unmount
            document.title = "Mitsubishi Dwindo Bintaro";
            if (link) link.href = originalHref;
        };
    }, []);

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Nopol & Vehicle Info
        nopol: '',
        nopolFound: false,
        nama: '',
        kendaraan: '',
        maskedPhone: '',
        fullPhone: '', // Expected phone if found
        riwayat: [],
        manualInput: false, // true if nopol not found, requiring manual entry

        // Step 2: Service Info
        km: '',
        keluhan: '',
        acCare: false,

        // Step 3: Schedule
        tanggal: '',
        jam: '',

        // Step 4: Verification
        verifyPhone: '',
    });

    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isSlotLoading, setIsSlotLoading] = useState(false);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [duplicateNopol, setDuplicateNopol] = useState(null);

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Initial load: generate 3 upcoming dates
    useEffect(() => {
        const generateDates = () => {
            const dates = [];
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

            for (let i = 1; i <= 3; i++) {
                const d = new Date();
                // To support Asia/Jakarta timezone roughly without complex libs
                d.setDate(d.getDate() + i);
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dates.push({
                    iso,
                    dayName: days[d.getDay()],
                    day: d.getDate(),
                    month: months[d.getMonth()],
                    dateObj: d,
                    isSunday: d.getDay() === 0
                });
            }
            setAvailableDates(dates);
        };
        generateDates();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errorMsg) setErrorMsg('');
    };

    const normalizePhone = (phone) => {
        if (!phone) return null;
        let clean = phone.replace(/\D/g, '');
        if (clean.startsWith('62')) clean = '0' + clean.slice(2);
        if (!clean.startsWith('0')) clean = '0' + clean;
        return clean;
    };

    const checkNopol = async () => {
        const cleanNopol = formData.nopol.replace(/\s+/g, '').toLowerCase();
        if (!cleanNopol) {
            setErrorMsg('Silakan masukkan nomor polisi');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Auto prefix 'b' if starts with number
            let queryNopol = cleanNopol;
            if (/^\d/.test(queryNopol)) {
                queryNopol = 'b' + queryNopol;
            }

            const response = await fetch(`https://csdwindo.com/api-book/?nopol=${queryNopol}`);
            const data = await response.json();

            if (data.status && data.data) {
                const d = data.data;
                const expectedPhone = normalizePhone(d.telp);
                setFormData(prev => ({
                    ...prev,
                    nopolFound: true,
                    manualInput: false,
                    nama: d.nama,
                    kendaraan: d.kendaraan,
                    maskedPhone: d.telp ? `xxxx-xxxx-${d.telp.slice(-4)}` : '',
                    fullPhone: expectedPhone,
                    riwayat: d.riwayat || []
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    nopolFound: false,
                    manualInput: true,
                    nama: '',
                    kendaraan: '',
                    maskedPhone: '',
                    fullPhone: '',
                    riwayat: []
                }));
            }
            setCurrentStep(2);
        } catch (error) {
            console.error(error);
            setErrorMsg('Gagal terhubung ke server. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateStep1 = () => {
        if (formData.manualInput) {
            if (!formData.nama || !formData.kendaraan || !formData.verifyPhone) {
                setErrorMsg('Mohon lengkapi semua data');
                return false;
            }
        }
        return true;
    };

    const handleNextToStep3 = () => {
        if (!formData.km) {
            setErrorMsg('Silakan pilih jarak tempuh service (KM)');
            return;
        }
        setErrorMsg('');
        setCurrentStep(3);
    };

    const checkDuplicateNopol = async (tanggal) => {
        if (!formData.nopol || !tanggal) return;
        try {
            const res = await fetch(`https://csdwindo.com/api/panel/data_booking.php?date=${tanggal}`);
            const result = await res.json();
            if (result.status && result.data) {
                const cleanNopol = formData.nopol.replace(/\s/g, '').toUpperCase();
                const match = result.data.find(b => b.nopol.replace(/\s/g, '').toUpperCase() === cleanNopol);
                if (match) {
                    const dateFormatted = new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    setDuplicateNopol({
                        nopol: match.nopol,
                        tanggal: dateFormatted,
                        nama: match.nama,
                        jam: match.jam
                    });
                    return;
                }
            }
            setDuplicateNopol(null);
        } catch (err) {
            console.error('Duplicate check error:', err);
            setDuplicateNopol(null);
        }
    };

    const fetchSlots = async (tanggal) => {
        setIsSlotLoading(true);
        try {
            const response = await fetch(`https://csdwindo.com/api-book/slot-jam/?tanggal=${tanggal}`);
            const data = await response.json();

            // Logic slot
            const isMinor = (parseInt(formData.km) / 10000) % 2 !== 0; // Ganjil = Minor
            const isSunday = new Date(tanggal).getDay() === 0;

            const baseSlots = ['08:00', '09:00', '10:00', '11:00'];
            if (!isSunday && isMinor) {
                baseSlots.push('13:00'); // Jam 13:00 only for minor service and not Sunday
            }

            let jamData = {};
            if (data.status && data.jam) {
                jamData = data.jam;
            }

            // Map and calculate remaining
            const processedSlots = baseSlots.map(jam => {
                const totalBooking = jamData[jam] !== undefined ? parseInt(jamData[jam]) : 0;
                const max = 6; // Maksimal 6 sesuai request
                const remaining = max - totalBooking;
                return {
                    jam,
                    remaining: remaining > 0 ? remaining : 0,
                    isFull: remaining <= 0
                };
            }).filter(slot => !slot.isFull);

            setAvailableSlots(processedSlots);
        } catch (error) {
            console.error('Slot fetch error', error);
        } finally {
            setIsSlotLoading(false);
        }
    };

    const handleSelectDate = (isoDate) => {
        handleInputChange('tanggal', isoDate);
        handleInputChange('jam', '');
        setShowCustomDate(false);
        setDuplicateNopol(null);
        checkDuplicateNopol(isoDate);
        fetchSlots(isoDate);
    };

    const handleCustomDateChange = (isoDate) => {
        handleInputChange('tanggal', isoDate);
        handleInputChange('jam', '');
        setShowCustomDate(false);
        setDuplicateNopol(null);
        if (isoDate) {
            checkDuplicateNopol(isoDate);
            fetchSlots(isoDate);
        }
    };

    const handleNextToStep4 = () => {
        if (!formData.tanggal || !formData.jam) {
            setErrorMsg('Silakan pilih tanggal dan jam service');
            return;
        }
        setErrorMsg('');
        setCurrentStep(4);
    };

    const submitBooking = async () => {
        // Phone verification logic if found
        if (formData.nopolFound) {
            const inputPhone = normalizePhone(formData.verifyPhone);
            if (inputPhone !== formData.fullPhone) {
                setErrorMsg('Nomor telepon tidak sesuai dengan yang terdaftar di sistem kami.');
                return;
            }
        } else if (!formData.verifyPhone) {
            setErrorMsg('Silakan masukkan nomor telepon.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        // Prepare payload for legacy booking API
        const payload = {
            tanggal: formData.tanggal,
            jam: formData.jam,
            kendaraan: formData.kendaraan,
            nopol: formData.nopol.toUpperCase().replace(/\s+/g, ''),
            nama: formData.nama,
            telp: normalizePhone(formData.verifyPhone),
            jenis: `${((parseInt(formData.km) / 10000) % 2 !== 0) ? 'Service Kecil' : 'Service Besar'} ${formData.km} KM`,
            keluhan: formData.keluhan + (formData.acCare ? ' (Tambah AC Care)' : ''),
            user: 'CUSTOMER'
        };

        try {
            const res = await fetch(`https://csdwindo.com/api/chat/booking_legacy.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.status) {
                setCurrentStep(5); // Success step
            } else {
                setErrorMsg(result.message || 'Gagal menyimpan booking.');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {currentStep > 1 && currentStep < 5 && (
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                        )}
                        <h1 className="text-lg font-bold text-gray-900">Booking Service</h1>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-600 rounded-md">
                        Dwindo Bintaro
                    </div>
                </div>

                {/* Progress Bar */}
                {currentStep < 5 && (
                    <div className="max-w-2xl mx-auto px-4 pb-4">
                        <div className="flex items-center justify-between relative mt-2">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                            ></div>

                            {steps.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep >= step.id;
                                const isCurrent = currentStep === step.id;

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-red-600 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'
                                            } ${isCurrent ? 'ring-4 ring-red-100' : ''}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-24">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Pengecekan Kendaraan */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Cek Data Kendaraan</h2>
                                <p className="text-sm text-gray-500 mb-6">Masukkan nomor polisi kendaraan Mitsubishi Anda untuk mengecek riwayat service.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Polisi</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Contoh: B1234XYZ"
                                                value={formData.nopol}
                                                onChange={(e) => handleInputChange('nopol', e.target.value.toUpperCase())}
                                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-semibold uppercase"
                                                onKeyDown={(e) => e.key === 'Enter' && checkNopol()}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-md text-gray-500">
                                                <Car className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {errorMsg && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p>{errorMsg}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={checkNopol}
                                        disabled={isLoading || !formData.nopol}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-red-600/20"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Cek Data <ChevronRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div className="flex gap-3 items-start p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900 block mb-0.5">Booking Service Resmi</span>
                                    Layanan ini khusus untuk pelayanan service di bengkel resmi Mitsubishi Dwindo Bintaro.
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Detail Service */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            {/* User & Vehicle Info Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shrink-0">
                                    <Car className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {formData.nopolFound ? (
                                        <>
                                            <h3 className="font-bold text-gray-900 truncate">{formData.nama}</h3>
                                            <p className="text-sm text-gray-500 font-medium truncate">{formData.kendaraan}</p>
                                            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-600">
                                                {formData.nopol}
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">Data Belum Terdaftar</h3>
                                            <p className="text-sm text-gray-500 mb-3">Silakan lengkapi data kendaraan Anda.</p>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Nama Lengkap"
                                                    value={formData.nama}
                                                    onChange={(e) => handleInputChange('nama', e.target.value.toUpperCase())}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-red-500"
                                                />
                                                <CustomSelect 
                                                    value={formData.kendaraan}
                                                    onChange={(val) => handleInputChange('kendaraan', val)}
                                                    options={LEGACY_VEHICLES.map(v => ({ label: v, value: v }))}
                                                    placeholder="Pilih Kendaraan"
                                                    allowCustom={true}
                                                    customPlaceholder="Ketik tipe kendaraan..."
                                                />
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="Nomor WhatsApp/HP"
                                                    value={formData.verifyPhone}
                                                    onChange={(e) => handleInputChange('verifyPhone', e.target.value.replace(/\D/g, ''))}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-red-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service Input */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Rencana Service</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Berkala (KM)</label>
                                        <CustomSelect 
                                            value={formData.km}
                                            onChange={(val) => handleInputChange('km', val)}
                                            options={[
                                                { value: '1000', label: '1.000 KM (Service Pertama)' },
                                                ...[...Array(10)].map((_, i) => {
                                                    const km = (i + 1) * 10000;
                                                    const isMinor = (i + 1) % 2 !== 0;
                                                    return {
                                                        value: String(km),
                                                        label: `${km.toLocaleString('id-ID')} KM (${isMinor ? 'Service Kecil' : 'Service Besar'})`
                                                    };
                                                })
                                            ]}
                                            placeholder="Pilih Kelipatan KM"
                                            allowCustom={true}
                                            customPlaceholder="Ketik angka KM (contoh: 150000)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan / Catatan (Opsional)</label>
                                        <textarea
                                            value={formData.keluhan}
                                            onChange={(e) => handleInputChange('keluhan', e.target.value)}
                                            placeholder="Tuliskan jika ada kendala pada kendaraan Anda..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Soft Selling AC */}
                            <div
                                onClick={() => handleInputChange('acCare', !formData.acCare)}
                                className={`rounded-2xl p-4 border-2 cursor-pointer transition-all flex items-start gap-4 ${formData.acCare ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center border-2 mt-0.5 ${formData.acCare ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                                    }`}>
                                    {formData.acCare && <Check className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${formData.acCare ? 'text-blue-900' : 'text-gray-900'}`}>Tambah AC Care (+Rp 338.000)</h4>
                                    <p className={`text-sm mt-1 ${formData.acCare ? 'text-blue-700' : 'text-gray-500'}`}>
                                        Sekalian bersihkan evaporator dan blower agar AC kembali dingin maksimal dan udara kabin lebih segar.
                                    </p>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium flex items-center gap-1.5 px-1">
                                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (validateStep1()) handleNextToStep3();
                                }}
                                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm"
                            >
                                Lanjut Pilih Jadwal <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 3: Jadwal */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-red-600" />
                                    <h3 className="font-bold text-gray-900">Pilih Tanggal</h3>
                                </div>

                                <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                                    {availableDates.map((date, idx) => {
                                        const isSelected = formData.tanggal === date.iso;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectDate(date.iso)}
                                                className={`snap-start shrink-0 w-[100px] p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${isSelected
                                                    ? 'bg-red-50 border-red-500 shadow-sm'
                                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {date.dayName}
                                                </span>
                                                <span className={`text-2xl font-bold my-1 ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                                                    {date.day}
                                                </span>
                                                <span className={`text-xs font-medium ${isSelected ? 'text-red-600/80' : 'text-gray-500'}`}>
                                                    {date.month}
                                                </span>
                                            </button>
                                        )
                                    })}

                                    <button
                                        onClick={() => setShowCustomDate(true)}
                                        className={`snap-start shrink-0 w-[100px] p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${(formData.tanggal && !availableDates.find(d => d.iso === formData.tanggal))
                                            ? 'bg-red-50 border-red-500 shadow-sm'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <Calendar className={`w-6 h-6 mb-1 ${(formData.tanggal && !availableDates.find(d => d.iso === formData.tanggal)) ? 'text-red-600' : 'text-gray-400'}`} />
                                        <span className={`text-xs font-semibold text-center leading-tight ${(formData.tanggal && !availableDates.find(d => d.iso === formData.tanggal)) ? 'text-red-700' : 'text-gray-500'}`}>
                                            {(formData.tanggal && !availableDates.find(d => d.iso === formData.tanggal)) ? formData.tanggal : 'Tanggal Lain'}
                                        </span>
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showCustomDate && (
                                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                    <h3 className="font-bold text-gray-900">Pilih Tanggal Booking</h3>
                                                    <button onClick={() => setShowCustomDate(false)} className="p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="p-4 flex justify-center relative min-h-[320px]">
                                                    {/* We override the absolute positioning from CustomDatePicker using a wrapper */}
                                                    <div className="w-full relative [&>div]:static [&>div]:w-full [&>div]:shadow-none [&>div]:border-none [&>div]:translate-x-0 [&>div]:mt-0 [&>div]:p-0">
                                                        <CustomDatePicker
                                                            currentDate={formData.tanggal}
                                                            onSelect={handleCustomDateChange}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                                <p className="text-xs text-gray-400 mt-3 text-center">Bisa ubah jadwal jika tanggal tidak tersedia.</p>
                            </div>

                            {formData.tanggal && (
                                duplicateNopol ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl p-5 shadow-sm border-2 border-orange-300"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 border-2 border-orange-200">
                                                <AlertCircle className="w-7 h-7" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Booking Sudah Ada</h3>
                                            <p className="text-sm text-gray-500 mb-4">Nopol kendaraan Anda sudah terdaftar pada tanggal ini.</p>
                                        </div>

                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Nopol</span>
                                                <span className="text-sm font-bold text-gray-900 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-orange-200">{duplicateNopol.nopol}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Tanggal</span>
                                                <span className="text-sm font-medium text-gray-900">{duplicateNopol.tanggal}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Atas Nama</span>
                                                <span className="text-sm font-medium text-gray-900">{duplicateNopol.nama}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Jam</span>
                                                <span className="text-sm font-bold text-red-600">{duplicateNopol.jam} WIB</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
                                            Silakan pilih tanggal lain atau hubungi dealer untuk bantuan lebih lanjut.
                                        </p>
                                    </motion.div>
                                ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-gray-700" />
                                        <h3 className="font-bold text-gray-900">Pilih Waktu Kedatangan</h3>
                                    </div>

                                    {isSlotLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <>
                                            {availableSlots.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {availableSlots.map((slot, idx) => {
                                                        const isSelected = formData.jam === slot.jam;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleInputChange('jam', slot.jam)}
                                                                className={`relative p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                                                        ? 'bg-red-50 border-red-500 shadow-sm'
                                                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                                                    }`}
                                                            >
                                                                <span className={`block font-bold text-lg mb-1 ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                                                                    {slot.jam} WIB
                                                                </span>
                                                                <span className={`text-xs font-medium ${isSelected ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                    {`Sisa ${slot.remaining} Slot`}
                                                                </span>

                                                                {isSelected && (
                                                                    <div className="absolute top-3 right-3 text-red-600">
                                                                        <CheckCircle className="w-5 h-5 fill-current text-white" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-6 px-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center text-sm font-medium">
                                                    Maaf, semua slot waktu pada tanggal ini sudah penuh. Silakan pilih tanggal lain.
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Info Minor/Major rule */}
                                    {((parseInt(formData.km) / 10000) % 2 === 0) && (
                                        <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                                            <Info className="w-4 h-4 shrink-0" />
                                            Karena kendaraan Anda akan melakukan Service Besar, jam operasional penerimaan maksimal adalah jam 11:00 WIB.
                                        </p>
                                    )}
                                </motion.div>
                                )
                            )}

                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium flex items-center gap-1.5 px-1">
                                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                                </div>
                            )}

                            <button
                                onClick={handleNextToStep4}
                                disabled={!formData.tanggal || !formData.jam || !!duplicateNopol}
                                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Lanjut Ringkasan <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: Konfirmasi */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Ringkasan Booking</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="text-gray-500 text-sm">Kendaraan</div>
                                        <div className="text-right font-medium text-gray-900">
                                            {formData.kendaraan} <br />
                                            <span className="text-gray-500 text-sm">{formData.nopol}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="text-gray-500 text-sm">Service</div>
                                        <div className="text-right font-medium text-gray-900">
                                            {parseInt(formData.km).toLocaleString('id-ID')} KM
                                            {formData.acCare && <div className="text-blue-600 text-sm">+ AC Care</div>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="text-gray-500 text-sm">Jadwal</div>
                                        <div className="text-right font-medium text-gray-900">
                                            {formData.tanggal} <br />
                                            <span className="text-gray-500 text-sm">{formData.jam} WIB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Verification */}
                            {formData.nopolFound && (
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                                    <div className="flex items-center gap-2 mb-2 text-red-800">
                                        <Phone className="w-5 h-5" />
                                        <h3 className="font-bold">Verifikasi Keamanan</h3>
                                    </div>
                                    <p className="text-sm text-red-700/80 mb-4">
                                        Data kendaraan Anda terdaftar dengan nomor: <strong className="text-red-900">{formData.maskedPhone}</strong>. Silakan masukkan nomor lengkap untuk konfirmasi.
                                    </p>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="Contoh: 08123456789"
                                        value={formData.verifyPhone}
                                        onChange={(e) => handleInputChange('verifyPhone', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900"
                                    />
                                </div>
                            )}

                            {errorMsg && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>{errorMsg}</p>
                                </div>
                            )}

                            <button
                                onClick={submitBooking}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-600/30 text-lg"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Konfirmasi Booking <CheckCircle className="w-5 h-5" /></>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 5: Sukses */}
                    {currentStep === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100"
                        >
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h2>
                            <p className="text-gray-500 mb-6">
                                Terima kasih, permohonan service Anda untuk kendaraan <strong>{formData.nopol}</strong> telah kami terima. Service Advisor kami akan segera menghubungi Anda melalui WhatsApp.
                            </p>

                            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tanggal</span>
                                    <span className="font-semibold text-gray-900">{formData.tanggal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Jam</span>
                                    <span className="font-semibold text-gray-900">{formData.jam} WIB</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lokasi</span>
                                    <span className="font-semibold text-gray-900">Dwindo Bintaro</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const event = new CustomEvent('openDinaChat', {
                                        detail: { message: `cek Booking Service Untuk Nopol ${formData.nopol}` }
                                    });
                                    window.dispatchEvent(event);
                                }}
                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 border border-red-200 mb-3 shadow-sm"
                            >
                                <MessageSquare className="w-5 h-5" /> Tanya DINA
                            </button>

                            <button
                                onClick={() => {
                                    if (window.location.hostname.startsWith('booking.')) {
                                        window.location.href = 'https://csdwindo.com';
                                    } else {
                                        window.location.href = '/';
                                    }
                                }}
                                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all"
                            >
                                Kembali ke Beranda
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
