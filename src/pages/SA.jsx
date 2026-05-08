import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check, ArrowRight, User, Calendar, Phone, CarFront, Wrench, Search as SearchIcon, Bot, Send, Loader2, AlertTriangle, ShieldAlert, Lock, UserRound, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ANGULAR_CLIP } from '../utils/constants';
import AngularButton from '../components/ui/AngularButton';
import { CustomSelect } from '../components/panel/booking/LegacyBookingModals';

const SA_OPTIONS = [
  { value: 'Dimas', label: 'Dimas' },
  { value: 'Ipral', label: 'Ipral' },
  { value: 'Muti', label: 'Muti' },
  { value: 'Rudi', label: 'Rudi' },
  { value: 'Yuda', label: 'Yuda' },
  { value: 'Ilham', label: 'Ilham' },
];




const SA = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('potensi'); // 'potensi' | 'konfirmasi'

  // State for Potensi
  const [selectedPotensi, setSelectedPotensi] = useState(null);
  const [potensiData, setPotensiData] = useState([]);
  const [isLoadingPotensi, setIsLoadingPotensi] = useState(false);
  const [invalidNoteModal, setInvalidNoteModal] = useState(false);
  const [invalidNote, setInvalidNote] = useState('');

  // State for Konfirmasi Backend
  const [konfirmasiSearchQuery, setKonfirmasiSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedKonfirmasi, setSelectedKonfirmasi] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoadingKonfirmasi, setIsLoadingKonfirmasi] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];

  // WhatsApp / AI Chat Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waModalStep, setWaModalStep] = useState(1);
  const [waContextInput, setWaContextInput] = useState('');
  const [waGenerating, setWaGenerating] = useState(false);
  const [waGeneratedText, setWaGeneratedText] = useState('');

  // Komplen State
  const [showKomplenConfirm, setShowKomplenConfirm] = useState(false);
  const [isKomplenLoading, setIsKomplenLoading] = useState(false);

  // Other Number State
  const [showOtherNumberModal, setShowOtherNumberModal] = useState(false);
  const [otherNumberInput, setOtherNumberInput] = useState('');
  const [isUpdatingNumber, setIsUpdatingNumber] = useState(false);

  // SA Setup State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState('SELECT_SA'); // 'SELECT_SA' | 'ENTER_PIN' | 'CREATE_PIN'
  const [saName, setSaName] = useState('');
  const [saPin, setSaPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [saSetupData, setSaSetupData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const checkSetup = () => {
      const stored = localStorage.getItem('sa_setup_session');
      const today = new Date().toISOString().split('T')[0];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.date === today && parsed.name) {
            setSaSetupData(parsed);
            return;
          }
        } catch(e) {}
      }

      const savedName = localStorage.getItem('saved_sa_name');
      if (savedName) {
        setSaName(savedName);
        setAuthStep('ENTER_PIN');
      } else {
        setAuthStep('SELECT_SA');
      }
      setSetupModalOpen(true);
    };
    checkSetup();
  }, []);

  const handleSaChange = async (val) => {
    setSaName(val);
    if (!val) return;
    
    setIsCheckingPin(true);
    try {
      const res = await fetch(`https://csdwindo.com/api/panel/sa_auth.php?action=check&name=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.status) {
        if (data.data.exists) {
          setAuthStep('ENTER_PIN');
        } else {
          setAuthStep('CREATE_PIN');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingPin(false);
    }
  };

  const saveSession = (name) => {
    const today = new Date().toISOString().split('T')[0];
    const data = { name, date: today };
    localStorage.setItem('sa_setup_session', JSON.stringify(data));
    localStorage.setItem('saved_sa_name', name);
    setSaSetupData(data);
    setSetupModalOpen(false);
    setSaPin('');
    setPinConfirm('');
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!saName) return;

    if (authStep === 'ENTER_PIN') {
      if (saPin.length !== 4) return;
      setIsCheckingPin(true);
      try {
        const res = await fetch('https://csdwindo.com/api/panel/sa_auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', name: saName, pin: saPin })
        });
        const data = await res.json();
        if (data.status) {
          saveSession(saName);
        } else {
          showToast(data.message || 'PIN Salah', 'error');
        }
      } catch (err) {
        showToast('Gagal verifikasi PIN', 'error');
      } finally {
        setIsCheckingPin(false);
      }
    } else if (authStep === 'CREATE_PIN') {
      if (saPin.length !== 4 || pinConfirm.length !== 4) {
        showToast('PIN harus 4 angka', 'error');
        return;
      }
      if (saPin !== pinConfirm) {
        showToast('Konfirmasi PIN tidak cocok', 'error');
        return;
      }
      setIsCheckingPin(true);
      try {
        const res = await fetch('https://csdwindo.com/api/panel/sa_auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'setup', name: saName, pin: saPin })
        });
        const data = await res.json();
        if (data.status) {
          showToast('PIN berhasil disetting');
          saveSession(saName);
        } else {
          showToast(data.message || 'Gagal setting PIN', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan', 'error');
      } finally {
        setIsCheckingPin(false);
      }
    }
  };

  // Fetch potensi service data for this SA
  useEffect(() => {
    if (!saSetupData?.name) return;
    const fetchPotensi = async () => {
      setIsLoadingPotensi(true);
      try {
        const res = await fetch(`https://csdwindo.com/api/potensi_service.php?action=list&sa=${encodeURIComponent(saSetupData.name)}`);
        const json = await res.json();
        if (json.status) {
          // Map DB fields to component fields
          setPotensiData(json.data.map(d => ({
            id: d.id,
            nopol: d.nopol,
            nama: d.nama,
            telp: d.telp,
            kendaraan: d.kendaraan,
            rangka: d.rangka,
            serviceTerakhir: d.service_terakhir,
            potensiNextService: d.potensi_service,
            expectedDate: d.expected_date,
            lastSA: d.sa,
            statusFollowUp: d.status,
            source: d.source,
            note: d.note,
            time: d.time,
          })));
        }
      } catch (err) {
        console.error('Error fetching potensi data:', err);
      } finally {
        setIsLoadingPotensi(false);
      }
    };
    fetchPotensi();
  }, [saSetupData?.name]);

  const fetchBookings = async () => {
    // If length is 1 or 2, don't trigger global API search to avoid spam, we'll just local filter today's data.
    // But we still need to load today's data if it's 0.
    if (konfirmasiSearchQuery.length > 0 && konfirmasiSearchQuery.length < 3) {
      return;
    }

    setIsLoadingKonfirmasi(true);
    try {
      let url = `https://csdwindo.com/api/panel/data_booking.php?date=${currentDate}`;
      if (konfirmasiSearchQuery.length >= 3) {
        url = `https://csdwindo.com/api/panel/data_booking.php?search=${encodeURIComponent(konfirmasiSearchQuery)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.status) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingKonfirmasi(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 500);

    return () => clearTimeout(timer);
  }, [konfirmasiSearchQuery, currentDate]);

  // Stats for Potensi
  const potensiStats = useMemo(() => {
    return {
      total: potensiData.length,
      belum: potensiData.filter(p => p.statusFollowUp === 'NEW').length,
      sudah: potensiData.filter(p => p.statusFollowUp === 'FOLLOW_UP').length,
      success: potensiData.filter(p => p.statusFollowUp === 'BOOKING').length,
    };
  }, [potensiData]);

  // Stats for Konfirmasi
  const konfirmasiStats = useMemo(() => {
    return {
      total: bookings.length,
      booking: bookings.filter(k => k.status === 'BOOKING').length,
      datang: bookings.filter(k => k.status === 'DATANG').length,
      cancel: bookings.filter(k => k.status === 'CANCEL').length,
    };
  }, [bookings]);

  const filteredKonfirmasi = useMemo(() => {
    if (!konfirmasiSearchQuery) return bookings;
    const query = konfirmasiSearchQuery.toLowerCase();
    return bookings.filter(k =>
      k.nopol.toLowerCase().includes(query) ||
      k.nama.toLowerCase().includes(query) ||
      k.kendaraan.toLowerCase().includes(query)
    );
  }, [konfirmasiSearchQuery, bookings]);

  const handleSearchSelect = (query) => {
    setKonfirmasiSearchQuery(query);
    setIsSearchModalOpen(false);
  };

  const formatBookingWhatsApp = (booking) => {
    let fDate = booking.tanggal;
    if (booking.tanggal) {
      const dd = new Date(booking.tanggal);
      if (!isNaN(dd.getTime())) {
        fDate = dd.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
    let text = `*DATA BOOKING SERVICE*\n\n`;
    text += `Nama: ${booking.nama || '-'}\n`;
    text += `No HP: ${booking.telp || '-'}\n`;
    text += `Kendaraan: ${booking.kendaraan || '-'}\n`;
    text += `Nopol: ${booking.nopol || '-'}\n`;
    text += `Tanggal: ${fDate || '-'}\n`;
    text += `Jam: ${booking.jam || '-'}\n`;
    text += `Jenis Service: ${booking.jenis || '-'}\n`;
    text += `Keluhan: ${booking.keluhan || '-'}\n`;
    return text;
  };

  const generateAiResponse = async () => {
    if (!selectedKonfirmasi) return;
    setWaGenerating(true);
    setWaModalStep(2);
    setWaGeneratedText('');

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const bookingContext = formatBookingWhatsApp(selectedKonfirmasi);

      const systemPrompt = `Kamu adalah Service Advisor untuk dealer mobil Mitsubishi Dwindo.
Nama kamu adalah ${saSetupData?.name || 'SA'}.
Tugasmu adalah membuat draft pesan WhatsApp (text siap kirim) kepada konsumen berdasarkan instruksi dari Service Advisor di bawah ini.
Gunakan bahasa Indonesia yang sopan, formal, to the point, tapi tetap friendly.
Jangan gunakan markdown bintang (**) berlebihan. Akhiri dengan "Salam, ${saSetupData?.name || 'SA'} - Service Advisor Mitsubishi Dwindo".
Gunakan data booking di bawah sebagai referensi jika relevan dengan pesan yang diminta.

Instruksi / Pesan yang ingin disampaikan Service Advisor:
${waContextInput || 'Sampaikan informasi umum terkait booking.'}

Data Booking Konsumen (sebagai referensi):
${bookingContext}

Buatkan draft pesannya sekarang:`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-001',
          messages: [
            { role: 'user', content: systemPrompt }
          ],
          temperature: 0.7
        })
      });

      const result = await res.json();
      if (result.choices && result.choices[0] && result.choices[0].message) {
        setWaGeneratedText(result.choices[0].message.content);
      } else {
        setWaGeneratedText('Maaf, AI gagal merespon.');
      }
    } catch (err) {
      console.error('AI Error:', err);
      setWaGeneratedText('Terjadi kesalahan koneksi AI.');
    } finally {
      setWaGenerating(false);
    }
  };

  const directWhatsApp = (phone, customText = null) => {
    if (!phone) return;
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    const defaultText = `Halo Bpk/Ibu ${selectedKonfirmasi?.nama || ''}, saya ${saSetupData?.name || 'SA'} dari Mitsubishi Dwindo Bintaro...`;
    const text = encodeURIComponent(customText || defaultText);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const openChatFlow = () => {
    setWaContextInput('');
    setWaGeneratedText('');
    setWaModalStep(1);
    setShowWaModal(true);
  };

  const recordWhatsAppAction = async () => {
    if (!selectedKonfirmasi) return;
    try {
      await fetch('https://csdwindo.com/api/panel/data_booking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_whatsapp',
          booking_id: selectedKonfirmasi.id,
          user: saSetupData?.name || 'SA',
          before: waContextInput || '-',
          after: waGeneratedText || '-'
        })
      });
    } catch (err) {
      console.error('Failed to record WA action:', err);
    }
  };

  const handleIndikasiKomplen = async () => {
    if (!selectedKonfirmasi) return;
    setIsKomplenLoading(true);
    try {
      const payload = {
        ...selectedKonfirmasi,
        user: saSetupData?.name || 'SA',
        forceStatus: 'INDIKASI_KOMPLEN'
      };

      const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status) {
        showToast('Status berhasil diubah menjadi Indikasi Komplen');
        setShowKomplenConfirm(false);
        setSelectedKonfirmasi(null);
        fetchBookings();
      } else {
        showToast(data.message || 'Gagal mengubah status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsKomplenLoading(false);
    }
  };

  const handleUpdateNumberAndSend = async (e) => {
    e.preventDefault();
    if (!selectedKonfirmasi || !otherNumberInput) return;
    if (!otherNumberInput.startsWith('0')) {
      showToast('Nomor telepon harus dimulai dengan 0', 'error');
      return;
    }

    setIsUpdatingNumber(true);
    try {
      const payload = {
        ...selectedKonfirmasi,
        user: saSetupData?.name || 'SA',
        telp: otherNumberInput
      };

      const res = await fetch('https://csdwindo.com/api/panel/data_booking.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status) {
        showToast('Nomor telepon berhasil diperbarui');
        const updatedKonfirmasi = { ...selectedKonfirmasi, telp: otherNumberInput };
        setSelectedKonfirmasi(updatedKonfirmasi);
        
        setShowOtherNumberModal(false);
        setShowWaModal(false);
        setOtherNumberInput('');
        await recordWhatsAppAction();
        directWhatsApp(otherNumberInput, waGeneratedText);
        
        fetchBookings();
      } else {
        showToast(data.message || 'Gagal memperbarui nomor telepon', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsUpdatingNumber(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#111111] font-sans">
      {/* Header */}
      <header className="bg-[#111111] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-display font-bold flex items-center gap-2 uppercase tracking-wider">
              <span className="w-3 h-8 bg-[#E60012] inline-block" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}></span>
              SA Dashboard
            </h1>
            <div className="text-[11px] bg-[#E60012] px-3 py-1 font-display font-bold tracking-widest uppercase" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}>
              SA: {saSetupData?.name || '-'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-3xl mx-auto px-4 pt-2 border-b border-white/10">
          <div className="flex w-full gap-1">
            <button
              onClick={() => setActiveTab('potensi')}
              className={`flex-1 py-3 text-sm font-display font-bold uppercase tracking-widest text-center transition-colors ${activeTab === 'potensi' ? 'bg-[#E60012] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              style={activeTab === 'potensi' ? { clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' } : {}}
            >
              POTENSI
            </button>
            <button
              onClick={() => setActiveTab('konfirmasi')}
              className={`flex-1 py-3 text-sm font-display font-bold uppercase tracking-widest text-center transition-colors ${activeTab === 'konfirmasi' ? 'bg-[#E60012] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              style={activeTab === 'konfirmasi' ? { clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' } : {}}
            >
              KONFIRMASI
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* ----------------- TAB: POTENSI ----------------- */}
        {activeTab === 'potensi' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Cards Counter */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-gray-300 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-gray-500 uppercase mb-1">Total</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{potensiStats.total}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-[#E60012] flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-[#E60012] uppercase mb-1">Belum Follow Up</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{potensiStats.belum}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-blue-600 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-blue-600 uppercase mb-1">Sudah Follow Up</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{potensiStats.sudah}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-green-600 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-green-600 uppercase mb-1">Success Booking</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{potensiStats.success}</p>
              </div>
            </div>

            <div className="space-y-6">

              {/* NEW - Belum Follow Up */}
              {potensiData.filter(p => p.statusFollowUp === 'NEW').length > 0 && (
                <div>
                  <h2 className="text-[11px] font-display font-bold text-[#E60012] mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E60012]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: BELUM FOLLOW UP
                  </h2>
                  <div className="space-y-3">
                    {potensiData.filter(p => p.statusFollowUp === 'NEW').map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPotensi(item)}
                        style={{ clipPath: ANGULAR_CLIP }}
                        className="bg-white border-l-4 border-[#E60012] p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#E60012]/5 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#E60012]/10 transition-colors"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg tracking-wider text-[#111111]">{item.nopol}</h3>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{item.nama} <span className="text-[#E60012] font-bold mx-1">•</span> {item.kendaraan}</p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-semibold bg-gray-50 inline-block px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                            <Wrench className="w-3 h-3 inline text-[#E60012]" /> Potensi: {item.potensiNextService}
                          </p>
                        </div>
                        <div className="text-gray-300 group-hover:text-[#E60012] transition-colors relative z-10">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOLLOW_UP - Sudah Follow Up */}
              {potensiData.filter(p => p.statusFollowUp === 'FOLLOW_UP').length > 0 && (
                <div>
                  <h2 className="text-[11px] font-display font-bold text-blue-600 mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: SUDAH FOLLOW UP
                  </h2>
                  <div className="space-y-3">
                    {potensiData.filter(p => p.statusFollowUp === 'FOLLOW_UP').map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPotensi(item)}
                        style={{ clipPath: ANGULAR_CLIP }}
                        className="bg-white border-l-4 border-blue-600 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-blue-100 transition-colors"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg tracking-wider text-[#111111]">{item.nopol}</h3>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{item.nama} <span className="text-blue-600 font-bold mx-1">•</span> {item.kendaraan}</p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-semibold bg-gray-50 inline-block px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                            <Wrench className="w-3 h-3 inline text-blue-600" /> Potensi: {item.potensiNextService}
                          </p>
                        </div>
                        <div className="text-gray-300 group-hover:text-blue-600 transition-colors relative z-10">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOOKING - Success */}
              {potensiData.filter(p => p.statusFollowUp === 'BOOKING').length > 0 && (
                <div>
                  <h2 className="text-[11px] font-display font-bold text-green-600 mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: SUCCESS BOOKING
                  </h2>
                  <div className="space-y-3">
                    {potensiData.filter(p => p.statusFollowUp === 'BOOKING').map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPotensi(item)}
                        style={{ clipPath: ANGULAR_CLIP }}
                        className="bg-white border-l-4 border-green-600 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-green-100 transition-colors"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg tracking-wider text-[#111111]">{item.nopol}</h3>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{item.nama} <span className="text-green-600 font-bold mx-1">•</span> {item.kendaraan}</p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-semibold bg-gray-50 inline-block px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                            <Wrench className="w-3 h-3 inline text-green-600" /> Potensi: {item.potensiNextService}
                          </p>
                        </div>
                        <div className="text-gray-300 group-hover:text-green-600 transition-colors relative z-10">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoadingPotensi ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E60012]" />
                </div>
              ) : potensiData.length === 0 && (
                <div className="text-center py-10 font-display font-bold tracking-widest text-gray-400 uppercase text-sm">Tidak ada data potensi.</div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB: KONFIRMASI ----------------- */}
        {activeTab === 'konfirmasi' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Cards Counter */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-gray-300 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-gray-500 uppercase mb-1">Total</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{konfirmasiStats.total}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-[#E60012] flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-[#E60012] uppercase mb-1">Booking</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{konfirmasiStats.booking}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-white p-3 shadow-sm border-b-4 border-green-600 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-green-600 uppercase mb-1">Datang</p>
                <p className="text-xl md:text-2xl font-display font-bold text-[#111111]">{konfirmasiStats.datang}</p>
              </div>
              <div style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }} className="bg-gray-100 p-3 shadow-sm border-b-4 border-gray-400 flex flex-col items-center justify-center">
                <p className="text-[9px] md:text-[10px] font-display font-bold tracking-widest text-gray-500 uppercase mb-1">Cancel</p>
                <p className="text-xl md:text-2xl font-display font-bold text-gray-500">{konfirmasiStats.cancel}</p>
              </div>
            </div>

            {/* Search Bar / Trigger Modal Search */}
            <div className="mb-6">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
                className="w-full bg-white border-2 border-transparent hover:border-gray-200 p-3 flex items-center justify-between text-gray-500 focus:outline-none transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <SearchIcon className="w-5 h-5 text-gray-400 group-hover:text-[#E60012] transition-colors" />
                  <span className="font-medium text-sm">{konfirmasiSearchQuery ? `Pencarian: ${konfirmasiSearchQuery}` : 'Cari Nopol, Nama, Kendaraan...'}</span>
                </div>
                {konfirmasiSearchQuery && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setKonfirmasiSearchQuery(''); }}
                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-[#E60012] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            {/* List Konfirmasi */}
            <div className="space-y-6">
              {isLoadingKonfirmasi ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#E60012]">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent mb-4"></div>
                  <p className="font-display font-bold tracking-widest uppercase text-sm text-gray-400">Memuat Data...</p>
                </div>
              ) : (
                <>
                  {/* DATANG */}
                  {filteredKonfirmasi.filter(k => k.status === 'DATANG').length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-display font-bold text-green-600 mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: DATANG
                      </h2>
                      <div className="space-y-3">
                        {filteredKonfirmasi.filter(k => k.status === 'DATANG').map(row => (
                          <div
                            key={row.id}
                            onClick={() => setSelectedKonfirmasi(row)}
                            style={{ clipPath: ANGULAR_CLIP }}
                            className="bg-white border-l-4 border-green-600 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-green-100 transition-colors"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#111111] text-white text-[10px] font-display font-bold tracking-wider px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>{row.jam}</span>
                                <h3 className="font-display font-bold text-lg tracking-wider text-[#111111]">{row.nopol}</h3>
                              </div>
                              <p className="text-sm font-medium text-gray-600">{row.nama} <span className="text-green-600 font-bold mx-1">•</span> {row.kendaraan}</p>
                            </div>
                            <div className="text-gray-300 group-hover:text-[#111111] transition-colors relative z-10">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOOKING */}
                  {filteredKonfirmasi.filter(k => k.status === 'BOOKING').length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-display font-bold text-[#E60012] mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#E60012]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: BOOKING
                      </h2>
                      <div className="space-y-3">
                        {filteredKonfirmasi.filter(k => k.status === 'BOOKING').map(row => (
                          <div
                            key={row.id}
                            onClick={() => setSelectedKonfirmasi(row)}
                            style={{ clipPath: ANGULAR_CLIP }}
                            className="bg-white border-l-4 border-[#E60012] p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#E60012]/5 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#E60012]/10 transition-colors"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#111111] text-white text-[10px] font-display font-bold tracking-wider px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>{row.jam}</span>
                                <h3 className="font-display font-bold text-lg tracking-wider text-[#111111]">{row.nopol}</h3>
                              </div>
                              <p className="text-sm font-medium text-gray-600">{row.nama} <span className="text-[#E60012] font-bold mx-1">•</span> {row.kendaraan}</p>
                            </div>
                            <div className="text-gray-300 group-hover:text-[#E60012] transition-colors relative z-10">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CANCEL */}
                  {filteredKonfirmasi.filter(k => k.status === 'CANCEL').length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-display font-bold text-gray-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span> Status: CANCEL
                      </h2>
                      <div className="opacity-80 space-y-3">
                        {filteredKonfirmasi.filter(k => k.status === 'CANCEL').map(row => (
                          <div
                            key={row.id}
                            onClick={() => setSelectedKonfirmasi(row)}
                            style={{ clipPath: ANGULAR_CLIP }}
                            className="bg-gray-100 border-l-4 border-gray-400 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                          >
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-gray-400 text-white text-[10px] font-display font-bold tracking-wider px-2 py-1" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>{row.jam}</span>
                                <h3 className="font-display font-bold text-lg tracking-wider text-gray-500">{row.nopol}</h3>
                              </div>
                              <p className="text-sm font-medium text-gray-500">{row.nama} <span className="text-gray-400 font-bold mx-1">•</span> {row.kendaraan}</p>
                            </div>
                            <div className="text-gray-300 group-hover:text-[#111111] transition-colors relative z-10">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredKonfirmasi.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Search className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="font-display font-bold tracking-widest uppercase text-sm">Tidak ada data yang ditemukan.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* Search Modal Konfirmasi */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 backdrop-blur-sm pt-20">
          <div style={{ clipPath: ANGULAR_CLIP }} className="bg-white w-full max-w-md shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 border-t-4 border-[#E60012]">
            <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
              <SearchIcon className="w-5 h-5 text-[#E60012]" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik Nopol, Nama..."
                className="flex-1 outline-none text-lg text-[#111111] bg-transparent font-medium"
                value={konfirmasiSearchQuery}
                onChange={(e) => setKonfirmasiSearchQuery(e.target.value)}
              />
              <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-[#E60012] p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-y-auto">
              {isLoadingKonfirmasi ? (
                <div className="p-8 text-center text-[#E60012]">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E60012] border-t-transparent mx-auto mb-2"></div>
                  <p className="font-display font-bold tracking-widest uppercase text-xs text-gray-400">Mencari...</p>
                </div>
              ) : filteredKonfirmasi.length > 0 ? (
                <div className="space-y-1">
                  {filteredKonfirmasi.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSearchSelect(item.nopol)}
                      className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors border-l-2 border-transparent hover:border-[#E60012]"
                    >
                      <div>
                        <p className="font-display font-bold tracking-wider text-[#111111]">{item.nopol}</p>
                        <p className="text-sm font-medium text-gray-500">{item.nama} • {item.kendaraan}</p>
                      </div>
                      <span className={`text-[9px] font-display font-bold tracking-widest px-2 py-1 text-white uppercase ${item.status === 'BOOKING' ? 'bg-[#E60012]' : item.status === 'DATANG' ? 'bg-green-600' : 'bg-gray-500'}`} style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 font-display font-bold tracking-widest uppercase text-sm">Pencarian tidak ditemukan</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Potensi */}
      {selectedPotensi && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div style={{ clipPath: ANGULAR_CLIP }} className="bg-white w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border-t-4 border-[#111111]">
            <div className="bg-[#111111] px-5 py-4 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 transform rotate-45 translate-x-10 -translate-y-10"></div>
              <h3 className="font-display font-bold text-lg tracking-widest uppercase relative z-10">Detail Potensi</h3>
              <button onClick={() => setSelectedPotensi(null)} className="text-white/60 hover:text-white relative z-10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm bg-gray-50/50">
              <div className="flex justify-between items-center mb-2 pb-3 border-b border-gray-200">
                <span className="text-gray-500 font-display font-bold tracking-widest uppercase text-xs">Status Follow Up</span>
                <span className={`px-3 py-1 text-[10px] font-display font-bold tracking-widest uppercase text-white ${selectedPotensi.statusFollowUp === 'SUCCESS' ? 'bg-green-600' : selectedPotensi.statusFollowUp === 'SUDAH' ? 'bg-blue-600' : 'bg-[#E60012]'}`} style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                  {selectedPotensi.statusFollowUp}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Nama</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedPotensi.nama}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Telepon</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedPotensi.telp}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium flex items-center gap-2"><CarFront className="w-4 h-4 text-gray-400" /> Kendaraan</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedPotensi.kendaraan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium flex items-center gap-2">No. Polisi</span>
                <span className="col-span-2 font-display font-bold text-lg tracking-wider text-[#E60012]">{selectedPotensi.nopol}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Service Trkh</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedPotensi.serviceTerakhir}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <span className="text-gray-500 font-medium flex items-center gap-2"><Wrench className="w-4 h-4 text-[#E60012]" /> Next Service</span>
                <span className="col-span-2 font-bold text-[#111111] bg-white px-2 py-1 border-l-2 border-[#E60012]">{selectedPotensi.potensiNextService}</span>
              </div>
            </div>
            <div className={`p-5 bg-white border-t ${selectedPotensi.statusFollowUp === 'FOLLOW_UP' ? 'grid grid-cols-3 gap-3' : 'flex gap-3'}`}>
              {selectedPotensi.statusFollowUp === 'FOLLOW_UP' ? (
                <>
                  <AngularButton variant="danger" className="w-full !flex !items-center !justify-center text-xs" onClick={() => setInvalidNoteModal(true)}>
                    INVALID
                  </AngularButton>
                  <AngularButton variant="primary" className="w-full !flex !items-center !justify-center !gap-1 !bg-[#25D366] hover:!bg-[#1ebd5a] text-[10px]" onClick={async () => {
                    const p = selectedPotensi;
                    const saName = saSetupData?.name || 'SA';
                    let phone = (p.telp || '').replace(/\D/g, '');
                    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                    const message = `Halo Bapak/Ibu ${p.nama},\n\nPerkenalkan saya ${saName}, Service Advisor dari Mitsubishi Dwindo.\n\nKami ingin menginformasikan bahwa kendaraan *${p.kendaraan}* (${p.nopol}) Anda sudah waktunya untuk melakukan *${p.potensiNextService}*.\n\nApakah Bapak/Ibu berkenan untuk booking jadwal service? Kami siap membantu menjadwalkan waktu yang paling nyaman untuk Anda.\n\nOh ya, perkenalkan juga DINA layanan 24/7 dari kami https://csdwindo.com, Bapak/Ibu bisa booking service dan lainnya melalui link tersebut.\n\nTerima kasih.\n\nSalam,\n${saName} - Service Advisor\nMitsubishi Dwindo`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}>
                    HUBUNGI ULANG
                  </AngularButton>
                  <AngularButton variant="primary" className="w-full !flex !items-center !justify-center !gap-1 text-xs" onClick={() => {
                    const kmMatch = selectedPotensi.potensiNextService.match(/([\d\.]+)\s*KM/i);
                    const parsedKm = kmMatch ? parseInt(kmMatch[1].replace(/\./g, '')).toString() : '';
                    navigate('/booking', { 
                      state: { 
                        step: 2, 
                        nopol: selectedPotensi.nopol,
                        nopolFound: true,
                        nama: selectedPotensi.nama,
                        kendaraan: selectedPotensi.kendaraan,
                        telp: selectedPotensi.telp,
                        km: parsedKm
                      } 
                    });
                  }}>
                    BOOKING
                  </AngularButton>
                </>
              ) : selectedPotensi.statusFollowUp === 'NEW' ? (
                <AngularButton variant="primary" className="w-full !flex !items-center !justify-center !gap-2 !bg-[#25D366] hover:!bg-[#1ebd5a]" onClick={async () => {
                  const p = selectedPotensi;
                  const saName = saSetupData?.name || 'SA';
                  let phone = (p.telp || '').replace(/\D/g, '');
                  if (phone.startsWith('0')) phone = '62' + phone.substring(1);
  
                  const message = `Halo Bapak/Ibu ${p.nama},\n\nPerkenalkan saya ${saName}, Service Advisor dari Mitsubishi Dwindo.\n\nKami ingin menginformasikan bahwa kendaraan *${p.kendaraan}* (${p.nopol}) Anda sudah waktunya untuk melakukan *${p.potensiNextService}*.\n\nApakah Bapak/Ibu berkenan untuk booking jadwal service? Kami siap membantu menjadwalkan waktu yang paling nyaman untuk Anda.\n\nOh ya, perkenalkan juga DINA layanan 24/7 dari kami https://csdwindo.com, Bapak/Ibu bisa booking service dan lainnya melalui link tersebut.\n\nTerima kasih.\n\nSalam,\n${saName} - Service Advisor\nMitsubishi Dwindo`;
  
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  
                  // Update status to FOLLOW_UP
                  if (p.id) {
                    try {
                      await fetch('https://csdwindo.com/api/potensi_service.php', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: p.id, status: 'FOLLOW_UP' })
                      });
                      
                      // Force refresh page so status change is immediately visible
                      window.location.reload();
                    } catch (err) {
                      console.error('Failed to update status:', err);
                    }
                  }
                }}>
                  HUBUNGI VIA WHATSAPP
                </AngularButton>
              ) : (
                <div className="w-full text-center py-2 font-display font-bold text-gray-400 uppercase tracking-widest text-sm">
                  TIDAK ADA AKSI
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Konfirmasi */}
      {selectedKonfirmasi && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div style={{ clipPath: ANGULAR_CLIP }} className="bg-white w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border-t-4 border-[#E60012]">
            <div className="bg-[#111111] px-5 py-4 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 transform rotate-45 translate-x-10 -translate-y-10"></div>
              <h3 className="font-display font-bold text-lg tracking-widest uppercase relative z-10">Detail Booking</h3>
              <button onClick={() => setSelectedKonfirmasi(null)} className="text-white/60 hover:text-white relative z-10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm bg-gray-50/50">
              <div className="flex justify-between items-center mb-2 pb-3 border-b border-gray-200">
                <span className="text-gray-500 font-display font-bold tracking-widest uppercase text-xs">Status</span>
                <span className={`px-3 py-1 text-[10px] font-display font-bold tracking-widest uppercase text-white ${selectedKonfirmasi.status === 'BOOKING' ? 'bg-[#E60012]' : selectedKonfirmasi.status === 'DATANG' ? 'bg-green-600' : 'bg-gray-500'}`} style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                  {selectedKonfirmasi.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Tanggal</span>
                <span className="col-span-2 font-bold text-[#111111]">
                  {selectedKonfirmasi.tanggal ? new Date(selectedKonfirmasi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Nama</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedKonfirmasi.nama}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">No. Telepon</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedKonfirmasi.telp}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Kendaraan</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedKonfirmasi.kendaraan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">No. Polisi</span>
                <span className="col-span-2 font-display font-bold text-lg tracking-wider text-[#E60012]">{selectedKonfirmasi.nopol}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Jam</span>
                <span className="col-span-2 font-bold text-[#111111] bg-white px-2 py-1 inline-block border-l-2 border-[#111111]">{selectedKonfirmasi.jam}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">Jenis Service</span>
                <span className="col-span-2 font-bold text-[#111111]">{selectedKonfirmasi.jenis}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <span className="text-gray-500 font-medium">Keluhan</span>
                <span className="col-span-2 font-bold text-[#E60012] bg-white p-2 border border-gray-100">{selectedKonfirmasi.keluhan}</span>
              </div>
            </div>

            {/* Action Buttons for Booking */}
            <div className="p-5 bg-white border-t flex flex-col gap-3">
              <AngularButton variant="primary" className="w-full !flex !items-center !justify-center !gap-2 !bg-[#25D366] hover:!bg-[#1ebd5a]" onClick={openChatFlow}>
                <Bot className="w-4 h-4" /> Whatsapp Konfirmasi
              </AngularButton>
              <AngularButton 
                variant="danger"
                onClick={() => setShowKomplenConfirm(true)}
                className="w-full !flex !items-center !justify-center !gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> Indikasi Komplen
              </AngularButton>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp AI Modal for Konfirmasi */}
      <AnimatePresence>
        {showWaModal && selectedKonfirmasi && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowWaModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111] p-4 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-[#25D366]" />
                  <h3 className="font-display font-bold uppercase tracking-wider text-sm">
                    {waModalStep === 1 ? 'Konteks Pesan WhatsApp' : 'Draft Pesan WhatsApp'}
                  </h3>
                </div>
                <button onClick={() => setShowWaModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {waModalStep === 1 ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Data Booking</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-500">Nama:</span> <span className="font-bold">{selectedKonfirmasi.nama}</span></div>
                        <div><span className="text-gray-500">Telp:</span> <span className="font-bold">{selectedKonfirmasi.telp}</span></div>
                        <div><span className="text-gray-500">Kendaraan:</span> <span className="font-bold">{selectedKonfirmasi.kendaraan}</span></div>
                        <div><span className="text-gray-500">Nopol:</span> <span className="font-bold font-mono">{selectedKonfirmasi.nopol}</span></div>
                        <div><span className="text-gray-500">Tanggal:</span> <span className="font-bold">
                          {selectedKonfirmasi.tanggal ? new Date(selectedKonfirmasi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </span></div>
                        <div><span className="text-gray-500">Jam:</span> <span className="font-bold text-[#E60012]">{selectedKonfirmasi.jam}</span></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Tulis pesan atau instruksi yang ingin disampaikan ke konsumen. AI akan menyusunnya menjadi pesan WhatsApp yang sopan dan profesional.</p>
                    <textarea
                      value={waContextInput}
                      onChange={(e) => setWaContextInput(e.target.value)}
                      className="w-full h-28 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                      placeholder="Contoh: Tolong info estimasi biaya service berkala 20rb km, atau tanya kapan bisa datang..."
                    />
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-2">Draft pesan ini dibuat berdasarkan data booking. Silakan edit jika diperlukan sebelum mengirim.</p>

                    {waGenerating ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-4">
                        <Loader2 size={32} className="animate-spin text-green-500" />
                        <p className="text-sm">Menyusun pesan...</p>
                      </div>
                    ) : (
                      <textarea
                        value={waGeneratedText}
                        onChange={(e) => setWaGeneratedText(e.target.value)}
                        className="w-full h-48 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                        placeholder="Teks pesan akan muncul di sini..."
                      />
                    )}
                  </>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-end gap-3 shrink-0">
                {waModalStep === 1 ? (
                  <>
                    <button
                      onClick={() => {
                        setShowWaModal(false);
                        directWhatsApp(selectedKonfirmasi.telp);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors border border-gray-300"
                    >
                      Langsung Buka WA
                    </button>
                    <button
                      onClick={generateAiResponse}
                      className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded transition-colors flex items-center gap-2"
                    >
                      <Bot size={16} />
                      Generate via AI
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setWaModalStep(1)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => setShowOtherNumberModal(true)}
                      className="px-4 py-2 text-sm font-medium text-[#E60012] bg-red-50 hover:bg-red-100 rounded transition-colors flex items-center gap-2"
                    >
                      Nomor Lain
                    </button>
                    <button
                      onClick={async () => {
                        setShowWaModal(false);
                        await recordWhatsAppAction();
                        directWhatsApp(selectedKonfirmasi.telp, waGeneratedText);
                      }}
                      disabled={waGenerating || !waGeneratedText}
                      className="px-4 py-2 text-sm font-medium bg-[#25D366] text-white hover:bg-[#128C7E] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={16} />
                      Kirim ke WhatsApp
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Setup SA Modal */}
      <AnimatePresence>
        {setupModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative"
            >
              <div className="bg-[#E60012] p-5 text-center relative rounded-t-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 transform rotate-45 translate-x-12 -translate-y-12"></div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  {authStep === 'SELECT_SA' ? <UserRound className="text-white" /> : <Lock className="text-white" />}
                </div>
                <h3 className="font-display font-bold uppercase tracking-wider text-white text-lg">
                  {authStep === 'SELECT_SA' ? 'Service Advisor' : 
                   authStep === 'ENTER_PIN' ? 'Verifikasi PIN' : 'Setting PIN Baru'}
                </h3>
                {authStep !== 'SELECT_SA' && (
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">SA: {saName}</p>
                )}
              </div>

              <form onSubmit={handleSetupSubmit} className="p-6 space-y-5">
                {authStep === 'SELECT_SA' ? (
                  <div>
                    <label className="block text-[10px] font-display font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Pilih Identitas SA</label>
                    <CustomSelect
                      value={saName}
                      onChange={handleSaChange}
                      options={SA_OPTIONS}
                      placeholder="Pilih Nama SA"
                      allowCustom={false}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-display font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                          {authStep === 'ENTER_PIN' ? 'Masukkan 4 Angka PIN' : 'Buat 4 Angka PIN'}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            autoFocus
                            value={saPin}
                            onChange={(e) => setSaPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full border-2 border-gray-100 rounded-xl p-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-[#E60012] focus:ring-0 outline-none bg-gray-50 transition-all"
                            required
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <KeyRound size={20} />
                          </div>
                        </div>
                      </div>

                      {authStep === 'CREATE_PIN' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                          <label className="block text-[10px] font-display font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Konfirmasi PIN</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={pinConfirm}
                            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full border-2 border-gray-100 rounded-xl p-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-[#E60012] focus:ring-0 outline-none bg-gray-50 transition-all"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <AngularButton 
                        variant="primary" 
                        type="submit" 
                        disabled={isCheckingPin || saPin.length !== 4 || (authStep === 'CREATE_PIN' && pinConfirm.length !== 4)}
                        className="w-full !py-4 !flex !items-center !justify-center !gap-2 !text-xs !tracking-[0.2em]"
                      >
                        {isCheckingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : 'MASUK SEKARANG'}
                      </AngularButton>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('SELECT_SA');
                          setSaName('');
                          setSaPin('');
                          setPinConfirm('');
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-[#E60012] uppercase tracking-widest transition-colors py-2"
                      >
                        Bukan {saName}? Ganti Akun
                      </button>
                    </div>
                  </>
                )}
                
                {authStep === 'SELECT_SA' && isCheckingPin && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#E60012]" />
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Invalid Note */}
      {invalidNoteModal && selectedPotensi && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div style={{ clipPath: ANGULAR_CLIP }} className="bg-white w-full max-w-sm shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border-t-4 border-[#E60012]">
            <div className="bg-[#111111] px-5 py-4 flex justify-between items-center text-white">
              <h3 className="font-display font-bold text-sm tracking-widest uppercase text-[#E60012]">Tandai Invalid</h3>
              <button onClick={() => { setInvalidNoteModal(false); setInvalidNote(''); }} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">Berikan catatan mengapa data <span className="font-bold text-gray-900">{selectedPotensi.nopol}</span> ini dianggap tidak valid (misal: nomor salah, mobil sudah dijual, dll).</p>
              <textarea
                value={invalidNote}
                onChange={(e) => setInvalidNote(e.target.value)}
                placeholder="Tuliskan catatan di sini..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
              ></textarea>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setInvalidNoteModal(false); setInvalidNote(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <AngularButton
                  variant="danger"
                  className="px-6 py-2 text-sm font-bold"
                  disabled={!invalidNote.trim()}
                  onClick={async () => {
                    try {
                      await fetch('https://csdwindo.com/api/potensi_service.php', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedPotensi.id, status: 'INVALID', note: invalidNote })
                      });
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  KIRIM
                </AngularButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indikasi Komplen Confirm Modal */}
      <AnimatePresence>
        {showKomplenConfirm && selectedKonfirmasi && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowKomplenConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display uppercase tracking-tight">Indikasi Komplen</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Yakin konsumen <strong className="text-gray-900">{selectedKonfirmasi.nama}</strong> berindikasi komplen? Status booking ini akan diubah.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowKomplenConfirm(false)}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleIndikasiKomplen}
                    disabled={isKomplenLoading}
                    className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    {isKomplenLoading ? <Loader2 size={16} className="animate-spin" /> : 'Ya!'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nomor Lain */}
      <AnimatePresence>
        {showOtherNumberModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowOtherNumberModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111] p-4 flex justify-between items-center text-white">
                <h3 className="font-display font-bold uppercase tracking-wider text-sm">Kirim ke Nomor Lain</h3>
                <button onClick={() => setShowOtherNumberModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateNumberAndSend} className="p-4 flex flex-col gap-4">
                <p className="text-xs text-gray-500">
                  Masukkan nomor WhatsApp baru untuk <strong className="text-[#111111]">{selectedKonfirmasi?.nama}</strong>. Nomor ini akan diupdate pada data booking dan konsumen.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={otherNumberInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtherNumberInput(val);
                    }}
                    placeholder="08xxxxxxxxxx"
                    className="w-full p-3 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtherNumberModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingNumber || !otherNumberInput}
                    className="px-4 py-2 text-sm font-medium bg-[#E60012] text-white hover:bg-[#B5000F] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdatingNumber ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    Update & Kirim
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
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

export default SA;
