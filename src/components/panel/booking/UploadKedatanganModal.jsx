import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Loader2, Check, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const VEHICLE_MAPPINGS = [
    { key: 'XPANDER', val: 'MITSUBISHI XPANDER' },
    { key: 'PAJERO', val: 'MITSUBISHI PAJERO' },
    { key: 'QX', val: 'MITSUBISHI PAJERO' },
    { key: 'DESTINATOR', val: 'MITSUBISHI DESTINATOR' },
    { key: 'XFORCE', val: 'MITSUBISHI XFORCE' },
    { key: 'L300', val: 'MITSUBISHI L300' },
    { key: 'TRITON', val: 'MITSUBISHI TRITON' },
    { key: 'DELICA', val: 'MITSUBISHI DELICA' },
    { key: 'OUTLANDER PHEV', val: 'MITSUBISHI OUTLANDER PHEV' },
    { key: 'ECLIPSE CROSS', val: 'MITSUBISHI ECLIPSE CROSS' },
    { key: 'MIRAGE', val: 'MITSUBISHI MIRAGE' },
    { key: 'OUTLANDER SPORT', val: 'MITSUBISHI OUTLANDER' },
    { key: 'LANCER', val: 'MITSUBISHI LANCER' },
    { key: 'GALANT', val: 'MITSUBISHI GALANT' },
];

