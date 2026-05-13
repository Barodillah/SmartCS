import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import VirtualCS from '../VirtualCS';

const PublicLayout = () => {
    const location = useLocation();
    const isSurveyPath = location.pathname.startsWith('/survey/');
    const isSurveyCompleted = new URLSearchParams(location.search).get('completed') === '1';

    // Sembunyikan VirtualCS saat di halaman survey, kecuali sudah selesai
    const hideVirtualCS = isSurveyPath && !isSurveyCompleted;

    return (
        <div className="min-h-screen bg-white font-body text-[#444444] selection:bg-[#E60012] selection:text-white">
            <Navigation />
            <Outlet />
            <Footer />
            {!hideVirtualCS && <VirtualCS />}
        </div>
    );
};

export default PublicLayout;
