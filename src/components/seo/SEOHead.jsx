import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    SITE_URL,
    BRAND_NAME,
    DEFAULT_OG_IMAGE,
    getBaseGraph
} from '../../utils/seoConfig';

/**
 * Komponen manajemen <head> dan Schema.org JSON-LD untuk setiap halaman SPA (Bab 2.4, Bab 4, Bab 5.9)
 */
const SEOHead = ({
    title,
    description,
    canonicalPath,
    image = DEFAULT_OG_IMAGE,
    ogType = 'website',
    noindex = false,
    schemaNodes = []
}) => {
    const location = useLocation();

    useEffect(() => {
        const fullTitle = title
            ? title.includes('Dwindo') || title.includes('PT Dwindo')
                ? title
                : `${title} | ${BRAND_NAME}`
            : `${BRAND_NAME} | Dealer Resmi & Bengkel 3S`;

        const cleanPath = canonicalPath || location.pathname || '/';
        const normalizedPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '');
        const canonicalUrl = normalizedPath.startsWith('http')
            ? normalizedPath
            : `${SITE_URL}${normalizedPath}`;

        const absImage = image
            ? image.startsWith('http')
                ? image
                : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`
            : DEFAULT_OG_IMAGE;

        const descText =
            description ||
            'Dealer Resmi 3S Mitsubishi Motors & Fuso PT Dwindo Berlian Samjaya di Bintaro, Radin Inten, dan Cakung. Cek harga OTR terbaru, promo kredit, booking service online, & asisten AI DINA 24/7.';

        const robotsValue = noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large';

        // 1. Update document.title
        document.title = fullTitle;

        // Helper untuk update/buat meta tag
        const setMetaTag = (attrName, attrValue, content) => {
            if (!content) return;
            let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrName, attrValue);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        setMetaTag('name', 'description', descText);
        setMetaTag('name', 'robots', robotsValue);

        // Open Graph
        setMetaTag('property', 'og:type', ogType);
        setMetaTag('property', 'og:site_name', BRAND_NAME);
        setMetaTag('property', 'og:locale', 'id_ID');
        setMetaTag('property', 'og:title', fullTitle);
        setMetaTag('property', 'og:description', descText);
        setMetaTag('property', 'og:url', canonicalUrl);
        setMetaTag('property', 'og:image', absImage);

        // Twitter Card
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', fullTitle);
        setMetaTag('name', 'twitter:description', descText);
        setMetaTag('name', 'twitter:url', canonicalUrl);
        setMetaTag('name', 'twitter:image', absImage);

        // Canonical Link
        let canonicalEl = document.head.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
            canonicalEl = document.createElement('link');
            canonicalEl.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', canonicalUrl);

        // JSON-LD Schema.org @graph (Bab 5.1 & 5.9)
        const ssrSchema = document.getElementById('ssr-schema-ld');
        if (ssrSchema) {
            ssrSchema.remove();
        }

        let ldScript = document.getElementById('spa-schema-ld');
        if (!ldScript) {
            ldScript = document.createElement('script');
            ldScript.id = 'spa-schema-ld';
            ldScript.type = 'application/ld+json';
            document.head.appendChild(ldScript);
        }

        const graph = [...getBaseGraph(), ...(Array.isArray(schemaNodes) ? schemaNodes : [])];
        ldScript.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': graph
        });

        return () => {
            const existing = document.getElementById('spa-schema-ld');
            if (existing) {
                existing.remove();
            }
        };
    }, [title, description, canonicalPath, image, ogType, noindex, schemaNodes, location.pathname]);

    return null;
};

export default SEOHead;

