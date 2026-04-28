import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trash2, Clock, MessageSquare, AlertTriangle, Eye, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentManager = () => {
    const { id } = useParams();
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({
        views: { total: 0, unique_ip: 0 },
        likes: { total: 0, unique_ip: 0 },
        comments: { total: 0, unique_ip: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://csdwindo.com/api/artikel/admin_comment.php?article_id=${id}`);
            const data = await res.json();
            if (data.status) {
                setComments(data.data);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (err) {
            console.error('Failed to fetch comments', err);
            showToast('Gagal mengambil data komentar.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleAction = async (commentId, action) => {
        try {
            const res = await fetch('https://csdwindo.com/api/artikel/admin_comment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: commentId, action })
            });
            const data = await res.json();
            if (data.status) {
                showToast(data.message);
                fetchComments();
            } else {
                showToast(data.message || 'Gagal memproses aksi.');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan koneksi.');
        }
    };

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4">
                <Link to="/panel/artikel" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E60012] transition-colors w-fit">
                    <ArrowLeft size={16} /> Kembali ke Artikel
                </Link>
                <div>
                    <h1 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-wide">Kelola Komentar</h1>
                    <p className="text-gray-500 text-sm mt-1">Review dan kelola komentar pengunjung untuk artikel ini.</p>
                </div>
            </div>

            {/* Stats Cards */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-[#E5E5E5] p-5 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Views</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">{stats.views.total}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stats.views.unique_ip} Unique IP</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-[#E5E5E5] p-5 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-[#E60012] rounded-lg flex items-center justify-center shrink-0">
                            <Heart size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Likes</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">{stats.likes.total}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stats.likes.unique_ip} Unique IP</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] p-5 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-lg flex items-center justify-center shrink-0">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Komentar</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">{stats.comments.total}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stats.comments.unique_ip} Unique IP</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <MessageSquare size={32} className="mb-4 text-gray-300" />
                        <p>Belum ada komentar untuk artikel ini.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E5E5E5]">
                        {comments.map(comment => (
                            <div key={comment.id} className={`p-4 md:p-6 flex flex-col md:flex-row gap-4 transition-colors ${comment.is_approved == 0 ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-gray-900">{comment.sender_name}</span>
                                        {comment.is_approved == 0 ? (
                                            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                <AlertTriangle size={10} /> Menunggu Approval
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Approved</span>
                                        )}
                                        <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto md:ml-2">
                                            <Clock size={12} />
                                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-line bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                        {comment.comment}
                                    </p>
                                </div>
                                
                                <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-center">
                                    {comment.is_approved == 0 && (
                                        <button 
                                            onClick={() => handleAction(comment.id, 'approve')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-bold"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => { if(window.confirm('Yakin ingin menghapus komentar ini?')) handleAction(comment.id, 'delete'); }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors font-bold"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className="fixed bottom-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white bg-gray-900">
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentManager;
