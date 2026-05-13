import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, BarChart3, ChevronLeft, ChevronRight, Calendar, Loader2, Send, RefreshCw, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';
import { parseChatMarkdown } from '../../utils/markdownParser';

const AI_MODEL = 'qwen/qwen3-235b-a22b-2507';
const CACHE_PREFIX = 'nps_ai_';
const stripThink = (text) => text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

const SYSTEM_PROMPT = `Anda adalah AI Analyst Net Promoter Score (NPS) untuk jaringan dealer resmi Mitsubishi Motors (Dwindo Group: Bintaro, Radin Inten, Cakung).
Tugas Anda: menganalisis data NPS secara mendalam dan memberikan insight strategis yang actionable untuk meningkatkan kualitas pelayanan dealer.

Anda akan menerima data NPS yang berisi: nama konsumen, no rangka, kendaraan, score (0-10), note/catatan, cabang, dan divisi.
- Score 9-10 = Promotor, 7-8 = Passive, 0-6 = Detractor

Berikan analisis lengkap dalam format Markdown (bahasa Indonesia profesional) dengan struktur:

### 📊 Ringkasan NPS & Statistik Utama
Ringkasan score rata-rata, distribusi Promotor/Passive/Detractor, dan NPS keseluruhan.

### 📈 Analisis Trend & Perbandingan Cabang
Bandingkan performa antar cabang. Cabang mana terbaik/terburuk. Pola yang terlihat.

### 👥 Profil & Segmentasi Konsumen
Analisis berdasarkan tipe kendaraan, pola skor berdasarkan kendaraan/cabang.

### ⭐ Analisis Kualitas Pelayanan
Identifikasi area pelayanan yang dinilai baik dan yang perlu diperbaiki dari catatan konsumen.

### ⚠️ Area Kritis yang Perlu Diperbaiki
Soroti masalah paling mendesak, detractor dengan catatan negatif, pola keluhan yang berulang.

### 💡 Rekomendasi & Saran Perbaikan
Berikan 5-7 saran konkret, prioritas tinggi ke rendah, dengan estimasi dampak.

### 🎯 Action Plan Prioritas
Tabel singkat: Prioritas | Aksi | PIC | Target Waktu`;

const FOLLOWUP_SYSTEM = `Anda adalah AI Analyst NPS dealer Mitsubishi Motors Dwindo Group.
Anda sudah memberikan analisis NPS sebelumnya. CS Manager ingin bertanya lebih lanjut.
Jawab dalam Markdown, bahasa Indonesia profesional, singkat, jelas, dan actionable.`;

const mdClasses = "prose-sm [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:text-[#111111] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-[#111111] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#E60012] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:border-b [&_h3]:border-gray-100 [&_h3]:pb-2 [&_strong]:text-[#111111] [&_li]:text-gray-600 [&_li]:text-sm [&_li]:leading-relaxed [&_hr]:my-4 [&_hr]:border-gray-200 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E60012] [&_blockquote]:pl-3 [&_blockquote]:text-gray-500 [&_blockquote]:italic [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_th]:bg-gray-50 [&_th]:border [&_th]:border-gray-200 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-xs [&_th]:uppercase [&_td]:border [&_td]:border-gray-200 [&_td]:p-2 [&_td]:text-gray-600";

