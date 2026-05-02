import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Plus, Eye, Heart, MessageSquare, MoreVertical, X, Edit3, Trash2, Archive, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
    draft: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500'
};

const STATUS_LABELS = { draft: 'Draft', published: 'Published', archived: 'Archived' };

const CTA_LABELS = {
    booking: 'Booking Service',
    test_drive: 'Test Drive',
    prospect: 'Prospect',
    emergency: 'Emergency',
    sparepart: 'Sparepart',
    aksesoris: 'Aksesoris',
    complaint: 'Complaint',
    none: 'Tanpa CTA'
};

const CATEGORY_LABELS = {
    berita: 'Berita', kegiatan: 'Kegiatan', insight: 'Insight', promo: 'Promo', tips: 'Tips'
};

const ArticleManager = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const adminUser = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        if (adminUser.role !== 'admin') {
            navigate('/panel', { replace: true });
        }
    }, [navigate]);

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, type: '', article: null });

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleStatusChange = async (article, newStatus) => {
        try {
            const res = await fetch('https://csdwindo.com/api/artikel/update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article.id, status: newStatus })
            });
            const json = await res.json();
            if (json.status) {
                showToast(newStatus === 'published' ? 'Artikel berhasil dipublish!' : 'Artikel berhasil diarsipkan!');
                setSelectedArticle(null);
                fetchArticles();
            } else {
                showToast(json.message || 'Gagal mengubah status.');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan koneksi.');
        }
        setConfirmModal({ show: false, type: '', article: null });
    };

    const handleDelete = async (article) => {
        try {
            const res = await fetch('https://csdwindo.com/api/artikel/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article.id })
            });
            const json = await res.json();
            if (json.status) {
                showToast('Artikel berhasil dihapus!');
                setSelectedArticle(null);
                fetchArticles();
            } else {
                showToast(json.message || 'Gagal menghapus artikel.');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan koneksi.');
        }
        setConfirmModal({ show: false, type: '', article: null });
    };

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('https://csdwindo.com/api/artikel/list.php');
            const json = await res.json();
            if (json.status && json.data) {
                setArticles(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch articles:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr.replace(' ', 'T'));
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredArticles = articles.filter(a => {
        if (statusFilter && a.status !== statusFilter) return false;
        if (categoryFilter && a.category !== categoryFilter) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <Edit3 size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Artikel</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola postingan artikel, berita, dan insight.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/panel/artikel/create')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#E60012] text-white text-sm font-bold rounded hover:bg-red-700 transition-colors"
                >
                    <Plus size={16} /> Tambah Artikel
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012] bg-white">
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012] bg-white">
                    <option value="">Semua Kategori</option>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Cari judul artikel..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#E60012]" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button onClick={() => { fetchArticles(); showToast('Data di-refresh'); }} className="p-2 border border-[#E5E5E5] rounded hover:bg-gray-50 bg-white">
                    <RefreshCw size={18} className="text-gray-500" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
                {[
                    { label: 'Total', val: articles.length, color: 'text-[#111111]' },
                    { label: 'Published', val: articles.filter(a => a.status === 'published').length, color: 'text-green-600' },
                    { label: 'Draft', val: articles.filter(a => a.status === 'draft').length, color: 'text-yellow-600' },
                    { label: 'Total Views', val: articles.reduce((s, a) => s + a.views_count, 0).toLocaleString('id-ID'), color: 'text-blue-600' }
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-[#E5E5E5] rounded-lg p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{s.label}</div>
                        <div className={`text-2xl font-display font-bold ${s.color}`}>{s.val}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E5E5E5] flex-1 overflow-hidden flex flex-col">
                <div className="bg-[#fcfcfc] border-b border-[#E5E5E5] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden md:grid">
                    <div className="col-span-5">Artikel</div>
                    <div className="col-span-2">Engagement</div>
                    <div className="col-span-2">CTA</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Tanggal</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 md:p-0">
                    {filteredArticles.length === 0 ? (
                        <div className="text-center py-20">
                            <Edit3 size={32} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-sm">Belum ada artikel untuk filter ini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E5E5E5]">
                            {filteredArticles.map(article => (
                                <div
                                    key={article.id}
                                    onClick={() => setSelectedArticle(article)}
                                    className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-[#FAFAFA] cursor-pointer transition-colors relative"
                                >
                                    {/* Article Info */}
                                    <div className="col-span-5 flex items-center gap-3 mb-2 md:mb-0">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {article.image ? (
                                                <img src={article.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Edit3 size={20} /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[13px] text-[#111111] line-clamp-1">{article.title}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 uppercase font-bold">{CATEGORY_LABELS[article.category]}</span>
                                                {article.is_featured && <span className="text-[10px] bg-[#E60012]/10 text-[#E60012] px-2 py-0.5 rounded-full font-bold">★ Featured</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Engagement */}
                                    <div className="col-span-2 flex items-center gap-4 text-[12px] text-gray-500 mb-2 md:mb-0">
                                        <span className="flex items-center gap-1"><Eye size={14} /> {article.views_count}</span>
                                        <span className="flex items-center gap-1"><Heart size={14} /> {article.likes_count}</span>
                                        <span className="flex items-center gap-1"><MessageSquare size={14} /> {article.comments_count}</span>
                                    </div>

                                    {/* CTA */}
                                    <div className="col-span-2 mb-2 md:mb-0">
                                        <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">{CTA_LABELS[article.cta_type]}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1 mb-2 md:mb-0">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${STATUS_COLORS[article.status]}`}>
                                            {STATUS_LABELS[article.status]}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2 text-[11px] text-gray-500">
                                        <div>{article.published_at ? formatDate(article.published_at) : 'Belum dipublish'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedArticle(null)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center shrink-0 bg-gray-50">
                                <h3 className="font-display font-bold text-lg text-[#111111] tracking-wide">Detail Artikel</h3>
                                <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-[#E60012]"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Preview */}
                                {selectedArticle.image && (
                                    <div className="w-full h-48 rounded-lg overflow-hidden">
                                        <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[selectedArticle.status]}`}>{STATUS_LABELS[selectedArticle.status]}</span>
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 uppercase font-bold">{CATEGORY_LABELS[selectedArticle.category]}</span>
                                    </div>
                                    <h2 className="font-display font-bold text-xl text-[#111111]">{selectedArticle.title}</h2>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">/{selectedArticle.slug}</p>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Views', val: selectedArticle.views_count, icon: <Eye size={16} /> },
                                        { label: 'Likes', val: selectedArticle.likes_count, icon: <Heart size={16} /> },
                                        { label: 'Comments', val: selectedArticle.comments_count, icon: <MessageSquare size={16} /> },
                                        { label: 'Read Time', val: selectedArticle.read_time, icon: null }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{s.label}</div>
                                            <div className="text-lg font-bold text-[#111111] flex items-center justify-center gap-1">{s.icon}{s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Config */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">Konfigurasi CTA</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-blue-600 text-xs">Jenis CTA</span><div className="font-bold">{CTA_LABELS[selectedArticle.cta_type]}</div></div>
                                        <div><span className="text-blue-600 text-xs">Featured</span><div className="font-bold">{selectedArticle.is_featured ? 'Ya' : 'Tidak'}</div></div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedArticle.tags && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedArticle.tags.map((t, i) => (
                                                <span key={i} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    <button onClick={() => { setSelectedArticle(null); navigate(`/panel/artikel/edit/${selectedArticle.id}`); }} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50"><Edit3 size={14} /> Edit</button>
                                    {(selectedArticle.status === 'draft' || selectedArticle.status === 'archived') && (
                                        <button onClick={() => setConfirmModal({ show: true, type: 'publish', article: selectedArticle })} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"><Send size={14} /> Publish</button>
                                    )}
                                    {selectedArticle.status === 'published' && (
                                        <button onClick={() => setConfirmModal({ show: true, type: 'archive', article: selectedArticle })} className="flex items-center gap-2 px-4 py-2 text-sm border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50"><Archive size={14} /> Arsipkan</button>
                                    )}
                                    <button onClick={() => setConfirmModal({ show: true, type: 'delete', article: selectedArticle })} className="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"><Trash2 size={14} /> Hapus</button>
                                    <button onClick={() => { setSelectedArticle(null); navigate(`/panel/artikel/komentar/${selectedArticle.id}`); }} className="flex items-center gap-2 px-4 py-2 text-sm border border-blue-200 text-blue-600 rounded hover:bg-blue-50"><MessageSquare size={14} /> Kelola</button>
                                    <a href={`/artikel/${selectedArticle.slug || selectedArticle.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm bg-[#111111] text-white rounded hover:bg-[#222]"><Eye size={14} /> Preview</a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setConfirmModal({ show: false, type: '', article: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' :
                                        confirmModal.type === 'publish' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {confirmModal.type === 'delete' ? <Trash2 size={32} /> :
                                        confirmModal.type === 'publish' ? <Send size={32} /> : <Archive size={32} />}
                                </div>
                                <h3 className="font-display font-bold text-xl text-[#111111] mb-2">
                                    {confirmModal.type === 'delete' ? 'Hapus Artikel?' :
                                        confirmModal.type === 'publish' ? 'Publish Artikel?' : 'Arsipkan Artikel?'}
                                </h3>
                                <p className="text-gray-600 text-sm mb-1 font-bold">{confirmModal.article?.title}</p>
                                <p className="text-gray-500 text-xs mb-6">
                                    {confirmModal.type === 'delete' ? 'Artikel beserta komentar, views, dan likes akan dihapus permanen.' :
                                        confirmModal.type === 'publish' ? 'Artikel akan langsung dapat dilihat oleh publik di website.' :
                                            'Artikel akan disembunyikan dari website publik.'}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmModal({ show: false, type: '', article: null })} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
                                    <button
                                        onClick={() => {
                                            if (confirmModal.type === 'delete') handleDelete(confirmModal.article);
                                            else if (confirmModal.type === 'publish') handleStatusChange(confirmModal.article, 'published');
                                            else handleStatusChange(confirmModal.article, 'archived');
                                        }}
                                        className={`flex-1 px-4 py-2.5 text-white font-bold rounded-lg transition-colors ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                                                confirmModal.type === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                                            }`}
                                    >
                                        {confirmModal.type === 'delete' ? 'Ya, Hapus' :
                                            confirmModal.type === 'publish' ? 'Ya, Publish' : 'Ya, Arsipkan'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className="fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white bg-green-500">
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArticleManager;