export const UploadKedatanganModal = ({ isOpen, onClose, onSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (file) => {
        setErrorMsg('');
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            setErrorMsg('Format file tidak didukung. Harap gunakan file Excel (.xlsx, .xls).');
            return;
        }
        setFile(file);
        parseExcel(file);
    };

    const normalizeData = (row) => {
        let { tanggal, jam, nama, telp, kendaraan, nopol, jenis } = row;

        // Normalize Telp
        let strTelp = String(telp || '').replace(/\D/g, '');
        if (strTelp && !strTelp.startsWith('0') && !strTelp.startsWith('62')) {
            strTelp = '0' + strTelp;
        } else if (strTelp.startsWith('62')) {
            strTelp = '0' + strTelp.slice(2);
        }

        // Normalize Kendaraan
        let rawKendaraan = String(kendaraan || '').toUpperCase();
        let finalKendaraan = 'MITSUBISHI';
        const match = VEHICLE_MAPPINGS.find(m => rawKendaraan.includes(m.key));
        if (match) {
            finalKendaraan = match.val;
        } else {
            finalKendaraan = rawKendaraan;
        }

        // Normalize Jenis
        let finalJenis = String(jenis || '');
        const matchJenis = finalJenis.match(/(1|10|20|30|40|50|60|70|80|90|100)[\.,]?000/i);
        if (matchJenis) {
            finalJenis = `${matchJenis[1]}.000 KM`;
        }

        // Fix Excel date (if it's a serial number)
        let finalTanggal = String(tanggal || '');
        if (!isNaN(finalTanggal) && finalTanggal > 10000) { // rough check for excel date serial
            const d = new Date(Math.round((finalTanggal - 25569) * 86400 * 1000));
            finalTanggal = d.toISOString().split('T')[0];
        }

        // Handle possible time formats like 0.3333333333333333 or 46139.3618055556 for 08:41
        let finalJam = String(jam || '');
        if (!isNaN(finalJam) && finalJam !== '') {
            const numericJam = parseFloat(finalJam);
            const timeFraction = numericJam % 1; // Extract decimal part
            const totalSeconds = Math.round(timeFraction * 86400);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            finalJam = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }

        return {
            tanggal: finalTanggal,
            jam: finalJam,
            nama: String(nama || ''),
            telp: strTelp,
            kendaraan: finalKendaraan,
            nopol: String(nopol || '').toUpperCase().replace(/\s/g, ''),
            jenis: finalJenis
        };
    };

    const parseExcel = (file) => {
        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get data as JSON
                const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                // Validate columns
                if (rawJson.length > 0) {
                    const firstRow = rawJson[0];
                    const requiredCols = ['tanggal', 'jam', 'nama', 'telp', 'kendaraan', 'nopol', 'jenis'];
                    const hasAllCols = requiredCols.every(col => Object.keys(firstRow).some(k => k.toLowerCase() === col));

                    if (!hasAllCols) {
                        setErrorMsg('Kolom tidak sesuai template. Pastikan ada: tanggal, jam, nama, telp, kendaraan, nopol, jenis.');
                        setParsedData([]);
                        setIsParsing(false);
                        return;
                    }
                }

                // Process data
                const processed = rawJson.map(row => {
                    // Convert keys to lowercase for mapping
                    const lowerRow = {};
                    for (const key in row) {
                        lowerRow[key.toLowerCase()] = row[key];
                    }
                    return normalizeData(lowerRow);
                }).filter(r => r.nopol && r.tanggal); // Filter out empty rows

                // Deduplicate by nopol and tanggal, combining 'jenis'
                const uniqueMap = new Map();
                processed.forEach(r => {
                    const key = `${r.tanggal}_${r.nopol}`;
                    if (uniqueMap.has(key)) {
                        const existing = uniqueMap.get(key);
                        if (r.jenis && !existing.jenis.includes(r.jenis)) {
                            existing.jenis = existing.jenis ? `${existing.jenis}, ${r.jenis}` : r.jenis;
                        }
                    } else {
                        uniqueMap.set(key, { ...r });
                    }
                });
                const finalProcessed = Array.from(uniqueMap.values());

                setParsedData(finalProcessed);

                if (finalProcessed.length === 0) {
                    setErrorMsg('Tidak ada data valid yang ditemukan (Nopol dan Tanggal wajib diisi).');
                }
            } catch (err) {
                console.error(err);
                setErrorMsg('Gagal membaca file. Pastikan format Excel valid.');
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { tanggal: '2026-05-02', jam: '08:00', nama: 'Andri', telp: '08170993456', kendaraan: 'DESTINATOR EXCEED 4X2 CVT', nopol: 'B2060WFG', jenis: 'FS 3 (FS : 10.000 Km) DWIN' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Kedatangan.xlsx");
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) return;
        setIsUploading(true);
        setErrorMsg('');

        try {
            const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
            const payload = {
                user: user.name || user.nama || 'ADMIN',
                data: parsedData
            };

            const res = await fetch('https://csdwindo.com/api/panel/upload_kedatangan.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.status) {
                onSuccess(result.message);
                resetState();
            } else {
                setErrorMsg(result.message || 'Gagal mengupload data');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Terjadi kesalahan jaringan');
        } finally {
            setIsUploading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setErrorMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const closeAndReset = () => {
        resetState();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeAndReset}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gray-50 shrink-0">
                        <div className="flex items-center gap-2">
                            <UploadCloud className="text-green-600" size={20} />
                            <h3 className="text-lg font-bold text-[#111111] font-display">Upload Data Kedatangan</h3>
                        </div>
                        <button onClick={closeAndReset} className="text-gray-400 hover:text-[#E60012] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-100 shrink-0">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <p className="text-sm font-medium">{errorMsg}</p>
                            </div>
                        )}

                        {!file ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div>
                                        <h4 className="font-bold text-blue-800 mb-1">Gunakan Template yang Sesuai</h4>
                                        <p className="text-xs text-blue-600">Pastikan file excel Anda memiliki kolom: tanggal, jam, nama, telp, kendaraan, nopol, jenis</p>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <FileSpreadsheet size={14} />
                                        Download Template
                                    </button>
                                </div>

                                <div
                                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
                                        ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileSelect}
                                    />
                                    <UploadCloud size={48} className={`mb-4 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
                                    <h4 className="font-bold text-lg text-gray-700 mb-2">Drag & Drop file Excel di sini</h4>
                                    <p className="text-sm text-gray-500">atau klik untuk memilih file dari komputer</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4 shrink-0 bg-gray-50 p-3 rounded-lg border border-[#E5E5E5]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded text-green-700">
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#111111]">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {isParsing ? 'Sedang memproses...' : `${parsedData.length} baris data ditemukan`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetState}
                                        disabled={isUploading}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        title="Hapus dan pilih file lain"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {isParsing ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10">
                                        <Loader2 size={32} className="animate-spin text-green-500 mb-4" />
                                        <p className="text-gray-500 font-medium">Membaca file Excel...</p>
                                    </div>
                                ) : parsedData.length > 0 && (
                                    <div className="flex-1 overflow-hidden border border-[#E5E5E5] rounded-lg flex flex-col min-h-[300px]">
                                        <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-[#fcfcfc] border-b border-[#E5E5E5] sticky top-0 z-10 shadow-sm text-gray-500 font-bold uppercase tracking-wider">
                                                    <tr>
                                                        <th className="p-3 whitespace-nowrap">Tanggal</th>
                                                        <th className="p-3 whitespace-nowrap">Jam</th>
                                                        <th className="p-3 whitespace-nowrap">Nopol</th>
                                                        <th className="p-3 whitespace-nowrap">Nama</th>
                                                        <th className="p-3 whitespace-nowrap">Telp</th>
                                                        <th className="p-3 whitespace-nowrap">Kendaraan</th>
                                                        <th className="p-3 whitespace-nowrap">Jenis</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#E5E5E5]">
                                                    {parsedData.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 whitespace-nowrap font-medium text-[#111111]">{row.tanggal}</td>
                                                            <td className="p-3 whitespace-nowrap text-red-600 font-bold">{row.jam}</td>
                                                            <td className="p-3 whitespace-nowrap font-mono font-bold text-[#111111]">{row.nopol}</td>
                                                            <td className="p-3 whitespace-nowrap text-[#111111]">{row.nama}</td>
                                                            <td className="p-3 whitespace-nowrap text-[#111111]">{row.telp}</td>
                                                            <td className="p-3 whitespace-nowrap text-[#111111] font-medium">{row.kendaraan}</td>
                                                            <td className="p-3 whitespace-nowrap">
                                                                <span className="bg-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-700">{row.jenis}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-[#E5E5E5] bg-gray-50 flex justify-end gap-3 shrink-0">
                        <button
                            onClick={closeAndReset}
                            disabled={isUploading}
                            className="px-4 py-2 font-bold text-sm text-gray-600 bg-white border border-[#E5E5E5] hover:bg-gray-50 rounded transition-colors disabled:opacity-50 shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={parsedData.length === 0 || isUploading || isParsing}
                            className="px-6 py-2 font-bold text-sm text-white bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Mengupload...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Mulai Upload Data
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
