import React from 'react';
import { Database } from 'lucide-react';

const DataPDIKTB = () => {
    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]"><Database size={24} /></div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Data PDI KTB</h1>
                        <p className="text-gray-500 text-sm mt-1">Upload dan Kelola Data PDI KTB.</p>
                    </div>
                </div>
            </div>
            <div className="bg-white border border-[#E5E5E5] flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Database size={48} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700">Fitur Dalam Development</h2>
                <p className="text-gray-500 mt-2 max-w-md">Modul Data PDI KTB saat ini sedang dalam tahap pengembangan dan akan segera tersedia.</p>
            </div>
        </div>
    );
};

export default DataPDIKTB;
