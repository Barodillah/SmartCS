import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';

// Public Views (eagerly loaded for instant navigation & zero chunk-waterfall on public/booking domains)
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import DealerLocation from './pages/DealerLocation';
import Aksesoris from './pages/Aksesoris';
import BookingService from './pages/BookingService';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import FAQ from './pages/FAQ';
import OfficialChannels from './pages/OfficialChannels';
import NotFound from './pages/NotFound';
import ChatHistory from './pages/ChatHistory';
import Cetak from './pages/Cetak';
import CustomerSurvey from './pages/CustomerSurvey';

// Lazy-loaded Standalone & Admin/CS Panel Views (isolated from public bundle)
const WaBlast = lazy(() => import('./pages/WaBlast'));
const SA = lazy(() => import('./pages/SA'));
const PanelLayout = lazy(() => import('./components/layout/PanelLayout'));
const Dashboard = lazy(() => import('./pages/panel/Dashboard'));
const PanelChat = lazy(() => import('./pages/panel/PanelChat'));
const PanelWhatsapp = lazy(() => import('./pages/panel/PanelWhatsapp'));
const LeadManager = lazy(() => import('./pages/panel/LeadManager'));
const ArticleManager = lazy(() => import('./pages/panel/ArticleManager'));
const ArticleEditor = lazy(() => import('./pages/panel/ArticleEditor'));
const CommentManager = lazy(() => import('./pages/panel/CommentManager'));
const KnowledgeHub = lazy(() =>
    import('./pages/panel/GenericPages').then(m => ({ default: m.KnowledgeHub }))
);
const Users = lazy(() => import('./pages/panel/Users'));
const PanelPriceList = lazy(() => import('./pages/panel/PanelPriceList'));
const PanelPromo = lazy(() => import('./pages/panel/PanelPromo'));
const DataBookingLegacy = lazy(() => import('./pages/panel/DataBookingLegacy'));
const AnalisisBooking = lazy(() => import('./pages/panel/AnalisisBooking'));
const SalesSurvey = lazy(() => import('./pages/panel/SalesSurvey'));
const SalesSurveyKTB = lazy(() => import('./pages/panel/SalesSurveyKTB'));
const NPSReport = lazy(() => import('./pages/panel/NPSReport'));
const NPSUpload = lazy(() => import('./pages/panel/NPSUpload'));
const NPSDetail = lazy(() => import('./pages/panel/NPSDetail'));
const NPSAnalysis = lazy(() => import('./pages/panel/NPSAnalysis'));
const WarrantyMMKSI = lazy(() => import('./pages/panel/WarrantyMMKSI'));
const WarrantyKTB = lazy(() => import('./pages/panel/WarrantyKTB'));
const DataPDIMMKSI = lazy(() => import('./pages/panel/DataPDIMMKSI'));
const DataPDIKTB = lazy(() => import('./pages/panel/DataPDIKTB'));
const PDIUpload = lazy(() => import('./pages/panel/PDIUpload'));
const ChurnPrediction = lazy(() => import('./pages/panel/ChurnPrediction'));
const PotensiBooking = lazy(() => import('./pages/panel/PotensiBooking'));
const KonsumenBooking = lazy(() => import('./pages/panel/KonsumenBooking'));
const Dissatisfaction = lazy(() => import('./pages/panel/Dissatisfaction'));
const SalesSurveyAnalysis = lazy(() => import('./pages/panel/SalesSurveyAnalysis'));
const SalesRate = lazy(() => import('./pages/panel/SalesRate'));

const RouteFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#E60012] rounded-full animate-spin" />
    </div>
);

