import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Printer, Calendar, Users, FileText, ChevronRight, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

const Cetak = () => {
    const [view, setView] = useState('pin'); // pin, menu, booking_form, absensi_form, booking_print, absensi_print
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Booking Form State
    const [bookingForm, setBookingForm] = useState({
        date: new Date().toISOString().split('T')[0],
        cs: ''
    });

    // Absensi Form State
    const [absensiForm, setAbsensiForm] = useState({
        date: new Date().toISOString().split('T')[0],
        divisi: 'MMKSI',
        kegiatan: '',
        materi: ''
    });

    const [bookingResults, setBookingResults] = useState([]);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin === '1066') {
            setView('menu');
            setError('');
        } else {
            setError('PIN Salah!');
            setPin('');
        }
    };

    const DatePicker = ({ value, onChange, label, color = "red" }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [viewDate, setViewDate] = useState(new Date(value));

        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
        const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
        const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

        const isSelected = (day) => {
            const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const valD = new Date(value);
            return d.toDateString() === valD.toDateString();
        };

        const themeClass = color === "red" ? "text-red-500 bg-red-600" : "text-blue-500 bg-blue-600";
        const borderClass = color === "red" ? "focus-within:border-red-600" : "focus-within:border-blue-600";

        return (
            <div className="relative w-full">
                <label className="block text-sm text-gray-400 mb-2">{label}</label>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between group transition-all ${borderClass}`}
                >
                    <span className="text-white font-medium">{formatDate(value)}</span>
                    <Calendar className={`w-5 h-5 ${color === 'red' ? 'text-red-500' : 'text-blue-500'} group-hover:scale-110 transition-transform`} />
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full mt-2 left-0 right-0 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl"
                            >
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                    </button>
                                    <div className="font-display text-sm font-bold">
                                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                                    </div>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(d => (
                                        <div key={d} className="text-[10px] font-bold text-gray-500 uppercase">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {blanks.map(b => <div key={`blank-${b}`} className="h-9"></div>)}
                                    {days.map(day => {
                                        const selected = isSelected(day);
                                        return (
                                            <button
                                                type="button"
                                                key={day}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                                    const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                                    onChange(dateStr);
                                                    setIsOpen(false);
                                                }}
                                                className={`h-9 w-full rounded-lg text-xs flex items-center justify-center transition-all ${selected ? `${themeClass} text-white font-bold shadow-lg` :
                                                    'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const fetchBookingData = async () => {
        try {
            const res = await fetch(`https://csdwindo.com/api/panel/data_booking.php?date=${bookingForm.date}&sort=jam`);
            const json = await res.json();
            if (json.status) {
                setBookingResults(json.data);
                setView('booking_print');
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        fetchBookingData();
    };

    const handleAbsensiSubmit = (e) => {
        e.preventDefault();
        setView('absensi_print');
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleBack = () => {
        setView('menu');
    };

    const getDayName = (dateStr) => {
        const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUM\'AT', 'SABTU'];
        const d = new Date(dateStr);
        return days[d.getDay()];
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatDateLong = (dateStr) => {
        const d = new Date(dateStr);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return d.toLocaleDateString('id-ID', options);
    };

    // Print View Styles (to be injected)
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body * {
                    visibility: hidden;
                }
                #print-section, #print-section * {
                    visibility: visible;
                }
                #print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                }
                .no-print {
                    display: none !important;
                }
                
                /* Orientation control via named pages */
                @page landscape-page {
                    size: A4 landscape;
                    margin: 0.5cm;
                }
                @page portrait-page {
                    size: A4 portrait;
                    margin: 1cm;
                }
                @page absensi-page {
                    size: A4 portrait;
                    margin: 1cm;
                }
                @page catatan-page {
                    size: A4 landscape;
                    margin: 1cm;
                }
                
                .landscape-view {
                    page: landscape-page;
                }
                .portrait-view {
                    page: portrait-page;
                }
                .absensi-view {
                    page: absensi-page;
                }
                .catatan-view {
                    page: catatan-page;
                }

                .page-break {
                    page-break-before: always;
                    break-before: page;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-body overflow-x-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'pin' && (
                    <motion.div
                        key="pin"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10"
                    >
                        <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-xl">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-red-600 rounded-full shadow-[0_0_20px_rgba(230,0,18,0.4)]">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-display text-center mb-2">Akses Terbatas</h1>
                            <p className="text-gray-400 text-center mb-8">Masukkan PIN Keamanan untuk melanjutkan</p>

                            <form onSubmit={handlePinSubmit} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        placeholder="••••"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] focus:outline-none focus:border-red-600 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95"
                                >
                                    Masuk
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {view === 'menu' && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display mb-4">Pilih Layanan Cetak</h2>
                            <p className="text-gray-400">Silakan pilih dokumen yang ingin Anda cetak hari ini</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                            {/* Booking Card */}
                            <button
                                onClick={() => setView('booking_form')}
                                className="group bg-[#1a1a1a] border border-white/5 p-8 rounded-3xl hover:border-red-600/50 hover:bg-[#222] transition-all duration-300 text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Printer className="w-32 h-32" />
                                </div>
                                <div className="p-4 bg-red-600/10 rounded-2xl w-fit mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                                    <Calendar className="w-8 h-8 text-red-500 group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-display mb-2">Cetak Booking</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">Cetak daftar reservasi service harian beserta status dissatisfaction pelanggan.</p>
                                <div className="flex items-center text-red-500 font-bold group-hover:translate-x-2 transition-transform">
                                    Buka Form <ChevronRight className="ml-2 w-5 h-5" />
                                </div>
                            </button>

                            {/* Absensi Card */}
                            <button
                                onClick={() => setView('absensi_form')}
                                className="group bg-[#1a1a1a] border border-white/5 p-8 rounded-3xl hover:border-blue-600/50 hover:bg-[#222] transition-all duration-300 text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="w-32 h-32" />
                                </div>
                                <div className="p-4 bg-blue-600/10 rounded-2xl w-fit mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <FileText className="w-8 h-8 text-blue-500 group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-display mb-2">Cetak Absensi</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">Cetak daftar absensi kegiatan dealer dan lembar catatan kegiatan/isu harian.</p>
                                <div className="flex items-center text-blue-500 font-bold group-hover:translate-x-2 transition-transform">
                                    Buka Form <ChevronRight className="ml-2 w-5 h-5" />
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {view === 'booking_form' && (
                    <motion.div
                        key="booking_form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10"
                    >
                        <div className="w-full max-w-lg">
                            <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
                                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali ke Menu
                            </button>

                            <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl shadow-2xl overflow-visible">
                                <h2 className="text-2xl font-display mb-6">Form Cetak Booking</h2>
                                <form onSubmit={handleBookingSubmit} className="space-y-6">
                                    <DatePicker
                                        label="Pilih Tanggal"
                                        value={bookingForm.date}
                                        onChange={(val) => setBookingForm({ ...bookingForm, date: val })}
                                        color="red"
                                    />
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nama Pencetak (CS)</label>
                                        <input
                                            type="text"
                                            value={bookingForm.cs}
                                            onChange={(e) => setBookingForm({ ...bookingForm, cs: e.target.value })}
                                            placeholder="Masukkan nama Anda"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors text-white"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Printer className="mr-2 w-5 h-5" /> Siapkan Cetakan
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'absensi_form' && (
                    <motion.div
                        key="absensi_form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10"
                    >
                        <div className="w-full max-w-lg">
                            <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
                                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali ke Menu
                            </button>

                            <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl shadow-2xl overflow-visible">
                                <h2 className="text-2xl font-display mb-6">Form Cetak Absensi</h2>
                                <form onSubmit={handleAbsensiSubmit} className="space-y-4">
                                    <DatePicker
                                        label="Pilih Tanggal"
                                        value={absensiForm.date}
                                        onChange={(val) => setAbsensiForm({ ...absensiForm, date: val })}
                                        color="blue"
                                    />
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Divisi</label>
                                        <select
                                            value={absensiForm.divisi}
                                            onChange={(e) => setAbsensiForm({ ...absensiForm, divisi: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-white"
                                        >
                                            <option value="MMKSI">MMKSI</option>
                                            <option value="KTB">KTB</option>
                                            <option value="ALL">MMKSI & KTB</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Kegiatan</label>
                                        <input
                                            type="text"
                                            value={absensiForm.kegiatan}
                                            onChange={(e) => setAbsensiForm({ ...absensiForm, kegiatan: e.target.value })}
                                            placeholder="Contoh: Morning Briefing"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Materi</label>
                                        <textarea
                                            value={absensiForm.materi}
                                            onChange={(e) => setAbsensiForm({ ...absensiForm, materi: e.target.value })}
                                            placeholder="Detail materi kegiatan..."
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 transition-colors text-white h-24 resize-none"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95 mt-4"
                                    >
                                        <Printer className="mr-2 w-5 h-5" /> Siapkan Cetakan
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRINT SECTIONS (Hidden from Screen, Visible in Print) */}

            {/* 1. BOOKING PRINT VIEW */}
            {view === 'booking_print' && (
                <div id="print-section" className="bg-white text-black p-0 m-0 font-['MMC_Office'] overflow-visible landscape-view" style={{ fontFamily: '"MMC Office", sans-serif' }}>
                    <div className="relative mb-6">
                        <div className="absolute right-0 top-0 text-right">
                            <h1 className="text-2xl font-bold font-['MMC']" style={{ fontFamily: '"MMC", sans-serif' }}>
                                {getDayName(bookingForm.date)}, {formatDate(bookingForm.date)}
                            </h1>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-xl font-bold font-['MMC']" style={{ fontFamily: '"MMC", sans-serif' }}>SERVICE MASTER REGISTER</h4>
                            <p className="m-0 text-sm">Nama Pencetak: {bookingForm.cs}</p>
                            <p className="m-0 text-sm">Penanggung jawab: Petugas Security utama untuk mengisi</p>
                            <p className="m-0 text-sm">Objektif: Menyimpan data pelanggan yang masuk dan keluar service di dealer</p>
                            <p className="m-0 text-sm">Frekuensi: Setiap hari</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-center text-[10pt]">
                        <thead>
                            <tr>
                                <th colSpan="13" className="border border-black p-1 bg-gray-100 font-bold">SERVICE MASTER REGISTER</th>
                            </tr>
                            <tr>
                                <th rowSpan="2" className="border border-black p-1">NO</th>
                                <th rowSpan="2" className="border border-black p-1">TANGGAL</th>
                                <th rowSpan="2" className="border border-black p-1">JAM</th>
                                <th rowSpan="2" className="border border-black p-1">NAMA KONSUMEN</th>
                                <th rowSpan="2" className="border border-black p-1">NOMOR POLISI</th>
                                <th rowSpan="2" className="border border-black p-1">MODEL<br />KENDARAAN</th>
                                <th rowSpan="2" className="border border-black p-1">WARNA<br />KENDARAAN</th>
                                <th colSpan="2" className="border border-black p-1">KENDARAAN MASUK</th>
                                <th colSpan="3" className="border border-black p-1">PENYERAHAN KEMBALI</th>
                                <th rowSpan="2" className="border border-black p-1">CATATAN</th>
                            </tr>
                            <tr>
                                <th className="border border-black p-1 text-[8pt]">WAKTU<br />MASUK</th>
                                <th className="border border-black p-1 text-[8pt]">TIPE<br />(BOOKING/<br />WALK IN)</th>
                                <th className="border border-black p-1 text-[8pt]">WAKTU<br />KELUAR</th>
                                <th className="border border-black p-1 text-[8pt]">TANGGAL<br />PENYERAHAN</th>
                                <th className="border border-black p-1 text-[8pt]">NO.<br />GATE<br />PASS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingResults.map((row, idx) => (
                                <tr key={idx} style={{ color: row.dissatisfaction_count > 0 ? '#e50202' : '#000000' }}>
                                    <td className="border border-black p-1">{idx + 1}</td>
                                    <td className="border border-black p-1 whitespace-nowrap">{formatDate(row.tanggal)}</td>
                                    <td className="border border-black p-1">{row.jam}</td>
                                    <td className="border border-black p-1 uppercase">{row.nama}</td>
                                    <td className="border border-black p-1 font-bold text-lg">{row.nopol}</td>
                                    <td className="border border-black p-1">{row.kendaraan}</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1 font-bold">BOOKING</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1 text-left text-[8pt]">{row.jenis} - {row.keluhan}</td>
                                </tr>
                            ))}
                            {/* Fill empty rows up to 45 (approx 2 pages landscape) */}
                            {Array.from({ length: Math.max(0, 45 - bookingResults.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-[28px]">
                                    <td className="border border-black p-1">{bookingResults.length + idx + 1}</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1 font-bold">WALK IN</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={handleBack}
                        className="no-print mt-12 mb-12 bg-black text-white px-8 py-3 rounded-xl flex items-center mx-auto"
                    >
                        <ArrowLeft className="mr-2" /> Kembali Selesai Cetak
                    </button>
                </div>
            )}

            {/* 2. ABSENSI PRINT VIEW */}
            {view === 'absensi_print' && (
                <div id="print-section" className="bg-white text-black p-0 m-0 font-['MMC_Office']" style={{ fontFamily: '"MMC Office", sans-serif' }}>
                    {/* Page 1: Absensi Table (PORTRAIT) */}
                    <div className="p-4 absensi-view">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold font-['MMC']" style={{ fontFamily: '"MMC", sans-serif' }}>
                                <strong>ABSENSI KEGIATAN DEALER{absensiForm.divisi !== 'ALL' ? ` ${absensiForm.divisi}` : ''}</strong>
                            </h3>
                            <div className="flex justify-between mt-4 px-4 text-sm">
                                <p><strong>Tanggal </strong>: <span className="underline">{formatDateLong(absensiForm.date)}</span></p>
                                <p><strong>Kegiatan </strong>: <span className="underline">{absensiForm.kegiatan}</span></p>
                                <p><strong>Materi </strong>: <span className="underline">{absensiForm.materi}</span></p>
                            </div>
                        </div>

                        <table className="w-full border-collapse border border-black text-center text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1">#</th>
                                    <th className="border border-black p-4 w-1/3">NAMA</th>
                                    <th className="border border-black p-1">JABATAN</th>
                                    <th className="border border-black p-1">KET</th>
                                    <th colSpan="2" className="border border-black p-1">ABSENSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 11 }).map((_, i) => {
                                    const n1 = i * 2 + 1;
                                    const n2 = i * 2 + 2;
                                    return (
                                        <React.Fragment key={i}>
                                            <tr className="h-8">
                                                <td className="border border-black p-1">{n1}</td>
                                                <td className="border border-black p-1"></td>
                                                <td className="border border-black p-1"></td>
                                                <td className="border border-black p-1"></td>
                                                <td rowSpan="2" className="border border-black p-1 relative text-left align-top w-20">
                                                    <span className="text-[7pt] leading-none">{n1}</span>
                                                </td>
                                                <td rowSpan="2" className="border border-black p-1 relative text-left align-top w-20">
                                                    <span className="text-[7pt] leading-none">{n2}</span>
                                                </td>
                                            </tr>
                                            <tr className="h-8">
                                                <td className="border border-black p-1">{n2}</td>
                                                <td className="border border-black p-1"></td>
                                                <td className="border border-black p-1"></td>
                                                <td className="border border-black p-1"></td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="mt-8 flex justify-between px-4">
                            <div>
                                <p className="mb-12">Tangerang, {formatDateLong(absensiForm.date)}</p>
                                <p className="font-bold underline">M. Munir</p>
                                <p className="text-sm">Branch Manager</p>
                            </div>
                            {(absensiForm.divisi === 'KTB' || absensiForm.divisi === 'ALL') && (
                                <div className="text-center">
                                    <p className="mb-12 opacity-0">spacer</p>
                                    <p className="font-bold underline">Jo Herman</p>
                                    <p className="text-sm">Branch Manager</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Page Break for Print */}
                    <div className="page-break"></div>

                    {/* Page 2: Catatan Kegiatan (LANDSCAPE) */}
                    <div className="p-4 catatan-view">
                        <div className="text-center">
                            <h3 className="text-xl font-bold font-['MMC']" style={{ fontFamily: '"MMC", sans-serif' }}>
                                <strong>CATATAN KEGIATAN{absensiForm.divisi !== 'ALL' ? ` ${absensiForm.divisi}` : ''}</strong>
                            </h3>
                            <div className="flex justify-between mt-4 px-4 text-sm">
                                <p><strong>Tanggal </strong>: <span className="underline">{formatDateLong(absensiForm.date)}</span></p>
                                <p><strong>Kegiatan </strong>: <span className="underline">{absensiForm.kegiatan}</span></p>
                                <p><strong>Materi </strong>: <span className="underline">{absensiForm.materi}</span></p>
                            </div>
                        </div>

                        <table className="w-full border-collapse border border-black text-center text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 w-10">#</th>
                                    <th className="border border-black p-2 w-32">DIVISI</th>
                                    <th className="border border-black p-2">ISU / SARAN</th>
                                    <th className="border border-black p-2">SOLUSI / PUTUSAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <tr key={i} className="h-24">
                                        <td className="border border-black p-2">{i + 1}</td>
                                        <td className="border border-black p-2"></td>
                                        <td className="border border-black p-2"></td>
                                        <td className="border border-black p-2"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-8 flex justify-between px-4">
                            <div>
                                <p className="mb-12">Tangerang, {formatDateLong(absensiForm.date)}</p>
                                <p className="font-bold underline">M. Munir</p>
                                <p className="text-sm">Branch Manager</p>
                            </div>
                            {(absensiForm.divisi === 'KTB' || absensiForm.divisi === 'ALL') && (
                                <div className="text-center">
                                    <p className="mb-12 opacity-0">spacer</p>
                                    <p className="font-bold underline">Jo Herman</p>
                                    <p className="text-sm">Branch Manager</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleBack}
                        className="no-print mt-12 mb-12 bg-black text-white px-8 py-3 rounded-xl flex items-center mx-auto"
                    >
                        <ArrowLeft className="mr-2" /> Kembali Selesai Cetak
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cetak;
