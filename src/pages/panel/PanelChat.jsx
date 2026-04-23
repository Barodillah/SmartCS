import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Clock, Globe, Monitor, Smartphone, Tablet, X, Search, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../../utils/constants';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CHAT_API_BASE = 'https://csdwindo.com/api/chat';

// Markdown parser
const parseMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-[11px]">$1</code>');
    html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="ml-4 list-disc text-[12px]">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[12px]">$1</li>');
    html = html.replace(/\n/g, '<br />');
    return html;
};

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
    
    // Detail view state
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

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
                            <button 
                                onClick={() => setSelectedSession(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
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
                                        return (
                                        <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`max-w-[85%] p-3.5 text-[13px] leading-relaxed shadow-sm ${
                                                    msg.sender_type === 'user'
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
                                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanMessage(msg.message)) }}
                                                    />
                                                )}
                                            </div>
                                            {coords && (
                                                <div className="max-w-[85%] mt-1">
                                                    <LocationMap lat={coords.lat} lng={coords.lng} />
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

        </div>
    );
};

export default PanelChat;
