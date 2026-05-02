import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    Search,
    CalendarCheck,
    CarFront,
    Users,
    AlertTriangle,
    Wrench,
    UserCog,
    BookOpen,
    ChevronDown,
    ShieldAlert,
    X,
    Package,
    FileText,
    LogOut,
    Database,
    ChevronLeft,
    ChevronRight,
    Menu,
    BrainCircuit
} from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const WhatsappIcon = ({ size = 18, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
);

const PanelSidebar = ({ isOpen, setIsOpen, isMinimized, setIsMinimized }) => {
    const [knowledgeOpen, setKnowledgeOpen] = useState(false);
    const [warrantyOpen, setWarrantyOpen] = useState(false);
    const [pdiOpen, setPdiOpen] = useState(false);
    const [badgeCounts, setBadgeCounts] = useState({});
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const prevPathRef = React.useRef(location.pathname);
    const isMinimizedRef = React.useRef(isMinimized);
    useEffect(() => { isMinimizedRef.current = isMinimized; }, [isMinimized]);

    useEffect(() => {
        // Only auto-unminimize if we just navigated AWAY from whatsapp
        if (prevPathRef.current === '/panel/whatsapp' && location.pathname !== '/panel/whatsapp' && isMinimizedRef.current) {
            setIsMinimized(false);
        }
        prevPathRef.current = location.pathname;
    }, [location.pathname, setIsMinimized]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch lead badge counts
                const res = await fetch('https://csdwindo.com/api/chat/lead.php?action=count_new');
                const data = await res.json();
                
                // Fetch whatsapp konfirmasi counts
                const waRes = await fetch('https://csdwindo.com/api/panel/wa_followup.php?tab=konfirmasi');
                const waData = await waRes.json();

                let newCounts = {};
                if (data.status) {
                    newCounts = { ...data.data };
                }
                if (waData.status) {
                    newCounts['whatsapp'] = waData.data ? waData.data.length : 0;
                }
                
                setBadgeCounts(newCounts);
            } catch (err) {
                console.error('Failed to fetch badge counts:', err);
            }
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    const navigations = [
        { name: 'Dashboard', path: '/panel', icon: <LayoutDashboard size={18} />, exact: true },
        { name: 'Chat History', path: '/panel/chat', icon: <MessageSquare size={18} /> },
        { name: 'Booking Service', label: 'booking', path: '/panel/booking', icon: <CalendarCheck size={18} /> },
        { name: 'Data Booking', label: 'data_booking', path: '/panel/data-booking', icon: <Database size={18} /> },
        { name: 'Test Drive', label: 'test_drive', path: '/panel/test-drive', icon: <CarFront size={18} />, roles: ['admin'], division: 'sales' },
        { name: 'Prospect', label: 'prospect', path: '/panel/prospect', icon: <Users size={18} />, roles: ['admin'], division: 'sales' },
        { name: 'Emergency', label: 'emergency', path: '/panel/emergency', icon: <AlertTriangle size={18} />, roles: ['admin'], division: 'service' },
        { name: 'Sparepart', label: 'sparepart', path: '/panel/sparepart', icon: <Wrench size={18} />, roles: ['admin'], division: 'service' },
        { name: 'Aksesoris', label: 'aksesoris', path: '/panel/aksesoris', icon: <Package size={18} />, roles: ['admin'], division: 'service' },
        { name: 'Complaint', label: 'complaint', path: '/panel/complaint', icon: <ShieldAlert size={18} /> },
        { name: 'Sales Survey', label: 'sales_survey', path: '/panel/sales-survey', icon: <FileText size={18} />, roles: ['admin'], division: 'sales' },
        { name: 'Artikel', path: '/panel/artikel', icon: <FileText size={18} />, roles: ['admin'] },
        { name: 'Panel Whatsapp', label: 'whatsapp', path: '/panel/whatsapp', icon: <WhatsappIcon size={18} /> },
        { name: 'AI Churn Analysis', path: '/panel/churn-prediction', icon: <BrainCircuit size={18} />, roles: ['admin'] },
        { name: 'Users', path: '/panel/users', icon: <UserCog size={18} />, roles: ['admin'] },
    ];

    const filteredNavigations = navigations.filter(item => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        if (user.role === 'pkl') {
            return item.name === 'Dashboard' || item.name === 'Panel Whatsapp' || item.name === 'Data Booking';
        }

        // Cek jika item hanya untuk admin
        if (item.roles && item.roles.includes('admin') && !item.division) {
            return false;
        }

        // Cek pembatasan divisi untuk staff
        if (item.division && user.role === 'staff') {
            return user.divisi === item.division;
        }

        return true;
    });

    const knowledgeSubMenu = [
        { name: 'Price List', path: '/panel/knowledge/price-list' },
        { name: 'Promo', path: '/panel/knowledge/promo' },
        { name: 'Fitur', path: '/panel/knowledge/fitur' },
        { name: 'Service', path: '/panel/knowledge/service' },
    ];

    const warrantySubMenu = [
        { name: 'MMKSI', path: '/panel/warranty/mmksi' },
        { name: 'KTB', path: '/panel/warranty/ktb' },
    ];

    const pdiSubMenu = [
        { name: 'MMKSI', path: '/panel/data-pdi/mmksi' },
        { name: 'KTB', path: '/panel/data-pdi/ktb' },
    ];

    const effectiveIsMinimized = isMinimized && !isMobile;

    const sidebarWidth = effectiveIsMinimized ? 'lg:w-20 w-64' : 'w-64';

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-[999] lg:z-[999] lg:relative ${sidebarWidth} bg-[#111111] text-gray-300 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Sidebar Header */}
            <div className={`h-16 flex items-center ${effectiveIsMinimized ? 'justify-center' : 'justify-between'} px-4 lg:px-6 border-b border-white/10 transition-all duration-300 overflow-hidden`}>
                {!effectiveIsMinimized && (
                    <div className="flex items-center gap-3">
                        <div className="min-w-8 w-8 h-8 bg-[#E60012] flex items-center justify-center text-white font-display font-bold" style={{ clipPath: ANGULAR_CLIP }}>
                            CS
                        </div>
                        <span className="font-display font-bold text-white tracking-widest uppercase text-sm whitespace-nowrap overflow-hidden transition-all duration-300">Dashboard</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="hidden lg:flex text-gray-400 hover:text-white p-1">
                        {effectiveIsMinimized ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar Links */}
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                <div className={`py-6 px-4 flex-1 ${effectiveIsMinimized ? 'overflow-visible' : 'overflow-y-auto'} space-y-1`}>
                    {filteredNavigations.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors relative group ${isActive
                                    ? 'bg-[#E60012] text-white'
                                    : 'hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <div className="min-w-[18px] flex items-center justify-center">
                                    {item.icon}
                                </div>
                                {!effectiveIsMinimized && <span className="whitespace-nowrap transition-all duration-300">{item.name}</span>}
                            </div>
                            {item.label && badgeCounts[item.label] > 0 && (
                                <span className={`bg-[#E60012] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${effectiveIsMinimized ? 'absolute top-1 right-1 px-1.5' : 'ml-auto'}`}>
                                    {!effectiveIsMinimized ? badgeCounts[item.label] : badgeCounts[item.label] > 9 ? '9+' : badgeCounts[item.label]}
                                </span>
                            )}
                            
                            {/* Tooltip */}
                            {effectiveIsMinimized && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-[#222222] text-white text-sm whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-xl border border-white/10 flex items-center shadow-black/50">
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#222222] border-b border-l border-white/10 transform rotate-45"></div>
                                    <span className="font-bold tracking-wide">{item.name}</span>
                                </div>
                            )}
                        </NavLink>
                    ))}

                    {/* Dropdown Cek Warranty */}
                    {(user?.role === 'admin' || user?.role === 'pkl' || (user?.role === 'staff' && user?.divisi === 'sales')) && (
                        <div>
                            <button
                                onClick={() => setWarrantyOpen(!warrantyOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium transition-colors hover:bg-white/5 hover:text-white group relative"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="min-w-[18px] flex items-center justify-center">
                                        <Search size={18} />
                                    </div>
                                    {!effectiveIsMinimized && <span className="whitespace-nowrap transition-all duration-300">Cek Warranty</span>}
                                </div>
                                {!effectiveIsMinimized && <ChevronDown size={14} className={`transition-transform duration-200 ${warrantyOpen ? 'rotate-180' : ''}`} />}
                                {/* Tooltip */}
                                {effectiveIsMinimized && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-[#222222] text-white text-sm whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-xl border border-white/10 flex items-center shadow-black/50">
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#222222] border-b border-l border-white/10 transform rotate-45"></div>
                                        <span className="font-bold tracking-wide">Cek Warranty</span>
                                    </div>
                                )}
                            </button>
                            {warrantyOpen && !effectiveIsMinimized && (
                                <div className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-1">
                                    {warrantySubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.name}
                                            to={sub.path}
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded text-[13px] font-medium transition-colors ${isActive
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
                    )}

                    {/* Dropdown Data PDI */}
                    {(user?.role === 'admin' || user?.role === 'pkl' || (user?.role === 'staff' && user?.divisi === 'sales')) && (
                        <div>
                            <button
                                onClick={() => setPdiOpen(!pdiOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium transition-colors hover:bg-white/5 hover:text-white group relative"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="min-w-[18px] flex items-center justify-center">
                                        <Database size={18} />
                                    </div>
                                    {!effectiveIsMinimized && <span className="whitespace-nowrap transition-all duration-300">Data PDI</span>}
                                </div>
                                {!effectiveIsMinimized && <ChevronDown size={14} className={`transition-transform duration-200 ${pdiOpen ? 'rotate-180' : ''}`} />}
                                {/* Tooltip */}
                                {effectiveIsMinimized && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-[#222222] text-white text-sm whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-xl border border-white/10 flex items-center shadow-black/50">
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#222222] border-b border-l border-white/10 transform rotate-45"></div>
                                        <span className="font-bold tracking-wide">Data PDI</span>
                                    </div>
                                )}
                            </button>
                            {pdiOpen && !effectiveIsMinimized && (
                                <div className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-1">
                                    {pdiSubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.name}
                                            to={sub.path}
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded text-[13px] font-medium transition-colors ${isActive
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
                    )}

                    {/* Dropdown Knowledge */}
                    {user?.role === 'admin' && (
                        <div>
                            <button
                                onClick={() => setKnowledgeOpen(!knowledgeOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium transition-colors hover:bg-white/5 hover:text-white group relative"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="min-w-[18px] flex items-center justify-center">
                                        <BookOpen size={18} />
                                    </div>
                                    {!effectiveIsMinimized && <span className="whitespace-nowrap transition-all duration-300">Knowledge</span>}
                                </div>
                                {!effectiveIsMinimized && <ChevronDown size={14} className={`transition-transform duration-200 ${knowledgeOpen ? 'rotate-180' : ''}`} />}
                                {/* Tooltip */}
                                {effectiveIsMinimized && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-[#222222] text-white text-sm whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-xl border border-white/10 flex items-center shadow-black/50">
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#222222] border-b border-l border-white/10 transform rotate-45"></div>
                                        <span className="font-bold tracking-wide">Knowledge</span>
                                    </div>
                                )}
                            </button>
                            {knowledgeOpen && !effectiveIsMinimized && (
                                <div className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-1">
                                    {knowledgeSubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.name}
                                            to={sub.path}
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2 rounded text-[13px] font-medium transition-colors ${isActive
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
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#111111] shrink-0">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('admin_token');
                            sessionStorage.removeItem('admin_user');
                            window.location.href = '/panel';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors text-gray-400 hover:bg-white/5 hover:text-white group relative"
                    >
                        <div className="min-w-[18px] flex items-center justify-center">
                            <LogOut size={18} className="group-hover:text-[#E60012] transition-colors" />
                        </div>
                        {!effectiveIsMinimized && <span className="whitespace-nowrap transition-all duration-300">Logout</span>}
                        {/* Tooltip */}
                        {effectiveIsMinimized && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-[#222222] text-white text-sm whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-xl border border-white/10 flex items-center shadow-black/50">
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#222222] border-b border-l border-white/10 transform rotate-45"></div>
                                <span className="font-bold tracking-wide">Logout</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default PanelSidebar;
