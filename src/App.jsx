import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public Views
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import DealerLocation from './pages/DealerLocation';
import ChatHistory from './pages/ChatHistory';

// Panel Views
import PanelLayout from './components/layout/PanelLayout';
import Dashboard from './pages/panel/Dashboard';
import PanelChat from './pages/panel/PanelChat';
import BookingService from './pages/panel/BookingService';
import { TestDrive, Prospect, Emergency, Sparepart, Users, KnowledgeHub } from './pages/panel/GenericPages';
import PanelPriceList from './pages/panel/PanelPriceList';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/price-list" element={<PriceList />} />
                    <Route path="/lokasi-dealer" element={<DealerLocation />} />
                    <Route path="/chat-history" element={<ChatHistory />} />
                </Route>

                {/* Admin/CS Panel Routes */}
                <Route path="/panel" element={<PanelLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="chat" element={<PanelChat />} />
                    <Route path="booking" element={<BookingService />} />
                    <Route path="test-drive" element={<TestDrive />} />
                    <Route path="prospect" element={<Prospect />} />
                    <Route path="emergency" element={<Emergency />} />
                    <Route path="sparepart" element={<Sparepart />} />
                    <Route path="users" element={<Users />} />
                    
                    {/* Knowledge base sub-routes */}
                    <Route path="knowledge/price-list" element={<PanelPriceList />} />
                    <Route path="knowledge/promo" element={<KnowledgeHub title="Promo" />} />
                    <Route path="knowledge/fitur" element={<KnowledgeHub title="Fitur" />} />
                    <Route path="knowledge/service" element={<KnowledgeHub title="Service" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
