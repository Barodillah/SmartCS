import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const CustomMonthPicker = ({ currentMonth, onSelect, onClose, showAllOption, align = 'center' }) => {
    // currentMonth format: "YYYY-MM" or ""
    const now = new Date();
    const initialYear = currentMonth ? parseInt(currentMonth.split('-')[0]) : now.getFullYear();
    const [viewYear, setViewYear] = useState(initialYear);

    const selectedMonth = currentMonth || '';

    const handleSelect = (monthIndex) => {
        const m = String(monthIndex + 1).padStart(2, '0');
        onSelect(`${viewYear}-${m}`);
    };

    const isSelected = (monthIndex) => {
        const m = String(monthIndex + 1).padStart(2, '0');
        return selectedMonth === `${viewYear}-${m}`;
    };

    const isCurrent = (monthIndex) => {
        return viewYear === now.getFullYear() && monthIndex === now.getMonth();
    };

    let alignClasses = "left-1/2 -translate-x-1/2";
    if (align === 'right') {
        alignClasses = "right-0";
    } else if (align === 'left') {
        alignClasses = "left-0";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute top-full mt-2 bg-white border border-[#E5E5E5] rounded-lg shadow-xl p-4 z-50 w-64 ${alignClasses}`}
        >
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => setViewYear(viewYear - 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                    <ChevronLeft size={16} />
                </button>
                <div className="font-bold text-sm text-[#111111]">{viewYear}</div>
                <button type="button" onClick={() => setViewYear(viewYear + 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((name, index) => {
                    const selected = isSelected(index);
                    const current = isCurrent(index);
                    return (
                        <button
                            type="button"
                            key={name}
                            onClick={() => handleSelect(index)}
                            className={`py-2 px-1 rounded text-sm font-medium transition-colors ${
                                selected ? 'bg-[#E60012] text-white font-bold' :
                                current ? 'bg-red-50 text-[#E60012] font-bold border border-red-100' :
                                'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
            {showAllOption && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                    <button
                        type="button"
                        onClick={() => onSelect('')}
                        className={`w-full py-2 px-1 rounded text-sm font-medium transition-colors ${!selectedMonth ? 'bg-[#111111] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Semua Data
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default CustomMonthPicker;
