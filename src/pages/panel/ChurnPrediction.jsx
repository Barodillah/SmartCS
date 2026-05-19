import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, ShieldAlert, Check, RefreshCw, AlertTriangle, Loader2, Send, Download, FileDown, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseChatMarkdown } from '../../utils/markdownParser';
import { CATEGORIES, SUB_PARAMS, fetchBookingData, fetchKonsumenData, fetchPotensiData, fetchDissatisfactionData, fetchSalesSurveyData, fetchSurveyKTBData, getSystemPrompt } from './commandCenterConfig';

const AI_MODEL = 'qwen/qwen3-235b-a22b-2507';
const CACHE_KEY = 'ai_insight_conv';
const CACHE_TIME_KEY = 'ai_insight_time';

const FOLLOWUP_SYSTEM = `Anda adalah AI asisten Customer Satisfaction Manager di dealer resmi Mitsubishi Motors Dwindo Bintaro.
Anda sudah pernah memberikan analisis sebelumnya. Sekarang CS Manager ingin bertanya lebih lanjut.
Jawab dalam Markdown, bahasa Indonesia profesional, singkat dan jelas.`;

const stripThink = (text) => text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

const markdownClasses = "prose-sm [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:text-[#111111] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-[#111111] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-lg [&_h3]:text-[#00B2A9] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:border-b [&_h3]:border-gray-100 [&_h3]:pb-2 [&_strong]:text-[#111111] [&_li]:text-gray-600 [&_li]:text-sm [&_li]:leading-relaxed [&_hr]:my-4 [&_hr]:border-gray-200 [&_blockquote]:border-l-2 [&_blockquote]:border-[#00B2A9] [&_blockquote]:pl-3 [&_blockquote]:text-gray-500 [&_blockquote]:italic";

