import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import PanelSidebar from './PanelSidebar';
import PanelHeader from './PanelHeader';
import { ANGULAR_CLIP } from '../../utils/constants';

const PanelLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [error, setError] = useState(false);

    // Initial check from sessionStorage
    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth_temp');
        if (auth === '1066') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pinInput === '1066') {
            sessionStorage.setItem('admin_auth_temp', '1066');
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPinInput('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6 selection:bg-[#E60012] selection:text-white">
                <div className="bg-white max-w-sm w-full p-8 border border-[#E5E5E5] shadow-xl text-center">
                    <div className="w-16 h-16 bg-[#111111] flex items-center justify-center mx-auto mb-6" style={{ clipPath: ANGULAR_CLIP }}>
                        <Lock size={24} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-[#111111] tracking-wide mb-2">RESTRICTED AREA</h1>
                    <p className="text-gray-500 text-sm mb-8">Silakan masukkan PIN otorisasi untuk mengakses Admin Dashboard.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input 
                                type="password" 
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="Masukkan PIN..." 
                                className={`w-full text-center tracking-[0.5em] text-lg font-bold border-b-2 py-2 focus:outline-none transition-colors ${
                                    error ? 'border-[#E60012] text-[#E60012] placeholder-red-200' : 'border-gray-300 focus:border-[#111111]'
                                }`}
                                autoFocus
                            />
                            {error && <p className="text-[#E60012] text-xs mt-2 font-medium">PIN yang Anda masukkan salah!</p>}
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-[#E60012] text-white flex items-center justify-center gap-2 py-3 font-display font-bold text-sm tracking-wider uppercase hover:bg-[#B5000F] transition-colors"
                            style={{ clipPath: ANGULAR_CLIP }}
                        >
                            <span>Masuk Panel</span>
                            <ArrowRight size={16} />
                        </button>
                    </form>
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
            
            <PanelSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <PanelHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F5F5] p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PanelLayout;
