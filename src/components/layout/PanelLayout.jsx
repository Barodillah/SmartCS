import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, User, Mail, KeyRound } from 'lucide-react';
import PanelSidebar from './PanelSidebar';
import PanelHeader from './PanelHeader';
import { ANGULAR_CLIP } from '../../utils/constants';

const PanelLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login', 'forgot', 'reset'
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Initial check from sessionStorage
    useEffect(() => {
        const token = sessionStorage.getItem('admin_token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Dynamic Title for Panel Pages
    useEffect(() => {
        const isPanel = window.location.pathname.startsWith('/panel') || window.location.hostname.startsWith('panel.');
        if (!isPanel) return;

        let title = 'Panel Dashboard - CSDwindo';
        const path = location.pathname;

        if (path.includes('/chat')) title = 'Chat History - Panel CSDwindo';
        else if (path.includes('/whatsapp')) title = 'Panel WhatsApp - CSDwindo';
        else if (path.includes('/data-booking')) title = 'Data Booking - Panel CSDwindo';
        else if (path.includes('/booking')) title = 'Booking Service - Panel CSDwindo';
        else if (path.includes('/test-drive')) title = 'Test Drive - Panel CSDwindo';
        else if (path.includes('/prospect')) title = 'Prospect Leads - Panel CSDwindo';
        else if (path.includes('/emergency')) title = 'Emergency Center - Panel CSDwindo';
        else if (path.includes('/sparepart')) title = 'Sparepart Requests - Panel CSDwindo';
        else if (path.includes('/aksesoris')) title = 'Aksesoris Requests - Panel CSDwindo';
        else if (path.includes('/complaint')) title = 'Customer Complaint - Panel CSDwindo';
        else if (path.includes('/sales-survey')) title = 'Sales Survey - Panel CSDwindo';
        else if (path.includes('/artikel')) title = 'Artikel - Panel CSDwindo';
        else if (path.includes('/users')) title = 'Users - Panel CSDwindo';
        else if (path.includes('/warranty')) title = 'Warranty - Panel CSDwindo';
        else if (path.includes('/data-pdi')) title = 'Data PDI - Panel CSDwindo';
        else if (path.includes('/churn-prediction')) title = 'AI Insights - Panel CSDwindo';
        else if (path.includes('/knowledge')) title = 'Knowledge - Panel CSDwindo';

        document.title = title;
    }, [location.pathname]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('https://csdwindo.com/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.status) {
                sessionStorage.setItem('admin_token', data.data.token);
                sessionStorage.setItem('admin_user', JSON.stringify(data.data.user));
                setIsAuthenticated(true);
            } else {
                setError(data.message || 'Login gagal');
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await fetch('https://csdwindo.com/api/auth/forgot-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.status) {
                setSuccessMsg(data.message);
                setAuthMode('reset');
            } else {
                setError(data.message || 'Gagal mengirim OTP');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await fetch('https://csdwindo.com/api/auth/reset-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword })
            });
            const data = await res.json();
            if (data.status) {
                setSuccessMsg(data.message);
                setAuthMode('login');
                setPassword('');
                setOtp('');
                setNewPassword('');
            } else {
                setError(data.message || 'Gagal reset password');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6 selection:bg-[#E60012] selection:text-white">
                <div className="bg-white max-w-sm w-full p-8 border border-[#E5E5E5] shadow-xl text-center">
                    <div className="w-16 h-16 bg-[#111111] flex items-center justify-center mx-auto mb-6" style={{ clipPath: ANGULAR_CLIP }}>
                        <Lock size={24} className="text-white" />
                    </div>
                    
                    <h1 className="font-display font-bold text-2xl text-[#111111] tracking-wide mb-2">
                        {authMode === 'login' && 'RESTRICTED AREA'}
                        {authMode === 'forgot' && 'LUPA PASSWORD'}
                        {authMode === 'reset' && 'RESET PASSWORD'}
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        {authMode === 'login' && 'Silakan masuk untuk mengakses Admin Dashboard.'}
                        {authMode === 'forgot' && 'Masukkan email terdaftar Anda untuk menerima OTP.'}
                        {authMode === 'reset' && 'Masukkan kode OTP dan password baru Anda.'}
                    </p>

                    {error && <div className="bg-red-50 text-[#E60012] p-3 mb-4 text-sm border border-red-200">{error}</div>}
                    {successMsg && <div className="bg-green-50 text-green-700 p-3 mb-4 text-sm border border-green-200">{successMsg}</div>}

                    {authMode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-[#111111] focus:outline-none transition-colors"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="relative">
                                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-[#111111] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#E60012] text-white flex items-center justify-center gap-2 py-3 font-display font-bold text-sm tracking-wider uppercase hover:bg-[#B5000F] transition-colors disabled:opacity-50"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                <span>{loading ? 'Memproses...' : 'Masuk Panel'}</span>
                                <ArrowRight size={16} />
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                                className="text-sm text-gray-500 hover:text-[#111111] mt-4"
                            >
                                Lupa Password?
                            </button>
                        </form>
                    )}

                    {authMode === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-[#111111] focus:outline-none transition-colors"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#111111] text-white flex items-center justify-center gap-2 py-3 font-display font-bold text-sm tracking-wider uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                <span>{loading ? 'Memproses...' : 'Kirim OTP'}</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                                className="text-sm text-gray-500 hover:text-[#111111] mt-4"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}

                    {authMode === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Kode OTP (6 digit)" 
                                    className="w-full px-4 py-2 border border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-center tracking-widest font-bold"
                                    required
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <div className="relative">
                                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Password Baru" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-[#111111] focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#E60012] text-white flex items-center justify-center gap-2 py-3 font-display font-bold text-sm tracking-wider uppercase hover:bg-[#B5000F] transition-colors disabled:opacity-50"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                <span>{loading ? 'Memproses...' : 'Reset Password'}</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                                className="text-sm text-gray-500 hover:text-[#111111] mt-4"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="min-h-screen bg-[#F5F5F5] font-body text-[#444444] selection:bg-[#E60012] selection:text-white flex overflow-hidden">
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <PanelSidebar 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
                isMinimized={isMinimized} 
                setIsMinimized={setIsMinimized} 
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <PanelHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F5F5] p-6 lg:p-8">
                    <Outlet context={{ isMinimized, setIsMinimized }} />
                </main>
            </div>
        </div>
    );
};

export default PanelLayout;
