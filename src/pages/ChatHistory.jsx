import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, ArrowLeft, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANGULAR_CLIP } from '../utils/constants';

const CHAT_API_BASE = 'https://csdwindo.com/api/chat';

// Markdown parser (simplified for history view)
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

const ChatHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    // Load closed sessions
    useEffect(() => {
        const fetchSessions = async () => {
            const closedIds = JSON.parse(localStorage.getItem('dina_closed_sessions') || '[]');
            if (closedIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${CHAT_API_BASE}/session.php?action=list&ids=${closedIds.join(',')}`);
                const data = await res.json();
                if (data.status && data.data) {
                    setSessions(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
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

    // Scroll to bottom when messages load
    useEffect(() => {
        if (selectedSession && !loadingMessages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loadingMessages, selectedSession]);

    const removeSession = (e, sessionId) => {
        e.stopPropagation();
        const closedIds = JSON.parse(localStorage.getItem('dina_closed_sessions') || '[]');
        const updated = closedIds.filter(id => id !== sessionId);
        localStorage.setItem('dina_closed_sessions', JSON.stringify(updated));
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    // Format Date forcing Asia/Jakarta Timezone
    const formatDate = (dateStr) => {
        const utcDateStr = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
        const d = new Date(utcDateStr);
        return d.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMessageTime = (dateStr) => {
        const utcDateStr = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
        const d = new Date(utcDateStr);
        return d.toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit'
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

    return (
        <div className="min-h-screen bg-[#F5F5F5] pt-24 pb-16">
            <div className="max-w-[800px] mx-auto px-6">
                {/* Header Page */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-[12px] font-display font-bold text-gray-400 hover:text-[#E60012] tracking-wider uppercase transition-colors mb-4"
                    >
                        <ArrowLeft size={14} />
                        Kembali
                    </Link>
                    <h1 className="font-display font-bold text-[28px] text-[#111111] tracking-tight">
                        Chat History
                    </h1>
                    <p className="text-[14px] text-gray-500 mt-1">
                        Riwayat percakapan Anda dengan DINA
                    </p>
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="bg-white border border-[#E5E5E5] p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4" style={{ clipPath: ANGULAR_CLIP }}>
                            <MessageSquare size={24} className="text-gray-300" />
                        </div>
                        <h3 className="font-display font-bold text-[16px] text-[#111111] mb-2">Belum Ada Riwayat</h3>
                        <p className="text-[13px] text-gray-500">
                            Percakapan yang sudah selesai akan tersimpan di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => openSession(session)}
                                className="bg-white border border-[#E5E5E5] p-5 text-left transition-all hover:border-[#E60012] hover:shadow-lg group flex flex-col justify-between"
                                style={{ borderRadius: '0 20px 0 20px' }}
                            >
                                <div className="w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-[#F5F5F5] group-hover:bg-[#E60012] transition-colors flex items-center justify-center flex-shrink-0" style={{ clipPath: ANGULAR_CLIP }}>
                                            <MessageSquare size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div
                                            onClick={(e) => removeSession(e, session.id)}
                                            className="text-gray-300 hover:text-red-500 p-2 cursor-pointer transition-colors"
                                            title="Hapus riwayat"
                                        >
                                            <Trash2 size={16} />
                                        </div>
                                    </div>
                                    <h4 className="font-display font-bold text-[14px] text-[#111111] line-clamp-2 leading-relaxed mb-4">
                                        {session.first_user_message || 'Percakapan DINA'}
                                    </h4>
                                </div>
                                <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-[#E5E5E5]">
                                    <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                                        <Clock size={12} className="text-[#E60012]" />
                                        {formatDate(session.created_at)}
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-400 bg-[#F5F5F5] px-2 py-1 rounded">
                                        {session.total_messages} Pesan
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN CHAT MODAL */}
            <AnimatePresence>
                {selectedSession && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 w-full h-full z-[100] bg-white flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#111111] p-4 flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                                    <MessageSquare size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-[16px] tracking-widest uppercase">Riwayat Chat</h3>
                                    <p className="text-[12px] text-gray-400">
                                        {formatDate(selectedSession.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="w-10 h-10 flex items-center justify-center text-white hover:text-[#E60012] hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#F5F5F5]">
                            <div className="max-w-[800px] mx-auto w-full space-y-4">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E60012] border-t-transparent"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center pb-6">
                                            <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-500 text-[11px] font-bold tracking-wider uppercase rounded-full">
                                                Awal Percakapan
                                            </span>
                                        </div>
                                        {messages.filter(msg => msg.sender_type !== 'system').map((msg) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`max-w-[90%] md:max-w-[75%] p-4 text-[14px] leading-relaxed shadow-sm ${
                                                        msg.sender_type === 'user'
                                                            ? 'bg-[#111111] text-white'
                                                            : msg.sender_type === 'cs'
                                                                ? 'bg-[#E60012] text-white'
                                                                : 'bg-white text-[#444444] border border-[#E5E5E5]'
                                                    }`}
                                                    style={{ borderRadius: msg.sender_type === 'user' ? '16px 16px 0 16px' : '0 16px 16px 16px' }}
                                                >
                                                    {msg.sender_type === 'cs' && (
                                                        <div className="text-[10px] font-bold opacity-70 mb-1.5 uppercase tracking-wider">CS Agent</div>
                                                    )}
                                                    {msg.sender_type === 'user' ? (
                                                        msg.message
                                                    ) : (
                                                        <div
                                                            className="prose-sm prose-neutral [&_strong]:font-bold [&_em]:italic [&_a]:text-[#E60012] [&_a]:underline [&_hr]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E60012] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:rounded [&_code]:text-[12px] [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:text-[13px] [&_li]:mb-1"
                                                            dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanMessage(msg.message)) }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-medium text-gray-400 mt-1.5 px-2">
                                                    {formatMessageTime(msg.created_at)}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </div>

                        {/* Footer (Read Only Indicator) */}
                        <div className="bg-white border-t border-[#E5E5E5] p-4 text-center">
                            <p className="text-[12px] text-gray-500 font-medium">
                                Sesi obrolan ini sudah ditutup. <span className="hidden sm:inline">Ini adalah mode baca-saja.</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatHistory;
