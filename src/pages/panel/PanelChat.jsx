import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Clock, Globe, Monitor, Smartphone, Tablet, X, Search, MapPin, Navigation, ExternalLink, Trash2, Bot, RefreshCw } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../../utils/constants';
import { parseChatMarkdown } from '../../utils/markdownParser';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CHAT_API_BASE = 'https://csdwindo.com/api/chat';


const DeviceIcon = ({ type }) => {
    if (type === 'mobile') return <Smartphone size={14} className="text-gray-400" />;
    if (type === 'tablet') return <Tablet size={14} className="text-gray-400" />;
    return <Monitor size={14} className="text-gray-400" />;
};

// Extract coordinates from message text
const extractCoordinates = (text) => {
    if (!text) return null;
    // Match patterns like: -6.2719, 106.6999 or -6.2719,106.6999
    const match = text.match(/(-?\d+\.\d+)[,\s]+\s*(-?\d+\.\d+)/);
    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        // Basic validation for lat/lng range
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
        }
    }
    return null;
};

// Leaflet map component for coordinate display
const LocationMap = ({ lat, lng }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false
        }).setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const icon = L.divIcon({
            html: `<div style="width:24px;height:24px;background:#E60012;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            className: ''
        });

        L.marker([lat, lng], { icon }).addTo(map);
        mapInstanceRef.current = map;

        return () => { map.remove(); mapInstanceRef.current = null; };
    }, [lat, lng]);

    return (
        <div className="mt-2 overflow-hidden border border-[#E5E5E5] bg-white" style={{ borderRadius: '8px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '180px' }} />
            <div className="p-2 flex items-center justify-between gap-2 border-t border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <MapPin size={12} className="text-[#E60012]" />
                    <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                </div>
                <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-[#E60012] hover:underline flex items-center gap-1"
                >
                    <Navigation size={10} /> Buka Maps
                </a>
            </div>
        </div>
    );
};

const PanelChat = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Detail view state
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    // Delete state
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [user, setUser] = useState(null);

    // AI Summary state
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) { }
        }
    }, []);

    // Fetch all sessions (admin list)
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${CHAT_API_BASE}/session.php?action=admin_list`);
                const data = await res.json();
                if (data.status && data.data) {
                    setSessions(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch admin sessions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
        // Optional: polling every 30 seconds for new chats
        const interval = setInterval(fetchSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle deep-linking from LeadManager
    useEffect(() => {
        if (location.state?.openSessionId && sessions.length > 0) {
            const sessionToOpen = sessions.find(s => s.id === location.state.openSessionId);
            if (sessionToOpen && (!selectedSession || selectedSession.id !== sessionToOpen.id)) {
                openSession(sessionToOpen);
                // Clear the state so it doesn't reopen on refresh
                window.history.replaceState({}, document.title);
            } else if (!sessionToOpen && !loading) {
                // If session is old and not in list, fetch it directly
                fetch(`${CHAT_API_BASE}/message.php?action=history&session_id=${location.state.openSessionId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status) {
                            setSelectedSession({ id: location.state.openSessionId, status: 'unknown', ip_address: 'From Lead', created_at: new Date().toISOString() });
                            setMessages(data.data?.messages || []);
                        }
                    })
                    .catch(console.error);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, sessions, loading]);

    const openSession = async (session) => {
        setSelectedSession(session);
        setLoadingMessages(true);
        setMessages([]);

        try {
            const res = await fetch(`${CHAT_API_BASE}/message.php?action=history&session_id=${session.id}`);
            const data = await res.json();
            if (data.status && data.data?.messages) {
                setMessages(data.data.messages);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${CHAT_API_BASE}/session.php?action=delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionToDelete.id })
            });
            const data = await res.json();
            if (data.status) {
                setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
                if (selectedSession?.id === sessionToDelete.id) {
                    setSelectedSession(null);
                }
            } else {
                alert('Gagal menghapus: ' + data.message);
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
            alert('Terjadi kesalahan saat menghapus sesi.');
        } finally {
            setIsDeleting(false);
            setSessionToDelete(null);
        }
    };

    // AI Summary Handler
    const handleGenerateSummary = async (forceRegenerate = false) => {
        if (!selectedSession || messages.length === 0) return;
        setIsSummaryModalOpen(true);

        const cacheKey = `chat_summary_${selectedSession.id}`;
        if (!forceRegenerate) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setSummaryText(cached);
                return;
            }
        }

        setIsGeneratingSummary(true);
        setSummaryText('');

        try {
            // Filter system messages and format for AI
            const chatLog = messages
                .filter(msg => msg.sender_type !== 'system')
                .map(msg => `${msg.sender_type === 'user' ? 'User' : 'CS'}: ${msg.message}`)
                .join('\n');

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "xiaomi/mimo-v2-flash",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Buat ringkasan percakapan yang jelas dan singkat (maksimal 3-4 kalimat). Fokus pada masalah pelanggan dan status penyelesaian. Gunakan bahasa Indonesia yang profesional."
                        },
                        {
                            "role": "user",
                            "content": chatLog
                        }
                    ]
                })
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                const summary = data.choices[0].message.content;
                setSummaryText(summary);
                localStorage.setItem(cacheKey, summary);
            } else {
                setSummaryText("Gagal menghasilkan ringkasan.");
            }
        } catch (error) {
            console.error("AI Summary Error:", error);
            setSummaryText("Terjadi kesalahan saat menghubungi API.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Scroll to bottom
    useEffect(() => {
        if (selectedSession && !loadingMessages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loadingMessages, selectedSession]);

    // Formatters
    const formatDate = (dateStr) => {
        const utcDateStr = dateStr?.includes('Z') ? dateStr : dateStr?.replace(' ', 'T') + 'Z';
        if (!utcDateStr) return '-';
        const d = new Date(utcDateStr);
        return d.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatMessageTime = (dateStr) => {
        const utcDateStr = dateStr?.includes('Z') ? dateStr : dateStr?.replace(' ', 'T') + 'Z';
        if (!utcDateStr) return '';
        const d = new Date(utcDateStr);
        return d.toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const cleanMessage = (text) => {
        return text?.split('\n')
            .filter(line => !line.match(/^💬\s*/))
            .join('\n')
            .replace(/\[EMERGENCY\]/g, '')
            .replace(/\[WHATSAPP\]/g, '')
            .replace(/\[SAVE_LEAD:(\w+)\]([\s\S]*?)\[\/SAVE_LEAD\]/g, '')
            .trim() || '';
    };

    // Filtered sessions
    const filteredSessions = sessions.filter(s =>
        s.first_user_message?.toLowerCase().includes(search.toLowerCase()) ||
        s.id.includes(search) ||
        s.ip_address?.includes(search)
    );

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)]">
            {/* Header Area */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Semua Sesi Chat</h1>
                    <p className="text-gray-500 text-sm mt-1">Pantau percakapan chatbot dari semua pengunjung.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Cari pesan atau IP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012] transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
            </div>

            {/* Main Table/List Area */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-1">Status</div>
                    <div className="col-span-4">Konteks Percakapan</div>
                    <div className="col-span-2">Pesan Terakhir</div>
                    <div className="col-span-2">Jml Pesan</div>
                    <div className="col-span-3">Info User</div>
                </div>

                {/* Table Body */}
                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-20">
                            <MessageSquare className="mx-auto text-gray-300 mb-4" size={32} />
                            <p className="text-gray-500 text-sm">Belum ada sesi chat yang terekam.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {filteredSessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => openSession(session)}
                                    className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                >
                                    {/* Mobile Only: Status + Time Header */}
                                    <div className="flex justify-between items-center mb-2 md:hidden">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {session.status}
                                        </span>
                                        <span className="text-[11px] text-gray-400">{formatDate(session.last_message_at || session.created_at)}</span>
                                    </div>

                                    <div className="col-span-1 hidden md:block">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <div className="col-span-4 mb-2 md:mb-0 pr-4">
                                        <h4 className="text-[13px] font-bold text-[#111111] line-clamp-2">
                                            {session.first_user_message || '(Hanya melihat sapaan bot)'}
                                        </h4>
                                    </div>
                                    <div className="col-span-2 hidden md:flex items-center gap-2 text-[12px] text-gray-500">
                                        <Clock size={12} />
                                        <span>{formatDate(session.last_message_at || session.created_at)}</span>
                                    </div>
                                    <div className="col-span-2 text-[12px] text-gray-500 mb-2 md:mb-0">
                                        <span className="font-bold text-[#111111]">{session.total_messages}</span> pesan interaksi
                                    </div>
                                    <div className="col-span-3 flexflex-col gap-1 text-[11px] text-gray-400">
                                        <div className="flex items-center gap-1.5 line-clamp-1">
                                            <DeviceIcon type={session.device_type} />
                                            <span>{session.browser || 'Unknown'} / {session.os || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Globe size={12} />
                                            <span>{session.ip_address || 'Unknown IP'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Read-Only Chat Viewer Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] z-[110] flex flex-col border-l border-[#E5E5E5]"
                    >
                        {/* Detail Header */}
                        <div className="h-16 bg-[#111111] flex items-center justify-between px-6 shrink-0">
                            <div>
                                <h3 className="font-display font-bold text-white text-[15px] tracking-wide">
                                    Detail Percakapan
                                </h3>
                                <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${selectedSession.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                    <span className="uppercase">{selectedSession.status}</span>
                                    <span>•</span>
                                    <span>{selectedSession.ip_address}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {user?.role === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => handleGenerateSummary()}
                                            className="text-gray-400 hover:text-[#00B2A9] transition-colors"
                                            title="AI Summary"
                                        >
                                            <Bot size={18} />
                                        </button>
                                        <button
                                            onClick={() => setSessionToDelete(selectedSession)}
                                            className="text-gray-400 hover:text-[#E60012] transition-colors"
                                            title="Hapus Sesi"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Tutup"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto bg-[#F5F5F5] p-6 space-y-6">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center pb-2">
                                        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-500 text-[10px] font-bold tracking-wider uppercase rounded-full">
                                            {formatDate(selectedSession.created_at)}
                                        </span>
                                    </div>
                                    {messages.filter(msg => msg.sender_type !== 'system').map((msg) => {
                                        const coords = msg.sender_type === 'user' ? extractCoordinates(msg.message) : null;
                                        const leadRegex = /\[SAVE_LEAD:(\w+)\]([\s\S]*?)\[\/SAVE_LEAD\]/g;
                                        let leadMatch = leadRegex.exec(msg.message);
                                        let leadLabel = leadMatch ? leadMatch[1] : null;

                                        return (
                                            <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`max-w-[85%] p-3.5 text-[13px] leading-relaxed shadow-sm ${msg.sender_type === 'user'
                                                            ? 'bg-[#111111] text-white'
                                                            : msg.sender_type === 'cs'
                                                                ? 'bg-[#E60012] text-white'
                                                                : 'bg-white text-[#444444] border border-[#E5E5E5]'
                                                        }`}
                                                    style={{ borderRadius: msg.sender_type === 'user' ? '12px 12px 0 12px' : '0 12px 12px 12px' }}
                                                >
                                                    {msg.sender_type === 'cs' && (
                                                        <div className="text-[9px] font-bold opacity-70 mb-1 uppercase tracking-wider">You (CS Admin)</div>
                                                    )}
                                                    {msg.sender_type === 'user' ? (
                                                        msg.message
                                                    ) : (
                                                        <div
                                                            className="prose-sm prose-neutral [&_strong]:font-bold [&_em]:italic [&_a]:text-[#E60012] [&_a]:underline [&_hr]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E60012] [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-[11px] [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:text-[12px]"
                                                            dangerouslySetInnerHTML={{ __html: parseChatMarkdown(cleanMessage(msg.message)) }}
                                                        />
                                                    )}
                                                </div>
                                                {coords && (
                                                    <div className="max-w-[85%] mt-1">
                                                        <LocationMap lat={coords.lat} lng={coords.lng} />
                                                    </div>
                                                )}
                                                {leadLabel && (
                                                    <div className="max-w-[85%] mt-1">
                                                        <Link
                                                            to={`/panel/${leadLabel.replace('_', '-')}`}
                                                            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-[11px] font-bold uppercase tracking-wider hover:bg-green-100 transition-colors"
                                                        >
                                                            <span>Lead Terbuat: {leadLabel.replace('_', ' ')}</span>
                                                            <ExternalLink size={12} />
                                                        </Link>
                                                    </div>
                                                )}
                                                <div className="text-[10px] font-medium text-gray-400 mt-1 px-1">
                                                    {formatMessageTime(msg.created_at)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-2" />
                                </>
                            )}
                        </div>

                        {/* Input Area / Status Indicator */}
                        <div className="h-16 bg-white border-t border-[#E5E5E5] flex items-center justify-between px-6 shrink-0">
                            {selectedSession.status === 'active' ? (
                                <div className="text-xs text-[#E60012] font-medium">
                                    [Fitur CS Reply akan tersedia pada pembaruan berikutnya]
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 font-medium w-full text-center">
                                    Sesi telah ditutup. Mode baca-saja.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Backdrop overlay */}
            <AnimatePresence>
                {selectedSession && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/20 z-[100] backdrop-blur-sm"
                        onClick={() => setSelectedSession(null)}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {sessionToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isDeleting && setSessionToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-[#E60012]" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Hapus Sesi Chat?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus sesi chat ini? Semua pesan dalam sesi ini juga akan ikut terhapus permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setSessionToDelete(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded font-bold text-sm bg-gray-100 text-[#444444] hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteSession}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded font-bold text-sm bg-[#E60012] text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Ya, Hapus Sesi'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Summary Modal */}
            <AnimatePresence>
                {isSummaryModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isGeneratingSummary && setIsSummaryModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot size={32} className="text-[#00B2A9]" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Ringkasan AI</h3>

                            <div className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg text-left min-h-[100px] flex items-center justify-center">
                                {isGeneratingSummary ? (
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#00B2A9] border-t-transparent"></div>
                                        <span>Menghasilkan ringkasan...</span>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{summaryText}</p>
                                )}
                            </div>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    disabled={isGeneratingSummary}
                                    className="px-4 py-2 rounded font-bold text-sm bg-gray-100 text-[#444444] hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => handleGenerateSummary(true)}
                                    disabled={isGeneratingSummary}
                                    className="px-4 py-2 rounded font-bold text-sm bg-[#00B2A9] text-white hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw size={16} className={isGeneratingSummary ? 'animate-spin' : ''} />
                                    Generate Ulang
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PanelChat;