const NPSAnalysis = () => {
    const [month, setMonth] = useState('2026-04');
    const [cabang, setCabang] = useState('All');
    const [divisi, setDivisi] = useState('Sales');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const monthPickerRef = useRef(null);

    const [conversation, setConversation] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [followUpInput, setFollowUpInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const cacheKey = `${CACHE_PREFIX}${month}_${divisi}_${cabang}`;

    useEffect(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) { setConversation(JSON.parse(cached)); } else { setConversation([]); }
    }, [month, divisi, cabang]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, isSending]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) setShowMonthPicker(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg, type = 'success') => { setToast({ show: true, message: msg, type }); setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000); };

    const saveConv = (conv) => { localStorage.setItem(cacheKey, JSON.stringify(conv)); };

    const callAI = async (messages) => {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: AI_MODEL, messages })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) return stripThink(data.choices[0].message.content);
        throw new Error(data.error?.message || 'No AI response');
    };

    const getMonthLabel = () => { if (!month) return 'Pilih Bulan'; const d = new Date(month + '-01'); return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); };
    const handlePrevMonth = () => { const c = new Date(month + '-01'); c.setMonth(c.getMonth() - 1); setMonth(`${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}`); };
    const handleNextMonth = () => { const c = new Date(month + '-01'); c.setMonth(c.getMonth() + 1); setMonth(`${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}`); };

    const generateAnalysis = async () => {
        setIsGenerating(true);
        setConversation([]);
        try {
            setLoadingStatus('Mengambil data NPS dari server...');
            const params = new URLSearchParams({ bulan: month, divisi, cabang });
            const res = await fetch(`https://csdwindo.com/api/panel/nps_detail.php?${params}`);
            const json = await res.json();

            if (!json.status || !json.data || json.data.list.length === 0) {
                showToast('Tidak ada data NPS untuk periode ini.', 'error');
                setIsGenerating(false); setLoadingStatus(''); return;
            }

            const { summary, list } = json.data;
            setLoadingStatus(`Menganalisis ${list.length} data penilaian konsumen...`);

            const dataContext = [
                `=== RINGKASAN NPS ===`,
                `Periode: ${getMonthLabel()}, Divisi: ${divisi}, Cabang: ${cabang === 'All' ? 'Semua (Dwindo Group)' : cabang}`,
                `Total Responden: ${summary.total}, Promoters: ${summary.promoters}, Passives: ${summary.passives}, Detractors: ${summary.detractors}, NPS: ${summary.nps}%`,
                ``,
                `=== DETAIL DATA (${list.length} responden) ===`,
                ...list.map((item, i) => `${i + 1}. [${item.status_nps}] Score=${item.score} | ${item.nama || '-'} | ${item.kendaraan || '-'} | Cabang: ${item.cabang} | Rangka: ${item.rangka || '-'} | Note: "${item.note || '-'}"`)
            ].join('\n');

            setLoadingStatus('AI sedang menganalisis data NPS...');
            const aiReply = await callAI([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: dataContext }
            ]);

            const newConv = [{ role: 'assistant', content: aiReply }];
            setConversation(newConv);
            saveConv(newConv);
            showToast('Analisis NPS berhasil dibuat!');
        } catch (err) {
            console.error(err);
            showToast('Gagal menganalisis: ' + err.message, 'error');
        } finally { setIsGenerating(false); setLoadingStatus(''); }
    };

    const sendFollowUp = async () => {
        const msg = followUpInput.trim();
        if (!msg || isSending) return;
        setFollowUpInput('');
        const updated = [...conversation, { role: 'user', content: msg }];
        setConversation(updated);
        setIsSending(true);
        try {
            const aiMessages = [{ role: 'system', content: FOLLOWUP_SYSTEM }, ...updated.map(m => ({ role: m.role, content: m.content }))];
            const reply = await callAI(aiMessages);
            const final = [...updated, { role: 'assistant', content: reply }];
            setConversation(final);
            saveConv(final);
        } catch (err) { console.error(err); showToast('Gagal mengirim pertanyaan', 'error'); }
        finally { setIsSending(false); }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            {/* Header */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#E60012] to-red-700 text-white rounded-lg shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">NPS AI Analysis</h1>
                        <p className="text-gray-500 text-sm mt-1">Analisis mendalam data NPS {divisi} — {cabang === 'All' ? 'Dwindo Group' : cabang} — {getMonthLabel()}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[{ id: 'All', label: 'Dwindo' }, { id: 'Bintaro', label: 'Bintaro' }, { id: 'Radin Inten', label: 'Radin Inten' }, { id: 'Cakung', label: 'Cakung' }].map(c => (
                            <button key={c.id} onClick={() => setCabang(c.id)}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${cabang === c.id ? 'bg-white text-[#E60012] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative h-[42px]" ref={monthPickerRef}>
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500"><ChevronLeft size={16} /></button>
                        <div className="flex items-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded text-sm font-bold text-[#111111]" onClick={() => setShowMonthPicker(!showMonthPicker)}>
                            <Calendar size={16} className="text-[#E60012]" />{getMonthLabel()}
                        </div>
                        <AnimatePresence>{showMonthPicker && <CustomMonthPicker currentMonth={month} onSelect={(m) => { setMonth(m); setShowMonthPicker(false); }} onClose={() => setShowMonthPicker(false)} />}</AnimatePresence>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500"><ChevronRight size={16} /></button>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[{ id: 'Sales', label: 'Sales' }, { id: 'Service', label: 'Service' }].map(d => (
                            <button key={d.id} onClick={() => setDivisi(d.id)}
                                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${divisi === d.id ? 'bg-white text-[#E60012] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={generateAnalysis} disabled={isGenerating}
                        className="flex items-center gap-2 bg-[#E60012] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-md text-sm font-bold transition-colors disabled:opacity-50">
                        {isGenerating ? <><Loader2 size={16} className="animate-spin" />Menganalisis...</> : <><Sparkles size={16} />{conversation.length > 0 ? 'Analisis Ulang' : 'Generate Analisis'}</>}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden rounded-xl shadow-sm flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {isGenerating && conversation.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 relative">
                                <Sparkles size={36} className="text-[#E60012] animate-pulse" />
                                <div className="absolute inset-0 rounded-full border-2 border-[#E60012]/20 animate-ping"></div>
                            </div>
                            <p className="font-bold text-[#111111] mb-1 text-lg">AI sedang menganalisis data NPS...</p>
                            <p className="text-sm text-gray-500">{loadingStatus}</p>
                        </div>
                    )}

                    {conversation.length === 0 && !isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                                <Sparkles size={44} className="text-[#E60012]/40" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-gray-700 mb-3">Belum Ada Analisis NPS</h3>
                            <p className="text-sm text-gray-500 max-w-md mb-2">Klik <strong className="text-[#E60012]">"Generate Analisis"</strong> untuk menganalisis data NPS secara mendalam menggunakan AI.</p>
                            <p className="text-xs text-gray-400 max-w-sm">AI akan menganalisis trend, segmentasi konsumen, kualitas pelayanan, area perbaikan, dan memberikan rekomendasi strategis.</p>
                        </div>
                    )}

                    {conversation.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] ${msg.role === 'user'
                                ? 'bg-[#111111] text-white rounded-[16px_16px_0_16px] px-5 py-3'
                                : 'bg-[#FAFAFA] border border-[#E5E5E5] rounded-[0_16px_16px_16px] px-5 py-4'}`}>
                                {msg.role === 'user' ? (
                                    <>
                                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">CS Manager</div>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#E60012] mb-2 flex items-center gap-1"><Sparkles size={10} />NPS AI Analyst</div>
                                        <div className={mdClasses} dangerouslySetInnerHTML={{ __html: parseChatMarkdown(msg.content) }} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[0_16px_16px_16px] px-5 py-4 flex items-center gap-2 text-gray-400">
                                <Loader2 size={16} className="animate-spin text-[#E60012]" /><span className="text-sm">Sedang menjawab...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Follow-up Input */}
                {conversation.length > 0 && (
                    <div className="shrink-0 border-t border-[#E5E5E5] p-4 bg-white rounded-b-xl">
                        <form onSubmit={(e) => { e.preventDefault(); sendFollowUp(); }} className="flex gap-3">
                            <input ref={inputRef} type="text" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)}
                                placeholder="Tanyakan detail lebih lanjut tentang analisis NPS..." disabled={isSending || isGenerating}
                                className="flex-1 px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#E60012] transition-colors disabled:opacity-50 disabled:bg-gray-50" />
                            <button type="submit" disabled={!followUpInput.trim() || isSending || isGenerating}
                                className="px-4 py-2.5 bg-[#E60012] hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                                <Send size={16} />Kirim
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {toast.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}{toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NPSAnalysis;
