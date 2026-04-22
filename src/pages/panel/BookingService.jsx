import React from 'react';
import { CalendarCheck } from 'lucide-react';

const BookingService = () => {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Booking Service</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola permohonan booking service dari client.</p>
            </div>
            
            <div className="bg-white p-12 border border-[#E5E5E5] text-center border-dashed">
                <CalendarCheck size={32} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400">Data tabel booking akan tampil di sini.</p>
            </div>
        </div>
    );
};

export default BookingService;
