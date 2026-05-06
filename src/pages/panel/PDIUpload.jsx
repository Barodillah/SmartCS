import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileDown, Check, ShieldAlert, FileText, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';

const PDIUpload = () => {
    const navigate = useNavigate();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const fileInputRef = useRef(null);
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

    const getMonthLabel = () => {
        if (!month) return 'Pilih Bulan RS';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const handleDownloadFormat = () => {
        const headers = ["Rangka", "Nama", "Note"];
        const dummyData = [
            ["MHM1234567890", "Budi Santoso", "Catatan pertama"],
            ["MHM0987654321", "Siti Aminah", ""],
            ["MHM5555555555", "Agus Setiawan", "Harap diproses segera"]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Format_RS");

        XLSX.writeFile(workbook, "Format_Upload_RS.xlsx");
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length > 0) {
                    // Extract headers and find indexes
                    const headers = data[0].map(h => String(h).trim().toLowerCase());
                    const rangkaIdx = headers.findIndex(h => h === 'rangka');
                    const nameIdx = headers.findIndex(h => h === 'nama');
                    const noteIdx = headers.findIndex(h => h === 'note');

                    if (rangkaIdx === -1 && nameIdx === -1) {
                        showToast("Format Excel tidak sesuai. Gunakan format yang di-download.", 'error');
                        setPreviewData([]);
                        return;
                    }

                    const parsedData = [];
                    // Using Set to handle duplicate rangka in the uploaded file itself
                    const seenRangka = new Set();
                    
                    for (let i = 1; i < data.length; i++) {
                        const row = data[i];
                        if (!row || row.length === 0) continue;

                        // Check if row is completely empty
                        if (!row[nameIdx] && !row[rangkaIdx]) continue;

                        const rangkaVal = String(row[rangkaIdx] || '').trim();
                        if (rangkaVal && !seenRangka.has(rangkaVal)) {
                            seenRangka.add(rangkaVal);
                            parsedData.push({
                                Rangka: rangkaVal,
                                Nama: row[nameIdx] || '',
                                Note: row[noteIdx] || ''
                            });
                        }
                    }

                    setPreviewData(parsedData);
                }
            } catch (err) {
                console.error(err);
                showToast("Gagal membaca file Excel", 'error');
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!month) {
            showToast("Bulan RS wajib diisi!", "error");
            return;
        }

        if (previewData.length === 0) {
            showToast("Silakan pilih file Excel dengan data yang valid.", "error");
            return;
        }

        setIsUploading(true);
        try {
            const response = await fetch('https://csdwindo.com/api/panel/pdi_upload.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    month,
                    rows: previewData
                })
            });

            const resData = await response.json();

            if (resData.status) {
                showToast(`Berhasil upload: ${resData.inserted} baris. Terlewat (double): ${resData.skipped} baris.`, 'success');
                setTimeout(() => {
                    navigate('/panel/data-pdi/ktb');
                }, 2000);
            } else {
                showToast(resData.message || 'Gagal menyimpan data', 'error');
            }
        } catch (err) {
            console.error(err);
            // Fallback for local testing
            try {
                const responseLocal = await fetch('/api/panel/pdi_upload.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ month, rows: previewData })
                });
                const resDataLocal = await responseLocal.json();
                if (resDataLocal.status) {
                    showToast(`Berhasil upload: ${resDataLocal.inserted} baris. Terlewat (double): ${resDataLocal.skipped} baris.`, 'success');
                    setTimeout(() => navigate('/panel/data-pdi/ktb'), 2000);
                } else {
                    showToast(resDataLocal.message || 'Gagal menyimpan data', 'error');
                }
            } catch (localErr) {
                showToast('Terjadi kesalahan jaringan atau endpoint tidak dapat diakses.', 'error');
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/panel/data-pdi/ktb')}
                        className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-gray-500 hover:text-[#111111] hover:bg-gray-50 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Upload Data RS</h1>
                        <p className="text-gray-500 text-sm mt-1">Import data RS PDI KTB dari file Excel.</p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadFormat}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E60012] text-[#E60012] text-sm font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors h-[42px]"
                >
                    <FileDown size={16} />
                    Download Format Excel
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm shrink-0">
                    <div className="mb-6 flex flex-col items-center">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bulan RS <span className="text-red-500">*</span></label>
                        <div className="relative w-fit" ref={monthPickerRef}>
                            <div className="flex items-center justify-between px-4 py-2 gap-3 border border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#E60012] transition-colors bg-white text-sm font-bold text-[#111111]"
                                onClick={() => setShowMonthPicker(!showMonthPicker)}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-[#E60012]" />
                                    {getMonthLabel()}
                                </div>
                            </div>
                            <AnimatePresence>
                                {showMonthPicker && (
                                    <CustomMonthPicker
                                        currentMonth={month}
                                        onSelect={(m) => { setMonth(m); setShowMonthPicker(false); }}
                                        onClose={() => setShowMonthPicker(false)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".xlsx, .xls"
                        className="hidden"
                    />
                    {!file ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#E60012] mb-3">
                                <Upload size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">Pilih file Excel untuk diupload</h3>
                            <p className="text-sm text-gray-500 mb-4">Hanya mendukung file .xlsx atau .xls</p>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                                <FileText size={14} />
                                {file.name}
                                <button type="button" onClick={() => { setFile(null); setPreviewData([]); fileInputRef.current.value = null; }} className="p-0.5 hover:bg-green-200 rounded-full ml-1 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isUploading || previewData.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#E60012] text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Menyimpan...</>
                            ) : (
                                <><Check size={18} /> Simpan Data ({previewData.length} baris)</>
                            )}
                        </button>
                    </div>
                </form>

                {previewData.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-2 shrink-0">
                            <FileText size={18} className="text-gray-400" />
                            <h2 className="font-bold text-gray-700">Preview Data Excel</h2>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold ml-2">{previewData.length} Baris</span>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-[#E5E5E5] text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-3 font-bold w-12 text-center">No</th>
                                        <th className="px-6 py-3 font-bold">Rangka</th>
                                        <th className="px-6 py-3 font-bold">Nama</th>
                                        <th className="px-6 py-3 font-bold">Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E5E5] text-sm">
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-center text-gray-400">{idx + 1}</td>
                                            <td className="px-6 py-3 font-mono text-gray-700 font-medium">{row.Rangka}</td>
                                            <td className="px-6 py-3 font-bold text-gray-800">{row.Nama}</td>
                                            <td className="px-6 py-3 text-gray-500">{row.Note || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

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

export default PDIUpload;
