import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Search, ShieldAlert, Check, Database, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LegacyDetailModal, LegacyFormModal } from '../../components/panel/booking/LegacyBookingModals';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import BookingSearchModal from '../../components/panel/booking/BookingSearchModal';

const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    // Append 'Z' to treat the DB string as UTC
    let ts = timestamp;
    if (ts.includes(' ') && !ts.endsWith('Z')) {
        ts = ts.replace(' ', 'T') + 'Z';
    }
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    
    const intervals = [
        { label: 'tahun', seconds: 31536000 },
        { label: 'bulan', seconds: 2592000 },
        { label: 'hari', seconds: 86400 },
        { label: 'jam', seconds: 3600 },
        { label: 'menit', seconds: 60 }
    ];

    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label} yang lalu`;
        }
    }
    return 'Baru saja';
};

const getBadgeColor = (status) => {
    const s = (status || 'REQUEST').toUpperCase();
    switch (s) {
        case 'REQUEST': return 'bg-blue-100 text-blue-700';
        case 'BOOKING': return 'bg-purple-100 text-purple-700';
        case 'UBAH': return 'bg-orange-100 text-orange-700';
        case 'DATANG': return 'bg-green-100 text-green-700';
        case 'CANCEL': return 'bg-red-100 text-red-700';
        // Fallback untuk status lama
        case 'EDIT': return 'bg-orange-100 text-orange-700';
        case 'SELESAI': return 'bg-green-100 text-green-700';
        case 'BATAL': return 'bg-red-100 text-red-700';
        case 'CONFIRM':
        case 'KONFIRMASI': return 'bg-indigo-100 text-indigo-700';
        case 'PROSES': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const DataBookingLegacy = () => {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal states
    const [detailModalData, setDetailModalData] = useState(null);
    const [formModalData, setFormModalData] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Delete states
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            let url = `https://csdwindo.com/api/panel/data_booking.php?date=${currentDate}`;
            if (searchQuery) {
                url = `https://csdwindo.com/api/panel/data_booking.php?search=${encodeURIComponent(searchQuery)}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                setBookings(data.data);
            } else {
                showToast('Gagal memuat data booking', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        setCurrentDate(date.toISOString().split('T')[0]);
        setSearchQuery('');
    };

    const handleNextDay = () => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + 1);
        setCurrentDate(date.toISOString().split('T')[0]);
        setSearchQuery('');
    };

    const isToday = () => {
        return currentDate === new Date().toISOString().split('T')[0];
    };

    const handleDelete = (id) => {
        setDeleteConfirmId(id);
    };

    const executeDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        
        try {
            const res = await fetch(`https://csdwindo.com/api/panel/data_booking.php?id=${deleteConfirmId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.status) {
                showToast('Booking berhasil dihapus');
                setDetailModalData(null);
                setDeleteConfirmId(null);
                fetchBookings();
            } else {
                showToast(data.message || 'Gagal menghapus booking', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const executeCancelBooking = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        
        const bookingToCancel = bookings.find(b => b.id === deleteConfirmId);
        if (!bookingToCancel) {
            setIsDeleting(false);
            return;
        }

        const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        const payload = { 
            ...bookingToCancel, 
            user: user.nama || 'STAFF',
            forceStatus: 'CANCEL'
        };

        try {
            const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.status) {
                showToast('Status booking diubah menjadi Cancel');
                setDetailModalData(null);
                setDeleteConfirmId(null);
                fetchBookings();
            } else {
                showToast(data.message || 'Gagal cancel booking', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        
        const method = formData.id ? 'PUT' : 'POST';
        const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        const { ubahStatus, ...cleanFormData } = formData;
        const payload = { 
            ...cleanFormData, 
            user: user.nama || 'STAFF',
            ...(formData.id ? { forceStatus: ubahStatus ? 'UBAH' : 'BOOKING' } : {})
        };

        try {
            const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (data.status) {
                showToast(data.message);
                setIsFormModalOpen(false);
                setFormModalData(null);
                
                if (formData.tanggal !== currentDate) {
                    setCurrentDate(formData.tanggal);
                } else {
                    fetchBookings();
                }
            } else {
                showToast(data.message || 'Gagal menyimpan data', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            
            {/* Header matches LeadManager style */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <Database size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Data Booking</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola data permohonan booking service dari database lama.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative" ref={datePickerRef}>
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="p-1.5 bg-red-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors mr-1 border border-red-100"
                            title="Cari Data Booking"
                        >
                            <Search size={16} />
                        </button>

                        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        
                        {searchQuery ? (
                            <div className="flex items-center gap-2 bg-red-50 text-[#E60012] px-3 py-1.5 rounded text-sm font-bold border border-red-100 whitespace-nowrap">
                                <span>Hasil: "{searchQuery}"</span>
                                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-red-200 rounded text-red-700 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div 
                                className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar size={16} className="text-[#E60012]" />
                                {isToday() ? 'Hari ini' : new Date(currentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}

                        <AnimatePresence>
                            {showDatePicker && (
                                <CustomDatePicker 
                                    currentDate={currentDate} 
                                    onSelect={(dateStr) => { setCurrentDate(dateStr); setShowDatePicker(false); setSearchQuery(''); }}
                                    onClose={() => setShowDatePicker(false)}
                                />
                            )}
                        </AnimatePresence>

                        <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button 
                        onClick={() => { setFormModalData(null); setIsFormModalOpen(true); }}
                        className="flex items-center gap-2 bg-[#E60012] hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors w-full sm:w-auto justify-center h-10"
                    >
                        <Plus size={16} />
                        Tambah Booking
                    </button>
                </div>
            </div>

            {/* Content Table / List */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-1">Jam</div>
                    <div className="col-span-2">Nopol</div>
                    <div className="col-span-3">Nama</div>
                    <div className="col-span-3">Kendaraan</div>
                    <div className="col-span-2">Service</div>
                    <div className="col-span-1">Status</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><Calendar size={32} /></div>
                            <p className="text-gray-500 text-sm">Tidak ada booking untuk tanggal ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {bookings.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setDetailModalData(item)}
                                    className="p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                >
                                    <div className="flex justify-between items-start md:col-span-1 md:block">
                                        <span className="inline-block bg-[#E60012]/10 text-[#E60012] px-2 py-1 rounded text-xs font-bold">
                                            {item.jam}
                                        </span>
                                        <div className="md:hidden flex flex-col items-end gap-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>
                                                {item.status || 'REQUEST'}
                                            </span>
                                            {item.time && (
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                    {getTimeAgo(item.time)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-2 md:block">
                                        <div className="font-mono text-sm font-bold text-[#111111]">{item.nopol}</div>
                                    </div>

                                    <div className="md:col-span-3 text-sm">
                                        <span className="text-xs font-medium text-gray-400 md:hidden block mb-0.5">Nama</span>
                                        <div className="font-medium text-[#111111]">{item.nama}</div>
                                    </div>

                                    <div className="md:col-span-3 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Kendaraan</span>
                                        <div className="font-bold text-[#111111]">{item.kendaraan}</div>
                                    </div>

                                    <div className="md:col-span-2 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Service</span>
                                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold tracking-wide">{item.jenis}</span>
                                    </div>

                                    <div className="hidden md:flex md:col-span-1 flex-col gap-1 items-start">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>
                                            {item.status || 'REQUEST'}
                                        </span>
                                        {item.time && (
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                {getTimeAgo(item.time)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <LegacyDetailModal 
                isOpen={!!detailModalData} 
                data={detailModalData}
                onClose={() => setDetailModalData(null)}
                onEdit={(data) => {
                    setDetailModalData(null);
                    setFormModalData(data);
                    setIsFormModalOpen(true);
                }}
                onDelete={handleDelete}
            />

            <LegacyFormModal 
                isOpen={isFormModalOpen}
                initialData={formModalData}
                onClose={() => { setIsFormModalOpen(false); setFormModalData(null); }}
                onSave={handleSave}
                isLoading={isSaving}
            />

            <BookingSearchModal 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={(item) => setDetailModalData(item)}
                onSearchSubmit={(q) => setSearchQuery(q)}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isDeleting && setDeleteConfirmId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <Trash2 size={32} className="text-[#E60012]" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Hapus Booking?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus data booking ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 rounded font-bold text-sm bg-gray-100 text-[#444444] hover:bg-gray-200 transition-colors disabled:opacity-50 order-3 sm:order-1"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeCancelBooking}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 rounded font-bold text-sm bg-gray-500 text-white hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md order-2 sm:order-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Proses...
                                        </>
                                    ) : (
                                        'Cancel Booking'
                                    )}
                                </button>
                                <button
                                    onClick={executeDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 rounded font-bold text-sm bg-[#E60012] text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md order-1 sm:order-3"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Hapus
                                        </>
                                    ) : (
                                        'Ya, Hapus'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Toast */}
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

export default DataBookingLegacy;
