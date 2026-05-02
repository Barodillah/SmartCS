import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';

// Public Views
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import DealerLocation from './pages/DealerLocation';
import ChatHistory from './pages/ChatHistory';
import Aksesoris from './pages/Aksesoris';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import Cetak from './pages/Cetak';

// Panel Views
import PanelLayout from './components/layout/PanelLayout';
import Dashboard from './pages/panel/Dashboard';
import PanelChat from './pages/panel/PanelChat';
import PanelWhatsapp from './pages/panel/PanelWhatsapp';
import LeadManager from './pages/panel/LeadManager';
import ArticleManager from './pages/panel/ArticleManager';
import ArticleEditor from './pages/panel/ArticleEditor';
import CommentManager from './pages/panel/CommentManager';
import { KnowledgeHub } from './pages/panel/GenericPages';
import Users from './pages/panel/Users';
import PanelPriceList from './pages/panel/PanelPriceList';
import DataBookingLegacy from './pages/panel/DataBookingLegacy';
import SalesSurvey from './pages/panel/SalesSurvey';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/price-list" element={<PriceList />} />
                    <Route path="/lokasi-dealer" element={<DealerLocation />} />
                    <Route path="/aksesoris" element={<Aksesoris />} />
                    <Route path="/chat-history" element={<ChatHistory />} />
                    <Route path="/artikel" element={<ArticleList />} />
                    <Route path="/artikel/:id" element={<ArticleDetail />} />
                    <Route path="/cetak" element={<Cetak />} />
                </Route>

                {/* Admin/CS Panel Routes */}
                <Route path="/panel" element={<PanelLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="chat" element={<PanelChat />} />
                    <Route path="whatsapp" element={<PanelWhatsapp />} />
                    <Route path="booking" element={<LeadManager label="booking" title="Booking Service" desc="Kelola permohonan booking service dari client." icon="CalendarCheck" />} />
                    <Route path="data-booking" element={<DataBookingLegacy />} />
                    <Route path="test-drive" element={<LeadManager label="test_drive" title="Test Drive" desc="Kelola permohonan penjadwalan test drive kendaraan." icon="CarFront" />} />
                    <Route path="prospect" element={<LeadManager label="prospect" title="Prospect Leads" desc="Data potensi prospek pembelian kendaraan dari chatbot." icon="Users" />} />
                    <Route path="emergency" element={<LeadManager label="emergency" title="Emergency Center" desc="Daftar laporan layanan darurat (Mogok / Kecelakaan)." icon="AlertTriangle" />} />
                    <Route path="sparepart" element={<LeadManager label="sparepart" title="Sparepart Requests" desc="Permintaan ketersediaan dan harga suku cadang." icon="Wrench" />} />
                    <Route path="aksesoris" element={<LeadManager label="aksesoris" title="Aksesoris Requests" desc="Permintaan aksesoris kendaraan." icon="Package" />} />
                    <Route path="complaint" element={<LeadManager label="complaint" title="Customer Complaint" desc="Kelola keluhan dan masukan dari pelanggan." icon="ShieldAlert" />} />
                    <Route path="sales-survey" element={<SalesSurvey />} />
                    <Route path="artikel" element={<ArticleManager />} />
                    <Route path="artikel/create" element={<ArticleEditor />} />
                    <Route path="artikel/edit/:id" element={<ArticleEditor />} />
                    <Route path="artikel/komentar/:id" element={<CommentManager />} />
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
