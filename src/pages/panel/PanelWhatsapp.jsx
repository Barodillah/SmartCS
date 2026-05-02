import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Phone, Clock, Calendar, RefreshCw, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../../utils/constants';

const API_BASE = 'https://csdwindo.com/api/panel/wa_followup.php';

// =================== HELPERS ===================

const getHariIndonesia = (dateStr) => {
    const map = { Sun: 'MINGGU', Mon: 'SENIN', Tue: 'SELASA', Wed: 'RABU', Thu: 'KAMIS', Fri: "JUM'AT", Sat: 'SABTU' };
    const day = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    return map[day] || 'Tidak diketahui';
};

const formatTanggal = (dateStr) => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

const getSalam = () => {
    const jam = new Date().getHours();
    if (jam < 11) return 'Selamat Pagi';
    if (jam < 15) return 'Selamat Siang';
    if (jam < 18) return 'Selamat Sore';
    return 'Selamat Malam';
};

const formatPhone = (telp) => {
    if (!telp) return '';
    let phone = telp.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = phone.substring(1);
    if (!phone.startsWith('62')) phone = '62' + phone;
    return phone;
};

const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
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
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label} lalu`;
    }
    return 'Baru saja';
};

// =================== WA MESSAGE BUILDERS ===================

const buildKonfirmasiMessage = (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);
    const isUpdate = item.status === 'UBAH';

    let pesan = `${salam}, kami dari Mitsubishi Bintaro\n\n`;

    if (isUpdate) {
        pesan += `*KONFIRMASI PERUBAHAN JADWAL*\n`;
        pesan += `Booking Service Anda telah kami perbarui a/n *${item.nama}*\n\n`;
    } else {
        pesan += `Konfirmasi Booking Service a/n *${item.nama}*\n\n`;
    }

    pesan += `Waktu : *${hari} ${tgl}, ${item.jam}*\n`;
    pesan += `Kendaraan : *${item.kendaraan}, ${item.nopol}*\n`;
    pesan += `Jenis Service : *${item.jenis}* ${item.keluhan || ''}\n\n`;
    pesan += `Mohon datang *tepat waktu* sesuai jadwal ya, karena stall & mekanik sudah kami siapkan.\n\n`;
    pesan += `*Disclaimer:* Cuci kendaraan hanya body luar & vacuum.\n\n`;
    pesan += `Perkenalkan layanan 24/7 kami *DINA* Assistant Virtual Dwindo:\n`;
    pesan += `• Booking Service\n`;
    pesan += `• Info Service\n`;
    pesan += `• Sparepart & Aksesoris\n`;
    pesan += `• Promo & Harga Kendaraan\n`;
    pesan += `• Simulasi Kredit\n`;
    pesan += `• Emergency Service\n`;
    pesan += `https://csdwindo.com\n\n`;
    pesan += `Jika ada kesalahan data, silakan balas pesan ini.`;

    return pesan;
};

const buildH1Message = (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);

    let pesan = `*REMINDER BOOKING SERVICE*\n\n`;
    pesan += `${salam} Bapak/Ibu *${item.nama}*\n\n`;
    pesan += `Kami mengingatkan bahwa *besok* Anda memiliki jadwal service:\n\n`;
    pesan += `Waktu : *${hari} ${tgl}, ${item.jam}*\n`;
    pesan += `Kendaraan : *${item.kendaraan}, ${item.nopol}*\n\n`;
    pesan += `Mohon datang *tepat waktu* sesuai jadwal, karena stall & mekanik sudah kami siapkan.\n\n`;
    pesan += `*Disclaimer:* Pencucian hanya body luar & vacuum.\n\n`;
    pesan += `Untuk kemudahan layanan, Anda juga dapat menggunakan *DINA Assistant 24/7*:\n`;
    pesan += `• Booking Service\n`;
    pesan += `• Info Service\n`;
    pesan += `• Sparepart & Aksesoris\n`;
    pesan += `• Promo & Harga Kendaraan\n`;
    pesan += `• Simulasi Kredit\n`;
    pesan += `• Emergency Service On Road\n`;
    pesan += `https://csdwindo.com\n\n`;
    pesan += `Mohon konfirmasi *kedatangan / reschedule / pembatalan* dengan membalas pesan ini ya.`;

    return pesan;
};

