import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, X, Image as ImageIcon, Send, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
    berita: 'Berita', kegiatan: 'Kegiatan', insight: 'Insight', promo: 'Promo', tips: 'Tips'
};

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

const ArticleEditor = () => {
    const navigate = useNavigate();
    const { id: editId } = useParams();
    const isEditMode = Boolean(editId);

    useEffect(() => {
        const adminUser = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
        if (adminUser.role !== 'admin') {
            navigate('/panel', { replace: true });
        }
    }, [navigate]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        slug: '',
        category: 'berita',
        author: 'Mitsubishi Dwindo',
        image: '',
        content: '',
        gallery: [''],
        tags: [],
        read_time: '',
        cta_type: 'test_drive',
        status: 'draft',
        is_featured: false
    });

    // AI Modal State
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Tag Input State
    const [tagInput, setTagInput] = useState('');

    // Publish Confirm Modal
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    // Loading for edit mode
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Load article data in edit mode
    useEffect(() => {
        if (!isEditMode) return;
        setLoadingEdit(true);
        fetch('https://csdwindo.com/api/artikel/list.php')
            .then(res => res.json())
            .then(json => {
                if (json.status && json.data) {
                    const found = json.data.find(a => a.id == editId);
                    if (found) {
                        setFormData({
                            title: found.title || '',
                            subtitle: found.subtitle || '',
                            slug: found.slug || '',
                            category: found.category || 'berita',
                            author: found.author || 'Mitsubishi Dwindo',
                            image: found.image || '',
                            content: found.content || '',
                            gallery: found.gallery && found.gallery.length > 0 ? found.gallery : [''],
                            tags: found.tags || [],
                            read_time: found.read_time || '',
                            cta_type: found.cta_type || 'test_drive',
                            status: found.status || 'draft',
                            is_featured: !!found.is_featured
                        });
                    } else {
                        showToast('Artikel tidak ditemukan.', 'error');
                    }
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Gagal memuat data artikel.', 'error');
            })
            .finally(() => setLoadingEdit(false));
    }, [editId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'title' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
        }));
    };

    const handleAddGallery = () => {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ''] }));
    };

    const handleRemoveGallery = (index) => {
        setFormData(prev => {
            const newGallery = [...prev.gallery];
            newGallery.splice(index, 1);
            return { ...prev, gallery: newGallery };
        });
    };

    const handleGalleryChange = (index, value) => {
        setFormData(prev => {
            const newGallery = [...prev.gallery];
            newGallery[index] = value;
            return { ...prev, gallery: newGallery };
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const handleGenerateAI = async () => {
        if (!aiContext.trim()) {
            showToast('Masukkan konteks terlebih dahulu', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const systemPrompt = `Kamu adalah content writer profesional untuk dealer Mitsubishi Dwindo Bintaro. Tugasmu adalah membuat artikel berkualitas tinggi.

Berikan output dalam format JSON yang valid (tanpa markdown code block) dengan struktur berikut:
{
  "title": "Judul artikel yang menarik dan SEO-friendly",
  "subtitle": "Ringkasan singkat 1-2 kalimat",
  "content": "Isi artikel dalam format Markdown standar. Gunakan heading (#, ##, ###), bold (**), italic (*), list (-, *), blockquote (>). Minimal 3 paragraf dengan heading yang rapi.",
  "category": "salah satu dari: berita, kegiatan, insight, promo, tips",
  "tags": ["array", "of", "relevant", "tags"],
  "read_time": "estimasi waktu baca, contoh: 5 min read",
  "cta_type": "salah satu dari: booking, test_drive, prospect, emergency, sparepart, aksesoris, complaint, none — pilih yang paling sesuai konteks"
}

Pastikan konten relevan dengan dunia otomotif Mitsubishi dan dealer Dwindo Bintaro.`;

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'SmartCS Article Generator'
                },
                body: JSON.stringify({
                    model: 'qwen/qwen3.5-flash-02-23',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: 'Buatkan artikel berdasarkan konteks berikut:\n\n' + aiContext }
                    ],
                    temperature: 0.7,
                    max_tokens: 3000
                })
            });
            const result = await res.json();

            let content = result?.choices?.[0]?.message?.content || '';
            // Strip markdown code fences if present
            content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

            const parsed = JSON.parse(content);

            if (parsed && parsed.title) {
                setFormData(prev => ({
                    ...prev,
                    title: parsed.title || prev.title,
                    subtitle: parsed.subtitle || prev.subtitle,
                    content: parsed.content || prev.content,
                    category: parsed.category || prev.category,
                    tags: Array.isArray(parsed.tags) ? parsed.tags : prev.tags,
                    read_time: parsed.read_time || prev.read_time,
                    cta_type: parsed.cta_type || prev.cta_type
                }));
                setAiModalOpen(false);
                showToast('Konten berhasil di-generate oleh AI!');
                setAiContext('');
            } else {
                showToast('AI menghasilkan format yang tidak valid. Coba lagi.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat menghubungi AI.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            showToast('Judul dan konten wajib diisi.', 'error');
            return;
        }
        // Show confirmation if publishing
        if (formData.status === 'published') {
            setShowPublishConfirm(true);
            return;
        }
        doSave();
    };

    const doSave = async () => {
        setShowPublishConfirm(false);
        try {
            const endpoint = isEditMode
                ? 'https://csdwindo.com/api/artikel/update.php'
                : 'https://csdwindo.com/api/artikel/save.php';

            const payload = isEditMode
                ? { ...formData, id: parseInt(editId) }
                : formData;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();

            if (json.status) {
                showToast(isEditMode ? 'Artikel berhasil diperbarui!' : 'Artikel berhasil disimpan!');
                setTimeout(() => navigate('/panel/artikel'), 1500);
            } else {
                showToast(json.message || 'Gagal menyimpan artikel.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat menyimpan.', 'error');
        }
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col min-h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/panel/artikel')}
                        className="p-2 border border-[#E5E5E5] rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">{isEditMode ? 'Edit Artikel' : 'Tulis Artikel'}</h1>
                        <p className="text-gray-500 text-sm mt-1">{isEditMode ? 'Ubah konten artikel yang sudah ada.' : 'Buat konten baru untuk website.'}</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setAiModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                    >
                        <Sparkles size={16} /> Generate AI
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E60012] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <Save size={16} /> Simpan
                    </button>
                </div>
            </div>

            {/* Form Area */}
            <form className="bg-white border border-[#E5E5E5] rounded-xl flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto border-r border-[#E5E5E5]">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Artikel <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="title" required
                                value={formData.title} onChange={handleChange}
                                placeholder="Contoh: Tips Merawat Kendaraan di Musim Hujan"
                                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-shadow text-lg font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Subjudul / Ringkasan</label>
                            <input
                                type="text" name="subtitle"
                                value={formData.subtitle} onChange={handleChange}
                                placeholder="Ringkasan singkat yang menarik minat pembaca"
                                className="w-full px-4 py-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] transition-shadow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Isi Konten (Markdown) <span className="text-red-500">*</span></label>
                            <textarea
                                name="content" required rows="15"
                                value={formData.content} onChange={handleChange}
                                placeholder="Tuliskan isi artikel Anda di sini dengan format Markdown..."
                                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-shadow resize-y font-mono text-sm"
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-1">Gunakan format Markdown: # Heading 1, ## Heading 2, **bold**, *italic*, - list</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">URL Gambar Utama (Hero Image)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text" name="image"
                                    value={formData.image} onChange={handleChange}
                                    placeholder="https://..."
                                    className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] transition-shadow"
                                />
                                <div className="w-10 h-10 border border-[#E5E5E5] rounded-lg flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
                                    {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-gray-400" />}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">URL Galeri Gambar</label>
                            <div className="space-y-2">
                                {formData.gallery.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={url} onChange={(e) => handleGalleryChange(index, e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E60012] transition-shadow text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGallery(index)}
                                            className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddGallery}
                                    className="text-sm font-bold text-[#E60012] hover:underline"
                                >
                                    + Tambah Gambar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Config Area */}
                <div className="w-full md:w-80 p-6 bg-[#FAFAFA] overflow-y-auto space-y-6">
                    <div>
                        <h3 className="font-display font-bold text-[#111111] uppercase text-xs tracking-wider mb-4 pb-2 border-b border-[#E5E5E5]">Publishing</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                                <select
                                    name="status" value={formData.status} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#E60012] bg-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Kategori</label>
                                <select
                                    name="category" value={formData.category} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#E60012] bg-white"
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox" name="is_featured"
                                    checked={formData.is_featured} onChange={handleChange}
                                    className="rounded border-gray-300 text-[#E60012] focus:ring-[#E60012]"
                                />
                                <span className="text-sm font-medium text-gray-700">Tampilkan sebagai Featured</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-[#111111] uppercase text-xs tracking-wider mb-4 pb-2 border-b border-[#E5E5E5]">Metadata & CTA</h3>

                        <div className="space-y-4">


                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Penulis</label>
                                <input
                                    type="text" name="author"
                                    value={formData.author} onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#E60012]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Estimasi Waktu Baca</label>
                                <input
                                    type="text" name="read_time" placeholder="e.g. 5 min read"
                                    value={formData.read_time} onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#E60012]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Tags</label>
                                <div className="p-2 bg-white border border-[#E5E5E5] rounded-lg focus-within:border-[#E60012] transition-shadow flex flex-wrap gap-2 items-center min-h-[42px]">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder={formData.tags.length === 0 ? "Ketik lalu tekan Enter..." : ""}
                                        className="flex-1 min-w-[100px] text-sm focus:outline-none bg-transparent"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mt-4">
                                <label className="block text-xs font-bold text-blue-800 mb-1">Call to Action (CTA)</label>
                                <p className="text-[10px] text-blue-600 mb-2 leading-tight">CTA akan ditampilkan di akhir artikel dan mengarahkan user ke asisten AI DINA sesuai konteks.</p>
                                <select
                                    name="cta_type" value={formData.cta_type} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white text-blue-900"
                                >
                                    {Object.entries(CTA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* AI Modal */}
            <AnimatePresence>
                {aiModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isGenerating && setAiModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                                <div className="flex items-center gap-2 text-purple-700">
                                    <Sparkles size={20} />
                                    <h3 className="font-display font-bold text-lg tracking-wide">Generate Artikel AI</h3>
                                </div>
                                {!isGenerating && (
                                    <button onClick={() => setAiModalOpen(false)} className="text-gray-400 hover:text-purple-600"><X size={24} /></button>
                                )}
                            </div>

                            <div className="p-6">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                        <p className="text-purple-700 font-medium animate-pulse">Menghasilkan konten kreatif...</p>
                                    </div>
                                ) : (
                                    <>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Topik atau Konteks Artikel</label>
                                        <textarea
                                            value={aiContext} onChange={(e) => setAiContext(e.target.value)}
                                            placeholder="Contoh: Buatkan artikel tentang pentingnya servis berkala sebelum mudik lebaran, targetkan untuk promo servis..."
                                            className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-shadow resize-none h-32 mb-4 text-sm"
                                        ></textarea>
                                        <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100 mb-6 flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5">💡</span>
                                            <p>AI akan membuat judul, konten, tag, waktu baca, dan memilih tipe CTA secara otomatis berdasarkan input Anda.</p>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setAiModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                                            <button onClick={handleGenerateAI} className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2">
                                                <Sparkles size={16} /> Generate Sekarang
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Publish Confirmation Modal */}
            <AnimatePresence>
                {showPublishConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowPublishConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={32} />
                                </div>
                                <h3 className="font-display font-bold text-xl text-[#111111] mb-2">Publish Artikel?</h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    Artikel ini akan langsung dapat dilihat oleh publik di website. Apakah Anda yakin?
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowPublishConfirm(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                        Batal
                                    </button>
                                    <button onClick={doSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                                        Ya, Publish
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
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className={`fixed bottom-6 left-1/2 z-[300] px-6 py-3 rounded-full shadow-xl font-bold text-sm text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArticleEditor;
