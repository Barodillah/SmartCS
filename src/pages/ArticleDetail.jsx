import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Eye, Heart, Share2, ArrowRight, ChevronLeft, ChevronRight,
    Link as LinkIcon, MessageCircle, Send, MessageSquare, X, Play, Video
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { parseArticleMarkdown, isVideoUrl } from '../utils/markdownParser';
import SEOHead from '../components/seo/SEOHead';
import { SITE_URL, ORG_ID, getBreadcrumbNode } from '../utils/seoConfig';

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
    const [inlinePreviewImg, setInlinePreviewImg] = useState(null);
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

                        // Related articles with views ASC tie-breaker (Bab 7.3 & 7.4) for equitable crawl & user exposure
                        const others = articles.filter(a => a.id !== found.id);
                        const sameCategory = others
                            .filter(a => a.category === found.category)
                            .sort((a, b) => (Number(a.views_count) || 0) - (Number(b.views_count) || 0));
                        const diffCategory = others
                            .filter(a => a.category !== found.category)
                            .sort((a, b) => (Number(a.views_count) || 0) - (Number(b.views_count) || 0));
                        setRelatedArticles([...sameCategory, ...diffCategory].slice(0, 3));
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

        setTimeout(() => {
            gsap.fromTo('.article-fade-up',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
        }, 100);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    // Handle clicks on inline article images [img:link|caption]
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const handleInlineImgClick = (e) => {
            const target = e.target;
            if (target && target.tagName === 'IMG' && target.closest('.my-article-figure')) {
                const figure = target.closest('.my-article-figure');
                const figcaption = figure ? figure.querySelector('figcaption') : null;
                setInlinePreviewImg({
                    src: target.currentSrc || target.src,
                    alt: target.alt || '',
                    caption: figcaption ? figcaption.textContent : ''
                });
            }
        };

        el.addEventListener('click', handleInlineImgClick);
        return () => el.removeEventListener('click', handleInlineImgClick);
    }, [article]);

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
        } else if (platform === 'threads') {
            window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
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
                fetchComments(article.id);
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading artikel...</div>;
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 px-6 text-center">
                <SEOHead
                    title="404 Artikel Tidak Ditemukan — Mitsubishi Dwindo Bintaro"
                    description="Artikel yang Anda cari tidak ditemukan atau telah dipindahkan."
                    noindex={true}
                />
                <h1 className="text-4xl font-display font-black text-[#111111] mb-2">404 — Artikel Tidak Ditemukan</h1>
                <p className="mb-6 max-w-md">Artikel yang Anda cari mungkin sudah dihapus atau URL tidak sesuai.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Link to="/artikel" className="px-5 py-2.5 bg-[#E60012] text-white font-bold rounded">Lihat Semua Artikel</Link>
                    <Link to="/price-list" className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded">Daftar Harga OTR</Link>
                    <Link to="/" className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded">Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    const articlePath = `/artikel/${article.slug || article.id}`;
    const articleImage = article.image
        ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`)
        : `${SITE_URL}/media/hero.webp`;
    const pubIso = new Date(article.published_at || article.created_at || Date.now()).toISOString();
    const modIso = new Date(article.updated_at || article.published_at || article.created_at || Date.now()).toISOString();

    const breadcrumbs = [
        { name: 'Beranda', path: '/' },
        { name: 'Berita & Promo', path: '/artikel' },
        { name: article.title, path: articlePath }
    ];

    const blogPostingSchema = {
        '@type': 'BlogPosting',
        '@id': `${SITE_URL}${articlePath}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${articlePath}` },
        headline: article.title,
        description: article.subtitle || article.title,
        image: [articleImage],
        datePublished: pubIso,
        dateModified: modIso,
        author: {
            '@type': 'Organization',
            name: article.author || 'Dwindo Bintaro',
            url: SITE_URL
        },
        publisher: { '@id': ORG_ID },
        articleSection: article.category || 'Otomotif',
        inLanguage: 'id-ID'
    };

    return (
        <div className="bg-white min-h-screen pt-20">
            <SEOHead
                title={`${article.title} — Mitsubishi Dwindo Bintaro`}
                description={article.subtitle || `Baca artikel ${article.title} dari Dealer Resmi Mitsubishi Motors Dwindo Bintaro.`}
                canonicalPath={articlePath}
                image={articleImage}
                ogType="article"
                schemaNodes={[getBreadcrumbNode(breadcrumbs), blogPostingSchema]}
            />

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
                <nav aria-label="breadcrumb" className="article-fade-up mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-[#E60012] transition-colors font-medium text-sm group"
                    >
                        <ChevronLeft size={18} className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </button>
                    <ol className="hidden md:flex text-sm text-gray-400 gap-2 items-center">
                        <li><Link to="/" className="hover:text-gray-700">Beranda</Link></li>
                        <li>/</li>
                        <li><Link to="/artikel" className="hover:text-gray-700">Berita</Link></li>
                        <li>/</li>
                        <li className="text-gray-700 capitalize">{article.category}</li>
                    </ol>
                </nav>

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
                                width="24"
                                height="24"
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
                            <time dateTime={pubIso}>
                                {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </time>
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

                {/* Featured Media (Image or Video) */}
                <div className="article-fade-up w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative rounded-2xl overflow-hidden mb-12 shadow-lg bg-black">
                    {isVideoUrl(article.image) ? (
                        <video
                            src={article.image}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={article.image}
                            alt={article.title}
                            width="1200"
                            height="675"
                            fetchPriority="high"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop';
                            }}
                        />
                    )}
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

                            <button onClick={scrollToComments} aria-label="Lihat Komentar" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#E60012] hover:text-white transition-colors tooltip group relative">
                                <MessageSquare size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Komentar</span>
                            </button>
                            <button onClick={() => setIsShareModalOpen(true)} aria-label="Bagikan Artikel" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-colors group relative">
                                <Share2 size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Bagikan</span>
                            </button>
                            <button onClick={() => handleShare('copy')} aria-label="Salin Tautan" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-colors group relative">
                                <LinkIcon size={18} />
                                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Copy Link</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <article className="article-fade-up lg:w-[calc(100%-80px)] max-w-3xl font-body">
                        {/* Mobile Share */}
                        <div className="sticky top-[50px] z-40 bg-white/90 backdrop-blur-md flex items-center gap-4 mb-8 lg:hidden border-b border-gray-100 py-4 -mx-6 px-6 shadow-sm">
                            <span className="text-sm font-bold text-gray-500 uppercase">Share:</span>
                            <button onClick={scrollToComments} aria-label="Komentar" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#E60012] hover:text-white transition-colors"><MessageSquare size={18} /></button>
                            <button onClick={() => setIsShareModalOpen(true)} aria-label="Bagikan" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-colors"><Share2 size={18} /></button>
                            <button onClick={() => handleShare('copy')} aria-label="Salin Link" className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"><LinkIcon size={18} /></button>
                        </div>

                        {/* Render Markdown content */}
                        <div
                            className="prose prose-lg max-w-none prose-p:font-body prose-headings:font-display prose-a:text-[#E60012] mb-12"
                            dangerouslySetInnerHTML={{ __html: parseArticleMarkdown(article.content) }}
                        />

                        {/* Gallery Bento Grid (Photos & Videos) */}
                        {article.gallery && article.gallery.length > 0 && (
                            <div className="mb-12 article-fade-up">
                                <h2 className="font-display font-bold text-2xl md:text-3xl text-[#111111] mb-6">Galeri & Media Dokumentasi</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[250px]">
                                    {article.gallery.map((mediaUrl, idx) => {
                                        const isVideo = isVideoUrl(mediaUrl);
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
                                                className={`relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300 bg-black ${colSpan} ${rowSpan}`}
                                            >
                                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-500 z-10 flex items-center justify-center">
                                                    {isVideo ? (
                                                        <div className="bg-[#E60012]/90 text-white p-4 rounded-full shadow-xl backdrop-blur-sm group-hover:scale-110 group-hover:bg-[#E60012] transition-all flex items-center justify-center">
                                                            <Play size={26} className="fill-white translate-x-0.5" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                                                            <Eye size={24} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>

                                                {isVideo && (
                                                    <span className="absolute top-3 right-3 bg-black/75 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full z-20 flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                                                        <Play size={10} className="fill-white" /> Video
                                                    </span>
                                                )}

                                                {isVideo ? (
                                                    <video
                                                        src={mediaUrl}
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <img
                                                        src={mediaUrl}
                                                        alt={`${article.title} — Galeri ${idx + 1}`}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Contextual Internal Links (Hub & Spoke SEO - Bab 7.2) */}
                        <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-6 mb-10">
                            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-gray-800 mb-3">
                                Layanan Terkait Mitsubishi Dwindo Bintaro:
                            </h2>
                            <div className="flex flex-wrap gap-3 text-xs font-display font-bold uppercase tracking-wider">
                                <Link to="/price-list" className="px-4 py-2 bg-white border border-gray-200 hover:border-[#E60012] text-[#111111] transition-colors rounded">
                                    Daftar Harga OTR Terbaru
                                </Link>
                                <Link to="/booking" className="px-4 py-2 bg-white border border-gray-200 hover:border-[#E60012] text-[#111111] transition-colors rounded">
                                    Booking Service Online
                                </Link>
                                <Link to="/aksesoris" className="px-4 py-2 bg-white border border-gray-200 hover:border-[#E60012] text-[#111111] transition-colors rounded">
                                    Katalog Aksesoris Resmi
                                </Link>
                                <Link to="/lokasi-dealer" className="px-4 py-2 bg-white border border-gray-200 hover:border-[#E60012] text-[#111111] transition-colors rounded">
                                    Lokasi Cabang 3S
                                </Link>
                            </div>
                        </div>

                        {/* Article Footer Actions */}
                        <div className="border-t border-b border-gray-100 py-8 my-10 flex flex-col gap-8">
                            {article.tags && article.tags.length > 0 && (
                                <div className="w-full text-left">
                                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 capitalize">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                            <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
                                <MessageSquare size={24} className="text-[#E60012]" />
                                Komentar ({comments.length})
                            </h2>

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
                                        aria-label="Kirim Komentar"
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
                    <h2 className="font-display font-bold text-2xl mb-8 border-l-4 border-[#E60012] pl-4">Artikel Terkait</h2>
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
                                            width="640"
                                            height="360"
                                            loading="lazy"
                                            decoding="async"
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
                        <div className="flex justify-center gap-3 sm:gap-5">
                            <button onClick={() => { handleShare('wa'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                            </button>
                            <button onClick={() => { handleShare('fb'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">Facebook</span>
                            </button>
                            <button onClick={() => { handleShare('tw'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 text-[#111111] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">X</span>
                            </button>
                            <button onClick={() => { handleShare('threads'); setIsShareModalOpen(false); }} className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/5 text-[#111111] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z"/>
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-gray-600">Threads</span>
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
                        {isVideoUrl(article.gallery[currentImageIndex]) ? (
                            <video
                                key={article.gallery[currentImageIndex]}
                                src={article.gallery[currentImageIndex]}
                                controls
                                autoPlay
                                playsInline
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            />
                        ) : (
                            <img
                                src={article.gallery[currentImageIndex]}
                                alt={`Gallery full ${currentImageIndex}`}
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl transition-opacity duration-300 pointer-events-none"
                            />
                        )}
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-display text-sm tracking-widest z-50 bg-black/50 px-4 py-1 rounded-full">
                        {currentImageIndex + 1} / {article.gallery.length}
                    </div>
                </div>
            )}

            {/* Inline Article Image Lightbox Modal */}
            {inlinePreviewImg && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 animate-fade-in"
                    onClick={() => setInlinePreviewImg(null)}
                >
                    <button
                        aria-label="Tutup Pratinjau Gambar"
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-50 cursor-pointer"
                        onClick={() => setInlinePreviewImg(null)}
                    >
                        <X size={32} />
                    </button>

                    <div className="flex flex-col items-center max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={inlinePreviewImg.src}
                            alt={inlinePreviewImg.alt}
                            className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
                        />
                        {inlinePreviewImg.caption && (
                            <p className="mt-4 text-white/90 text-sm md:text-base text-center italic font-body max-w-2xl px-5 py-2 bg-black/50 rounded-full border border-white/10">
                                {inlinePreviewImg.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleDetail;
