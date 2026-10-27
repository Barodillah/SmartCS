import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Calendar, CheckCircle, Search, AlertCircle, Phone, Info, Clock, Wrench, ChevronRight, Check, X, ChevronDown, MessageSquare, Wind, HelpCircle, ShieldCheck } from 'lucide-react';
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

const getVehicleTier = (kendaraan = '') => {
    const k = String(kendaraan).toUpperCase();
    if (k.includes('PAJERO') || k.includes('TRITON') || k.includes('L300') || k.includes('CANTER') || k.includes('FUSO') || k.includes('DELICA')) {
        return 'B';
    }
    return 'A';
};

const ADDITIONAL_SERVICE_OPTIONS = [
    {
        category: "Paket Perawatan Berkala",
        items: [
            {
                id: "ac-clean",
                name: "AC Clean",
                desc: "Bersihkan evaporator dan blower agar hembusan AC kembali dingin maksimal dan udara kabin lebih segar.",
                A: 338000,
                B: 338000,
                isRecommended: true
            },
            {
                id: "cooling-grid-cleaner",
                name: "Cooling Grid Cleaner",
                desc: "Membersihkan kisi-kisi kondensor dan radiator untuk menjaga pendinginan mesin dan AC tetap optimal.",
                A: 273000,
                B: 273000
            },
            {
                id: "ac-care",
                name: "AC Care",
                desc: "Sterilisasi dan penyegaran sirkulasi udara kabin untuk menghilangkan kuman dan aroma tidak sedap.",
                A: 195000,
                B: 195000
            },
            {
                id: "ac-fresh-berat-single",
                name: "AC Fresh Berat Single Blower",
                desc: "Pembersihan intensif komponen sistem AC single blower dari kotoran dan lumut.",
                A: 1040000,
                B: 1300000
            },
            {
                id: "ac-fresh-berat-double",
                name: "AC Fresh Berat Double Blower",
                desc: "Pembersihan total sistem AC double blower depan & belakang secara menyeluruh.",
                A: 1300000,
                B: 1690000
            }
        ]
    },
    {
        category: "Service & Komponen AC",
        items: [
            {
                id: "oli-kompresor-single",
                name: "Oli Kompresor Single",
                desc: "Penggantian oli kompresor AC single blower untuk mencegah keausan dan kompresor macet.",
                A: 325000,
                B: 429000
            },
            {
                id: "oli-kompresor-double",
                name: "Oli Kompresor Double",
                desc: "Penggantian oli kompresor AC double blower untuk menjaga tekanan freon dan keawetan kompresor.",
                A: 429000,
                B: 455000
            },
            {
                id: "flat-rate-service",
                name: "Flate Rate Service",
                desc: "Pengecekan menyeluruh sistem pendingin, kebocoran pipa, magnet clutch, dan tekanan freon.",
                A: 234000,
                B: 286000
            }
        ]
    }
];