const ChurnPrediction = () => {
    const [user, setUser] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [showParamModal, setShowParamModal] = useState(false);
    
    // Parameter Modal State
    const [modalStep, setModalStep] = useState(1);
    const [analysisParams, setAnalysisParams] = useState({ category: '', depth: 'Standar' });
    
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [followUpInput, setFollowUpInput] = useState('');
    const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch (e) { } }
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cached && cachedTime) { setConversation(JSON.parse(cached)); setLastUpdated(cachedTime); }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isSendingFollowUp]);

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const saveConversation = (conv) => {
        const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        setLastUpdated(time);
        localStorage.setItem(CACHE_KEY, JSON.stringify(conv));
        localStorage.setItem(CACHE_TIME_KEY, time);
    };

    const callAI = async (messages) => {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: AI_MODEL, messages })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) return stripThink(data.choices[0].message.content);
        throw new Error('No AI response');
    };

    const generateInsight = async () => {
        setShowParamModal(false);
        setIsGenerating(true);
        try {
            setLoadingStatus(`Mengambil data ${CATEGORIES.find(c => c.id === analysisParams.category)?.label || ''}...`);
            let userMsg = '';
            
            if (analysisParams.category === 'booking' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Booking & Kapasitas...');
                userMsg += await fetchBookingData(analysisParams) + '\\n\\n';
            }
            if (analysisParams.category === 'konsumen' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Konsumen...');
                userMsg += await fetchKonsumenData(analysisParams) + '\\n\\n';
            }
            if (analysisParams.category === 'potensi' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Potensi Service...');
                userMsg += await fetchPotensiData(analysisParams) + '\\n\\n';
            }
            if (analysisParams.category === 'dissatisfaction' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Dissatisfaction...');
                userMsg += await fetchDissatisfactionData(analysisParams) + '\\n\\n';
            }
            if (analysisParams.category === 'sales_survey' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Sales Survey & Produktivitas Follow Up...');
                userMsg += await fetchSalesSurveyData(analysisParams) + '\\n\\n';
            }
            if (analysisParams.category === 'survey_ktb' || analysisParams.category === 'semua') {
                setLoadingStatus('Mengambil data Survey KTB...');
                userMsg += await fetchSurveyKTBData(analysisParams) + '\\n\\n';
            }

            setLoadingStatus('AI sedang menganalisis data...');
            const sysPrompt = getSystemPrompt(analysisParams.category, analysisParams);
            const aiReply = await callAI([{ role: 'system', content: sysPrompt }, { role: 'user', content: userMsg }]);
            const newConv = [{ role: 'assistant', content: aiReply }];
            setConversation(newConv);
            saveConversation(newConv);
            showToast('AI Insight berhasil diperbarui!');
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat menghubungi API', 'error');
        } finally { setIsGenerating(false); setLoadingStatus(''); }
    };

    const sendFollowUp = async () => {
        const msg = followUpInput.trim();
        if (!msg || isSendingFollowUp) return;
        setFollowUpInput('');
        const updated = [...conversation, { role: 'user', content: msg }];
        setConversation(updated);
        setIsSendingFollowUp(true);
        try {
            const aiMessages = [{ role: 'system', content: FOLLOWUP_SYSTEM }, ...updated.map(m => ({ role: m.role, content: m.content }))];
            const reply = await callAI(aiMessages);
            const final = [...updated, { role: 'assistant', content: reply }];
            setConversation(final);
            saveConversation(final);
        } catch (err) {
            console.error(err);
            showToast('Gagal mengirim pertanyaan', 'error');
        } finally { setIsSendingFollowUp(false); }
    };

    const exportPDF = async () => {
        showToast('Menyiapkan PDF...');
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;padding:40px;background:#fff;font-family:Segoe UI,Tahoma,sans-serif;color:#222;font-size:13px;line-height:1.7;z-index:-1;';

        container.innerHTML = `<div style="border-bottom:3px solid #00B2A9;padding-bottom:12px;margin-bottom:24px">
            <h1 style="font-size:22px;margin:0 0 4px;color:#111">AI Insights Report</h1>
            <p style="font-size:11px;color:#888;margin:0">Mitsubishi Motors Dwindo Bintaro — ${lastUpdated || new Date().toLocaleString('id-ID')}</p>
        </div>`;

        const styleTag = `<style>
            h1,h2,h3,h4,h5,h6{color:#00B2A9;margin-top:18px;margin-bottom:8px}
            h3{font-size:16px;border-bottom:1px solid #eee;padding-bottom:6px}
            strong{color:#111}
            ul,ol{padding-left:20px;margin:8px 0}
            li{margin-bottom:4px;font-size:12px;color:#444}
            table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px}
            th{background:#f3f3f3;border:1px solid #ddd;padding:6px 10px;text-align:left;font-weight:700;font-size:10px;text-transform:uppercase;color:#555}
            td{border:1px solid #ddd;padding:6px 10px;color:#444}
            tr:nth-child(even){background:#fafafa}
            blockquote{border-left:3px solid #00B2A9;padding-left:12px;color:#666;font-style:italic;margin:12px 0}
            code{background:#f0f0f0;padding:1px 5px;border-radius:3px;font-size:11px;color:#E60012}
            pre{background:#f5f5f5;padding:10px;border-radius:6px;overflow-x:auto;font-size:11px}
            hr{border:none;border-top:1px solid #ddd;margin:16px 0}
            a{color:#E60012}
        </style>`;

        conversation.forEach((msg) => {
            if (msg.role === 'user') {
                container.innerHTML += `<div style="background:#111;color:#fff;border-radius:12px 12px 0 12px;padding:14px 18px;margin-bottom:16px">
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;color:#4dd9d2">CS Manager</div>
                    <p style="margin:0;font-size:13px">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>`;
            } else {
                container.innerHTML += `<div style="background:#f8fafa;border:1px solid #e5e5e5;border-radius:0 12px 12px 12px;padding:16px 20px;margin-bottom:16px">
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;color:#00B2A9">AI Assistant</div>
                    ${styleTag}${parseChatMarkdown(msg.content)}
                </div>`;
            }
        });

        document.body.appendChild(container);

        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');

            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            document.body.removeChild(container);

            const pdfW = 210;
            const pdfH = 297;
            const marginX = 5;
            const marginY = 15;
            const contentW = pdfW - marginX * 2;
            const contentH = pdfH - marginY * 2;

            const pxPerMm = canvas.width / contentW;
            const pageHeightPx = Math.floor(contentH * pxPerMm);
            const totalPages = Math.ceil(canvas.height / pageHeightPx);

            const doc = new jsPDF('p', 'mm', 'a4');

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) doc.addPage();
                const sliceY = page * pageHeightPx;
                const sliceH = Math.min(pageHeightPx, canvas.height - sliceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceH;
                const ctx = pageCanvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

                const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
                const imgH = (sliceH * contentW) / canvas.width;
                doc.addImage(pageImg, 'JPEG', marginX, marginY, contentW, imgH);
            }

            doc.save(`AI_Insights_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast('PDF berhasil diunduh!');
        } catch (err) {
            console.error('PDF export error:', err);
            if (document.body.contains(container)) document.body.removeChild(container);
            showToast('Gagal mengexport PDF', 'error');
        }
    };

    const handleRegenClick = () => {
        if (conversation.length > 0) { setShowRegenModal(true); } else { setModalStep(1); setShowParamModal(true); }
    };

    const handleCategorySelect = (id) => {
        const subParams = SUB_PARAMS[id];
        let newParams = { category: id, depth: 'Standar' };
        if (subParams) {
            subParams.forEach(p => {
                newParams[p.key] = typeof p.default === 'function' ? p.default() : p.default;
            });
        }
        setAnalysisParams(newParams);
        setModalStep(2);
    };

    if (user && user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-[#111111]">Akses Ditolak</h2>
                <p className="text-gray-500 mt-2">Halaman ini hanya dapat diakses oleh Admin.</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#00B2A9] to-teal-700 text-white rounded-lg shadow-lg"><BrainCircuit size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Smart Command Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Pusat analisis AI terintegrasi dari seluruh data operasional.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
                    {lastUpdated && <span className="text-xs text-gray-400 flex items-center gap-1 mr-1"><RefreshCw size={12} />{lastUpdated}</span>}
                    {conversation.length > 0 && (
                        <button onClick={exportPDF} className="flex items-center gap-2 bg-[#111111] hover:bg-gray-800 text-white px-4 py-2.5 rounded shadow-md text-sm font-bold transition-colors">
                            <FileDown size={16} />Export PDF
                        </button>
                    )}
                    <button onClick={handleRegenClick} disabled={isGenerating}
                        className="flex items-center gap-2 bg-[#00B2A9] hover:bg-teal-600 text-white px-5 py-2.5 rounded shadow-md text-sm font-bold transition-colors disabled:opacity-50">
                        {isGenerating ? <><Loader2 size={16} className="animate-spin" />Menganalisis...</> : <><BrainCircuit size={16} />{conversation.length > 0 ? 'Generate Ulang' : 'Mulai Analisis'}</>}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-y-auto rounded-lg shadow-sm relative flex flex-col min-h-0 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {isGenerating && conversation.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 border border-teal-100"><BrainCircuit size={32} className="text-[#00B2A9] animate-pulse" /></div>
                            <p className="font-bold text-[#111111] mb-1">AI sedang menganalisis...</p>
                            <p className="text-sm text-gray-500">{loadingStatus}</p>
                        </div>
                    )}

                    {conversation.length === 0 && !isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><BrainCircuit size={40} className="text-gray-300" /></div>
                            <h3 className="font-bold text-lg text-gray-600 mb-2">Pusat Analisis Terintegrasi</h3>
                            <p className="text-sm text-gray-500 max-w-md mb-1">Klik <strong>"Mulai Analisis"</strong> untuk memilih kategori data.</p>
                            <p className="text-xs text-gray-400 max-w-sm">Ditenagai oleh AI untuk insight mendalam & komprehensif.</p>
                        </div>
                    )}

                    {conversation.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-[16px_16px_0_16px] px-5 py-3' : 'bg-[#F8FAFA] border border-[#E5E5E5] rounded-[0_16px_16px_16px] px-5 py-4'}`}>
                                {msg.role === 'user' ? (
                                    <>
                                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">CS Manager</div>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#00B2A9] mb-2 flex items-center gap-1"><BrainCircuit size={10} />AI Assistant</div>
                                        <div className={markdownClasses} dangerouslySetInnerHTML={{ __html: parseChatMarkdown(msg.content) }} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {isSendingFollowUp && (
                        <div className="flex justify-start">
                            <div className="bg-[#F8FAFA] border border-[#E5E5E5] rounded-[0_16px_16px_16px] px-5 py-4 flex items-center gap-2 text-gray-400">
                                <Loader2 size={16} className="animate-spin text-[#00B2A9]" /><span className="text-sm">Sedang menjawab...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {conversation.length > 0 && (
                    <div className="shrink-0 border-t border-[#E5E5E5] p-4 bg-white rounded-b-lg">
                        <form onSubmit={(e) => { e.preventDefault(); sendFollowUp(); }} className="flex gap-3">
                            <input ref={inputRef} type="text" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)}
                                placeholder="Tanyakan detail lebih lanjut..." disabled={isSendingFollowUp || isGenerating}
                                className="flex-1 px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#00B2A9] transition-colors disabled:opacity-50 disabled:bg-gray-50" />
                            <button type="submit" disabled={!followUpInput.trim() || isSendingFollowUp || isGenerating}
                                className="px-4 py-2.5 bg-[#00B2A9] hover:bg-teal-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                                <Send size={16} />Kirim
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showRegenModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRegenModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center" onClick={e => e.stopPropagation()}>
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"><RefreshCw size={32} className="text-orange-500" /></div>
                            <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Generate Ulang Insight?</h3>
                            <p className="text-sm text-gray-500 mb-6">Data insight saat ini akan diganti. Apakah Anda sudah mendownload laporan dalam bentuk PDF?</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button onClick={() => setShowRegenModal(false)} className="px-4 py-2.5 rounded font-bold text-sm bg-gray-100 text-[#444444] hover:bg-gray-200 transition-colors">Batal</button>
                                <button onClick={() => { exportPDF(); setShowRegenModal(false); }}
                                    className="px-4 py-2.5 rounded font-bold text-sm bg-[#111111] text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                    <Download size={16} />Download PDF Dulu
                                </button>
                                <button onClick={() => { setShowRegenModal(false); setModalStep(1); setShowParamModal(true); }}
                                    className="px-4 py-2.5 rounded font-bold text-sm bg-[#00B2A9] text-white hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                                    <RefreshCw size={16} />Ya, Lanjut
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showParamModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[130] backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowParamModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className={`bg-white rounded-xl shadow-2xl w-full overflow-hidden flex flex-col ${modalStep === 1 ? 'max-w-4xl max-h-[90vh]' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>
                            
                            {modalStep === 1 ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                                        <div>
                                            <h3 className="font-display font-bold text-xl text-[#111111]">Pilih Kategori Analisis</h3>
                                            <p className="text-sm text-gray-500">Pilih modul data yang ingin dianalisis oleh AI</p>
                                        </div>
                                    </div>
                                    <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {CATEGORIES.map(cat => {
                                                const Icon = cat.icon;
                                                return (
                                                    <div key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                                                        className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#00B2A9] hover:shadow-md transition-all group flex flex-col gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-sm`}>
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#111111] group-hover:text-[#00B2A9] transition-colors flex items-center justify-between">
                                                                {cat.label}
                                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#00B2A9] transition-colors" />
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                                        <button onClick={() => setShowParamModal(false)} className="px-5 py-2.5 rounded font-bold text-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                                        <button onClick={() => setModalStep(1)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ChevronRight size={18} className="rotate-180" /></button>
                                        <h3 className="font-display font-bold text-lg text-[#111111]">Parameter Detail</h3>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        {SUB_PARAMS[analysisParams.category]?.map(param => (
                                            <div key={param.key}>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">{param.label}</label>
                                                {param.type === 'select' ? (
                                                    <select value={analysisParams[param.key]} onChange={e => setAnalysisParams({...analysisParams, [param.key]: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B2A9]">
                                                        {param.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                                                    </select>
                                                ) : param.type === 'month' ? (
                                                    <input type="month" value={analysisParams[param.key]} onChange={e => setAnalysisParams({...analysisParams, [param.key]: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B2A9]" />
                                                ) : null}
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Kedalaman Analisis</label>
                                            <select value={analysisParams.depth} onChange={e => setAnalysisParams({...analysisParams, depth: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B2A9]">
                                                <option value="Standar">Standar (Ringkasan Eksekutif)</option>
                                                <option value="Mendalam">Mendalam (Detail & Komprehensif)</option>
                                                <option value="Pencarian Solusi">Fokus Pemecahan Masalah/Solusi</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button onClick={() => setShowParamModal(false)} className="px-4 py-2 rounded font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
                                        <button onClick={() => { setConversation([]); generateInsight(); }}
                                            className="px-6 py-2 rounded font-bold text-sm bg-[#00B2A9] text-white hover:bg-teal-600 transition-colors flex items-center gap-2">
                                            <BrainCircuit size={16} /> Mulai Analisis
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

export default ChurnPrediction;
