import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Phone, Clock, Calendar, RefreshCw, Check, ShieldAlert, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../../utils/constants';
import * as XLSX from 'xlsx';

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

const buildKonfirmasiMessage = async (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);
    const isUpdate = item.status === 'UBAH';
    const sapaan = await guessGender(item.nama);

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

const buildH1Message = async (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);
    const sapaan = await guessGender(item.nama);

    let pesan = `*REMINDER BOOKING SERVICE*\n\n`;
    pesan += `${salam} ${sapaan} *${item.nama}*\n\n`;
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

const buildH30MenitMessage = async (item) => {
    const salam = getSalam();
    const hari = getHariIndonesia(item.tanggal);
    const tgl = formatTanggal(item.tanggal);
    const sapaan = await guessGender(item.nama);

    let pesan = `${salam}, mengingatkan kembali bahwa hari ini *${hari} ${tgl}*, Pukul *${item.jam}*, ada jadwal booking service untuk kendaraan ${sapaan}\n`;
    pesan += `Kendaraan : *${item.kendaraan}, ${item.nopol}*\n\n`;
    pesan += `_Demi kenyamanan ${sapaan} ${item.nama}, Kami ingatkan datang *tepat waktu*, tidak lebih awal maupun terlambat, dikarenakan Stall dan Mekaniknya sudah kami siapkan sesuai Jam Booking._\n\n`;
    pesan += `_*Note* : Mohon konfirmasi kedatangan, Reschedule, atau Pembatalan dengan membalas pesan ini_`;

    return pesan;
};

const guessGender = async (name) => {
    try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) return "Bapak/Ibu";

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "~google/gemini-flash-latest",
                messages: [
                    { role: "system", content: "Tebak gender dari nama orang Indonesia. Balas HANYA dengan satu kata: Bapak atau Ibu. Jika tidak yakin balas Bapak/Ibu." },
                    { role: "user", content: name }
                ],
                temperature: 0,
                max_tokens: 50
            })
        });

        if (!res.ok) return "Bapak/Ibu";

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();

        if (reply) {
            if (reply.includes("Bapak") && !reply.includes("Ibu")) return "Bapak";
            if (reply.includes("Ibu") && !reply.includes("Bapak")) return "Ibu";
            if (reply === "Bapak" || reply === "Ibu") return reply;
        }
        return "Bapak/Ibu";
    } catch (err) {
        console.error("Gender guess error:", err);
        return "Bapak/Ibu";
    }
};

const buildPktMessage = async (item) => {
    const salam = getSalam();
    const sapaan = await guessGender(item.nama);
    let pesan = `${salam} ${sapaan} *${item.nama}*,\n\n`;
    pesan += `Terima kasih telah melakukan pembelian kendaraan *${item.kendaraan}* dengan nomor rangka *${item.rangka}*.\n\n`;
    pesan += `Saya ingin menanyakan bagaimana pelayanan sales kami:\n`;
    pesan += `- Apakah sales kami sudah menjelaskan fitur-fitur kendaraannya?\n`;
    pesan += `- Apakah ${sapaan} puas dan merasa terbantu dengan pelayanan sales kami?\n`;
    pesan += `- Apakah sales mengikuti proses penyerahan kendaraan?\n`;
    pesan += `- Apakah ${sapaan} ada saran atau masukan untuk pelayanan sales kami?\n\n`;
    pesan += `Jika ada kendala atau ingin booking service bisa hubungi kami dengan membalas pesan ini, atau melalui DINA dengan layanan 24 jam https://csdwindo.com`;
    return pesan;
};

const buildStnkMessage = async (item) => {
    const jam = new Date().getHours();
    let salam = 'Selamat Pagi';
    if (jam >= 11 && jam < 15) salam = 'Selamat Siang';
    else if (jam >= 15 && jam < 18) salam = 'Selamat Sore';
    else if (jam >= 18) salam = 'Selamat Malam';

    const sapaan = await guessGender(item.nama);
    const dateObj = new Date(item.one_year);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const format_tanggal = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    let pesan = `${salam} ${sapaan} *${item.nama}*,\n\n`;
    pesan += `Kami dari Mitsubishi Bintaro ingin mengingatkan Anda untuk membayar pajak STNK tahunan mobil *${item.kendaraan}* No. Polisi *${item.nopol}*, yang jatuh tempo pada *${format_tanggal}*.\n\n`;
    pesan += `Pesan ini kami kirim sebagai pengingat rutin. Kami sangat menghargai perhatian ${sapaan} agar tidak melewatkan pembayaran ini untuk menjaga legalitas kendaraan dan menghindari denda.\n\n`;
    pesan += `_*Jika ${sapaan} sudah membayar, silakan abaikan pesan ini.*_\n\n`;
    pesan += `Silakan hubungi kami jika ada pertanyaan atau butuh bantuan. Terima kasih atas kerjasamanya.\n\n`;
    pesan += `Hormat kami,\nDwindo Berlian Samjaya.`;

    return pesan;
};

