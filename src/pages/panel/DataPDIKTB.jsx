import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Check, FileText, X, Filter, ChevronLeft, ChevronRight, Calendar, Copy, MessageCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import SurveySearchModal from '../../components/panel/survey/SurveySearchModal';

const API_BASE = 'https://csdwindo.com/api/panel/data_pdi_ktb.php';

const getBadgeColor = (status) => {
    switch (status) {
        case 'Belum': return 'bg-red-100 text-red-700';
        case 'Pre PDI': return 'bg-orange-100 text-orange-700';
        case 'PDI': return 'bg-blue-100 text-blue-700';
        case 'PKT': return 'bg-green-100 text-green-700';
        case 'PERLU FOLLOW UP': return 'bg-blue-100 text-blue-700';
        case 'PUAS': case 'PROMOTOR': return 'bg-green-100 text-green-700';
        case 'SARAN': case 'BIASA SAJA': return 'bg-yellow-100 text-yellow-700';
        case 'TIDAK PUAS': case 'KOMPLEN': case 'DETRACTOR': return 'bg-red-100 text-red-700';
        case 'TIDAK DIANGKAT': case 'NOMOR SALAH': case 'SALAH SAMBUNG': case 'PASSIVER': return 'bg-gray-100 text-gray-700';
        case 'PERJANJIAN': case 'DITOLAK/REJECT': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const ProsesPDIModal = ({ isOpen, data, onClose, onSave, isLoading }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nama: '',
        sales: '',
        spv: '',
        telp: '',
        kendaraan: '',
        note: '',
        pdi_date: new Date().toISOString().split('T')[0]
    });
    const [pdiStatus, setPdiStatus] = useState(''); // 'Pre PDI' | 'PDI Done'
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    useEffect(() => {
        if (data) {
            setFormData(prev => ({
                ...prev,
                nama: data.nama || '',
                sales: data.sales || '',
                spv: data.spv || '',
                telp: data.telp || '',
                kendaraan: data.kendaraan || '',
                note: data.note || '',
                pdi_date: (data.pdi_date && data.pdi_date !== '0000-00-00') ? data.pdi_date : new Date().toISOString().split('T')[0]
            }));
            if (data.status === 'Pre PDI') {
                setStep(2);
                setPdiStatus('PDI Done');
            } else {
                setStep(1);
                setPdiStatus('');
            }
        }
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(2);

    const handleSubmit = () => {
        if (!pdiStatus) return;
        const finalData = {
            ...data,
            nama: formData.nama,
            sales: formData.sales,
            spv: formData.spv,
            telp: formData.telp,
            kendaraan: formData.kendaraan,
            note: formData.note,
            status: pdiStatus === 'PDI Done' ? 'PDI' : 'Pre PDI'
        };
        if (pdiStatus === 'PDI Done') {
            finalData.pdi_date = formData.pdi_date;
        }
        onSave(finalData);
    };

    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0 rounded-t-xl">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Proses PDI</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>

                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${step === 1 ? 'bg-[#E60012]' : 'bg-green-500'}`}></div>
                    <div className={`h-1 w-12 rounded ${step === 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full ${step === 2 ? 'bg-[#E60012]' : 'bg-gray-300'}`}></div>
                </div>

                <div className={`p-6 flex-1 ${step === 1 ? 'overflow-y-auto' : 'overflow-visible'}`}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="font-bold text-center text-gray-800 mb-2">Lengkapi Data PDI</h3>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Konsumen</label>
                                    <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Sales</label>
                                        <input type="text" name="sales" value={formData.sales} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">SPV</label>
                                        <input type="text" name="spv" value={formData.spv} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">No. Telpon</label>
                                    <input type="text" name="telp" value={formData.telp} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kendaraan</label>
                                    <input type="text" name="kendaraan" value={formData.kendaraan} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Note (Catatan)</label>
                                    <textarea name="note" value={formData.note} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none"></textarea>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <h3 className="font-bold text-gray-800 mb-4 text-center">Tentukan Status PDI</h3>

                                {data.status === 'Pre PDI' ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => setPdiStatus('PDI Done')}
                                            className="p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors border-green-500 bg-green-50 text-green-700"
                                        >
                                            <span className="font-bold">PDI Done</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPdiStatus('Pre PDI')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${pdiStatus === 'Pre PDI' ? 'border-[#E60012] bg-red-50 text-[#E60012]' : 'border-gray-200 hover:border-red-200 text-gray-600'}`}
                                        >
                                            <span className="font-bold">Pre PDI</span>
                                        </button>
                                        <button
                                            onClick={() => setPdiStatus('PDI Done')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${pdiStatus === 'PDI Done' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200 text-gray-600'}`}
                                        >
                                            <span className="font-bold">PDI Done</span>
                                        </button>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {pdiStatus === 'Pre PDI' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <div className="bg-orange-50 text-orange-700 p-3 rounded text-sm mt-4 text-center">
                                                Siapkan dokumen karoserie dan upload ke DMS.
                                            </div>
                                        </motion.div>
                                    )}
                                    {pdiStatus === 'PDI Done' && (
                                        <motion.div initial={{ opacity: 0, height: 0, overflow: 'hidden' }} animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }}>
                                            <div className="mt-4 relative" ref={datePickerRef}>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal PDI</label>
                                                <div
                                                    className="flex items-center px-3 py-2 border border-gray-300 rounded cursor-pointer bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]"
                                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                                >
                                                    <Calendar size={16} className="text-[#E60012] mr-2" />
                                                    {formData.pdi_date}
                                                </div>
                                                <AnimatePresence>
                                                    {showDatePicker && (
                                                        <CustomDatePicker
                                                            currentDate={formData.pdi_date}
                                                            onSelect={(d) => { setFormData(prev => ({ ...prev, pdi_date: d })); setShowDatePicker(false); }}
                                                            onClose={() => setShowDatePicker(false)}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-between shrink-0 bg-white items-center rounded-b-xl">
                    {step === 2 && data.status !== 'Pre PDI' ? (
                        <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Kembali</button>
                    ) : (
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Tutup</button>
                    )}

                    {step === 1 ? (
                        <button 
                            onClick={handleNext} 
                            disabled={!formData.sales || !formData.spv || !formData.telp || !formData.kendaraan}
                            className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Lanjutkan
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isLoading || !pdiStatus}
                            className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Menyimpan...</> : 'Simpan'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const DetailKonsumenModal = ({ isOpen, data, onClose, adminUser, onEdit }) => {
    const [copied, setCopied] = useState(false);
    if (!isOpen || !data) return null;

    const ageInfo = calculateAge(data.rs);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Detail Konsumen</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] overflow-y-auto flex-1">
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">ID</span>
                                <span className="font-mono font-bold text-base">{data.id}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Umur (dari RS)</span>
                                <span className={`font-bold text-base ${getUmurColor(ageInfo.days)}`}>{ageInfo.text}</span>
                                {data.rs && <span className="text-gray-400 text-[10px] mt-0.5">RS: {data.rs}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Nama Konsumen</span>
                            <span className="font-bold text-base">{data.nama}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">No. Telp / WhatsApp</span>
                            <span className="font-medium">{data.telp?.startsWith('0') ? data.telp : `0${data.telp}`}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Kendaraan</span><span className="font-medium">{data.kendaraan}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">No. Rangka</span>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:text-[#E60012] transition-colors group"
                                    onClick={() => handleCopy(data.rangka)}
                                    title="Klik untuk menyalin"
                                >
                                    <span className="font-mono font-medium">{data.rangka}</span>
                                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400 group-hover:text-[#E60012]" />}
                                </div>
                                {copied && <span className="text-[10px] text-green-500 font-bold animate-in fade-in slide-in-from-top-1">Berhasil disalin!</span>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-gray-500 text-xs">Sales / SPV</span><span className="font-medium">{data.sales} / {data.spv}</span></div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs">Status</span>
                                <div><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 ${getBadgeColor(data.status)}`}>{data.status}</span></div>
                            </div>
                        </div>
                        {data.note && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-col"><span className="text-gray-500 text-xs">Catatan</span><span className="font-medium">{data.note}</span></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white items-center">
                    {adminUser?.role === 'admin' && (
                        <button onClick={() => onEdit(data)} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm mr-auto transition-colors">Edit</button>
                    )}
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Tutup</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const EditPDIModal = ({ isOpen, data, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen || !data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#111111] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><FileText size={20} />Edit Data PDI</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 bg-[#FAFAFA] overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none">
                                <option value="Belum">Belum</option>
                                <option value="Pre PDI">Pre PDI</option>
                                <option value="PDI">PDI</option>
                                <option value="PKT">PKT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama</label>
                            <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Telepon</label>
                            <input type="text" name="telp" value={formData.telp || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">No Rangka</label>
                            <input type="text" name="rangka" value={formData.rangka || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kendaraan</label>
                            <input type="text" name="kendaraan" value={formData.kendaraan || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Sales</label>
                            <input type="text" name="sales" value={formData.sales || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">SPV</label>
                            <input type="text" name="spv" value={formData.spv || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal PDI</label>
                            <input type="date" name="pdi_date" value={formData.pdi_date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal PKT</label>
                            <input type="date" name="pkt_date" value={formData.pkt_date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">RS Date</label>
                            <input type="date" name="rs" value={formData.rs || ''} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Catatan</label>
                            <textarea name="note" value={formData.note || ''} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#E60012] focus:outline-none"></textarea>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Batal</button>
                    <button onClick={() => onSave(formData)} disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Menyimpan...</> : 'Simpan'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const getUmurColor = (days) => {
    if (days > 90) return 'text-red-600 font-bold';
    if (days > 60) return 'text-orange-500 font-bold';
    return 'text-gray-600';
};

const getExpiryDaysFromRs = (rsDate) => {
    if (!rsDate) return null;
    const rs = new Date(rsDate + 'T00:00:00+07:00');
    if (isNaN(rs.getTime())) return null;
    const expiry = new Date(rs);
    expiry.setMonth(expiry.getMonth() + 3);
    const now = new Date();
    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    nowJakarta.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return Math.floor((expiry - nowJakarta) / (1000 * 60 * 60 * 24));
};


const calculateAge = (pdiDate) => {
    if (!pdiDate) return { text: '-', days: 0 };
    const pdi = new Date(pdiDate + 'T00:00:00+07:00');
    if (isNaN(pdi.getTime())) return { text: '-', days: 0 };
    const now = new Date();
    const nowJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    nowJakarta.setHours(0, 0, 0, 0);
    pdi.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(nowJakarta - pdi);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { text: `${diffDays} Hari`, days: diffDays };
};

const DataPDIKTB = () => {
    const navigate = useNavigate();
    const adminUser = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
    const [surveys, setSurveys] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [prosesData, setProsesData] = useState(null);
    const [editingData, setEditingData] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const monthPickerRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() - 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m); setSearchQuery('');
    };

    const handleNextMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() + 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m); setSearchQuery('');
    };

    const getMonthLabel = () => {
        if (!month) return 'Semua Data';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const fetchSurveys = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `${API_BASE}?action=list`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                let fetchedData = data.data || [];

                // Filter by month based on rs date (26 bulan lalu - 25 bulan ini)
                if (month && !searchQuery) {
                    fetchedData = fetchedData.filter(item => {
                        const selected = new Date(month + '-01');
                        const startDate = new Date(selected.getFullYear(), selected.getMonth() - 1, 26);
                        const endDate = new Date(selected.getFullYear(), selected.getMonth(), 25);

                        if (!item.rs) return false;
                        const rsDate = new Date(item.rs + 'T00:00:00');
                        return rsDate >= startDate && rsDate <= endDate;
                    });
                }

                fetchedData.sort((a, b) => {
                    const dateA = new Date(a.rs || '9999-12-31');
                    const dateB = new Date(b.rs || '9999-12-31');
                    return dateA - dateB;
                });
                setSurveys(fetchedData);
            } else {
                showToast('Gagal memuat data survey', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, month]);

    useEffect(() => { fetchSurveys(); }, [fetchSurveys]);



    const handleEditSave = async (updatedData) => {
        setIsSaving(true);
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    ...updatedData
                })
            });
            const data = await res.json();
            if (data.status) {
                showToast(data.message || 'Data berhasil diupdate');
                setEditingData(null);
                setDetailData(updatedData);
                setSurveys(prev => prev.map(s => s.id === updatedData.id ? updatedData : s));
            } else {
                showToast(data.message || 'Gagal menyimpan', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyData = () => {
        const filteredSurveys = surveys.filter(s => !statusFilter || s.status === statusFilter);
        const statusText = statusFilter ? statusFilter : 'Semua Status';
        const d = month ? new Date(month + '-01') : new Date();
        const monthName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        let text = `Berikut data Bulan ${monthName} dengan status ${statusText}:\n\n`;
        filteredSurveys.forEach(s => {
            text += `- ${s.nama}, ${s.rangka} - ${s.sales}, ${s.spv}\n`;
        });
        
        navigator.clipboard.writeText(text);
        showToast('Data berhasil disalin', 'success');
    };

    const counts = {
        'Belum': surveys.filter(s => s.status === 'Belum').length,
        'Pre PDI': surveys.filter(s => s.status === 'Pre PDI').length,
        'PDI': surveys.filter(s => s.status === 'PDI').length,
        'PKT': surveys.filter(s => s.status === 'PKT').length,
        'Total': surveys.length
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><ShieldAlert size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Data PDI KTB</h1>
                        <p className="text-gray-500 text-sm mt-1">Data PDI KTB dan kelola status PKT.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative" ref={monthPickerRef}>
                        <button onClick={() => setIsSearchOpen(true)}
                            className="p-1.5 bg-red-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors mr-1 border border-red-100"
                            title="Cari Data">
                            <Search size={16} />
                        </button>

                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
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
                            <div className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                                onClick={() => setShowMonthPicker(!showMonthPicker)}>
                                <Calendar size={16} className="text-[#E60012]" />
                                {getMonthLabel()}
                            </div>
                        )}

                        <AnimatePresence>
                            {showMonthPicker && (
                                <CustomMonthPicker
                                    currentMonth={month}
                                    onSelect={(m) => { setMonth(m); setShowMonthPicker(false); setSearchQuery(''); }}
                                    onClose={() => setShowMonthPicker(false)}
                                />
                            )}
                        </AnimatePresence>

                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                        <button onClick={handleCopyData}
                            className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-bold border transition-colors h-10 bg-white text-gray-600 border-[#E5E5E5] hover:bg-gray-50">
                            <Copy size={14} />Copy Data
                        </button>
                    <div className="flex gap-2">
                        {adminUser.role === 'admin' && (
                            <button
                                onClick={() => navigate('/panel/data-pdi/ktb/upload')}
                                className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-bold border transition-colors h-10 bg-white text-[#E60012] border-red-200 hover:bg-red-50">
                                <Upload size={14} />Upload RS
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 shrink-0">
                {['Total', 'Belum', 'Pre PDI', 'PDI', 'PKT'].map(status => {
                    const isTotal = status === 'Total';
                    const filterVal = isTotal ? null : status;
                    const isActive = statusFilter === filterVal;
                    let activeBg = 'bg-[#111111] border-[#111111] text-white ring-2 ring-[#111111]/30';
                    if (status === 'Belum') activeBg = 'bg-red-500 border-red-500 text-white ring-2 ring-red-500/30';
                    if (status === 'Pre PDI') activeBg = 'bg-orange-500 border-orange-500 text-white ring-2 ring-orange-500/30';
                    if (status === 'PDI') activeBg = 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-500/30';
                    if (status === 'PKT') activeBg = 'bg-green-500 border-green-500 text-white ring-2 ring-green-500/30';

                    return (
                        <div key={status} onClick={() => setStatusFilter(filterVal)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center flex flex-col justify-center
                                ${isActive ? activeBg : 'bg-white border-[#E5E5E5] hover:border-gray-400'}`}>
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{status}</div>
                            <div className={`text-xl font-black ${isActive ? 'text-white' : 'text-[#111111]'}`}>{counts[status]}</div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col rounded-xl">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-3">Nama</div>
                    <div className="col-span-3">Kendaraan / Rangka</div>
                    <div className="col-span-2">Sales / SPV</div>
                    <div className="col-span-2">Status / Umur</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div></div>
                    ) : surveys.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><ShieldAlert size={32} /></div>
                            <p className="text-gray-500 text-sm">Tidak ada data ditemukan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {surveys.filter(item => !statusFilter || item.status === statusFilter).map((item) => {
                                const ageInfo = calculateAge(item.rs);
                                return (
                                    <div key={item.id} onClick={() => setDetailData(item)}
                                        className="p-4 flex flex-col gap-3 border-b md:border-b-0 border-[#E5E5E5] md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start md:col-span-3 md:block">
                                            <div>
                                                <span className="text-xs font-medium text-gray-400 md:hidden block mb-0.5">Nama Konsumen</span>
                                                <div className="font-bold text-sm text-[#111111]">{item.nama}</div>
                                                <div className="font-mono text-xs text-gray-500 mt-0.5">{item.telp?.startsWith('0') ? item.telp : `0${item.telp}`}</div>
                                            </div>
                                            <div className="md:hidden flex flex-col items-end gap-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{item.status}</span>
                                                <span className={`text-[10px] ${getUmurColor(ageInfo.days)}`}>Umur: {ageInfo.text}</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Kendaraan / Rangka</span>
                                            <div className="font-bold text-gray-800">{item.kendaraan}</div>
                                            <div className="font-mono mt-0.5 text-gray-500">{item.rangka}</div>
                                        </div>

                                        <div className="md:col-span-2 text-xs text-gray-600 bg-gray-50 p-2 md:p-0 md:bg-transparent rounded border border-[#E5E5E5] md:border-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden block mb-1">Sales / SPV</span>
                                            <div className="font-bold text-gray-800">{item.sales}</div>
                                            <div className="mt-0.5 text-gray-500">{item.spv}</div>
                                        </div>

                                        <div className="hidden md:flex md:col-span-2 flex-col gap-1 items-start">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>{item.status}</span>
                                            <span className={`text-xs ${getUmurColor(ageInfo.days)}`}>{ageInfo.text}</span>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end">
                                            {item.status !== 'PDI' && item.status !== 'PKT' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setProsesData(item); }}
                                                    className="px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition-colors bg-[#111111] hover:bg-gray-800 text-white"
                                                >
                                                    {item.status === 'Pre PDI' ? 'PDI Done' : 'Proses PDI'}
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

            <AnimatePresence>
                {detailData && <DetailKonsumenModal isOpen={!!detailData} data={detailData} onClose={() => setDetailData(null)} adminUser={adminUser} onEdit={(data) => { setDetailData(null); setEditingData(data); }} />}
            </AnimatePresence>
            <AnimatePresence>
                {editingData && <EditPDIModal isOpen={!!editingData} data={editingData} onClose={() => setEditingData(null)} onSave={handleEditSave} isLoading={isSaving} />}
            </AnimatePresence>
            <AnimatePresence>
                {prosesData && <ProsesPDIModal isOpen={!!prosesData} data={prosesData} onClose={() => setProsesData(null)} onSave={(updatedData) => {
                    handleEditSave(updatedData);
                    setProsesData(null);
                }} isLoading={isSaving} />}
            </AnimatePresence>

            <SurveySearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={(item) => setDetailData(item)}
                onSearchSubmit={(q) => setSearchQuery(q)}
                apiBase={API_BASE}
                itemIcon="truck"
            />

            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {toast.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}{toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataPDIKTB;
