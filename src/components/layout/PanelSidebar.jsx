import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    MessageSquare, 
    CalendarCheck, 
    CarFront, 
    Users, 
    AlertTriangle, 
    Wrench, 
    UserCog,
    BookOpen,
    ChevronDown,
    X
} from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const PanelSidebar = ({ isOpen, setIsOpen }) => {
    const [knowledgeOpen, setKnowledgeOpen] = useState(false);

    const navigations = [
        { name: 'Dashboard', path: '/panel', icon: <LayoutDashboard size={18} />, exact: true },
        { name: 'Chat History', path: '/panel/chat', icon: <MessageSquare size={18} /> },
        { name: 'Booking Service', path: '/panel/booking', icon: <CalendarCheck size={18} /> },
        { name: 'Test Drive', path: '/panel/test-drive', icon: <CarFront size={18} /> },
        { name: 'Prospect', path: '/panel/prospect', icon: <Users size={18} /> },
        { name: 'Emergency', path: '/panel/emergency', icon: <AlertTriangle size={18} /> },
        { name: 'Sparepart', path: '/panel/sparepart', icon: <Wrench size={18} /> },
        { name: 'Users', path: '/panel/users', icon: <UserCog size={18} /> },
    ];

    const knowledgeSubMenu = [
        { name: 'Price List', path: '/panel/knowledge/price-list' },
        { name: 'Promo', path: '/panel/knowledge/promo' },
        { name: 'Fitur', path: '/panel/knowledge/fitur' },
        { name: 'Service', path: '/panel/knowledge/service' },
    ];

    return (
        <aside 
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] text-gray-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E60012] flex items-center justify-center text-white font-display font-bold" style={{ clipPath: ANGULAR_CLIP }}>
                        CS
                    </div>
                    <span className="font-display font-bold text-white tracking-widest uppercase text-sm">Dashboard</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Sidebar Links */}
            <div className="py-6 px-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
                {navigations.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.exact}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                                isActive 
                                    ? 'bg-[#E60012] text-white' 
                                    : 'hover:bg-white/5 hover:text-white relative group'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                {/* Dropdown Knowledge */}
                <div>
                    <button
                        onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium transition-colors hover:bg-white/5 hover:text-white group"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={18} />
                            <span>Knowledge</span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${knowledgeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {knowledgeOpen && (
                        <div className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-1">
                            {knowledgeSubMenu.map((sub) => (
                                <NavLink
                                    key={sub.name}
                                    to={sub.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded text-[13px] font-medium transition-colors ${
                                            isActive 
                                                ? 'text-[#E60012] bg-[#E60012]/10' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {sub.name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default PanelSidebar;