const buildBpkbMessage = async (item) => {
    const jam = new Date().getHours();
    let salam = 'Selamat Pagi';
    if (jam >= 11 && jam < 15) salam = 'Selamat Siang';
    else if (jam >= 15 && jam < 18) salam = 'Selamat Sore';
    else if (jam >= 18) salam = 'Selamat Malam';

    const sapaan = await guessGender(item.nama);

    let pesan = `${salam}, Kami dari Mitsubishi Bintaro ingin dengan hormat mengingatkan ${sapaan} *${item.nama}* bahwa BPKB untuk kendaraan *${item.kendaraan || 'Mitsubishi'}* dengan nomor rangka *${item.rangka}* sudah dapat diambil. Kami sangat berharap ${sapaan} berkenan untuk mengambilnya di kantor kami pada waktu yang memungkinkan. Mohon maaf apabila pemberitahuan ini mengganggu kesibukan ${sapaan}, namun hal ini merupakan upaya kami untuk memberikan pelayanan terbaik kepada pelanggan kami.\n\n`;

    pesan += `*SYARAT SYARAT PENGAMBILAN BPKB*\n`;
    pesan += `_Waktu pengambilan Senin - Jumat, 09:00 s/d 15:00_\n\n`;

    pesan += `PERORANGAN / PERUSAHAAN / CV / YAYASAN\n\n`;
    pesan += `A. Diambil sendiri oleh pemilik\n1. Membawa KTP asli/SIM asli\n\n`;

    pesan += `B. Diambil oleh kuasa dari pemilik\n1. Membawa KTP asli Pemilik BPKB ( pemberi kuasa)\n2. Membawa KTP asli Penerima Kuasa\n3. Membawa surat kuasa bermaterai yang telah ditandatangani oleh Pemilik BPKB dan penerima kuasanya\n\n`;

    pesan += `C. Jika pemilik BPKB meninggal dunia\n1. Membawa surat kematian pemilik BPKB\n2. Membawa kartu keluarga pemilik BPKB\n3. Membawa surat kuasa dari seluruh ahli waris dan KTP asli ahli waris pemberi kuasa\n4. Membawa surat keterangan ahli waris\n5. Membawa KTP asli penerima kuasa\n\n`;

    pesan += `D. Oleh Perusahaan/CV/Yayasan\n1. Membawa surat kuasa bermaterai dari Perusahaan ( diatas kop surat ) + Stempel Perusahaan/CV/Yayasan dan ditandatangani oleh pejabat berwenang\n2. Membawa copy KTP pemberi kuasa dan penerima kuasa\n3. Membawa Stempel Perusahaan/CV/Yayasan\n\n`;

    pesan += `Terima kasih atas kerjasama dan kepercayaan Anda sebagai pelanggan kami.\n\n`;
    pesan += `Hormat kami,\nMitsubishi Bintaro`;

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
        case 'PKT': case 'PERLU FOLLOW UP': return 'bg-green-100 text-green-700';
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
    const [pktData, setPktData] = useState([]);
    const [pajakStnkData, setPajakStnkData] = useState([]);
    const [bpkbReadyData, setBpkbReadyData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
            const [resKonf, resH1, resH30, resPkt, resStnk, resBpkb] = await Promise.all([
                fetch(`${API_BASE}?tab=konfirmasi`),
                fetch(`${API_BASE}?tab=h1`),
                fetch(`${API_BASE}?tab=h30`),
                fetch(`https://csdwindo.com/api/panel/sales_survey.php?action=list`),
                fetch(`${API_BASE}?tab=pajak_stnk`),
                fetch(`${API_BASE}?tab=bpkb_ready`)
            ]);
            const dataKonf = await resKonf.json();
            const dataH1 = await resH1.json();
            const dataH30 = await resH30.json();
            const dataPkt = await resPkt.json();
            const dataStnk = await resStnk.json();
            const dataBpkb = await resBpkb.json();

            setKonfirmasiData(dataKonf.status ? dataKonf.data : []);
            setH1Data(dataH1.status ? dataH1.data : []);
            setH30Data(dataH30.status ? dataH30.data : []);
            setPajakStnkData(dataStnk.status ? dataStnk.data : []);
            setBpkbReadyData(dataBpkb.status ? dataBpkb.data : []);

            if (dataPkt.status) {
                const now = new Date();
                const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
                nowJakarta.setHours(0, 0, 0, 0);

                const validPkt = (dataPkt.data || []).filter(item => {
                    if (item.status !== 'PKT' && item.status !== 'PERLU FOLLOW UP') return false;
                    if (!item.wa_date) return false;

                    const wa = new Date(item.wa_date + 'T00:00:00+07:00');
                    if (isNaN(wa.getTime())) return false;
                    wa.setHours(0, 0, 0, 0);

                    const diffDays = Math.floor((nowJakarta - wa) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays < 3;
                });
                setPktData(validPkt);
            }
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
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildKonfirmasiMessage(item);
            openWhatsapp(item.telp, msg);

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
    const handleH1 = async (item) => {
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

        await executeSendH1(item);
    };

    const executeSendH1 = async (item) => {
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildH1Message(item);
            openWhatsapp(item.telp, msg);
            showToast(`WA H-1 dikirim ke ${item.nama}`);
            setConfirmModal({ show: false, item: null, message: '' });
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses pesan WA', 'error');
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    // H-30 Menit: kirim WA saja, cek jam
    const handleH30 = async (item) => {
        if (isJamPassed(item.jam)) {
            showToast(`Jam booking ${item.jam} sudah lewat, tidak bisa kirim WA`, 'error');
            return;
        }
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildH30MenitMessage(item);
            openWhatsapp(item.telp, msg);
            showToast(`WA Reminder dikirim ke ${item.nama}`);
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses pesan WA', 'error');
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handlePkt = async (item) => {
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildPktMessage(item);
            openWhatsapp(item.telp, msg);
            showToast(`WA PKT dikirim ke ${item.nama}`);
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses pesan WA', 'error');
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handlePajakStnk = async (item) => {
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildStnkMessage(item);
            openWhatsapp(item.telp, msg);

            const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
            const res = await fetch(API_BASE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    action: 'WA STNK',
                    user: user.nama || 'ADMIN'
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(`Masa berlaku STNK ${item.nama} diperbarui.`);
                fetchAllData();
            } else {
                showToast(data.message || 'Gagal memperbarui STNK', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses WA STNK', 'error');
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handleBpkbReady = async (item) => {
        setUpdatingIds(prev => new Set(prev).add(item.id));
        try {
            const msg = await buildBpkbMessage(item);
            openWhatsapp(item.telp, msg);

            const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
            const res = await fetch(API_BASE, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    action: 'WA BPKB',
                    user: user.nama || 'ADMIN'
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(`Status BPKB ${item.nama} diperbarui.`);
                fetchAllData();
            } else {
                showToast(data.message || 'Gagal memperbarui BPKB', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses WA BPKB', 'error');
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Get all first column items (Rangka)
                const rangkas = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i] && data[i][0]) {
                        rangkas.push(String(data[i][0]).trim());
                    }
                }

                if (rangkas.length > 0) {
                    const res = await fetch(API_BASE, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'upload_bpkb', data: rangkas })
                    });
                    const resData = await res.json();
                    if (resData.status) {
                        showToast(resData.message, 'success');
                        fetchAllData();
                    } else {
                        showToast(resData.message, 'error');
                    }
                } else {
                    showToast('File excel kosong atau tidak memiliki format yang benar', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Gagal membaca file Excel', 'error');
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const tabs = [
        { key: 'Konfirmasi', label: 'Konfirmasi', count: konfirmasiData.length },
        { key: 'H-1', label: 'H-1', count: h1Data.length },
        { key: 'H-30 Menit', label: 'H-30 Menit', count: h30Data.length },
        { key: 'H+2 PKT', label: 'H+2 PKT', count: pktData.length },
        { key: 'Pajak STNK', label: 'Pajak STNK', count: pajakStnkData.length },
        { key: 'BPKB Ready', label: 'BPKB Ready', count: bpkbReadyData.length },
    ];

    const currentData = activeTab === 'Konfirmasi' ? konfirmasiData
        : activeTab === 'H-1' ? h1Data
            : activeTab === 'H-30 Menit' ? h30Data
                : activeTab === 'H+2 PKT' ? pktData
                    : activeTab === 'Pajak STNK' ? pajakStnkData
                        : activeTab === 'BPKB Ready' ? bpkbReadyData
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
        else if (activeTab === 'H+2 PKT') handlePkt(item);
        else if (activeTab === 'Pajak STNK') handlePajakStnk(item);
        else if (activeTab === 'BPKB Ready') handleBpkbReady(item);
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
                    <div>{activeTab === 'H+2 PKT' ? 'FU' : activeTab === 'Pajak STNK' ? 'Sisa' : activeTab === 'BPKB Ready' ? '-' : 'Jam'}</div>
                    <div>{activeTab === 'H+2 PKT' ? 'Warranty' : activeTab === 'Pajak STNK' ? 'Jatuh Tempo' : activeTab === 'BPKB Ready' ? 'Tanggal' : 'Tanggal'}</div>
                    <div>Nama</div>
                    <div>Kendaraan</div>
                    <div>{activeTab === 'H+2 PKT' ? 'Sales' : activeTab === 'Pajak STNK' ? 'TNKB' : activeTab === 'BPKB Ready' ? 'Sales / SPV' : 'Service'}</div>
                    <div>Status</div>
                    <div className="text-right">Aksi</div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : activeTab === 'BPKB Ready' && displayData.length === 0 ? (
                        <div className="p-6 md:p-10 max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-xl font-bold mb-6 text-center">Upload Data BPKB (Excel)</h2>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${isUploading ? 'border-gray-200 bg-gray-50' : 'border-[#E60012]/30 bg-red-50 hover:bg-red-100 hover:border-[#E60012]/50'
                                    }`}>
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E60012] border-t-transparent mb-4"></div>
                                    ) : (
                                        <UploadCloud size={48} className="text-[#E60012]/60 mb-4" />
                                    )}
                                    <span className="text-sm font-bold text-[#111111]">
                                        {isUploading ? 'Memproses File...' : 'Klik atau drag file kesini untuk upload'}
                                    </span>
                                    {!isUploading && (
                                        <span className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                                            Format file harus .xlsx / .xls dan Nomor Rangka berada pada kolom pertama (Kolom A)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : displayData.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><Calendar size={32} /></div>
                            <p className="text-gray-500 text-sm">
                                {activeTab === 'Konfirmasi' && 'Tidak ada booking dengan status REQUEST / UBAH.'}
                                {activeTab === 'H-1' && 'Tidak ada booking BOOKING untuk besok.'}
                                {activeTab === 'H-30 Menit' && 'Tidak ada booking BOOKING untuk hari ini.'}
                                {activeTab === 'H+2 PKT' && 'Tidak ada data survey PKT dengan umur WA kurang dari 3 hari.'}
                                {activeTab === 'Pajak STNK' && 'Tidak ada konsumen yang perlu diingatkan pajak STNK dalam 30 hari kedepan.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {displayData.map((item) => {
                                const passed = activeTab === 'H-30 Menit' && isJamPassed(item.jam);
                                const tooEarly = activeTab === 'H-30 Menit' && isTooEarlyForH30(item.jam);
                                const isUpdating = updatingIds.has(item.id);
                                const isEarly = activeTab === 'H-1' && new Date().getHours() < 15;
                                const isPktTab = activeTab === 'H+2 PKT';
                                const isStnkTab = activeTab === 'Pajak STNK';
                                const isBpkbTab = activeTab === 'BPKB Ready';

                                let diffDays = 0;
                                if (isPktTab && item.wa_date) {
                                    const now = new Date();
                                    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
                                    nowJakarta.setHours(0, 0, 0, 0);
                                    const wa = new Date(item.wa_date + 'T00:00:00+07:00');
                                    wa.setHours(0, 0, 0, 0);
                                    if (!isNaN(wa.getTime())) {
                                        diffDays = Math.floor((nowJakarta - wa) / (1000 * 60 * 60 * 24));
                                    }
                                }

                                let stnkDays = 0;
                                let tnkbDays = 0;
                                if (isStnkTab) {
                                    const now = new Date();
                                    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
                                    nowJakarta.setHours(0, 0, 0, 0);
                                    if (item.one_year) {
                                        const stnkDate = new Date(item.one_year + 'T00:00:00+07:00');
                                        stnkDate.setHours(0, 0, 0, 0);
                                        stnkDays = Math.floor((stnkDate - nowJakarta) / (1000 * 60 * 60 * 24));
                                    }
                                    if (item.five_year) {
                                        const tnkbDate = new Date(item.five_year + 'T00:00:00+07:00');
                                        tnkbDate.setHours(0, 0, 0, 0);
                                        tnkbDays = Math.floor((tnkbDate - nowJakarta) / (1000 * 60 * 60 * 24));
                                    }
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-[60px_90px_2fr_2fr_2fr_80px_120px] md:gap-3 md:items-center transition-colors ${passed ? 'bg-gray-50 opacity-60' : 'hover:bg-[#FAFAFA]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start md:block">
                                            <div className="flex items-center gap-2 md:block">
                                                {!isPktTab && !isStnkTab && !isBpkbTab ? (
                                                    <span className="inline-block bg-[#E60012]/10 text-[#E60012] px-2 py-1 rounded text-xs font-bold">
                                                        {item.jam}
                                                    </span>
                                                ) : isPktTab ? (
                                                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                        H+2
                                                    </span>
                                                ) : isStnkTab ? (
                                                    <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold text-center whitespace-nowrap">
                                                        {stnkDays} hari
                                                    </span>
                                                ) : (
                                                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                                        BPKB
                                                    </span>
                                                )}
                                                <div className="md:hidden text-xs">
                                                    <span className="font-bold text-[#111111]">{isPktTab ? formatTanggal(item.wa_date) : isStnkTab ? formatTanggal(item.one_year) : (item.wa_date || item.tanggal ? formatTanggal(item.wa_date || item.tanggal) : '-')}</span>
                                                    <span className="text-gray-400 text-[10px] ml-1">{isPktTab ? getHariIndonesia(item.wa_date) : isStnkTab ? '' : (item.wa_date || item.tanggal ? getHariIndonesia(item.wa_date || item.tanggal) : '')}</span>
                                                </div>
                                            </div>
                                            <div className="md:hidden flex flex-col items-end">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(isStnkTab ? 'STNK' : isBpkbTab ? item.bpkb : item.status)}`}>
                                                    {isStnkTab ? 'STNK' : isBpkbTab ? item.bpkb : (item.status || 'REQUEST')}
                                                </span>
                                                {isPktTab && (
                                                    <div className="text-[10px] font-bold text-blue-600 mt-1">
                                                        Umur: {diffDays} Hari
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-xs">
                                            <div className="font-bold text-[#111111]">{isPktTab ? formatTanggal(item.wa_date) : isStnkTab ? formatTanggal(item.one_year) : (item.wa_date || item.tanggal ? formatTanggal(item.wa_date || item.tanggal) : '-')}</div>
                                            <div className="text-gray-400 text-[10px]">{isPktTab ? getHariIndonesia(item.wa_date) : isStnkTab ? '' : (item.wa_date || item.tanggal ? getHariIndonesia(item.wa_date || item.tanggal) : '')}</div>
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
                                            <div className="font-bold text-[#111111]">{item.kendaraan || 'Tidak Diketahui'}</div>
                                            <div className="mt-0.5 font-mono text-xs font-bold text-gray-500">{isPktTab ? item.rangka : item.nopol}</div>
                                        </div>
                                        <div className="text-xs text-gray-600 bg-gray-50 p-3 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">{isPktTab ? 'Sales' : isStnkTab ? 'TNKB' : isBpkbTab ? 'Sales / SPV' : 'Service'}</span>
                                            {isPktTab ? (
                                                <div className="font-bold text-gray-800">{item.sales}</div>
                                            ) : isStnkTab ? (
                                                <>
                                                    <div className="font-bold text-gray-800">{formatTanggal(item.five_year)}</div>
                                                    <div className="text-[10px] text-gray-500">{tnkbDays} hari</div>
                                                </>
                                            ) : isBpkbTab ? (
                                                <>
                                                    <div className="font-bold text-gray-800">{item.sales}</div>
                                                    <div className="text-[10px] text-gray-500">{item.spv}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold tracking-wide">{item.jenis}</span>
                                                    </div>
                                                    {item.keluhan && <div className="text-gray-500 mt-1.5 italic leading-relaxed">"{item.keluhan}"</div>}
                                                </>
                                            )}
                                        </div>
                                        <div className="hidden md:block">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(isStnkTab ? 'REQUEST' : isBpkbTab ? item.bpkb : item.status)}`}>
                                                {isStnkTab ? 'STNK' : isBpkbTab ? item.bpkb : (item.status || 'REQUEST')}
                                            </span>
                                            {isPktTab && (
                                                <div className="text-[10px] font-bold text-blue-600 mt-1">
                                                    Umur: {diffDays} Hari
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
