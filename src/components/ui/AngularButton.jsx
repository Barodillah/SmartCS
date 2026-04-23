import React from 'react';
import { ANGULAR_CLIP } from '../../utils/constants';

const AngularButton = ({ children, variant = 'primary', className = '', onClick }) => {
    const styles = {
        primary: `bg-[#E60012] text-white hover:bg-[#B5000F]`,
        secondary: `bg-transparent border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white`,
        white: `bg-white text-[#111111] hover:bg-[#E5E5E5]`,
    };

    return (
        <button
            onClick={onClick}
            style={{ clipPath: ANGULAR_CLIP }}
            className={`relative overflow-hidden px-8 py-3 font-display font-bold uppercase tracking-[0.2em] text-[12px] transition-all duration-300 ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default AngularButton;