const panelChildRoutes = (
    <>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<PanelChat />} />
        <Route path="whatsapp" element={<PanelWhatsapp />} />
        <Route path="booking" element={<LeadManager label="booking" title="Booking Service" desc="Kelola permohonan booking service dari client." icon="CalendarCheck" />} />
        <Route path="data-booking" element={<DataBookingLegacy />} />
        <Route path="analisis-booking" element={<AnalisisBooking />} />
        <Route path="konsumen-booking" element={<KonsumenBooking />} />
        <Route path="test-drive" element={<LeadManager label="test_drive" title="Test Drive" desc="Kelola permohonan penjadwalan test drive kendaraan." icon="CarFront" />} />
        <Route path="prospect" element={<LeadManager label="prospect" title="Prospect Leads" desc="Data potensi prospek pembelian kendaraan dari chatbot." icon="Users" />} />
        <Route path="emergency" element={<LeadManager label="emergency" title="Emergency Center" desc="Daftar laporan layanan darurat (Mogok / Kecelakaan)." icon="AlertTriangle" />} />
        <Route path="sparepart" element={<LeadManager label="sparepart" title="Sparepart Requests" desc="Permintaan ketersediaan dan harga suku cadang." icon="Wrench" />} />
        <Route path="aksesoris" element={<LeadManager label="aksesoris" title="Aksesoris Requests" desc="Permintaan aksesoris kendaraan." icon="Package" />} />
        <Route path="complaint" element={<LeadManager label="complaint" title="Customer Complaint" desc="Kelola keluhan dan masukan dari pelanggan." icon="ShieldAlert" />} />
        <Route path="question" element={<LeadManager label="question" title="CS Question" desc="Pertanyaan lanjutan customer ke CS." icon="MessageSquare" />} />
        <Route path="sales-survey/mmksi" element={<SalesSurvey />} />
        <Route path="sales-survey/ktb" element={<SalesSurveyKTB />} />
        <Route path="nps-report">
            <Route index element={<NPSReport />} />
            <Route path="upload" element={<NPSUpload />} />
        </Route>
        <Route path="nps-detail" element={<NPSDetail />} />
        <Route path="nps-analysis" element={<NPSAnalysis />} />
        <Route path="analysis/sales-survey" element={<SalesSurveyAnalysis />} />
        <Route path="sales-rate" element={<SalesRate />} />
        <Route path="warranty/mmksi" element={<WarrantyMMKSI />} />
        <Route path="warranty/ktb" element={<WarrantyKTB />} />
        <Route path="data-pdi/mmksi" element={<DataPDIMMKSI />} />
        <Route path="data-pdi/ktb" element={<DataPDIKTB />} />
        <Route path="data-pdi/ktb/upload" element={<PDIUpload />} />
        <Route path="artikel" element={<ArticleManager />} />
        <Route path="artikel/create" element={<ArticleEditor />} />
        <Route path="artikel/edit/:id" element={<ArticleEditor />} />
        <Route path="artikel/komentar/:id" element={<CommentManager />} />
        <Route path="users" element={<Users />} />
        <Route path="churn-prediction" element={<ChurnPrediction />} />
        <Route path="potensi-booking" element={<PotensiBooking />} />
        <Route path="dissatisfaction" element={<Dissatisfaction />} />

        {/* Knowledge base sub-routes */}
        <Route path="knowledge/price-list" element={<PanelPriceList />} />
        <Route path="knowledge/promo" element={<PanelPromo />} />
        <Route path="knowledge/fitur" element={<KnowledgeHub title="Fitur" />} />
        <Route path="knowledge/service" element={<KnowledgeHub title="Service" />} />
    </>
);

function App() {
    // Detect if we are on specific subdomains
    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isBookingSubdomain = hostname.startsWith('booking.');
    const isPanelSubdomain = hostname.startsWith('panel.');

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    {isPanelSubdomain ? (
                        <>
                            {/* On panel.csdwindo.com: support both /* and /panel/* directly in PanelLayout */}
                            <Route path="/" element={<PanelLayout />}>
                                {panelChildRoutes}
                            </Route>
                            <Route path="/panel" element={<PanelLayout />}>
                                {panelChildRoutes}
                            </Route>
                            <Route path="/sa" element={<SA />} />
                            <Route path="/wa-blast" element={<WaBlast />} />
                            <Route path="/cetak" element={<Cetak />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    ) : (
                        <>
                            {/* Public Website Routes */}
                            <Route element={<PublicLayout />}>
                                <Route path="/" element={isBookingSubdomain ? <BookingService /> : <Home />} />
                                <Route path="/price-list" element={<PriceList />} />
                                <Route path="/pricelist" element={<Navigate to="/price-list" replace />} />
                                <Route path="/lokasi-dealer" element={<DealerLocation />} />
                                <Route path="/dealer" element={<Navigate to="/lokasi-dealer" replace />} />
                                <Route path="/aksesoris" element={<Aksesoris />} />
                                <Route path="/booking" element={<BookingService />} />
                                <Route path="/faq" element={<FAQ />} />
                                <Route path="/kanal-resmi" element={<OfficialChannels />} />
                                <Route path="/tentang-kami" element={<Navigate to="/kanal-resmi" replace />} />
                                <Route path="/artikel" element={<ArticleList />} />
                                <Route path="/artikel/:id" element={<ArticleDetail />} />
                                <Route path="/chat-history" element={<ChatHistory />} />
                                <Route path="/cetak" element={<Cetak />} />
                                <Route path="/survey/:uuid" element={<CustomerSurvey />} />
                                {/* 404 Catch-All Route */}
                                <Route path="*" element={<NotFound />} />
                            </Route>

                            {/* Standalone Route for SA */}
                            <Route path="/sa" element={<SA />} />

                            {/* Standalone Route for WA Blast Public */}
                            <Route path="/wa-blast" element={<WaBlast />} />

                            {/* Admin/CS Panel Routes */}
                            <Route path="/panel" element={<PanelLayout />}>
                                {panelChildRoutes}
                            </Route>
                        </>
                    )}
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
