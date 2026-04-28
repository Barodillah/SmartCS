import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Eye, Heart, Share2, ArrowRight, ChevronLeft, ChevronRight,
    Link as LinkIcon, MessageCircle, Send, MessageSquare, X
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { parseArticleMarkdown } from '../utils/markdownParser';


const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [toastMessage, setToastMessage] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentName, setCommentName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const contentRef = useRef(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    const fetchComments = async (articleId) => {
        try {
            const res = await fetch(`https://csdwindo.com/api/artikel/comment_list.php?article_id=${articleId}`);
            const json = await res.json();
            if (json.status) {
                setComments(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchArticle = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://csdwindo.com/api/artikel/list.php?status=published');
                const json = await res.json();
                if (json.status && json.data) {
                    const articles = json.data;
                    const found = articles.find(a => a.id == id || a.slug === id);
                    if (found) {
                        setArticle(found);
                        setLikesCount(found.likes_count || 0);
                        fetchComments(found.id);

                        fetch('https://csdwindo.com/api/artikel/action.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ article_id: found.id, action: 'view' })
                        }).catch(e => console.error(e));

                        let related = articles.filter(a => a.id !== found.id && a.category === found.category);
                        if (related.length === 0) {
                            related = articles.filter(a => a.id !== found.id);
                        }
                        setRelatedArticles(related.slice(0, 3));
                    } else {
                        setArticle(null);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch article:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();

        // Scroll Progress
        const handleScroll = () => {
            if (!contentRef.current) return;
            const element = contentRef.current;
            const totalHeight = element.clientHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY - element.offsetTop;

            let progress = (scrollY / (totalHeight - windowHeight)) * 100;
            progress = Math.max(0, Math.min(100, progress));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);

        // GSAP Animations
        setTimeout(() => {
            gsap.fromTo('.article-fade-up',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
        }, 100);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await fetch('https://csdwindo.com/api/artikel/action.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: article.id, action: 'like' })
            });
        } catch (e) {
            console.error("Failed to like:", e);
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Baca artikel menarik ini: ${article.title}`;

        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            showToast('Link berhasil disalin!');
        } else if (platform === 'wa') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        } else if (platform === 'fb') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'tw') {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const submitComment = async (name) => {
        if (!commentText.trim()) {
            showToast('Komentar tidak boleh kosong!');
            return;
        }

        const payload = {
            article_id: article.id,
            comment: commentText,
            sender_name: name || 'Anonim'
        };

        try {
            const res = await fetch('https://csdwindo.com/api/artikel/comment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.status) {
                showToast(`Komentar terkirim ${name ? 'atas nama ' + name : 'secara Anonim'}! Menunggu persetujuan moderator.`);
                setCommentText('');
                setCommentName('');
                setIsCommentModalOpen(false);
                fetchComments(article.id); // Refresh comments
            } else {
                showToast(data.message || 'Gagal mengirim komentar');
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            showToast('Terjadi kesalahan koneksi.');
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const scrollToComments = () => {
        const el = document.getElementById('comments-section');
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        if (!article || !article.gallery) return;
        setCurrentImageIndex((prev) => (prev === article.gallery.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        if (!article || !article.gallery) return;
        setCurrentImageIndex((prev) => (prev === 0 ? article.gallery.length - 1 : prev - 1));
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        if (distance > minSwipeDistance) nextImage();
        if (distance < -minSwipeDistance) prevImage();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading artikel...</div>;
    if (!article) return <div className="min-h-screen flex flex-col items-center justify-center text-gray-500"><h2 className="text-2xl font-bold mb-2">404</h2><p>Artikel tidak ditemukan.</p><button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-[#E60012] text-white rounded">Kembali ke Home</button></div>;

    return (
        <div className="bg-white min-h-screen pt-20">
            {/* Sticky Reading Progress */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-[#E60012] transition-all duration-100 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl font-body text-sm animate-fade-in-down">
                    {toastMessage}
                </div>
            )}

            {/* Container */}
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">

                {/* Breadcrumb & Back */}
                <div className="article-fade-up mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-[#E60012] transition-colors font-medium text-sm group"
                    >
                        <ChevronLeft size={18} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </button>
                    <div className="hidden md:flex text-sm text-gray-400 gap-2">
                        <Link to="/" className="hover:text-gray-700">Home</Link>
                        <span>/</span>
                        <Link to="/artikel" className="hover:text-gray-700">Berita</Link>
                        <span>/</span>
                        <span className="text-gray-700">{article.category}</span>
                    </div>
                </div>

                {/* Hero Section */}
                <header className="article-fade-up max-w-4xl mx-auto text-center mb-10">
                    <div className="inline-block bg-[#F8F9FA] text-[#E60012] font-display font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full mb-6">
                        {article.category}
                    </div>
                    <h1 className="font-display font-extrabold text-[32px] sm:text-[40px] md:text-[48px] text-[#111111] leading-tight mb-6">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    article.author === 'Mitsubishi Motors Indonesia' ? '/logo/mitsubishi-motors/logo_text_black.png' :
                                        article.author === 'Mitsubishi Fuso Indonesia' ? '/logo/mitsubishi-fuso/logo_black.png' :
                                            '/logo/logo_dwindo.png'
                                }
                                alt={article.author || 'Author'}
                                className={
                                    article.author === 'Mitsubishi Motors Indonesia' || article.author === 'Mitsubishi Fuso Indonesia'
                                        ? "h-5 w-auto object-contain"
                                        : "w-6 h-6 rounded-full object-cover border border-gray-100"
                                }
                            />
                            <span className="text-gray-800">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            {article.read_time || '3 min read'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={16} />
                            {article.views_count || 0}
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="article-fade-up w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative rounded-2xl overflow-hidden mb-12 shadow-lg">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if image not found
                            e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop';
                        }}
                    />
                </div>

                {/* Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto" ref={contentRef}>

                    {/* Share Sidebar (Sticky) */}
                    <div className="lg:w-[80px] hidden lg:block">
                        <div className="sticky top-32 flex flex-col items-center gap-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                Bagikan
                            </span>
                            <div className="w-[1px] h-12 bg-gray-200"></div>

                            <button onClick={scrollToComments} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#E60012] hover:text-white transition-colors tooltip group relative">
                                <MessageSquare size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Komentar</span>
                            </button>
                            <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-colors group relative">
                                <Share2 size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Bagikan</span>
                            </button>
                            <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-colors group relative">
                                <LinkIcon size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Copy Link</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <article className="article-fade-up lg:w-[calc(100%-80px)] max-w-3xl font-body">
                        {/* Mobile Share (Visible only on small screens) */}
                        <div className="sticky top-[50px] z-40 bg-white/90 backdrop-blur-md flex items-center gap-4 mb-8 lg:hidden border-b border-gray-100 py-4 -mx-6 px-6 shadow-sm">
                            <span className="text-sm font-bold text-gray-500 uppercase">Share:</span>
                            <button onClick={scrollToComments} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#E60012] hover:text-white transition-colors"><MessageSquare size={18} /></button>
                            <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-colors"><Share2 size={18} /></button>
                            <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"><LinkIcon size={18} /></button>
                        </div>

                        {/* Render Markdown content */}
                        <div
                            className="prose prose-lg max-w-none prose-p:font-body prose-headings:font-display prose-a:text-[#E60012] mb-12"
                            dangerouslySetInnerHTML={{ __html: parseArticleMarkdown(article.content) }}
                        />

                        {/* Gallery Bento Grid */}
                        {article.gallery && article.gallery.length > 0 && (
                            <div className="mb-12 article-fade-up">
                                <h3 className="font-display font-bold text-2xl md:text-3xl text-[#111111] mb-6">Galeri Dokumentasi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[250px]">
                                    {article.gallery.map((img, idx) => {
                                        let colSpan = "";
                                        let rowSpan = "";
                                        if (article.gallery.length === 3 && idx === 0) {
                                            colSpan = "sm:col-span-2";
                                            rowSpan = "sm:row-span-2";
                                        } else if (article.gallery.length === 3) {
                                            colSpan = "sm:col-span-1";
                                        }
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => openLightbox(idx)}
                                                className={`relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 ${colSpan} ${rowSpan}`}
                                            >
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 flex items-center justify-center">
                                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                                                        <Eye size={24} className="text-white" />
                                                    </div>
                                                </div>
                                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Article Footer Actions */}
                        <div className="border-t border-b border-gray-100 py-8 my-10 flex flex-col gap-8">
                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="w-full text-left">
                                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 capitalize">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Like Button */}
                            <div className="flex justify-center w-full">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isLiked ? 'bg-red-50 text-[#E60012] border border-red-100' : 'bg-[#F8F9FA] text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <Heart size={20} className={isLiked ? "fill-current" : ""} />
                                    {likesCount} Suka
                                </button>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="mb-16" id="comments-section">
                            <h3 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
                                <MessageSquare size={24} className="text-[#E60012]" />
                                Komentar ({comments.length})
                            </h3>

                            <div className="flex gap-4 mb-10">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">You</div>
                                <div className="flex-1 relative">
                                    <textarea
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 pr-12 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-shadow resize-none"
                                        rows="3"
                                        placeholder="Tulis komentar Anda..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    ></textarea>
                                    <button
                                        onClick={() => { if (commentText.trim()) setIsCommentModalOpen(true); else showToast('Komentar tidak boleh kosong'); }}
                                        className="absolute bottom-4 right-4 text-gray-400 hover:text-[#E60012] transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className={`flex gap-4 ${comment.parent_id ? 'ml-14' : ''}`}>
                                            {comment.sender_type === 'admin' ? (
                                                <img src="/logo/logo_dwindo.png" className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-100" alt="Admin" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {comment.sender_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-sm text-gray-900">{comment.sender_name}</span>
                                                    {comment.sender_type === 'admin' && (
                                                        <span className="text-[10px] bg-[#E60012] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">Author</span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm whitespace-pre-line">{comment.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </article>
                </div>
            </div>

            {/* Bottom CTA Banner */}
            {article.cta_type && article.cta_type !== 'none' && (
                <div className="bg-[#111111] text-white py-16 mt-10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                            {article.cta_type === 'booking' ? 'Booking Servis Sekarang' :
                                article.cta_type === 'test_drive' ? 'Tertarik dengan Model Terbaru Kami?' :
                                    article.cta_type === 'prospect' ? 'Dapatkan Penawaran Spesial' :
                                        article.cta_type === 'emergency' ? 'Butuh Bantuan Darurat?' :
                                            article.cta_type === 'sparepart' ? 'Cari Suku Cadang Asli?' :
                                                article.cta_type === 'aksesoris' ? 'Lengkapi Kendaraan Anda' :
                                                    article.cta_type === 'complaint' ? 'Layanan Pelanggan' : 'Hubungi Kami'}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                            {article.cta_type === 'booking' ? 'Lakukan booking service secara online dan nikmati kemudahan perawatan kendaraan tanpa antre.' :
                                article.cta_type === 'test_drive' ? 'Jadwalkan test drive sekarang dan rasakan langsung sensasi berkendara dari inovasi terkini Mitsubishi Motors.' :
                                    article.cta_type === 'prospect' ? 'Dapatkan informasi lengkap mengenai harga, promo, dan paket kredit terbaik untuk mobil impian Anda.' :
                                        article.cta_type === 'emergency' ? 'Butuh bantuan darurat di jalan? Tim kami siap memberikan pertolongan cepat kapan pun Anda membutuhkan.' :
                                            article.cta_type === 'sparepart' ? 'Pastikan kendaraan Anda tetap prima dengan suku cadang asli Mitsubishi yang terjamin kualitasnya.' :
                                                article.cta_type === 'aksesoris' ? 'Tingkatkan tampilan dan fungsionalitas mobil Anda dengan berbagai pilihan aksesoris resmi Mitsubishi.' :
                                                    article.cta_type === 'complaint' ? 'Sampaikan keluhan atau masukan Anda. Kami berkomitmen untuk memberikan solusi terbaik bagi Anda.' :
                                                        'Asisten Virtual DINA siap membantu memenuhi semua kebutuhan kendaraan Anda dengan mudah dan cepat.'}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message: `Halo DINA, saya tertarik melakukan ${article.cta_type.replace('_', ' ')} setelah membaca artikel "${article.title}". Bisa dibantu?` } }))}
                                className="w-full sm:w-auto px-8 py-4 bg-[#E60012] text-white font-bold rounded-lg hover:bg-red-700 transition-colors capitalize"
                            >
                                {article.cta_type === 'booking' ? 'Booking Sekarang' :
                                    article.cta_type === 'test_drive' ? 'Test Drive Sekarang' :
                                        article.cta_type === 'prospect' ? 'Dapatkan Penawaran' :
                                            article.cta_type === 'emergency' ? 'Hubungi Bantuan' :
                                                article.cta_type === 'sparepart' ? 'Cek Suku Cadang' :
                                                    article.cta_type === 'aksesoris' ? 'Cek Aksesoris' :
                                                        article.cta_type === 'complaint' ? 'Kirim Masukan' : 'Tanya DINA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Related Articles */}
            <div className="bg-[#F8F9FA] py-16">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
                    <h3 className="font-display font-bold text-2xl mb-8 border-l-4 border-[#E60012] pl-4">Artikel Terkait</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedArticles.map((item, idx) => (
                            <Link
                                to={`/artikel/${item.slug || item.id}`}
                                key={idx}
                                className="article-card group drop-shadow-sm hover:drop-shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
                            >
                                <div className="bg-white flex flex-col flex-1 relative overflow-hidden" style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <img
                                            src={item.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-5 left-5 z-20">
                                            <div
                                                className="bg-white/95 backdrop-blur text-[#111111] font-display font-bold text-xs uppercase tracking-wider py-2 px-4 inline-block"
                                                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                            >
                                                {item.category}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 lg:p-8 flex flex-col flex-1 border-t-0 border-gray-100/50">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {item.read_time || '3 min read'}
                                            </div>
                                        </div>

                                        <h3 className="font-display font-bold text-xl lg:text-2xl text-[#111111] leading-snug mb-3 group-hover:text-[#E60012] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>

                                        <p className="text-gray-600 line-clamp-3 mb-6 flex-1">
                                            {item.subtitle}
                                        </p>

                                        <div className="mt-auto flex items-center font-display font-bold text-sm uppercase tracking-wide text-[#111111] group-hover:text-[#E60012] transition-colors">
                                            Baca Selengkapnya
                                            <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <X size={20} />
                        </button>
                        <h3 className="font-display font-bold text-xl mb-6 text-center">Bagikan Artikel</h3>
                        <div className="flex justify-center gap-6">
                            <button onClick={() => { handleShare('wa'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                    <MessageCircle size={28} />
                                </div>
                                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                            </button>
                            <button onClick={() => { handleShare('fb'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">Facebook</span>
                            </button>
                            <button onClick={() => { handleShare('tw'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 rounded-full bg-gray-100 text-[#111111] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">X / Twitter</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {isCommentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setIsCommentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <X size={20} />
                        </button>
                        <h3 className="font-display font-bold text-xl mb-2 text-[#111111]">Kirim Komentar</h3>
                        <p className="text-sm text-gray-500 mb-6">Pilih identitas pengirim untuk komentar Anda.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => submitComment(null)}
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-[#E60012] hover:text-[#E60012] transition-colors flex items-center justify-center gap-2"
                            >
                                Kirim sebagai Anonim
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-2 text-xs font-bold text-gray-400 tracking-wider">ATAU</span></div>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Masukkan Nama Anda"
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-[#E60012]"
                                    value={commentName}
                                    onChange={(e) => setCommentName(e.target.value)}
                                />
                                <button
                                    onClick={() => submitComment(commentName)}
                                    className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${commentName.trim() ? 'bg-[#E60012] text-white hover:bg-red-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Kirim dengan Nama
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && article.gallery && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-50">
                        <X size={32} />
                    </button>

                    <button
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 z-50"
                        onClick={prevImage}
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 z-50"
                        onClick={nextImage}
                    >
                        <ChevronRight size={48} />
                    </button>

                    <div
                        className="w-full h-full p-4 md:p-16 flex items-center justify-center relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <img
                            src={article.gallery[currentImageIndex]}
                            alt={`Gallery full ${currentImageIndex}`}
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl transition-opacity duration-300 pointer-events-none"
                        />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-display text-sm tracking-widest z-50 bg-black/50 px-4 py-1 rounded-full">
                        {currentImageIndex + 1} / {article.gallery.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleDetail;
