import React, { useState } from 'react';
import { Database, UploadCloud, FileText, Check, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const DataPDIMMKSI = () => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            readExcel(selectedFile);
        }
    };

    const formatExcelDate = (excelDate) => {
        if (!excelDate) return '';
        if (typeof excelDate === 'number') {
            const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        }
        return excelDate;
    };

    const readExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Remove empty rows
                const rows = jsonData.filter(row => row.length > 0);
                // Assume first row might be header
                const dataRows = rows.length > 1 && (typeof rows[0][2] === 'string' && rows[0][2].toLowerCase().includes('nama')) ? rows.slice(1) : rows;

                const formatted = dataRows.map((row, index) => ({
                    id: index,
                    date: formatExcelDate(row[0]),
                    rangka: row[1] || '',
                    nama: row[2] || '',
                    telp: row[3] || '',
                    kendaraan: row[4] || '',
                    sales: row[5] || '',
                    spv: row[6] || ''
                })).filter(r => r.rangka || r.nama);

                setPreviewData(formatted);
            } catch (err) {
                console.error("Error reading excel: ", err);
                showToast("Gagal membaca file Excel", "error");
                setPreviewData([]);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const clearFile = () => {
        setFile(null);
        setPreviewData([]);
    };

    const handleUpload = async () => {
        if (!file || previewData.length === 0) return;
        
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('action', 'upload_pdi_mmksi');
            formData.append('data', JSON.stringify(previewData));
            
            const res = await fetch('https://csdwindo.com/api/panel/sales_survey.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            
            if (result.status) {
                showToast(result.message || 'Data berhasil diupload');
                clearFile();
            } else {
                showToast(result.message || 'Gagal mengupload data', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><Database size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Data PDI MMKSI</h1>
                        <p className="text-gray-500 text-sm mt-1">Upload Data PDI MMKSI dari Excel untuk masuk ke Antrean Survey.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-[#E5E5E5] shrink-0 bg-[#FAFAFA]">
                    <div className="w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Upload File Excel (.xlsx, .xls)</label>
                        {!file ? (
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm font-medium text-gray-600">Klik atau drag file kesini untuk upload</span>
                                    <span className="text-xs text-gray-400 mt-1">Format: Date, Rangka, Nama, Telp, Kendaraan, Sales, SPV</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-green-50 text-green-600 rounded"><FileText size={20} /></div>
                                    <div className="truncate">
                                        <div className="text-sm font-bold text-gray-800 truncate">{file.name}</div>
                                        <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB • {previewData.length} baris valid</div>
                                    </div>
                                </div>
                                <button onClick={clearFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors z-20">
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        
                        {previewData.length > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="px-6 py-2 bg-[#E60012] text-white text-sm font-bold rounded shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isUploading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Mengupload...</> : <><UploadCloud size={18} /> Upload {previewData.length} Data</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-white">
                    {previewData.length > 0 ? (
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">No</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Rangka</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Nama</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Telp</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Kendaraan</th>
                                    <th className="px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Sales / SPV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {previewData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.date}</td>
                                        <td className="px-4 py-3 font-mono text-gray-600 whitespace-nowrap">{row.rangka}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 min-w-[150px]">{row.nama}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.telp}</td>
                                        <td className="px-4 py-3 text-gray-600 min-w-[150px]">{row.kendaraan}</td>
                                        <td className="px-4 py-3 text-gray-600 min-w-[150px]">
                                            <div className="font-medium text-gray-800">{row.sales}</div>
                                            <div className="text-xs text-gray-500">{row.spv}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>Pilih file excel untuk melihat preview data</p>
                        </div>
                    )}
                </div>
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

export default DataPDIMMKSI;
