import React from 'react';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import FeaturedModels from '../components/sections/FeaturedModels';
import VirtualCSHub from '../components/sections/VirtualCSHub';
import Advantage from '../components/sections/Advantage';
import GoogleReviews from '../components/sections/GoogleReviews';
import Updates from '../components/sections/Updates';
import ContextualFAQ from '../components/sections/ContextualFAQ';
import SEOHead from '../components/seo/SEOHead';
import { getAutoDealerGraphNodes, getFaqNode, PRICE_LIST_FAQS, BOOKING_FAQS } from '../utils/seoConfig';

const HOME_FAQS = [
    ...PRICE_LIST_FAQS.slice(0, 2),
    ...BOOKING_FAQS.slice(0, 2)
];

const Home = () => {
    return (
        <main>
            <SEOHead
                title="Mitsubishi Motors Dwindo Bintaro — Dealer Resmi 3S, Harga OTR & Booking Service"
                description="Dealer resmi 3S Mitsubishi Motors & Mitsubishi Fuso PT Dwindo Berlian Samjaya (Dwindo Bintaro, Radin Inten, Cakung). Cek daftar harga OTR Jabodetabek terbaru, simulasi kredit, aksesoris resmi, dan booking service online."
                canonicalPath="/"
                schemaNodes={[
                    ...getAutoDealerGraphNodes(),
                    getFaqNode(HOME_FAQS)
                ]}
            />
            <Hero />
            <Services />
            <FeaturedModels />
            <VirtualCSHub />
            <Advantage />
            <GoogleReviews />
            <Updates />
            <ContextualFAQ
                title="Pertanyaan Populer Seputar Mitsubishi Dwindo"
                subtitle="Informasi langsung mengenai harga OTR Jabodetabek, promo kredit, dan layanan bengkel resmi 3S."
                faqs={HOME_FAQS}
            />
        </main>
    );
};

export default Home;
