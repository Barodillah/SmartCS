import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomDatePicker = ({ currentDate, onSelect, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date(currentDate || new Date()));
    
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const blanks = Array.from({length: firstDay === 0 ? 6 : firstDay - 1}, (_, i) => i); // Monday start
    
    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    
    const isSelected = (day) => {
        if (!currentDate) return false;
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const currentD = new Date(currentDate);
        return d.toDateString() === currentD.toDateString();
    };

    const isToday = (day) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return d.toDateString() === new Date().toDateString();
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-[#E5E5E5] rounded-lg shadow-xl p-4 z-50 w-72"
        >
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                    <ChevronLeft size={16} />
                </button>
                <div className="font-bold text-sm text-[#111111]">
                    {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </div>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                    <ChevronRight size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`blank-${b}`} className="h-8"></div>)}
                {days.map(day => {
                    const selected = isSelected(day);
                    const today = isToday(day);
                    return (
                        <button
                            type="button"
                            key={day}
                            onClick={() => {
                                const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                const localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                onSelect(localDateStr);
                            }}
                            className={`h-8 w-full rounded text-sm flex items-center justify-center transition-colors ${
                                selected ? 'bg-[#E60012] text-white font-bold' : 
                                today ? 'bg-red-50 text-[#E60012] font-bold border border-red-100' : 
                                'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default CustomDatePicker;
