import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackConversion } from '../../utils/analytics';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Tunda sedikit agar document.title dari SEOHead sudah diperbarui
        const timer = setTimeout(() => {
            trackPageView(pathname, document.title);
        }, 50);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        const handleDinaTrack = (e) => {
            trackConversion('open_dina_chat', {
                prompt_message: e?.detail?.message || 'trigger_button'
            });
        };
        window.addEventListener('openDinaChat', handleDinaTrack);
        return () => window.removeEventListener('openDinaChat', handleDinaTrack);
    }, []);

    return null;
}
