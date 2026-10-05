import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Sparkles, X, Loader2, RefreshCw, AlertTriangle, Check, Download, Coffee } from 'lucide-react';
import * as XLSX from 'xlsx';

// =================== HELPERS ===================
const formatPhone = (telp) => {
    if (!telp) return '';
    let phone = String(telp).replace(/\D/g, '');
    if (phone.startsWith('0')) phone = phone.substring(1);
    if (!phone.startsWith('62')) phone = '62' + phone;
    return phone;
};

const openWhatsapp = (telp, message) => {
    const phone = formatPhone(telp);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

const WhatsappIcon = ({ size = 16, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
);

const WaBlast = () => {
    const [blastData, setBlastData] = useState(() => {
        const stored = localStorage.getItem('blastManualData_public');
        return stored ? JSON.parse(stored).data : [];
    });
    const [blastHeaders, setBlastHeaders] = useState(() => {
        const stored = localStorage.getItem('blastManualData_public');
        return stored ? JSON.parse(stored).headers : [];
    });
    const [blastTemplate, setBlastTemplate] = useState(() => {
        return localStorage.getItem('blastManualTemplate_public') || '';
    });
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef(null);
    const [sentRows, setSentRows] = useState(new Set());
    const [invalidRows, setInvalidRows] = useState(new Set());
    const [resendModal, setResendModal] = useState({ show: false, item: null, rowIdx: null });
    const [invalidModal, setInvalidModal] = useState({ show: false, item: null, rowIdx: null });
    const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);

    useEffect(() => {
        document.title = "WA Blast App | Kirim Pesan Massal Mudah";
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = "Kirim pesan WhatsApp massal dengan mudah. Tarik data dari Excel, gunakan template dinamis, dan manfaatkan AI untuk membuat isi pesan yang menarik.";
        
        // Optional: restore title on unmount if needed
        return () => {
            document.title = "Vite + React"; 
        };
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleBlastFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data && data.length > 0) {
                    const headers = Object.keys(data[0]);
                    const firstHeader = headers[0];

                    if (!firstHeader || firstHeader.toLowerCase() !== 'wa') {
                        showToast('Gagal: Kolom pertama (A1) harus berjudul "wa"', 'error');
                        return;
                    }

                    setBlastData(data);
                    setBlastHeaders(headers);
                    setSentRows(new Set());
                    setInvalidRows(new Set());
                    localStorage.setItem('blastManualData_public', JSON.stringify({ data, headers }));
                    showToast('Data excel berhasil dimuat', 'success');
                } else {
                    showToast('Data excel kosong atau format tidak valid', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Gagal memproses file Excel', 'error');
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleClearBlastData = () => {
        if (window.confirm('Yakin ingin menghapus data excel sementara?')) {
            setBlastData([]);
            setBlastHeaders([]);
            setSentRows(new Set());
            setInvalidRows(new Set());
            localStorage.removeItem('blastManualData_public');
        }
    };

    const handleDownloadExcel = () => {
        if (blastData.length === 0) {
            showToast('Tidak ada data untuk diunduh', 'error');
            return;
        }

        const exportData = blastData.map((item, idx) => {
            let status = 'Belum Dikirim';
            if (invalidRows.has(idx)) {
                status = 'Nomor Salah';
            } else if (sentRows.has(idx)) {
                status = 'Terkirim';
            }

            return {
                ...item,
                'Status Blast': status
            };
        });

        try {
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Hasil Blast");
            XLSX.writeFile(wb, "Hasil_WA_Blast.xlsx");
            showToast('Berhasil mengunduh hasil', 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal mengunduh file Excel', 'error');
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            { wa: '081234567890', Nama: 'Budi Santoso', Kendaraan: 'Xpander' }
        ];
        try {
            const ws = XLSX.utils.json_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Format Blast");
            XLSX.writeFile(wb, "Format_WA_Blast.xlsx");
            showToast('Format berhasil diunduh', 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal mengunduh format', 'error');
        }
    };

    const handleTemplateChange = (e) => {
        const val = e.target.value;
        setBlastTemplate(val);
        localStorage.setItem('blastManualTemplate_public', val);
    };

    const handleInsertVariable = (header) => {
        const insertText = `{{${header}}}`;
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const currentTemplate = blastTemplate;
            const newTemplate = currentTemplate.substring(0, start) + insertText + currentTemplate.substring(end);

            setBlastTemplate(newTemplate);
            localStorage.setItem('blastManualTemplate_public', newTemplate);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(start + insertText.length, start + insertText.length);
                }
            }, 0);
        } else {
            const newTemplate = blastTemplate + insertText;
            setBlastTemplate(newTemplate);
            localStorage.setItem('blastManualTemplate_public', newTemplate);
        }
    };

    const handleGenerateAI = async () => {
        if (!aiContext.trim()) {
            showToast('Konteks follow up tidak boleh kosong', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (!apiKey) {
                showToast('API Key OpenRouter tidak ditemukan di .env', 'error');
                setIsGenerating(false);
                return;
            }

            const availableVars = blastHeaders.filter(h => h.toLowerCase() !== 'wa').map(h => `{{${h}}}`).join(', ');

            const systemPrompt = `Anda adalah asisten pembuat template pesan WhatsApp profesional.
Tugas Anda adalah membuat template pesan WhatsApp yang menarik, sopan, dan jelas berdasarkan konteks dari user.
Anda HARUS menggunakan variabel-variabel berikut jika relevan: ${availableVars}.
Jangan gunakan variabel selain yang disebutkan di atas. Variabel ditulis dengan kurawal ganda, contoh: {{Nama}}.

PENTING:
- JANGAN menggunakan emoticon/emoji sama sekali dalam template.
- Gunakan format text standar WhatsApp berikut:
  *teks* untuk Bold
  _teks_ untuk Italic
  ~teks~ untuk Strikethrough
  \`teks\` untuk Monospace / Inline Code
  \`\`\`teks\`\`\` untuk Blok Monospace
  > teks untuk Quote
  • untuk Bullet
  - untuk Dash Bullet
  1. 2. 3. untuk Numbering

Balas HANYA dengan isi template pesan saja, tanpa tambahan penjelasan apapun.`;

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "xiaomi/mimo-v2.5",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: aiContext }
                    ],
                    temperature: 0.7,
                })
            });

            if (!res.ok) {
                throw new Error("Gagal memanggil API AI");
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content?.trim();

            if (reply) {
                setBlastTemplate(reply);
                localStorage.setItem('blastManualTemplate_public', reply);
                showToast('Template berhasil di-generate', 'success');
                setIsAiModalOpen(false);
                setAiContext('');
            } else {
                showToast('AI tidak merespon dengan benar', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat men-generate template', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const executeSendBlast = (item, rowIdx) => {
        let msg = blastTemplate;
        blastHeaders.forEach(header => {
            const safeHeader = header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`{{${safeHeader}}}`, 'g');
            msg = msg.replace(regex, item[header] != null ? String(item[header]) : '');
        });

        const phoneKey = blastHeaders[0];
        const telp = item[phoneKey];
        if (!telp) {
            showToast('Peringatan: Kolom "wa" kosong pada baris ini', 'error');
            return;
        }

        openWhatsapp(String(telp), msg);
        setSentRows(prev => new Set(prev).add(rowIdx));
    };

    const handleSendClick = (item, rowIdx) => {
        if (invalidRows.has(rowIdx)) {
            showToast('Nomor ini sudah ditandai tidak valid', 'error');
            return;
        }
        if (sentRows.has(rowIdx)) {
            setResendModal({ show: true, item, rowIdx });
        } else {
            executeSendBlast(item, rowIdx);
        }
    };

    const handleMarkInvalid = (rowIdx) => {
        setInvalidRows(prev => new Set(prev).add(rowIdx));
        setInvalidModal({ show: false, item: null, rowIdx: null });
        showToast('Nomor ditandai sebagai invalid', 'success');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg animate-in slide-in-from-top-2 text-white font-bold text-sm ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.message}
                </div>
            )}

            <div className="max-w-6xl w-full bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '80vh' }}>
                <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-[#25D366]">
                            <WhatsappIcon size={24} />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">WA Blast App</h1>
                            <p className="text-gray-500 text-sm mt-1">Kirim pesan WhatsApp massal berdasarkan template dari file Excel.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCoffeeModalOpen(true)}
                        className="hidden sm:flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                        <Coffee size={16} /> Buy Me Coffee
                    </button>
                </div>

                {blastData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 w-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-w-2xl w-full">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Upload Data Blast (Excel)</h2>
                                <button onClick={handleDownloadTemplate} className="mt-4 sm:mt-0 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                                    <Download size={16} /> Contoh Format
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleBlastFileUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${isUploading ? 'border-gray-200 bg-gray-50' : 'border-[#25D366]/30 bg-green-50 hover:bg-green-100 hover:border-[#25D366]/50'}`}>
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#25D366] border-t-transparent mb-4"></div>
                                    ) : (
                                        <UploadCloud size={48} className="text-[#25D366]/60 mb-4" />
                                    )}
                                    <span className="text-sm font-bold text-[#111111]">
                                        {isUploading ? 'Memproses File...' : 'Klik atau drag file kesini untuk upload'}
                                    </span>
                                    {!isUploading && (
                                        <span className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                                            Format file harus .xlsx / .xls. Baris pertama (Row 1) akan dijadikan variabel.<br />
                                            <strong className="text-red-500">Penting: Kolom pertama (A1) WAJIB berjudul "wa".</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in duration-300">
                        <div className="p-4 bg-gray-50 border-b border-[#E5E5E5] shrink-0 shadow-sm z-10 relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700">Template Pesan WhatsApp</label>
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded transition-colors"
                                >
                                    <Sparkles size={14} /> Generate AI
                                </button>
                            </div>
                            <textarea
                                ref={textareaRef}
                                className="w-full border border-gray-300 rounded p-3 text-sm focus:border-[#25D366] focus:outline-none min-h-[100px] shadow-inner"
                                placeholder="Gunakan kurawal ganda untuk data dinamis. Contoh: Halo {{Nama}}, promo untuk mobil {{Kendaraan}} Anda..."
                                value={blastTemplate}
                                onChange={handleTemplateChange}
                            />
                            <div className="mt-3 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-500 mr-2">Kolom Tersedia:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {blastHeaders.map(h => (
                                            <button
                                                key={h}
                                                onClick={() => handleInsertVariable(h)}
                                                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono shadow-sm cursor-pointer transition-colors"
                                            >
                                                {`{{${h}}}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleDownloadExcel} className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded text-xs font-bold transition-colors shadow-sm whitespace-nowrap flex items-center gap-1">
                                        <Download size={14} /> Download Hasil
                                    </button>
                                    <button onClick={handleClearBlastData} className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                                        Hapus Data Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-white w-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            <table className="w-full text-sm text-left border-collapse min-w-max">
                                <thead className="bg-[#fcfcfc] sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        {blastHeaders.map((header, idx) => (
                                            <th key={idx} className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-[#E5E5E5] whitespace-nowrap">{header}</th>
                                        ))}
                                        <th className="px-4 py-3 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-[#E5E5E5] text-right sticky right-0 bg-[#fcfcfc] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blastData.map((item, rowIdx) => (
                                        <tr key={rowIdx} className={`border-b border-[#E5E5E5] transition-colors ${invalidRows.has(rowIdx) ? 'bg-red-50 hover:bg-red-100 opacity-60' : 'hover:bg-gray-50'}`}>
                                            {blastHeaders.map((header, colIdx) => (
                                                <td key={colIdx} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[200px] truncate" title={item[header]}>{item[header]}</td>
                                            ))}
                                            <td className={`px-4 py-3 text-right sticky right-0 group-hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] ${invalidRows.has(rowIdx) ? 'bg-red-50' : 'bg-white'}`}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {sentRows.has(rowIdx) && !invalidRows.has(rowIdx) && (
                                                        <button onClick={() => setInvalidModal({ show: true, item, rowIdx })} className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center shadow-sm transition-colors" title="Tandai nomor invalid">
                                                            <AlertTriangle size={12} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleSendClick(item, rowIdx)}
                                                        className={`${invalidRows.has(rowIdx) ? 'bg-red-500 hover:bg-red-600' : sentRows.has(rowIdx) ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#25D366] hover:bg-[#1DA851]'} text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm transition-colors`}
                                                    >
                                                        {invalidRows.has(rowIdx) ? (
                                                            <><AlertTriangle size={12} /> Invalid</>
                                                        ) : sentRows.has(rowIdx) ? (
                                                            <><Check size={12} /> Terkirim</>
                                                        ) : (
                                                            <><WhatsappIcon size={12} /> Kirim</>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Generate Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles size={18} className="text-purple-500" />
                                Generate Template AI
                            </h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Konteks Follow Up
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[120px] resize-none"
                                placeholder="Contoh: Buatkan template untuk mengingatkan pelanggan bahwa waktu service rutin mereka sudah tiba bulan ini..."
                                value={aiContext}
                                onChange={(e) => setAiContext(e.target.value)}
                                disabled={isGenerating}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                AI akan menggunakan kolom yang tersedia: <br />
                                <span className="font-mono text-gray-600 font-medium">
                                    {blastHeaders.filter(h => h.toLowerCase() !== 'wa').map(h => `{{${h}}}`).join(', ')}
                                </span>
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={isGenerating}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleGenerateAI}
                                disabled={isGenerating || !aiContext.trim()}
                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resend Modal */}
            {resendModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                            <RefreshCw size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Kirim Ulang Pesan?</h3>
                        <p className="text-sm text-gray-500 mb-6">Pesan ke nomor ini sudah pernah dikirim. Yakin ingin mengirimnya lagi?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setResendModal({ show: false, item: null, rowIdx: null })} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Batal</button>
                            <button onClick={() => {
                                executeSendBlast(resendModal.item, resendModal.rowIdx);
                                setResendModal({ show: false, item: null, rowIdx: null });
                            }} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 flex items-center gap-2">
                                <RefreshCw size={16} /> Ya, Kirim Ulang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invalid Modal */}
            {invalidModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Tandai Nomor Invalid?</h3>
                        <p className="text-sm text-gray-500 mb-6">Tandai nomor ini sebagai invalid (tidak terdaftar/salah) agar tidak diproses lagi?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setInvalidModal({ show: false, item: null, rowIdx: null })} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Batal</button>
                            <button onClick={() => handleMarkInvalid(invalidModal.rowIdx)} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 flex items-center gap-2">
                                <AlertTriangle size={16} /> Ya, Tandai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Coffee Modal */}
            {isCoffeeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-2 animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsCoffeeModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                            <X size={20} />
                        </button>
                        <div className="w-full flex justify-center mt-8 mb-4">
                            <iframe
                                src="https://csdwindo.com/wp-content/uploads/qr-saweria.png"
                                width="300"
                                height="350"
                                className="border-0 overflow-hidden"
                                title="Saweria QR"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaBlast;
