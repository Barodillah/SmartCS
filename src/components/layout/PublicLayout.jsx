import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import VirtualCS from '../VirtualCS';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-white font-body text-[#444444] selection:bg-[#E60012] selection:text-white">
            <Navigation />
            <Outlet />
            <Footer />
            <VirtualCS />
        </div>
    );
};

export default PublicLayout;