const buildH30MenitMessage = (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);

    let pesan = `${salam}, mengingatkan kembali bahwa hari ini *${hari} ${tgl}*, Pukul *${item.jam}*, ada jadwal booking service untuk kendaraan Bapak/Ibu\n`;
    pesan += `Kendaraan : *${item.kendaraan}, ${item.nopol}*\n\n`;
    pesan += `_Demi kenyamanan Bapak/Ibu ${item.nama}, Kami ingatkan datang *tepat waktu*, tidak lebih awal maupun terlambat, dikarenakan Stall dan Mekaniknya sudah kami siapkan sesuai Jam Booking._\n\n`;
    pesan += `_*Note* : Mohon konfirmasi kedatangan, Reschedule, atau Pembatalan dengan membalas pesan ini_`;

    return pesan;
};

const openWhatsapp = (telp, message) => {
    const phone = formatPhone(telp);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// =================== WHATSAPP ICON ===================

const WhatsappIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
);

// =================== STATUS BADGE ===================

const getBadgeColor = (status) => {
    const s = (status || 'REQUEST').toUpperCase();
    switch (s) {
        case 'REQUEST': return 'bg-blue-100 text-blue-700';
        case 'UBAH': return 'bg-orange-100 text-orange-700';
        case 'BOOKING': return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

// =================== Time Check Helpers ===================
const isJamPassed = (jamStr) => {
    if (!jamStr) return true;
    const now = new Date();
    const [h, m] = jamStr.split(':').map(Number);
    const jamDate = new Date();
    jamDate.setHours(h, m, 0, 0);
    return now > jamDate;
};

const isTooEarlyForH30 = (jamStr) => {
    if (!jamStr) return false;
    const now = new Date();
    const [h, m] = jamStr.split(':').map(Number);
    const jamDate = new Date();
    jamDate.setHours(h, m, 0, 0);
    const oneHourBefore = new Date(jamDate.getTime() - (60 * 60 * 1000));
    return now < oneHourBefore;
};

// =================== COMPONENT ===================

const PanelWhatsapp = () => {
    const context = useOutletContext();
    const setIsMinimized = context?.setIsMinimized;

    const [activeTab, setActiveTab] = useState('Konfirmasi');
    const [konfirmasiData, setKonfirmasiData] = useState([]);
    const [h1Data, setH1Data] = useState([]);
    const [h30Data, setH30Data] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, item: null, message: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        if (setIsMinimized) setIsMinimized(true);
    }, [setIsMinimized]);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [resKonf, resH1, resH30] = await Promise.all([
                fetch(`${API_BASE}?tab=konfirmasi`),
                fetch(`${API_BASE}?tab=h1`),
                fetch(`${API_BASE}?tab=h30`),
            ]);
            const dataKonf = await resKonf.json();
            const dataH1 = await resH1.json();
            const dataH30 = await resH30.json();

            setKonfirmasiData(dataKonf.status ? dataKonf.data : []);
            setH1Data(dataH1.status ? dataH1.data : []);
            setH30Data(dataH30.status ? dataH30.data : []);
        } catch (err) {
            console.error('Error fetching WA data:', err);
            showToast('Gagal memuat data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Konfirmasi: kirim WA dan update status ke BOOKING
    const handleKonfirmasi = async (item) => {
        const msg = buildKonfirmasiMessage(item);
        openWhatsapp(item.telp, msg);

        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
            const res = await fetch(API_BASE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    status: 'BOOKING',
                    user: user.nama || 'STAFF',
                    action: 'Whatsapp Konfirmasi'
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(`Status ${item.nama} diubah ke BOOKING`);
                fetchAllData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    // H-1: kirim WA saja
    const handleH1 = (item) => {
        const now = new Date();
        const hours = now.getHours();

        if (hours < 15) {
            const timeOfDay = hours < 11 ? 'pagi' : 'siang';
            setConfirmModal({
                show: true,
                item: item,
                message: `Masih ${timeOfDay} dan belum jam 3 sore. Apakah Anda yakin ingin mengirim WA reminder sekarang?`
            });
            return;
        }

        executeSendH1(item);
    };

    const executeSendH1 = (item) => {
        const msg = buildH1Message(item);
        openWhatsapp(item.telp, msg);
        showToast(`WA H-1 dikirim ke ${item.nama}`);
        setConfirmModal({ show: false, item: null, message: '' });
    };

    // H-30 Menit: kirim WA saja, cek jam
    const handleH30 = (item) => {
        if (isJamPassed(item.jam)) {
            showToast(`Jam booking ${item.jam} sudah lewat, tidak bisa kirim WA`, 'error');
            return;
        }
        const msg = buildH30MenitMessage(item);
        openWhatsapp(item.telp, msg);
        showToast(`WA Reminder dikirim ke ${item.nama}`);
    };

    const tabs = [
        { key: 'Konfirmasi', label: 'Konfirmasi', count: konfirmasiData.length },
        { key: 'H-1', label: 'H-1', count: h1Data.length },
        { key: 'H-30 Menit', label: 'H-30 Menit', count: h30Data.length },
        { key: 'H+2 PKT', label: 'H+2 PKT', count: 0 },
        { key: 'Pajak STNK', label: 'Pajak STNK', count: 0 },
        { key: 'BPKB Ready', label: 'BPKB Ready', count: 0 },
    ];

    const currentData = activeTab === 'Konfirmasi' ? konfirmasiData
        : activeTab === 'H-1' ? h1Data
            : activeTab === 'H-30 Menit' ? h30Data
                : [];

    let displayData = [...currentData];
    if (activeTab === 'H-30 Menit') {
        displayData.sort((a, b) => {
            const aCannotSend = isJamPassed(a.jam) || isTooEarlyForH30(a.jam);
            const bCannotSend = isJamPassed(b.jam) || isTooEarlyForH30(b.jam);
            if (aCannotSend && !bCannotSend) return 1;
            if (!aCannotSend && bCannotSend) return -1;
            return 0;
        });
    }

    const handleSend = (item) => {
        if (activeTab === 'Konfirmasi') handleKonfirmasi(item);
        else if (activeTab === 'H-1') handleH1(item);
        else if (activeTab === 'H-30 Menit') handleH30(item);
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#25D366]">
                        <WhatsappIcon size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Panel Whatsapp</h1>
                        <p className="text-gray-500 text-sm mt-1">Follow-up WhatsApp untuk booking service.</p>
                    </div>
                </div>
                <button
                    onClick={fetchAllData}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-white border border-[#E5E5E5] hover:bg-gray-50 text-[#111111] px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tab Bar + Content */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-[#E5E5E5] overflow-x-auto shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative flex items-center gap-2 ${activeTab === tab.key ? 'text-[#E60012]' : 'text-gray-500 hover:text-[#111111]'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#E60012] text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Header */}
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-[60px_90px_2fr_2fr_2fr_80px_120px] gap-3 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div>Jam</div>
                    <div>Tanggal</div>
                    <div>Nama</div>
                    <div>Kendaraan</div>
                    <div>Service</div>
                    <div>Status</div>
                    <div className="text-right">Aksi</div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : (activeTab === 'H+2 PKT' || activeTab === 'Pajak STNK' || activeTab === 'BPKB Ready') ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><Calendar size={32} /></div>
                            <p className="text-gray-500 text-sm">Fitur {activeTab} akan segera hadir.</p>
                        </div>
                    ) : displayData.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><Calendar size={32} /></div>
                            <p className="text-gray-500 text-sm">
                                {activeTab === 'Konfirmasi' && 'Tidak ada booking dengan status REQUEST / UBAH.'}
                                {activeTab === 'H-1' && 'Tidak ada booking BOOKING untuk besok.'}
                                {activeTab === 'H-30 Menit' && 'Tidak ada booking BOOKING untuk hari ini.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {displayData.map((item) => {
                                const passed = activeTab === 'H-30 Menit' && isJamPassed(item.jam);
                                const tooEarly = activeTab === 'H-30 Menit' && isTooEarlyForH30(item.jam);
                                const isUpdating = updatingIds.has(item.id);
                                const isEarly = activeTab === 'H-1' && new Date().getHours() < 15;

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-[60px_90px_2fr_2fr_2fr_80px_120px] md:gap-3 md:items-center transition-colors ${passed ? 'bg-gray-50 opacity-60' : 'hover:bg-[#FAFAFA]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start md:block">
                                            <div className="flex items-center gap-2 md:block">
                                                <span className="inline-block bg-[#E60012]/10 text-[#E60012] px-2 py-1 rounded text-xs font-bold">
                                                    {item.jam}
                                                </span>
                                                <div className="md:hidden text-xs">
                                                    <span className="font-bold text-[#111111]">{item.tanggal ? formatTanggal(item.tanggal) : '-'}</span>
                                                    <span className="text-gray-400 text-[10px] ml-1">{item.tanggal ? getHariIndonesia(item.tanggal) : ''}</span>
                                                </div>
                                            </div>
                                            <div className="md:hidden">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>
                                                    {item.status || 'REQUEST'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-xs">
                                            <div className="font-bold text-[#111111]">{item.tanggal ? formatTanggal(item.tanggal) : '-'}</div>
                                            <div className="text-gray-400 text-[10px]">{item.tanggal ? getHariIndonesia(item.tanggal) : ''}</div>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-xs font-medium text-gray-400 md:hidden block mb-0.5">Nama & Kontak</span>
                                            <div className="font-medium text-[#111111]">{item.nama}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Phone size={10} /> {item.telp}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-gray-50 p-3 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Kendaraan</span>
                                            <div className="font-bold text-[#111111]">{item.kendaraan}</div>
                                            <div className="mt-0.5 font-mono text-xs font-bold text-gray-500">{item.nopol}</div>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-gray-50 p-3 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Service</span>
                                            <div className="flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold tracking-wide">{item.jenis}</span>
                                            </div>
                                            {item.keluhan && <div className="text-gray-500 mt-1.5 italic leading-relaxed">"{item.keluhan}"</div>}
                                        </div>
                                        <div className="hidden md:block">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>
                                                {item.status || 'REQUEST'}
                                            </span>
                                            {item.time && (
                                                <div className="text-[10px] text-gray-400 font-medium mt-1">
                                                    {getTimeAgo(item.time)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-[#E5E5E5] md:border-none w-full">
                                            {passed ? (
                                                <span className="text-xs text-red-400 font-bold">Jam Lewat</span>
                                            ) : tooEarly ? (
                                                <span className="text-xs text-gray-400 font-bold">Belum Waktunya</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSend(item)}
                                                    disabled={isUpdating}
                                                    className={`${isEarly ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#25D366] hover:bg-[#1DA851]'} text-white flex items-center gap-2 px-4 py-2 font-bold text-xs tracking-wide uppercase transition-colors disabled:opacity-50`}
                                                    style={{ clipPath: ANGULAR_CLIP }}
                                                >
                                                    {isUpdating ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    ) : (
                                                        <WhatsappIcon size={14} />
                                                    )}
                                                    {activeTab === 'Konfirmasi' ? 'Konfirmasi' : 'Kirim WA'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

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

            {/* Confirmation Modal for H-1 */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false, item: null, message: '' })}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4">
                                    <Clock size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-[#111111] mb-2">Konfirmasi Pengiriman</h3>
                                <p className="text-sm text-gray-500">{confirmModal.message}</p>
                            </div>
                            <div className="p-4 border-t border-[#E5E5E5] flex gap-2 bg-gray-50">
                                <button
                                    onClick={() => setConfirmModal({ show: false, item: null, message: '' })}
                                    className="flex-1 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => executeSendH1(confirmModal.item)}
                                    className="flex-1 py-2 text-sm font-bold text-white bg-[#25D366] rounded hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 shadow-md"
                                >
                                    <WhatsappIcon size={14} />
                                    Tetap Kirim
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PanelWhatsapp;
