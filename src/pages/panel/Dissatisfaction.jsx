import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, AlertOctagon, ShieldAlert, X, Phone, Car, FileText, CheckCircle2, User, Clock, Check, Plus, BrainCircuit, Loader2, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import CustomDatePicker from '../../components/ui/CustomDatePicker';
import { CustomSelect } from '../../components/panel/booking/LegacyBookingModals';
import { parseChatMarkdown } from '../../utils/markdownParser';

const getBadgeColor = (status) => {
    const s = (status || 'NEW').toUpperCase();
    switch (s) {
        case 'NEW': return 'bg-red-100 text-red-700';
        case 'CALL1': return 'bg-orange-100 text-orange-700';
        case 'CALL2': return 'bg-yellow-100 text-yellow-700';
        case 'CALL3': return 'bg-blue-100 text-blue-700';
        case 'CLOSE': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getCriteriaBadge = (criteria) => {
    if (criteria === '1') return { label: 'Bad Comment', color: 'bg-yellow-100 text-yellow-700' };
    if (criteria === '2') return { label: 'Low Score', color: 'bg-orange-100 text-orange-700' };
    return { label: 'Bad Comment & Low Score', color: 'bg-red-100 text-red-700' };
};

const DissatisfactionDetailModal = ({ isOpen, data, onClose, onSuccess, showToast }) => {
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [isInsightOpen, setIsInsightOpen] = useState(false);
    const [insightResult, setInsightResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [regenContext, setRegenContext] = useState('');

    const showNoteField = ['PERJANJIAN', 'SALAH SAMBUNG', 'IN PROGRESS', 'SELESAI'].includes(status);

    const handleSaveFollowUp = async () => {
        if (!status) {
            showToast("Pilih status follow up terlebih dahulu", "error");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('https://csdwindo.com/api/panel/update_dissatisfaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.id,
                    status: status,
                    note: note
                })
            });
            const result = await res.json();
            if (result.status) {
                showToast("Berhasil menyimpan tindak lanjut!");
                setIsFollowUpOpen(false);
                if (onSuccess) onSuccess();
            } else {
                showToast("Gagal: " + result.message, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Terjadi kesalahan saat menyimpan data.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const generateInsight = async (context = '') => {
        setIsGenerating(true);
        setShowRegenModal(false);
        try {
            const systemPrompt = `Anda adalah AI asisten Customer Satisfaction Manager.
Tugas Anda adalah memberikan "Rekomendasi Tindak lanjut", cara penanganan komplain, perbaikan, dan hal lain yang relevan berdasarkan data komplain pelanggan berikut.
Berikan jawaban yang singkat, profesional, dan gunakan Markdown untuk formatting.`;

            let userMsg = `Data Pelanggan:
Nama: ${data.nama || '-'}
Telepon: ${data.telp || '-'}
Nopol: ${data.nopol || '-'}

Info Service:
Tgl Service: ${data.tgl_svc || '-'}
Tgl Survey: ${data.tgl_srvy || '-'}
SA: ${data.sa || '-'}
DNET: ${data.dnet || '-'}

Detail Komplain:
Criteria: ${data.criteria}
Atribut: ${data.atribut || '-'}
Keluhan: ${data.keluhan || '-'}
Status Terakhir: ${data.status || 'NEW'}
History Penanganan: ${data.penanganan || '-'}`;

            if (context) {
                userMsg += `\n\nKonteks tambahan dari user: ${context}`;
            }

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "xiaomi/mimo-v2-flash",
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMsg }
                    ]
                })
            });
            const result = await res.json();
            if (result.choices?.[0]?.message?.content) {
                let content = result.choices[0].message.content;
                content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                setInsightResult(content);
                localStorage.setItem(`ai_insight_dissatisfaction_${data.id}`, content);
            } else {
                throw new Error('No response content');
            }
        } catch (err) {
            console.error(err);
            showToast("Gagal men-generate AI Insight", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenInsight = () => {
        setIsInsightOpen(true);
        const cached = localStorage.getItem(`ai_insight_dissatisfaction_${data.id}`);
        if (cached) {
            setInsightResult(cached);
        } else {
            generateInsight();
        }
    };

    if (!isOpen || !data) return null;
    const crit = getCriteriaBadge(data.criteria);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-[#E60012] px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h2 className="font-display font-bold text-lg tracking-wide flex items-center gap-2"><ShieldAlert size={20} />Detail Dissatisfaction</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-[#FAFAFA] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Info Pelanggan & Kendaraan */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><User size={16} className="text-[#E60012]" /> Data Pelanggan</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 block text-xs">Nama</span><span className="font-bold">{data.nama || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">Telepon</span><span className="font-bold">{data.telp || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">Nopol</span><span className="font-mono font-bold">{data.nopol || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">Rangka</span><span className="font-mono">{data.rangka || '-'}</span></div>
                            </div>
                        </div>

                        {/* Info Service */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><Clock size={16} className="text-[#E60012]" /> Info Service</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 block text-xs">Tgl Service</span><span className="font-bold">{data.tgl_svc || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">Tgl Survey</span><span className="font-bold">{data.tgl_srvy || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">Service Advisor (SA)</span><span className="font-bold">{data.sa || '-'}</span></div>
                                <div><span className="text-gray-500 block text-xs">DNET</span><span className="font-bold text-gray-600">{data.dnet || '-'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Komplain Detail */}
                    <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#E60012]"></div>
                        <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2"><FileText size={16} className="text-[#E60012]" /> Detail Komplain</h3>
                        <div className="flex gap-2 flex-wrap mb-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${crit.color}`}>{crit.label}</span>
                            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-50 text-blue-700 border border-blue-100">Atribut: {data.atribut || '-'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <span className="text-gray-500 text-xs block mb-1">Catatan Keluhan:</span>
                            <p className="text-sm text-gray-800 italic whitespace-pre-wrap">{data.keluhan ? `"${data.keluhan}"` : 'Tidak ada catatan keluhan.'}</p>
                        </div>
                    </div>

                    {/* Follow Up & Penanganan */}
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Phone size={16} className="text-[#E60012]" /> History Follow Up</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(data.status)}`}>
                                Status: {data.status || 'NEW'}
                            </span>
                        </h3>

                        <div className="space-y-4">
                            {/* Calls History */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="border border-gray-100 p-2 rounded bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Call 1</span>
                                    <div className="text-xs font-bold mt-1 text-gray-700">{data.call1 || '-'}</div>
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={data.hasil1}>{data.hasil1 || '-'}</div>
                                </div>
                                <div className="border border-gray-100 p-2 rounded bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Call 2</span>
                                    <div className="text-xs font-bold mt-1 text-gray-700">{data.call2 || '-'}</div>
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={data.hasil2}>{data.hasil2 || '-'}</div>
                                </div>
                                <div className="border border-gray-100 p-2 rounded bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Call 3</span>
                                    <div className="text-xs font-bold mt-1 text-gray-700">{data.call3 || '-'}</div>
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={data.hasil3}>{data.hasil3 || '-'}</div>
                                </div>
                            </div>

                            {/* Penanganan */}
                            <div className="bg-blue-50/50 p-3 rounded border border-blue-100">
                                <span className="text-blue-800 text-xs font-bold block mb-1 flex items-center gap-1"><CheckCircle2 size={14} /> Penanganan Akhir:</span>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.penanganan || '-'}</p>
                                {data.tgl_selesai && (
                                    <div className="text-xs text-green-600 font-bold mt-2">Selesai pada: {data.tgl_selesai}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                    <button onClick={handleOpenInsight} className="px-5 py-2.5 bg-[#00B2A9] hover:bg-teal-600 text-white font-bold rounded transition-colors text-sm flex items-center gap-2">
                        <BrainCircuit size={16} /> AI Insight
                    </button>
                    {(data.status || 'NEW').toUpperCase() !== 'CLOSE' && (
                        <button onClick={() => setIsFollowUpOpen(true)} className="px-5 py-2.5 bg-[#E60012] hover:bg-red-700 text-white font-bold rounded transition-colors text-sm flex items-center gap-2">
                            <Phone size={16} /> Tindak Lanjut
                        </button>
                    )}
                    <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded transition-colors text-sm">Tutup</button>
                </div>

                {/* Follow Up Modal Overlay */}
                {isFollowUpOpen && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 rounded-xl backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-visible flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b rounded-t-lg">
                                <h3 className="font-bold text-gray-800">Tindak Lanjut Follow Up</h3>
                                <button onClick={() => setIsFollowUpOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={18} /></button>
                            </div>
                            <div className="p-4 space-y-4 bg-white">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Status Follow Up</label>
                                    <CustomSelect
                                        value={status}
                                        onChange={setStatus}
                                        options={[
                                            { value: 'TIDAK DIANGKAT', label: 'TIDAK DIANGKAT' },
                                            { value: 'PERJANJIAN', label: 'PERJANJIAN' },
                                            { value: 'NOMOR TIDAK AKTIF', label: 'NOMOR TIDAK AKTIF' },
                                            { value: 'SALAH SAMBUNG', label: 'SALAH SAMBUNG' },
                                            { value: 'IN PROGRESS', label: 'IN PROGRESS' },
                                            { value: 'SELESAI', label: 'SELESAI' }
                                        ]}
                                        placeholder="- Pilih Status -"
                                    />
                                </div>

                                {showNoteField && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Catatan & Penanganan</label>
                                        <textarea
                                            rows="3"
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012] resize-none"
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            placeholder="Masukkan detail catatan atau penanganan..."
                                        ></textarea>
                                    </motion.div>
                                )}
                            </div>
                            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                                <button onClick={() => setIsFollowUpOpen(false)} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-50">Batal</button>
                                <button onClick={handleSaveFollowUp} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-[#E60012] text-white hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* AI Insight Modal Overlay */}
                {isInsightOpen && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 rounded-xl backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-[#00B2A9] to-teal-700 px-6 py-4 flex items-center justify-between border-b rounded-t-lg shrink-0">
                                <h3 className="font-bold text-white flex items-center gap-2"><BrainCircuit size={18} /> AI Insight - Rekomendasi Tindak Lanjut</h3>
                                <button onClick={() => setIsInsightOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto bg-[#F8FAFA] flex-1">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Loader2 size={32} className="animate-spin text-[#00B2A9] mb-4" />
                                        <p className="font-bold text-gray-700">AI sedang memproses...</p>
                                        <p className="text-sm text-gray-500">Menganalisis case komplain ini</p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: parseChatMarkdown(insightResult) }} />
                                )}
                            </div>
                            <div className="px-6 py-4 border-t bg-white flex justify-between gap-3 shrink-0 rounded-b-lg">
                                <button onClick={() => setShowRegenModal(true)} disabled={isGenerating} className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                                    <RefreshCw size={14} /> Generate Ulang
                                </button>
                                <button onClick={() => setIsInsightOpen(false)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded transition-colors text-sm">Tutup</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Regenerate Confirmation Modal Overlay */}
                {showRegenModal && (
                    <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 rounded-xl backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b rounded-t-lg">
                                <h3 className="font-bold text-gray-800">Generate Ulang Insight</h3>
                                <button onClick={() => setShowRegenModal(false)} className="text-gray-500 hover:text-gray-800"><X size={18} /></button>
                            </div>
                            <div className="p-4 space-y-4 bg-white">
                                <p className="text-sm text-gray-600">Anda dapat memberikan konteks tambahan kepada AI untuk fokus ke hal tertentu, atau biarkan kosong untuk default.</p>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Konteks Tambahan (Opsional)</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00B2A9] resize-none"
                                        value={regenContext}
                                        onChange={e => setRegenContext(e.target.value)}
                                        placeholder="Contoh: Fokus ke handling emosi pelanggan yang marah, atau beri kompensasi..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                                <button onClick={() => setShowRegenModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors">Batal</button>
                                <button onClick={() => generateInsight(regenContext)} className="px-4 py-2 text-sm font-bold bg-[#00B2A9] text-white hover:bg-teal-600 rounded transition-colors flex items-center gap-2">
                                    <RefreshCw size={14} /> Generate
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const DissatisfactionAddModal = ({ isOpen, onClose, onSuccess, showToast }) => {
    const [formData, setFormData] = useState({
        dnet: '', criteria: '', sa: '', tgl_svc: '', tgl_srvy: '',
        nama: '', telp: '', rangka: '', nopol: '', atribut: '', keluhan: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(null);
    const [dnetError, setDnetError] = useState('');

    useEffect(() => {
        const handleClickOutside = () => setOpenDatePicker(null);
        if (openDatePicker) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDatePicker]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTelpChange = (value) => {
        let formatted = value.replace(/\D/g, '');
        if (formatted.length > 0 && formatted[0] !== '0') {
            formatted = '0' + formatted;
        }
        handleChange('telp', formatted);
    };

    const handleRangkaNopolChange = (field, value) => {
        handleChange(field, value.toUpperCase().replace(/\s/g, ''));
    };

    const handleDnetBlur = async () => {
        if (!formData.dnet) {
            setDnetError('');
            return;
        }
        try {
            const res = await fetch(`https://csdwindo.com/api/panel/check_dnet.php?dnet=${formData.dnet}`);
            const result = await res.json();
            if (result.exists) {
                setDnetError('Dnet ID sudah tercatat di database (Duplikat).');
            } else {
                setDnetError('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isFormValid = Object.values(formData).every(val => val !== '') && !dnetError;

    const handleSave = async () => {
        if (!formData.dnet) {
            showToast("Dnet ID wajib diisi", "error");
            return;
        }
        if (!formData.criteria) {
            showToast("Criteria wajib dipilih", "error");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('https://csdwindo.com/api/panel/add_dissatisfaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (result.status) {
                showToast(result.message);
                if (onSuccess) onSuccess();
            } else {
                showToast(result.message, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-visible flex flex-col my-auto" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b rounded-t-lg sticky top-0 z-10">
                        <h3 className="font-bold text-gray-800">Catat Dissatisfaction Baru</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={18} /></button>
                    </div>

                    <div className="p-4 space-y-4 overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Dnet ID *</label>
                                <input type="text" className={`w-full border ${dnetError ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012]`} value={formData.dnet} onChange={e => { handleChange('dnet', e.target.value); setDnetError(''); }} onBlur={handleDnetBlur} placeholder="Tulis Dnet ID..." />
                                {dnetError && <p className="text-[10px] font-bold text-red-500 mt-1">{dnetError}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Criteria *</label>
                                <CustomSelect value={formData.criteria} onChange={val => handleChange('criteria', val)} placeholder="- Pilih Criteria -" options={[
                                    { value: '1', label: 'Bad Comment' },
                                    { value: '2', label: 'Low Score' },
                                    { value: '3', label: 'Bad Comment & Low Score' }
                                ]} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Service Advisor *</label>
                                <CustomSelect value={formData.sa} onChange={val => handleChange('sa', val)} placeholder="- Pilih SA -" options={[
                                    { value: 'MUTI', label: 'MUTI' },
                                    { value: 'RUDI', label: 'RUDI' },
                                    { value: 'DIMAS', label: 'DIMAS' },
                                    { value: 'IPRAL', label: 'IPRAL' },
                                    { value: 'YUDA', label: 'YUDA' },
                                ]} />
                            </div>
                            <div className="relative" onClick={e => e.stopPropagation()}>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Service *</label>
                                <div 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer flex justify-between items-center bg-white"
                                    onClick={() => setOpenDatePicker(openDatePicker === 'tgl_svc' ? null : 'tgl_svc')}
                                >
                                    <span className={formData.tgl_svc ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                                        {formData.tgl_svc ? new Date(formData.tgl_svc).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal...'}
                                    </span>
                                    <Calendar size={14} className={formData.tgl_svc ? 'text-[#E60012]' : 'text-gray-400'} />
                                </div>
                                <AnimatePresence>
                                    {openDatePicker === 'tgl_svc' && (
                                        <CustomDatePicker 
                                            currentDate={formData.tgl_svc}
                                            onSelect={(date) => {
                                                handleChange('tgl_svc', date);
                                                setOpenDatePicker(null);
                                            }}
                                            onClose={() => setOpenDatePicker(null)}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="relative" onClick={e => e.stopPropagation()}>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Survey *</label>
                                <div 
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer flex justify-between items-center bg-white"
                                    onClick={() => setOpenDatePicker(openDatePicker === 'tgl_srvy' ? null : 'tgl_srvy')}
                                >
                                    <span className={formData.tgl_srvy ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                                        {formData.tgl_srvy ? new Date(formData.tgl_srvy).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih Tanggal...'}
                                    </span>
                                    <Calendar size={14} className={formData.tgl_srvy ? 'text-[#E60012]' : 'text-gray-400'} />
                                </div>
                                <AnimatePresence>
                                    {openDatePicker === 'tgl_srvy' && (
                                        <CustomDatePicker 
                                            currentDate={formData.tgl_srvy}
                                            onSelect={(date) => {
                                                handleChange('tgl_srvy', date);
                                                setOpenDatePicker(null);
                                            }}
                                            onClose={() => setOpenDatePicker(null)}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Konsumen *</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012]" value={formData.nama} onChange={e => handleChange('nama', e.target.value)} placeholder="Tulis Nama..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon *</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012]" value={formData.telp} onChange={e => handleTelpChange(e.target.value)} placeholder="Tulis Telepon..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Rangka *</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012]" value={formData.rangka} onChange={e => handleRangkaNopolChange('rangka', e.target.value)} placeholder="Tulis Rangka..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Polisi *</label>
                                <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012]" value={formData.nopol} onChange={e => handleRangkaNopolChange('nopol', e.target.value)} placeholder="Tulis Nopol..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Atribut *</label>
                                <CustomSelect value={formData.atribut} onChange={val => handleChange('atribut', val)} placeholder="- Pilih Atribut -" options={[
                                    "Alasan Service Tidak Tuntas", "Alasan tidak dilakukan WAI", "Petugas Dealer Tidak Cepat Tanggap",
                                    "Kebersihan Dealer dan Area Service", "Kejelasan Informasi dan Transparansi Biaya",
                                    "Kemudahan Mengatur Waktu Kunjungan Service", "Kendala konsumen terhadap hasil service",
                                    "Kenyamanan Parkir/Lokasi Dealer", "Kepuasan Konsumen SA", "Keramahan/kesopanan",
                                    "Keseluruhan Waktu Antrian", "Ketelitian Pengerjaan Servis", "Kewajaran Biaya Servis",
                                    "Kondisi/Kebersihan Kendaraan Saat Diserahkan", "NPS", "Penyerahan Kendaraan Tidak Sesuai Estimasi",
                                    "Saran/Komentar", "Total Waktu Pengerjaan Service", "WAI"
                                ].map(a => ({ value: a, label: a }))} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Keluhan / Low Score *</label>
                                <textarea rows="3" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E60012] resize-none" value={formData.keluhan} onChange={e => handleChange('keluhan', e.target.value)} placeholder="Tulis Bad Comment/Low Score..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                        <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors disabled:opacity-50">Batal</button>
                        <button onClick={handleSave} disabled={isSaving || !isFormValid} className="px-4 py-2 text-sm font-bold bg-[#E60012] text-white hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const Dissatisfaction = () => {
    const adminUser = JSON.parse(sessionStorage.getItem('admin_user') || '{}');

    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const monthPickerRef = useRef(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const [filterNew, setFilterNew] = useState(false);
    const [newCount, setNewCount] = useState(0);

    useEffect(() => {
        fetchData();
    }, [month, searchQuery, filterNew]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let url = `https://csdwindo.com/api/panel/data_dissatisfaction.php?month=${month}`;
            if (filterNew) {
                url = `https://csdwindo.com/api/panel/data_dissatisfaction.php?filter_new=true`;
            } else if (searchQuery) {
                url = `https://csdwindo.com/api/panel/data_dissatisfaction.php?search=${encodeURIComponent(searchQuery)}`;
            }
            const res = await fetch(url);
            const result = await res.json();
            if (result.status) {
                setData(result.data);
                if (result.new_count !== undefined) {
                    setNewCount(result.new_count);
                }
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Service Dissatisfaction</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola data komplain dan ketidakpuasan pelanggan service.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <button
                        onClick={() => setFilterNew(!filterNew)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-bold transition-colors ${filterNew
                                ? 'bg-red-50 border-red-200 text-[#E60012]'
                                : 'bg-white border-[#E5E5E5] text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Belum Selesai
                        {newCount > 0 && (
                            <span className="bg-[#E60012] text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                                {newCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative" ref={monthPickerRef}>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-1.5 bg-red-50 text-[#E60012] hover:bg-[#E60012] hover:text-white rounded transition-colors mr-1 border border-red-100"
                            title="Cari Data"
                        >
                            <Search size={16} />
                        </button>

                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>

                        {searchQuery || isSearchOpen ? (
                            <div className="flex items-center gap-2 bg-white text-[#111111] px-2 py-1 rounded text-sm font-bold border border-gray-200">
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari..."
                                    className="outline-none bg-transparent w-24 sm:w-32"
                                />
                                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="p-0.5 hover:bg-red-50 rounded text-red-500 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                            >
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

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#E60012] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-red-700 transition-colors h-[38px]"
                    >
                        <Plus size={16} />
                        Catat Baru
                    </button>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col shadow-sm">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-3">Pelanggan</div>
                    <div className="col-span-3">Kendaraan</div>
                    <div className="col-span-4">Detail Komplain</div>
                    <div className="col-span-2">Status</div>
                </div>

                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center"><AlertOctagon size={32} /></div>
                            <p className="text-gray-500 text-sm">{filterNew ? 'Tidak ada data yang Belum Selesai.' : 'Tidak ada data untuk bulan ini.'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {data.map((item) => {
                                const crit = getCriteriaBadge(item.criteria);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="p-4 flex flex-col gap-3 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="md:col-span-3 flex flex-col">
                                            <span className="font-bold text-[#111111] group-hover:text-[#E60012] transition-colors">{item.nama}</span>
                                            <span className="text-sm text-gray-500">{item.telp}</span>
                                        </div>

                                        <div className="md:col-span-3 flex flex-col">
                                            <span className="font-mono text-sm font-bold text-[#111111]">{item.nopol}</span>
                                            <span className="text-xs text-gray-500">{item.rangka}</span>
                                        </div>

                                        <div className="md:col-span-4 flex flex-col gap-1.5">
                                            <div className="flex gap-1.5 flex-wrap">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${crit.color}`}>{crit.label}</span>
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-100">{item.atribut}</span>
                                            </div>
                                            {item.keluhan && <p className="text-xs text-gray-600 italic line-clamp-1">"{item.keluhan}"</p>}
                                        </div>

                                        <div className="md:col-span-2 flex flex-col items-start gap-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getBadgeColor(item.status)}`}>
                                                {item.status || 'NEW'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">{item.tgl_srvy}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <DissatisfactionDetailModal
                        isOpen={!!selectedItem}
                        data={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onSuccess={() => {
                            setSelectedItem(null);
                            fetchData();
                        }}
                        showToast={showToast}
                    />
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <DissatisfactionAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                showToast={showToast}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchData();
                }}
            />

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

export default Dissatisfaction;
