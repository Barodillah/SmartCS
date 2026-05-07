import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ currentDate, onSelect, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date(currentDate || new Date()));
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
    
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => (viewDate.getFullYear() - 5) + i);
    
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

    const handleMonthSelect = (monthIndex) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setViewMode('days');
    };

    const handleYearSelect = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode('months');
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl p-4 z-50 w-72"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-gray-50 -m-4 p-3 rounded-t-xl border-b border-gray-100">
                <button 
                    type="button" 
                    onClick={viewMode === 'days' ? handlePrevMonth : () => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))} 
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all active:scale-90"
                >
                    <ChevronLeft size={16} />
                </button>
                
                <button 
                    type="button"
                    onClick={() => {
                        if (viewMode === 'days') setViewMode('months');
                        else if (viewMode === 'months') setViewMode('years');
                        else setViewMode('days');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                    <span className="font-bold text-sm text-[#111111]">
                        {viewMode === 'years' 
                            ? `${years[0]} - ${years[years.length-1]}`
                            : viewMode === 'months' 
                                ? viewDate.getFullYear()
                                : viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                        }
                    </span>
                    <CalendarIcon size={12} className="text-gray-400" />
                </button>

                <button 
                    type="button" 
                    onClick={viewMode === 'days' ? handleNextMonth : () => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))} 
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all active:scale-90"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            
            <div className="mt-4">
                <AnimatePresence mode="wait">
                    {viewMode === 'days' && (
                        <motion.div
                            key="days"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
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
                                            className={`h-8 w-full rounded-lg text-sm flex items-center justify-center transition-all ${
                                                selected ? 'bg-[#E60012] text-white font-bold shadow-lg shadow-red-500/30' : 
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
                    )}

                    {viewMode === 'months' && (
                        <motion.div
                            key="months"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-3 gap-2"
                        >
                            {months.map((month, index) => (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => handleMonthSelect(index)}
                                    className={`py-3 rounded-xl text-xs font-bold transition-all ${
                                        viewDate.getMonth() === index 
                                            ? 'bg-[#E60012] text-white shadow-lg shadow-red-500/20' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {month.substring(0, 3)}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {viewMode === 'years' && (
                        <motion.div
                            key="years"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-3 gap-2"
                        >
                            {years.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => handleYearSelect(year)}
                                    className={`py-3 rounded-xl text-xs font-bold transition-all ${
                                        viewDate.getFullYear() === year 
                                            ? 'bg-[#E60012] text-white shadow-lg shadow-red-500/20' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CustomDatePicker;