const EXTENDED_SMART_PACKAGES = {
    XPANDER: {
        vehicleName: "Xpander",
        title: "Extended SMART Package Xpander",
        image: "https://csdwindo.com/wp-content/uploads/xpanderxtended.webp",
        effectiveDate: "1 Juli 2026",
        note: "per 1XPM adalah 6 bulan. Kedua paket lebih hemat s/d 25%",
        tiers: [
            { id: "1XPM", label: "1XPM", duration: "6 Bulan", price: 1387500, formattedPrice: "Rp 1.387.500" },
            { id: "2XPM", label: "2XPM", duration: "12 Bulan (1 Thn)", price: 2386500, formattedPrice: "Rp 2.386.500", isRecommended: true },
            { id: "4XPM", label: "4XPM", duration: "24 Bulan (2 Thn)", price: 4551000, formattedPrice: "Rp 4.551.000" },
            { id: "6XPM", label: "6XPM", duration: "36 Bulan (3 Thn)", price: 6660000, formattedPrice: "Rp 6.660.000" }
        ]
    },
    PAJERO: {
        vehicleName: "Pajero",
        title: "Extended SMART Package Pajero",
        image: "https://csdwindo.com/wp-content/uploads/1625123782-mmksi-press-release-mmksi-luncurkan-program-perpanjangan-paket-smart-untuk-pajero-sportjpg-optimized.webp",
        effectiveDate: "1 Juli 2026",
        note: "per 1XPM adalah 6 bulan. Kedua paket lebih hemat s/d 25%",
        tiers: [
            { id: "1XPM", label: "1XPM", duration: "6 Bulan", price: 2497500, formattedPrice: "Rp 2.497.500" },
            { id: "2XPM", label: "2XPM", duration: "12 Bulan (1 Thn)", price: 4662000, formattedPrice: "Rp 4.662.000", isRecommended: true },
            { id: "4XPM", label: "4XPM", duration: "24 Bulan (2 Thn)", price: 9102000, formattedPrice: "Rp 9.102.000" },
            { id: "6XPM", label: "6XPM", duration: "36 Bulan (3 Thn)", price: 13320000, formattedPrice: "Rp 13.320.000" }
        ]
    }
};

const getEligibleExtendedSmartPackage = (kendaraan = '', km = '') => {
    const k = String(kendaraan).toUpperCase();
    const kmNum = parseInt(km, 10) || 0;
    if (kmNum < 50000) return null;

    if (k.includes('XPANDER')) {
        return EXTENDED_SMART_PACKAGES.XPANDER;
    }
    if (k.includes('PAJERO')) {
        return EXTENDED_SMART_PACKAGES.PAJERO;
    }
    return null;
};

