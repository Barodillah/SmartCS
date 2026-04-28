import React, { useState, useEffect } from 'react';
import { CalendarCheck, CarFront, Users, AlertTriangle, Wrench, ShieldAlert, Search, RefreshCw, X, MessageSquare, Phone, Copy, Check, ExternalLink, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://csdwindo.com/api/chat';

const iconMap = {
    CalendarCheck: <CalendarCheck size={24} />,
    CarFront: <CarFront size={24} />,
    Users: <Users size={24} />,
    AlertTriangle: <AlertTriangle size={24} />,
    Wrench: <Wrench size={24} />,
    ShieldAlert: <ShieldAlert size={24} />,
    Package: <Package size={24} />
};

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    followed_up: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
};

const STATUS_LABELS = {
    new: 'New',
    in_progress: 'In Progress',
    followed_up: 'Followed Up',
    completed: 'Completed',
    cancelled: 'Cancelled'
};

const LeadManager = ({ label, title, desc, icon }) => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    const [selectedLead, setSelectedLead] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [statusUpdate, setStatusUpdate] = useState('');
    const [notesUpdate, setNotesUpdate] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchLeads = async (page = 1) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'list',
                label: label,
                page: page,
                limit: pagination.limit
            });
            if (statusFilter) query.append('status', statusFilter);
            if (search) query.append('search', search);

            const res = await fetch(`${API_BASE}/lead.php?${query.toString()}`);
            const data = await res.json();
            if (data.status) {
                setLeads(data.data.leads);
                setPagination(prev => ({
                    ...prev,
                    page: data.data.page,
                    total: data.data.total,
                    totalPages: data.data.total_pages
                }));
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(1);
    }, [label, statusFilter]);

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

    const openLeadDetail = async (lead) => {
        setSelectedLead(lead);
        setStatusUpdate(lead.status);
        setNotesUpdate(lead.notes || '');
        setModalLoading(true);
        try {
            const res = await fetch(`${API_BASE}/lead.php?action=get&id=${lead.id}`);
            const data = await res.json();
            if (data.status) {
                setSelectedLead(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch lead detail:', err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateLead = async () => {
        if (!selectedLead) return;
        setUpdateLoading(true);
        try {
            const res = await fetch(`${API_BASE}/lead.php?action=update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedLead.id,
                    status: statusUpdate,
                    notes: notesUpdate
                })
            });
            const data = await res.json();
            if (data.status) {
                // Refresh list
                fetchLeads(pagination.page);
                showToast('Berhasil memperbarui lead.');
                
                // Tutup modal agar kembali ke halaman list utama
                setTimeout(() => {
                    setSelectedLead(null);
                }, 1000);
            } else {
                showToast('Gagal memperbarui lead: ' + (data.message || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error('Failed to update lead:', err);
            showToast('Gagal memperbarui lead.', 'error');
        } finally {
            setUpdateLoading(false);
        }
    };

    const formatWhatsAppText = (lead) => {
        const d = lead.data || {};
        let text = `*LEAD BARU - ${title.toUpperCase()}*\n\n`;
        text += `*Data Konsumen*\n`;
        text += `Nama: ${lead.customer_name || '-'}\n`;
        text += `No HP: ${lead.customer_phone || '-'}\n`;
        if (lead.vehicle_model) text += `Kendaraan: ${lead.vehicle_model}\n`;
        if (lead.customer_nopol) text += `Nopol: ${lead.customer_nopol}\n`;
        text += `\n*Detail Spesifik*\n`;

        switch(label) {
            case 'booking':
                text += `Jenis Service: ${d.service_type || '-'}\n`;
                text += `Jarak Tempuh (KM): ${d.service_km || '-'}\n`;
                text += `Jadwal: ${d.booking_date || '-'} jam ${d.booking_time || '-'}\n`;
                text += `Keluhan: ${d.keluhan || '-'}\n`;
                break;
            case 'test_drive':
                text += `Jadwal: ${d.preferred_date || '-'} jam ${d.preferred_time || '-'}\n`;
                text += `Lokasi Dealer: ${d.dealer_location || '-'}\n`;
                break;
            case 'prospect':
                text += `Minat Pembelian: ${d.interest_type || '-'}\n`;
                text += `Rencana Pembiayaan: ${d.financing_type || '-'}\n`;
                break;
            case 'emergency':
                text += `Keluhan/Kondisi: ${d.keluhan || '-'}\n`;
                text += `Detail Lokasi: ${d.address_detail || '-'}\n`;
                if (d.google_maps_url) text += `Maps: ${d.google_maps_url}\n`;
                else if (d.latitude && d.longitude) text += `Koordinat: ${d.latitude}, ${d.longitude}\n`;
                break;
            case 'sparepart':
            case 'aksesoris':
                text += `Order: ${d.is_ordering ? 'Ya' : 'Hanya Tanya'}\n`;
                if (d.items && Array.isArray(d.items)) {
                    d.items.forEach((item, i) => {
                        text += `- ${item.part_number ? item.part_number + ' - ' : ''}${item.part_name || item.item_name} (Rp ${item.harga_satuan || item.harga})\n`;
                    });
                }
                break;
            case 'complaint':
                text += `Kategori: ${d.complaint_category || '-'}\n`;
                if (d.sales_name) text += `Nama Sales: ${d.sales_name}\n`;
                text += `Detail: ${d.complaint_detail || '-'}\n`;
                break;
        }

        text += `\nDiperoleh pada: ${formatDate(lead.created_at)}\n`;
        text += `Status Sistem: ${STATUS_LABELS[lead.status] || lead.status}`;
        return text;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const directWhatsApp = (phone) => {
        if (!phone) return;
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
        const text = encodeURIComponent(`Halo Bpk/Ibu ${selectedLead?.customer_name || ''}, kami dari Mitsubishi Dwindo Bintaro...`);
        window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        {iconMap[icon] || <MessageSquare size={24} />}
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">{title}</h1>
                        <p className="text-gray-500 text-sm mt-1">{desc}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012] bg-white"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Cari nama, hp, nopol..." 
                            value={search}
                            onKeyDown={(e) => e.key === 'Enter' && fetchLeads(1)}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012]"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <button onClick={() => fetchLeads(1)} className="p-2 border border-[#E5E5E5] rounded hover:bg-gray-50 bg-white">
                        <RefreshCw size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-2">Tanggal</div>
                    <div className="col-span-3">Konsumen</div>
                    <div className="col-span-3">Kendaraan / Nopol</div>
                    <div className="col-span-2">Info</div>
                    <div className="col-span-2">Status</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto text-gray-300 mb-4 flex justify-center">{iconMap[icon] || <MessageSquare size={32} />}</div>
                            <p className="text-gray-500 text-sm">Belum ada data lead untuk filter ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {leads.map(lead => (
                                <div 
                                    key={lead.id} 
                                    onClick={() => openLeadDetail(lead)}
                                    className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                >
                                    <div className="col-span-2 text-[12px] text-gray-500 mb-2 md:mb-0">
                                        {formatDate(lead.created_at)}
                                    </div>
                                    <div className="col-span-3 mb-2 md:mb-0">
                                        <div className="font-bold text-[13px] text-[#111111]">{lead.customer_name || '-'}</div>
                                        <div className="text-[12px] text-gray-500">{lead.customer_phone || '-'}</div>
                                    </div>
                                    <div className="col-span-3 mb-2 md:mb-0 text-[12px]">
                                        <div className="text-[#111111]">{lead.vehicle_model || '-'}</div>
                                        <div className="text-gray-500 font-mono">{lead.customer_nopol || '-'}</div>
                                    </div>
                                    <div className="col-span-2 text-[11px] text-gray-400 line-clamp-2 pr-2">
                                        {/* Brief preview based on label */}
                                        {label === 'booking' && lead.data?.booking_date}
                                        {label === 'emergency' && lead.data?.keluhan}
                                        {label === 'complaint' && lead.data?.complaint_category}
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {STATUS_LABELS[lead.status] || lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Pagination (Simple) */}
                <div className="border-t border-[#E5E5E5] p-3 flex justify-between items-center text-xs text-gray-500 shrink-0 bg-white">
                    <span>Menampilkan halaman {pagination.page} dari {pagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.page <= 1}
                            onClick={() => fetchLeads(pagination.page - 1)}
                            className="px-3 py-1 border border-[#E5E5E5] rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button 
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => fetchLeads(pagination.page + 1)}
                            className="px-3 py-1 border border-[#E5E5E5] rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedLead(null)}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center shrink-0 bg-gray-50">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-[#111111] tracking-wide">Detail Lead: {title}</h3>
                                    <div className="text-xs text-gray-500 mt-1">ID: {selectedLead.id}</div>
                                </div>
                                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-[#E60012] transition-colors"><X size={24} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
                                {modalLoading && !selectedLead.recent_messages ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Left Col: Info & Form */}
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-[#E5E5E5] pb-1">Informasi Konsumen</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-gray-500 text-xs">Nama</div>
                                                        <div className="font-bold">{selectedLead.customer_name || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500 text-xs">No WhatsApp</div>
                                                        <div className="font-bold">{selectedLead.customer_phone || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500 text-xs">Kendaraan</div>
                                                        <div className="font-bold">{selectedLead.vehicle_model || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500 text-xs">No Polisi</div>
                                                        <div className="font-bold font-mono">{selectedLead.customer_nopol || '-'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-[#E5E5E5] pb-1">Detail Spesifik (JSON)</h4>
                                                <div className="bg-gray-50 p-4 rounded text-sm space-y-2 border border-gray-100">
                                                    {selectedLead.data ? Object.entries(selectedLead.data).map(([k, v]) => (
                                                        <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                                                            <span className="text-gray-500 w-1/3 break-words font-mono text-xs">{k}</span>
                                                            <span className="font-medium flex-1 break-words">
                                                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                                            </span>
                                                        </div>
                                                    )) : <span className="text-gray-400 italic">Tidak ada data tambahan</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">Update Progress</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs text-blue-600 mb-1">Status</label>
                                                        <select 
                                                            value={statusUpdate}
                                                            onChange={e => setStatusUpdate(e.target.value)}
                                                            className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400 bg-white"
                                                        >
                                                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                                <option key={k} value={k}>{v}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-blue-600 mb-1">Catatan Internal (Notes)</label>
                                                        <textarea 
                                                            value={notesUpdate}
                                                            onChange={e => setNotesUpdate(e.target.value)}
                                                            className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400 bg-white h-20 resize-none"
                                                            placeholder="Tambahkan catatan untuk tim..."
                                                        ></textarea>
                                                    </div>
                                                    <button 
                                                        onClick={handleUpdateLead}
                                                        disabled={updateLoading}
                                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors disabled:opacity-50"
                                                    >
                                                        {updateLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Col: Actions & Context */}
                                        <div className="w-full md:w-64 space-y-4 flex flex-col">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 border-b border-[#E5E5E5] pb-1">Quick Actions</h4>
                                            
                                            <button 
                                                onClick={() => copyToClipboard(formatWhatsAppText(selectedLead))}
                                                className="w-full flex items-center gap-2 p-3 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                                            >
                                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
                                                <span className="flex-1 font-medium">{copied ? 'Tersalin!' : 'Copy WA Format'}</span>
                                            </button>

                                            <button 
                                                onClick={() => directWhatsApp(selectedLead.customer_phone)}
                                                className="w-full flex items-center gap-2 p-3 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors text-left"
                                            >
                                                <Phone size={16} />
                                                <span className="flex-1 font-medium">Chat Konsumen</span>
                                                <ExternalLink size={12} className="opacity-50" />
                                            </button>

                                            <button 
                                                onClick={() => navigate('/panel/chat', { state: { openSessionId: selectedLead.session_id } })}
                                                className="w-full flex items-center gap-2 p-3 text-sm bg-[#111111] text-white rounded hover:bg-[#222222] transition-colors text-left"
                                            >
                                                <MessageSquare size={16} />
                                                <span className="flex-1 font-medium">Buka Chat Session</span>
                                                <ExternalLink size={12} className="opacity-50" />
                                            </button>

                                            {/* Recent Chat context preview */}
                                            <div className="mt-4 flex-1 flex flex-col border border-gray-200 rounded overflow-hidden">
                                                <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200">
                                                    Konteks Chat Terakhir
                                                </div>
                                                <div className="p-3 text-[11px] space-y-2 overflow-y-auto max-h-48 bg-white">
                                                    {selectedLead.recent_messages && selectedLead.recent_messages.length > 0 ? (
                                                        selectedLead.recent_messages.slice(-5).map((m, i) => (
                                                            <div key={i} className={`p-1.5 rounded ${m.sender_type === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-[#E60012]/10 text-[#E60012]'}`}>
                                                                <span className="font-bold">{m.sender_type === 'user' ? 'Konsumen' : 'Bot'}: </span>
                                                                {m.message.length > 60 ? m.message.substring(0,60)+'...' : m.message}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-400 italic text-center py-2">Tidak ada context chat</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        {toast.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadManager;
