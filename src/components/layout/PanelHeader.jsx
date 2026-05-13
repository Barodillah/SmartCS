import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, AlertTriangle, X, Calendar, Clock, CarFront, Wrench, Plus, Check, ShieldAlert, MessageCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../../utils/constants';
import { LegacyFormModal } from '../panel/booking/LegacyBookingModals';

const PanelHeader = ({ sidebarOpen, setSidebarOpen }) => {
    const [userData, setUserData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [notifications, setNotifications] = useState([]);
    const [surveyNotifs, setSurveyNotifs] = useState([]);
    const [newCustomerNotifs, setNewCustomerNotifs] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Quick Add Booking State
    const [showQuickBooking, setShowQuickBooking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCombinedNotifications = async () => {
        try {
            const res = await fetch('https://csdwindo.com/api/panel/notifications_combined.php');
            const data = await res.json();
            if (data.status) {
                setNotifications(data.indikasi_komplen || []);
                setSurveyNotifs(data.survey_masuk || []);
            }
        } catch (error) {
            console.error('Failed to fetch combined notifications:', error);
        }
    };

    const fetchNewCustomers = async () => {
        try {
            const res = await fetch('https://runner.cuma.click/api/notifications/customers');
            const data = await res.json();
            if (Array.isArray(data)) {
                const newCusts = data.filter(c => c.status === 'New');
                setNewCustomerNotifs(newCusts);
            }
        } catch (error) {
            console.error('Failed to fetch new customers:', error);
        }
    };

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (e) { }
        }

        fetchCombinedNotifications();
        fetchNewCustomers();
        const notificationTimer = setInterval(() => {
            fetchCombinedNotifications();
            fetchNewCustomers();
        }, 180000); // 3 menit — sebelumnya 30 detik

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(timer);
            clearInterval(notificationTimer);
        };
    }, []);

    const totalNotifCount = notifications.length + surveyNotifs.length + newCustomerNotifs.length;

    const handleSaveNewBooking = async (formData) => {
        setIsSubmitting(true);
        try {
            const { ubahStatus, ...cleanFormData } = formData;
            const payload = {
                ...cleanFormData,
                user: userData ? (userData.name || userData.nama) : 'ADMIN',
            };

            const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status) {
                showToast('Booking berhasil ditambahkan!');
                setShowQuickBooking(false);

                // Sync with potensi_service
                try {
                    if (formData.nopol) {
                        await fetch('https://csdwindo.com/api/potensi_service.php', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nopol: formData.nopol.replace(/\s/g, '').toUpperCase(),
                                status: 'BOOKING'
                            })
                        });
                    }
                } catch (syncErr) {
                    console.error("Failed to sync with potensi_service:", syncErr);
                }

                // If on DataBookingLegacy page, it won't auto-refresh unless we trigger it.
                // But usually user will just see the toast.
            } else {
                showToast(data.message || 'Gagal menambahkan booking', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (date) => {
        const timeStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date).replace(/\./g, ':');

        const dateStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);

        return `${timeStr} ${dateStr}`;
    };

    // Helper untuk membuat inisial nama
    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-[#444444] hover:text-[#E60012] transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                    <span className="font-display font-bold text-[#111111] uppercase tracking-wider text-sm">
                        {formatTime(currentTime)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 relative">
                    <button
                        onClick={() => setShowQuickBooking(true)}
                        className="p-2 text-gray-500 hover:text-[#E60012] transition-colors"
                        title="Tambah Booking Cepat"
                    >
                        <Plus size={20} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`relative p-2 transition-colors rounded-full ${isDropdownOpen ? 'text-[#E60012] bg-red-50' : 'text-gray-500 hover:text-[#E60012] hover:bg-gray-50'}`}
                        >
                            <motion.div
                                animate={totalNotifCount > 0 ? { rotate: [0, -20, 20, -15, 15, -10, 10, 0] } : { rotate: 0 }}
                                transition={totalNotifCount > 0 ? { repeat: Infinity, repeatDelay: 2, duration: 0.8, ease: "easeInOut" } : {}}
                                className="origin-top"
                            >
                                <Bell size={20} />
                            </motion.div>
                            {totalNotifCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E60012] rounded-full border border-white animate-pulse"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="fixed left-4 right-4 top-16 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white shadow-2xl rounded-xl border border-[#E5E5E5] z-[100] overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-[#E5E5E5] bg-gray-50 flex justify-between items-center">
                                            <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#111111]">Notifikasi</h3>
                                            <span className="bg-[#E60012] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{totalNotifCount}</span>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                            {/* New Customer Notifications */}
                                            {newCustomerNotifs.length > 0 && (
                                                <>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Aktivasi Runner Baru</span>
                                                    </div>
                                                    {newCustomerNotifs.map((notif) => (
                                                        <div
                                                            key={`cust-${notif.id}`}
                                                            onClick={() => window.open('https://runner.cuma.click/dealer', '_blank')}
                                                            className="p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
                                                                    <MapPin size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-[#111111]">{notif.nama}</p>
                                                                    <p className="text-[11px] font-mono font-bold text-gray-500 mt-0.5">{notif.telp}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{notif.company}</p>
                                                                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                                                                        <Clock size={10} /> {new Date(notif.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {/* Survey Response Notifications */}
                                            {surveyNotifs.length > 0 && (
                                                <>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Survey Masuk</span>
                                                    </div>
                                                    {surveyNotifs.map((notif) => (
                                                        <div
                                                            key={`survey-${notif.id}`}
                                                            className="p-4 border-b border-gray-100 hover:bg-purple-50 transition-colors"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0 border border-purple-200">
                                                                    <MessageCircle size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-[#111111]">{notif.nama}</p>
                                                                    <p className="text-[11px] text-gray-600 mt-0.5">{notif.kendaraan}</p>
                                                                    <p className="text-[10px] mt-1">
                                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${notif.status === 'PUAS' ? 'bg-green-100 text-green-700' :
                                                                            notif.status === 'BIASA SAJA' ? 'bg-yellow-100 text-yellow-700' :
                                                                                'bg-red-100 text-red-700'
                                                                            }`}>{notif.status}</span>
                                                                        {notif.est && <span className="ml-1.5 text-gray-500">Nilai: {notif.est}</span>}
                                                                    </p>
                                                                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                                                                        <Clock size={10} /> {new Date(notif.used_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {/* Indikasi Komplen Notifications */}
                                            {notifications.length > 0 && (
                                                <>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Indikasi Komplen</span>
                                                    </div>
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => {
                                                                setSelectedBooking(notif);
                                                                setShowDetailModal(true);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className="p-4 border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-colors group"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 border border-red-200">
                                                                    <AlertTriangle size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-[#111111] group-hover:text-[#E60012]">{notif.nama}</p>
                                                                    <p className="text-[11px] font-mono font-bold text-gray-500 mt-0.5">{notif.nopol}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{notif.keluhan}</p>
                                                                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                                                                        <Clock size={10} /> {new Date(notif.time).toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}

                                            {totalNotifCount === 0 && (
                                                <div className="p-8 text-center">
                                                    <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                                                    <p className="text-xs text-gray-400 font-medium italic">Tidak ada notifikasi baru</p>
                                                </div>
                                            )}
                                        </div>
                                        {totalNotifCount > 0 && (
                                            <div className="p-2 bg-gray-50 border-t border-[#E5E5E5] text-center">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Periksa segera untuk menjaga kepuasan konsumen</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-[#E5E5E5]">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[13px] font-bold text-[#111111]">{userData ? userData.name : 'CS Admin'}</span>
                            <span className="text-[11px] text-gray-500 uppercase">
                                {userData ? `${userData.role} ${userData.divisi ? ` - ${userData.divisi}` : ''}` : 'Dwindo Bintaro'}
                            </span>
                        </div>
                        <div className="w-9 h-9 bg-[#111111] flex items-center justify-center text-white cursor-pointer hover:bg-[#E60012] transition-colors text-sm font-bold tracking-wider" style={{ clipPath: ANGULAR_CLIP }}>
                            {userData ? getInitials(userData.name) : <User size={18} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal for Notification */}
            <AnimatePresence>
                {showDetailModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md shadow-2xl overflow-hidden border-t-4 border-[#E60012]"
                            style={{ clipPath: ANGULAR_CLIP }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-[#111111] p-4 flex justify-between items-center text-white">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-[#E60012]" />
                                    <h3 className="font-display font-bold uppercase tracking-widest text-sm">Detail Indikasi Komplen</h3>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Konsumen</h4>
                                        <p className="text-lg font-bold text-[#111111]">{selectedBooking.nama}</p>
                                        <p className="text-sm font-mono font-bold text-[#E60012] bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block mt-1">{selectedBooking.nopol}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Telepon</h4>
                                        <p className="text-sm font-bold text-[#111111]">{selectedBooking.telp}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <CarFront size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Kendaraan</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#111111]">{selectedBooking.kendaraan}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Wrench size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Layanan</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#111111]">{selectedBooking.jenis}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Tanggal Booking</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#111111]">{selectedBooking.tanggal}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Jam</span>
                                        </div>
                                        <p className="text-sm font-bold text-[#111111]">{selectedBooking.jam}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Keluhan / Catatan Komplen
                                    </h4>
                                    <p className="text-sm text-gray-700 italic leading-relaxed">
                                        "{selectedBooking.keluhan || 'Tidak ada catatan keluhan.'}"
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="w-full py-3 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#E60012] transition-all rounded"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Add Booking Modal */}
            <LegacyFormModal
                isOpen={showQuickBooking}
                onClose={() => setShowQuickBooking(false)}
                onSave={handleSaveNewBooking}
                isLoading={isSubmitting}
                isNewBooking={true}
            />
        </header>
    );
};

export default PanelHeader;
