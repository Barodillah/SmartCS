import React, { useState, useEffect } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const PanelHeader = ({ sidebarOpen, setSidebarOpen }) => {
    const [userData, setUserData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (e) {}
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const timeStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date).replace(/\./g, ':');

        const dateStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);

        return `${timeStr} ${dateStr}`;
    };

    // Helper untuk membuat inisial nama
    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 z-30">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-[#444444] hover:text-[#E60012] transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                    <span className="font-display font-bold text-[#111111] uppercase tracking-wider text-sm">
                        {formatTime(currentTime)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:text-[#E60012] transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E60012] rounded-full border border-white"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-[#E5E5E5]">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[13px] font-bold text-[#111111]">{userData ? userData.name : 'CS Admin'}</span>
                        <span className="text-[11px] text-gray-500 uppercase">
                            {userData ? `${userData.role} ${userData.divisi ? ` - ${userData.divisi}` : ''}` : 'Dwindo Bintaro'}
                        </span>
                    </div>
                    <div className="w-9 h-9 bg-[#111111] flex items-center justify-center text-white cursor-pointer hover:bg-[#E60012] transition-colors text-sm font-bold tracking-wider" style={{ clipPath: ANGULAR_CLIP }}>
                        {userData ? getInitials(userData.name) : <User size={18} />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PanelHeader;
