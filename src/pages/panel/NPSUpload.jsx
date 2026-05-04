import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileDown, Check, ShieldAlert, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const NPSUpload = () => {
    const navigate = useNavigate();
    const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
    const [cabang, setCabang] = useState('');
    const [divisi, setDivisi] = useState('');
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const fileInputRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleDownloadFormat = () => {
        const headers = ["Nama", "Rangka", "Kendaraan", "Score", "Note"];
        const dummyData = [
            ["Budi Santoso", "MHM1234567890", "Xpander Ultimate", 10, "Pelayanan sangat baik"],
            ["Siti Aminah", "MHM0987654321", "Pajero Sport", 8, ""],
            ["Agus Setiawan", "MHM5555555555", "Xforce", 5, "Kurang responsif"]
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Format_NPS");
        
        XLSX.writeFile(workbook, "Format_Upload_NPS.xlsx");
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
                    const nameIdx = headers.findIndex(h => h === 'nama');
                    const rangkaIdx = headers.findIndex(h => h === 'rangka');
                    const kendaraanIdx = headers.findIndex(h => h === 'kendaraan');
                    const scoreIdx = headers.findIndex(h => h === 'score');
                    const noteIdx = headers.findIndex(h => h === 'note');

                    if (nameIdx === -1 && rangkaIdx === -1 && scoreIdx === -1) {
                        showToast("Format Excel tidak sesuai. Gunakan format yang di-download.", 'error');
                        setPreviewData([]);
                        return;
                    }

                    const parsedData = [];
                    for (let i = 1; i < data.length; i++) {
                        const row = data[i];
                        if (!row || row.length === 0) continue;
                        
                        // Check if row is completely empty
                        if (!row[nameIdx] && !row[rangkaIdx] && !row[scoreIdx]) continue;

                        parsedData.push({
                            Nama: row[nameIdx] || '',
                            Rangka: row[rangkaIdx] || '',
                            Kendaraan: row[kendaraanIdx] || '',
                            Score: row[scoreIdx] !== undefined ? row[scoreIdx] : '',
                            Note: row[noteIdx] || ''
                        });
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
        
        if (!bulan || !cabang || !divisi) {
            showToast("Bulan, Cabang, dan Divisi wajib diisi!", "error");
            return;
        }

        if (previewData.length === 0) {
            showToast("Silakan pilih file Excel dengan data yang valid.", "error");
            return;
        }

        setIsUploading(true);
        try {
            // Kita gunakan endpoint sesuai struktur project.
            const response = await fetch('https://csdwindo.com/api/panel/nps_upload.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bulan,
                    cabang,
                    divisi,
                    rows: previewData
                })
            });

            const resData = await response.json();
            
            if (resData.status) {
                showToast(resData.message, 'success');
                setTimeout(() => {
                    navigate('/panel/nps-report');
                }, 1500);
            } else {
                showToast(resData.message || 'Gagal menyimpan data', 'error');
            }
        } catch (err) {
            console.error(err);
            // Fallback for local testing if https://csdwindo.com CORS blocks it
            try {
                const responseLocal = await fetch('/api/panel/nps_upload.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bulan, cabang, divisi, rows: previewData })
                });
                const resDataLocal = await responseLocal.json();
                if (resDataLocal.status) {
                    showToast(resDataLocal.message, 'success');
                    setTimeout(() => navigate('/panel/nps-report'), 1500);
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
                        onClick={() => navigate('/panel/nps-report')}
                        className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-gray-500 hover:text-[#111111] hover:bg-gray-50 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Upload Data NPS</h1>
                        <p className="text-gray-500 text-sm mt-1">Import data Net Promoter Score dari file Excel.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bulan <span className="text-red-500">*</span></label>
                            <input 
                                type="month" 
                                required
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] text-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cabang <span className="text-red-500">*</span></label>
                            <select 
                                required
                                value={cabang}
                                onChange={(e) => setCabang(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] text-sm font-medium appearance-none bg-white"
                            >
                                <option value="" disabled>Pilih Cabang</option>
                                <option value="Bintaro">Bintaro</option>
                                <option value="Raden Inten">Raden Inten</option>
                                <option value="Cakung">Cakung</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Divisi <span className="text-red-500">*</span></label>
                            <select 
                                required
                                value={divisi}
                                onChange={(e) => setDivisi(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] text-sm font-medium appearance-none bg-white"
                            >
                                <option value="" disabled>Pilih Divisi</option>
                                <option value="Sales">Sales</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".xlsx, .xls" 
                            className="hidden" 
                        />
                        <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#E60012] mb-3">
                            <Upload size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Pilih file Excel untuk diupload</h3>
                        <p className="text-sm text-gray-500 mb-4">Hanya mendukung file .xlsx atau .xls</p>
                        
                        {file && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                                <FileText size={14} />
                                {file.name}
                                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewData([]); fileInputRef.current.value = null; }} className="p-0.5 hover:bg-green-200 rounded-full ml-1 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

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
                    <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-[#E5E5E5] bg-gray-50 shrink-0">
                            <h2 className="font-bold text-[#111111] flex items-center gap-2">
                                <FileText size={18} className="text-[#E60012]" /> Preview Data
                            </h2>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">No</th>
                                        <th className="px-6 py-3 font-bold">Nama</th>
                                        <th className="px-6 py-3 font-bold">Rangka</th>
                                        <th className="px-6 py-3 font-bold">Kendaraan</th>
                                        <th className="px-6 py-3 font-bold">Score</th>
                                        <th className="px-6 py-3 font-bold">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-[#E5E5E5] hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{row.Nama}</td>
                                            <td className="px-6 py-3 font-mono text-gray-500">{row.Rangka}</td>
                                            <td className="px-6 py-3 text-gray-700">{row.Kendaraan}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    row.Score >= 9 ? 'bg-green-100 text-green-700' :
                                                    row.Score >= 7 ? 'bg-yellow-100 text-yellow-700' :
                                                    row.Score !== '' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {row.Score !== '' ? row.Score : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 max-w-[200px] truncate" title={row.Note}>{row.Note}</td>
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
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {toast.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}{toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NPSUpload;