const getServicePrice = (item, vehicle) => {
    const tier = getVehicleTier(vehicle);
    return tier === 'B' ? item.B : item.A;
};

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
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
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
    const location = useLocation();
    const navigate = useNavigate();
    const initialState = location.state || {};

    const [currentStep, setCurrentStep] = useState(initialState.step || 1);
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
        nopol: initialState.nopol || '',
        nopolFound: initialState.nopolFound || false,
        nama: initialState.nama || '',
        kendaraan: initialState.kendaraan || '',
        maskedPhone: initialState.telp ? `xxxx-xxxx-${initialState.telp.slice(-4)}` : '',
        fullPhone: initialState.telp || '', // Expected phone if found
        riwayat: [],
        manualInput: initialState.step === 2 && !initialState.nopolFound, // true if from POTENSI and no full data

        // Step 2: Service Info
        km: initialState.km || '',
        keluhan: '',
        acCare: false,
        selectedAdditionalServices: [],

        // Step 3: Schedule
        tanggal: '',
        jam: '',

        // Step 4: Verification
        verifyPhone: initialState.telp || '',
        newPhone: '',

        // Extended SMART Package
        extendedSmartPackage: null,
    });

    const [phoneChoice, setPhoneChoice] = useState(null); // 'benar' | 'salah' | null
    const [isAdditionalServiceModalOpen, setIsAdditionalServiceModalOpen] = useState(false);
    const [previewSmartPackageImage, setPreviewSmartPackageImage] = useState(null);

    const eligibleSmartPkg = getEligibleExtendedSmartPackage(formData.kendaraan, formData.km);

    const handleToggleAdditionalService = (item) => {
        const price = getServicePrice(item, formData.kendaraan);
        const existing = (formData.selectedAdditionalServices || []).some(s => s.id === item.id);
        let updated;
        if (existing) {
            updated = (formData.selectedAdditionalServices || []).filter(s => s.id !== item.id);
        } else {
            const newItem = {
                id: item.id,
                name: item.name,
                price: price,
                formattedPrice: `Rp ${price.toLocaleString('id-ID')}`
            };
            updated = [...(formData.selectedAdditionalServices || []), newItem];
        }
        setFormData(prev => ({
            ...prev,
            selectedAdditionalServices: updated,
            acCare: updated.length > 0
        }));
    };

    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [holidayInfo, setHolidayInfo] = useState(null);
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
                const rawDigits = d.telp ? d.telp.replace(/\D/g, '') : '';
                const masked = rawDigits.length >= 4
                    ? `xxxx-xxxx-${rawDigits.slice(-4)}`
                    : (d.telp ? `xxxx-xxxx-${d.telp.slice(-4)}` : '');
                setFormData(prev => ({
                    ...prev,
                    nopolFound: true,
                    manualInput: false,
                    nama: d.nama,
                    kendaraan: d.kendaraan,
                    maskedPhone: masked,
                    fullPhone: expectedPhone,
                    riwayat: d.riwayat || [],
                    newPhone: '',
                    selectedAdditionalServices: [],
                    acCare: false,
                    extendedSmartPackage: null,
                }));
                setPhoneChoice(null);
            } else {
                setFormData(prev => ({
                    ...prev,
                    nopolFound: false,
                    manualInput: true,
                    nama: '',
                    kendaraan: '',
                    maskedPhone: '',
                    fullPhone: '',
                    riwayat: [],
                    newPhone: '',
                    selectedAdditionalServices: [],
                    acCare: false,
                    extendedSmartPackage: null,
                }));
                setPhoneChoice(null);
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

            if (data.keterangan_libur) {
                setHolidayInfo(data.keterangan_libur);
                setAvailableSlots([]);
                return;
            } else {
                setHolidayInfo(null);
            }

            // Logic slot
            const kmValue = parseInt(formData.km) || 0;
            const isMinor = kmValue === 1000 || (kmValue > 0 && (kmValue / 10000) % 2 !== 0); // Ganjil = Minor
            const isKelipatan20k = kmValue > 0 && kmValue % 20000 === 0; // 20k, 40k, 60k, 80k, 100k
            const isSunday = new Date(tanggal).getDay() === 0;

            // Sunday: only up to 11:00
            const baseSlots = isSunday
                ? ['08:00', '09:00', '10:00', '11:00']
                : ['08:00', '09:00', '10:00', '11:00'];

            // Jam 13:00: only if NOT Sunday AND is minor service AND NOT kelipatan 20.000 KM
            if (!isSunday && isMinor && !isKelipatan20k) {
                baseSlots.push('13:00');
            }

            let jamData = {};
            if (data.status && data.jam) {
                jamData = data.jam;
            }

            // Map and calculate remaining
            const processedSlots = baseSlots.map(jam => {
                const totalBooking = jamData[jam] !== undefined ? parseInt(jamData[jam]) : 0;
                // Sunday: max 3 for all slots. Jam 13:00: max 3. Others: max 6.
                const max = isSunday ? 3 : (jam === '13:00' ? 3 : 6);
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
        setHolidayInfo(null);
        checkDuplicateNopol(isoDate);
        fetchSlots(isoDate);
    };

    const handleCustomDateChange = (isoDate) => {
        handleInputChange('tanggal', isoDate);
        handleInputChange('jam', '');
        setShowCustomDate(false);
        setDuplicateNopol(null);
        setHolidayInfo(null);
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
        let finalTelp = '';

        // Phone verification logic if found
        if (formData.nopolFound) {
            if (!phoneChoice) {
                setErrorMsg('Silakan pilih konfirmasi nomor telepon (Benar atau Salah)');
                return;
            }

            if (phoneChoice === 'salah') {
                const cleanPhone = (formData.newPhone || '').replace(/\D/g, '');
                if (!cleanPhone) {
                    setErrorMsg('Silakan masukkan nomor telepon baru');
                    return;
                }
                if (cleanPhone.length < 8) {
                    setErrorMsg('Nomor telepon minimal 8 angka');
                    return;
                }
                if (cleanPhone.length > 14) {
                    setErrorMsg('Nomor telepon maksimal 14 angka');
                    return;
                }
                finalTelp = normalizePhone(cleanPhone);
            } else {
                // phoneChoice === 'benar'
                finalTelp = normalizePhone(formData.fullPhone);
                if (!finalTelp) {
                    setErrorMsg('Data nomor telepon terdaftar tidak valid.');
                    return;
                }
            }
        } else {
            if (!formData.verifyPhone) {
                setErrorMsg('Silakan masukkan nomor telepon.');
                return;
            }
            const cleanPhone = (formData.verifyPhone || '').replace(/\D/g, '');
            if (cleanPhone.length < 8 || cleanPhone.length > 14) {
                setErrorMsg('Nomor telepon minimal 8 dan maksimal 14 angka');
                return;
            }
            finalTelp = normalizePhone(cleanPhone);
        }

        setIsLoading(true);
        setErrorMsg('');

        let additionalServiceNote = '';
        if (formData.selectedAdditionalServices && formData.selectedAdditionalServices.length > 0) {
            additionalServiceNote = ` (Tambah: ${formData.selectedAdditionalServices.map(s => s.name).join(', ')})`;
        } else if (formData.acCare) {
            additionalServiceNote = ' (Tambah AC Clean)';
        }

        let smartPackageNote = '';
        if (formData.extendedSmartPackage) {
            smartPackageNote = ` (Daftar Extended SMART Package ${formData.extendedSmartPackage.vehicle} - ${formData.extendedSmartPackage.tier} ${formData.extendedSmartPackage.formattedPrice})`;
        }

        // Prepare payload for legacy booking API
        const payload = {
            tanggal: formData.tanggal,
            jam: formData.jam,
            kendaraan: formData.kendaraan,
            nopol: formData.nopol.toUpperCase().replace(/\s+/g, ''),
            nama: formData.nama,
            telp: finalTelp,
            jenis: `${((parseInt(formData.km) / 10000) % 2 !== 0) ? 'Service Kecil' : 'Service Besar'} ${formData.km} KM`,
            keluhan: (formData.keluhan || '') + additionalServiceNote + smartPackageNote,
            user: 'CUSTOMER'
        };

        try {
            const res = await fetch(`https://csdwindo.com/api/chat/booking_legacy.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let result;
            try {
                result = await res.json();
            } catch (err) {
                console.error("Non-JSON API Response", err);
                throw new Error("Terjadi kesalahan di server (Respon tidak valid).");
            }

            if (result.status) {
                // Update potensi_service status to BOOKING if applicable
                try {
                    const cleanNopol = payload.nopol;
                    const potensiRes = await fetch(`https://csdwindo.com/api/potensi_service.php?action=list&search=${encodeURIComponent(cleanNopol)}`);
                    const potensiData = await potensiRes.json();

                    if (potensiData.status && potensiData.data) {
                        const matchingPotensi = potensiData.data.find(p => p.nopol.replace(/\s+/g, '').toUpperCase() === cleanNopol && p.status !== 'BOOKING');

                        if (matchingPotensi) {
                            await fetch('https://csdwindo.com/api/potensi_service.php', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: matchingPotensi.id, status: 'BOOKING' })
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to sync potensi status:', e);
                }

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
                            {(formData.selectedAdditionalServices || []).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-blue-300 transition-all">
                                    <div
                                        onClick={() => {
                                            const tierPrice = getServicePrice(ADDITIONAL_SERVICE_OPTIONS[0].items[0], formData.kendaraan);
                                            const defaultItem = {
                                                id: 'ac-clean',
                                                name: 'AC Clean',
                                                price: tierPrice,
                                                formattedPrice: `Rp ${tierPrice.toLocaleString('id-ID')}`
                                            };
                                            handleInputChange('selectedAdditionalServices', [defaultItem]);
                                            handleInputChange('acCare', true);
                                        }}
                                        className="p-4 cursor-pointer flex items-start gap-3.5 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full flex shrink-0 items-center justify-center border-2 mt-0.5 border-gray-300 bg-white">
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                                    Tambah AC Clean (+Rp 338.000)
                                                </h4>
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                    Rekomendasi
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm mt-1 text-gray-500 leading-relaxed">
                                                Sekalian bersihkan evaporator dan blower agar AC kembali dingin maksimal dan udara kabin lebih segar.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Tersedia 8 opsi paket & service AC</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAdditionalServiceModalOpen(true);
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                        >
                                            Pilih Opsi Lainnya <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50/70 rounded-2xl border-2 border-blue-500 overflow-hidden shadow-xs transition-all">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    onClick={() => {
                                                        handleInputChange('selectedAdditionalServices', []);
                                                        handleInputChange('acCare', false);
                                                    }}
                                                    className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shrink-0"
                                                    title="Klik untuk membatalkan"
                                                >
                                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-blue-950 text-sm sm:text-base leading-tight">
                                                        Layanan Tambahan AC ({formData.selectedAdditionalServices.length} Dipilih)
                                                    </h4>
                                                    <span className="text-xs text-blue-600 font-medium">Ditambahkan ke jadwal booking</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-blue-700 text-sm sm:text-base">
                                                +Rp {formData.selectedAdditionalServices.reduce((sum, s) => sum + s.price, 0).toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        <div className="mt-3 pl-8 space-y-1.5">
                                            {formData.selectedAdditionalServices.map((svc, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs bg-white/90 border border-blue-200/80 px-3 py-2 rounded-xl shadow-2xs">
                                                    <span className="font-semibold text-gray-800">• {svc.name}</span>
                                                    <span className="font-bold text-blue-700">{svc.formattedPrice}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-4 py-2.5 bg-blue-100/60 border-t border-blue-200/80 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('selectedAdditionalServices', []);
                                                handleInputChange('acCare', false);
                                            }}
                                            className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                                        >
                                            Hapus Pilihan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAdditionalServiceModalOpen(true)}
                                            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                                        >
                                            Ubah / Pilih Opsi Lainnya <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Extended SMART Package Card (Xpander / Pajero, KM >= 50.000) */}
                            {eligibleSmartPkg && (
                                <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 rounded-2xl border-2 border-amber-300 p-5 shadow-xs transition-all">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                                        Daftarkan {eligibleSmartPkg.title}
                                                    </h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                                                        Hemat s/d 25%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                    Perpanjang paket service berkala resmi Mitsubishi setelah 50.000 KM agar bebas kenaikan harga suku cadang & jasa.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Detail button with ? icon */}
                                        <button
                                            type="button"
                                            onClick={() => setPreviewSmartPackageImage({
                                                title: eligibleSmartPkg.title,
                                                image: eligibleSmartPkg.image,
                                                vehicle: eligibleSmartPkg.vehicleName
                                            })}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-100/70 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                                            title="Lihat brosur dan rincian lengkap"
                                        >
                                            <HelpCircle className="w-4 h-4 text-amber-600" />
                                            <span className="text-xs font-bold">Detail</span>
                                        </button>
                                    </div>

                                    {/* Info Banner */}
                                    <div className="flex items-center justify-between text-[11px] text-amber-900/90 bg-amber-100/60 rounded-xl px-3 py-2 mb-3 border border-amber-200/60 font-medium">
                                        <span>⏱ 1XPM berlaku untuk 6 bulan</span>
                                        <span>Harga per 1 Juli 2026 (PPN)</span>
                                    </div>

                                    {/* Tiers Grid */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {eligibleSmartPkg.tiers.map((tier) => {
                                            const isSelected = formData.extendedSmartPackage?.tier === tier.id &&
                                                formData.extendedSmartPackage?.vehicle === eligibleSmartPkg.vehicleName;

                                            return (
                                                <button
                                                    key={tier.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            handleInputChange('extendedSmartPackage', null);
                                                        } else {
                                                            handleInputChange('extendedSmartPackage', {
                                                                vehicle: eligibleSmartPkg.vehicleName,
                                                                tier: tier.id,
                                                                label: tier.label,
                                                                duration: tier.duration,
                                                                price: tier.price,
                                                                formattedPrice: tier.formattedPrice,
                                                                title: `${eligibleSmartPkg.title} (${tier.label})`
                                                            });
                                                        }
                                                    }}
                                                    className={`relative p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                                                        isSelected
                                                            ? 'bg-amber-100/70 border-amber-500 shadow-xs ring-2 ring-amber-200'
                                                            : 'bg-white border-gray-200 hover:border-amber-300'
                                                    }`}
                                                >
                                                    {tier.isRecommended && (
                                                        <span className="absolute -top-2.5 right-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-red-600 text-white rounded-full shadow-xs">
                                                            Rekomendasi
                                                        </span>
                                                    )}
                                                    <div className="flex items-center justify-between gap-1 mb-1">
                                                        <span className={`font-bold text-sm ${isSelected ? 'text-amber-950' : 'text-gray-900'}`}>
                                                            {tier.label}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            {tier.duration}
                                                        </span>
                                                    </div>
                                                    <div className={`font-bold text-sm ${isSelected ? 'text-amber-800' : 'text-gray-800'}`}>
                                                        {tier.formattedPrice}
                                                    </div>
                                                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                                                        <span className={`text-[10px] ${isSelected ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>
                                                            {isSelected ? '✓ Terpilih' : 'Pilih paket'}
                                                        </span>
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                                            isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Action to cancel selection */}
                                    {formData.extendedSmartPackage && formData.extendedSmartPackage.vehicle === eligibleSmartPkg.vehicleName && (
                                        <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-center justify-between">
                                            <span className="text-xs text-amber-900 font-medium truncate">
                                                Paket terpilih: <strong>{formData.extendedSmartPackage.tier}</strong> ({formData.extendedSmartPackage.formattedPrice})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange('extendedSmartPackage', null)}
                                                className="text-xs text-red-600 hover:text-red-700 font-semibold transition-colors shrink-0 ml-2"
                                            >
                                                Batalkan Pilihan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                        ) : holidayInfo ? (
                                            <div className="py-6 px-4 bg-orange-50 text-orange-600 rounded-xl border border-orange-200 text-center text-sm font-medium">
                                                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                                Tanggal ini adalah hari libur:<br />
                                                <span className="font-bold text-orange-700">{holidayInfo}</span><br />
                                                Bengkel tidak beroperasi. Silakan pilih tanggal lain.
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
                                        {(() => {
                                            const kmVal = parseInt(formData.km) || 0;
                                            const isBesar = kmVal > 0 && (kmVal / 10000) % 2 === 0 && kmVal !== 1000;
                                            const isSun = formData.tanggal && new Date(formData.tanggal).getDay() === 0;
                                            return (
                                                <>
                                                    {isBesar && (
                                                        <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                                                            <Info className="w-4 h-4 shrink-0" />
                                                            Karena kendaraan Anda akan melakukan Service Besar, jam operasional penerimaan maksimal adalah jam 11:00 WIB.
                                                        </p>
                                                    )}
                                                    {isSun && (
                                                        <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                                                            <Info className="w-4 h-4 shrink-0" />
                                                            Hari Minggu memiliki kapasitas terbatas (maks. 3 unit per jam) dan hanya melayani hingga jam 11:00 WIB.
                                                        </p>
                                                    )}
                                                </>
                                            );
                                        })()}
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
                                disabled={!formData.tanggal || !formData.jam || !!duplicateNopol || !!holidayInfo}
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
                                            <div>{parseInt(formData.km).toLocaleString('id-ID')} KM</div>
                                            {(formData.selectedAdditionalServices && formData.selectedAdditionalServices.length > 0) ? (
                                                <div className="mt-1 space-y-0.5">
                                                    {formData.selectedAdditionalServices.map((svc, idx) => (
                                                        <div key={idx} className="text-blue-600 text-xs font-semibold">
                                                            + {svc.name} ({svc.formattedPrice || `Rp ${Number(svc.price).toLocaleString('id-ID')}`})
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : formData.acCare ? (
                                                <div className="text-blue-600 text-xs font-semibold">+ Tambahan Service AC</div>
                                            ) : null}
                                        </div>
                                    </div>
                                    {formData.extendedSmartPackage && (
                                        <div className="flex justify-between items-start pt-2 border-t border-gray-50">
                                            <div className="text-gray-500 text-sm">Paket SMART</div>
                                            <div className="text-right font-medium text-gray-900">
                                                <div className="text-amber-800 font-semibold text-xs sm:text-sm">
                                                    Extended SMART {formData.extendedSmartPackage.vehicle}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formData.extendedSmartPackage.tier} ({formData.extendedSmartPackage.duration})
                                                </div>
                                                <div className="text-xs font-bold text-amber-700 mt-0.5">
                                                    {formData.extendedSmartPackage.formattedPrice}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                <div className="bg-red-50/70 rounded-2xl p-5 border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-red-800">
                                        <Phone className="w-5 h-5 text-red-600" />
                                        <h3 className="font-bold text-gray-900">Verifikasi Nomor Terdaftar</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                        Data kendaraan Anda terdaftar dengan nomor telpon: <strong className="text-red-700 tracking-wider font-semibold">{formData.maskedPhone}</strong>. Apakah nomor ini sudah benar?
                                    </p>

                                    {/* Tombol Kiri Kanan: Benar dan Salah */}
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhoneChoice('benar');
                                                if (errorMsg) setErrorMsg('');
                                            }}
                                            className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${phoneChoice === 'benar'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-200'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                                }`}
                                        >
                                            <Check className={`w-4 h-4 ${phoneChoice === 'benar' ? 'text-white' : 'text-emerald-600'}`} />
                                            Benar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhoneChoice('salah');
                                                if (errorMsg) setErrorMsg('');
                                            }}
                                            className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${phoneChoice === 'salah'
                                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20 ring-2 ring-red-200'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50/40'
                                                }`}
                                        >
                                            <X className={`w-4 h-4 ${phoneChoice === 'salah' ? 'text-white' : 'text-red-600'}`} />
                                            Salah
                                        </button>
                                    </div>

                                    {/* Input Nomor Baru jika Salah */}
                                    <AnimatePresence>
                                        {phoneChoice === 'salah' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-2 border-t border-red-100/80">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                        Nomor Telepon / WhatsApp Baru <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={14}
                                                        placeholder="Contoh: 08123456789"
                                                        value={formData.newPhone || ''}
                                                        onChange={(e) => {
                                                            const numericOnly = e.target.value.replace(/\D/g, '');
                                                            if (numericOnly.length <= 14) {
                                                                handleInputChange('newPhone', numericOnly);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm shadow-sm"
                                                    />
                                                    <div className="flex justify-between items-center text-xs mt-1.5 px-0.5">
                                                        <span className="text-gray-500">Gunakan format nomor telp yang sesuai, diawali 0</span>
                                                        <span className={
                                                            (formData.newPhone?.length || 0) >= 8 && (formData.newPhone?.length || 0) <= 14
                                                                ? 'text-emerald-600 font-semibold'
                                                                : 'text-gray-400'
                                                        }>
                                                            {formData.newPhone?.length || 0}/14
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {phoneChoice === 'benar' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-xl p-3 flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                                            <span>Nomor terdaftar <strong>{formData.maskedPhone}</strong> akan digunakan untuk konfirmasi booking Anda.</span>
                                        </motion.div>
                                    )}
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

                            {initialState.step === 2 ? (
                                <button
                                    onClick={() => navigate('/sa')}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all"
                                >
                                    Kembali ke SA Dashboard
                                </button>
                            ) : (
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
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modal Pilihan Opsi Layanan Tambahan */}
            <AnimatePresence>
                {isAdditionalServiceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-transparent"
                            onClick={() => setIsAdditionalServiceModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                            className="relative w-full max-w-none sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] z-10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Mobile Drag Indicator */}
                            <div className="pt-2.5 pb-0.5 sm:hidden flex justify-center bg-gradient-to-r from-blue-50/50 to-white">
                                <div className="w-12 h-1.5 bg-gray-300/80 rounded-full" />
                            </div>

                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">Pilihan Layanan Tambahan</h3>
                                        <p className="text-xs text-gray-500">Perawatan AC & Komponen Tambahan</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAdditionalServiceModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Kendaraan & Tier Info Banner */}
                            <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Car className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="font-medium truncate max-w-[200px]">
                                        {formData.kendaraan || 'Tipe Kendaraan'}
                                    </span>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-100 text-blue-700">
                                    Estimasi Tipe {getVehicleTier(formData.kendaraan)}
                                </span>
                            </div>

                            {/* Modal Body - Service List */}
                            <div className="p-5 overflow-y-auto space-y-5 hide-scrollbar">
                                {ADDITIONAL_SERVICE_OPTIONS.map((section, sIdx) => (
                                    <div key={sIdx} className="space-y-2.5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                                            {section.category}
                                        </h4>
                                        <div className="space-y-2.5">
                                            {section.items.map((item) => {
                                                const isSelected = (formData.selectedAdditionalServices || []).some(s => s.id === item.id);
                                                const price = getServicePrice(item, formData.kendaraan);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleToggleAdditionalService(item)}
                                                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                                                            isSelected
                                                                ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                                                                : 'bg-white border-gray-100 hover:border-blue-200'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full flex shrink-0 items-center justify-center border-2 mt-0.5 transition-colors ${
                                                            isSelected
                                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                                : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className={`font-bold text-sm ${isSelected ? 'text-blue-950' : 'text-gray-900'}`}>
                                                                    {item.name}
                                                                </span>
                                                                <span className={`font-bold text-sm shrink-0 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                    Rp {price.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-blue-800/80' : 'text-gray-500'}`}>
                                                                {item.desc}
                                                            </p>
                                                            {item.isRecommended && (
                                                                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                                    Rekomendasi
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 pb-6 sm:pb-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs text-gray-500">
                                        {(formData.selectedAdditionalServices || []).length} Layanan Dipilih
                                    </div>
                                    <div className="font-bold text-gray-900 text-sm">
                                        +Rp {((formData.selectedAdditionalServices || []).reduce((sum, s) => sum + s.price, 0)).toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(formData.selectedAdditionalServices || []).length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('selectedAdditionalServices', []);
                                                handleInputChange('acCare', false);
                                            }}
                                            className="px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsAdditionalServiceModalOpen(false)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" /> Selesai
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Full Preview Brosur Extended SMART Package */}
            <AnimatePresence>
                {previewSmartPackageImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-transparent"
                            onClick={() => setPreviewSmartPackageImage(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            {previewSmartPackageImage.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Brosur Program Perpanjangan Paket SMART Mitsubishi
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPreviewSmartPackageImage(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Image Container */}
                            <div className="p-3 sm:p-5 overflow-y-auto flex flex-col items-center justify-center bg-gray-50 hide-scrollbar">
                                <img
                                    src={previewSmartPackageImage.image}
                                    alt={previewSmartPackageImage.title}
                                    className="w-full h-auto max-h-[62vh] object-contain rounded-2xl shadow-sm border border-gray-200 bg-white"
                                    loading="lazy"
                                />
                                <div className="mt-3 text-xs text-gray-500 text-center leading-relaxed px-2">
                                    💡 <em>Program Extended SMART Package memberikan jaminan hemat s/d 25% biaya service berkala dengan suku cadang original & teknisi bersertifikasi MMKSI.</em>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-500 font-medium">
                                    Berlaku Per 1 Juli 2026 (Termasuk PPN)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPreviewSmartPackageImage(null)}
                                    className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-colors"
                                >
                                    Tutup Brosur
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
