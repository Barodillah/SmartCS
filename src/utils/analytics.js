/**
 * SmartCS — SPA Pageview & Conversion Tracking Utility (Bab 13 Panduan)
 * Mendukung Google Analytics 4 (window.gtag / window.dataLayer) & pencatatan konversi dengan source_page.
 */

export const trackPageView = (path, title) => {
    if (typeof window === 'undefined') return;
    const pagePath = path || window.location.pathname;
    const pageTitle = title || document.title;

    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: pageTitle,
            page_location: window.location.href
        });
    } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: 'page_view',
            page_path: pagePath,
            page_title: pageTitle
        });
    }
};

export const trackConversion = (eventName, params = {}) => {
    if (typeof window === 'undefined') return;
    const payload = {
        source_page: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...params
    };

    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
    } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            event: eventName,
            ...payload
        });
    }
};

