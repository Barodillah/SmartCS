import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import VirtualCS from './components/VirtualCS';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import DealerLocation from './pages/DealerLocation';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-white font-body text-[#444444] selection:bg-[#E60012] selection:text-white">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/price-list" element={<PriceList />} />
                    <Route path="/lokasi-dealer" element={<DealerLocation />} />
                </Routes>
                <Footer />
                <VirtualCS />
            </div>
        </BrowserRouter>
    );
}

export default App;
