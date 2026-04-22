import React from 'react';

const SectionTag = ({ children }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-[1px] bg-[#E60012]"></div>
        <span className="font-display font-bold text-[10px] tracking-[0.3em] text-[#E60012] uppercase">
            {children}
        </span>
    </div>
);

export default SectionTag;
