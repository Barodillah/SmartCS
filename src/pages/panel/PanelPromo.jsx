import React, { useState, useEffect } from 'react';
import { 
    Tag, 
    Save, 
    Code, 
    Plus, 
    Trash2, 
    Edit3, 
    RefreshCw, 
    Check, 
    AlertCircle, 
    Search, 
    FileText, 
    Settings, 
    ChevronDown, 
    Calendar, 
    Wrench, 
    Gift, 
    Car, 
    X,
    Eye,
    Layers,
    Sparkles,
    Wand2,
    Bot,
    Copy,
    CheckCheck,
    Loader2,
    FilePlus2
} from 'lucide-react';
import defaultPromoDsf from '../../../knowledge/promo/promo_dsf.json';
import defaultPromoService from '../../../knowledge/promo/progam_service.json';
import defaultPromoReferral from '../../../knowledge/promo/progam_referral.json';
import { ANGULAR_CLIP } from '../../utils/constants';

const API_BASE = 'https://csdwindo.com/api/promo/index.php';

const BUILTIN_PROMO_FILES = [
    {
        id: 'promo_dsf',
        title: 'Promo Penjualan (DSF)',
        filename: 'promo_dsf.json',
        icon: Car,
        description: 'Paket kredit, bunga 0%, DP ringan, dan benefit penjualan mobil baru',
        is_builtin: true,
        defaultData: defaultPromoDsf
    },
    {
        id: 'progam_service',
        title: 'Promo & Program Servis',
        filename: 'progam_service.json',
        icon: Wrench,
        description: 'Diskon ganti oli, gratis cek AC & fogging, recall L300, dan extended SMART package',
        is_builtin: true,
        defaultData: defaultPromoService
    },
    {
        id: 'progam_referral',
        title: 'Program Referral',
        filename: 'progam_referral.json',
        icon: Gift,
        description: 'Reward komisi dan benefit rekomendasi pembelian mobil baru',
        is_builtin: true,
        defaultData: defaultPromoReferral
    }
];

export default function PanelPromo() {
    const [promoFiles, setPromoFiles] = useState(BUILTIN_PROMO_FILES);
    const [activeTab, setActiveTab] = useState('promo_dsf');
    const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'json'

    // Storage for all promo data files
    const [promoDataStore, setPromoDataStore] = useState({
        promo_dsf: defaultPromoDsf,
        progam_service: defaultPromoService,
        progam_referral: defaultPromoReferral
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Raw JSON Text for JSON Editor
    const [rawJsonText, setRawJsonText] = useState('');
    const [jsonError, setJsonError] = useState('');

    // Modals
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [metaForm, setMetaForm] = useState({});

    const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
    const [newModelForm, setNewModelForm] = useState({
        name: '',
        slug: '',
        trade_in: '',
        dp_min: '10%',
        bunga_min: '1.99%',
        bunga_0: '0% 1 tahun',
        benefits: ''
    });

    const [isAddServicePackageModalOpen, setIsAddServicePackageModalOpen] = useState(false);
    const [newPackageForm, setNewPackageForm] = useState({
        package_id: '',
        name: '',
        eligible_models: '',
        promo_price_idr: '',
        normal_price_idr: '',
        discount_percent: 10,
        included: ''
    });

    // Modal Tambah File Promo Baru
    const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
    const [newFileForm, setNewFileForm] = useState({
        title: '',
        id: '',
        template: 'blank' // 'blank' | 'sales_dsf' | 'service' | 'referral'
    });

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        fileId: '',
        fileName: ''
    });

    // AI Modal States
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiRawInput, setAiRawInput] = useState('');
    const [aiGeneratedJson, setAiGeneratedJson] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiCopied, setAiCopied] = useState(false);

    // 1. Fetch promo data on mount
    const fetchAllPromoData = async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await fetch(API_BASE);
            const data = await res.json();
            if (data.status && data.data) {
                const incomingPromos = data.data.promos || data.data;
                const incomingFiles = data.data.files || [];

                // Filter out null / invalid entries so they don't overwrite default valid JSON
                const validPromos = {};
                for (const [k, v] of Object.entries(incomingPromos)) {
                    if (v && typeof v === 'object' && Object.keys(v).length > 0) {
                        validPromos[k] = v;
                    }
                }

                setPromoDataStore(prev => ({
                    ...prev,
                    ...validPromos
                }));

                // Ensure BUILTIN_PROMO_FILES always remain present and merge any extra files
                const filesMap = new Map();
                BUILTIN_PROMO_FILES.forEach(b => filesMap.set(b.id, { ...b }));

                if (Array.isArray(incomingFiles)) {
                    incomingFiles.forEach(f => {
                        if (filesMap.has(f.id)) {
                            const existing = filesMap.get(f.id);
                            filesMap.set(f.id, {
                                ...existing,
                                title: f.title || existing.title,
                                filename: f.filename || existing.filename
                            });
                        } else {
                            filesMap.set(f.id, {
                                id: f.id,
                                title: f.title || f.id.replace(/^(promo_|progam_)/, '').replace(/_/g, ' ').toUpperCase(),
                                filename: f.filename || `${f.id}.json`,
                                icon: Tag,
                                description: 'Berkas promo kustom tambahan',
                                is_builtin: false,
                                defaultData: incomingPromos[f.id] || {}
                            });
                        }
                    });
                }
                setPromoFiles(Array.from(filesMap.values()));
            }
        } catch (err) {
            console.warn('Gagal memuat promo dari API, menggunakan data lokal default:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPromoData();
    }, []);

    const activeFileData = promoFiles.find(f => f.id === activeTab) || promoFiles[0] || BUILTIN_PROMO_FILES[0];
    const currentData = (promoDataStore && promoDataStore[activeTab]) || activeFileData?.defaultData || {};

    // Sync rawJsonText when activeTab or promoDataStore changes
    useEffect(() => {
        const dataToDisplay = (promoDataStore && promoDataStore[activeTab]) || activeFileData?.defaultData || {};
        setRawJsonText(JSON.stringify(dataToDisplay, null, 2));
        setJsonError('');
    }, [activeTab, promoDataStore]);

    // Save helper to API
    const savePromoData = async (dataToSave, targetTab = activeTab) => {
        setIsSaving(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}?file=${targetTab}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: targetTab,
                    data: dataToSave
                })
            });
            const result = await res.json();
            if (result.status) {
                setPromoDataStore(prev => ({
                    ...prev,
                    [targetTab]: dataToSave
                }));
                setStatusMessage({
                    type: 'success',
                    text: `Berhasil disimpan ke app_data: ${targetTab}.json`
                });
                return true;
            } else {
                setStatusMessage({
                    type: 'error',
                    text: result.message || 'Gagal menyimpan ke app_data'
                });
                return false;
            }
        } catch (err) {
            console.error('Error saving promo data:', err);
            setStatusMessage({
                type: 'error',
                text: 'Terjadi kesalahan jaringan saat menyimpan data.'
            });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // --- JSON Mode Handlers ---
    const handleJsonChange = (e) => {
        const text = e.target.value;
        setRawJsonText(text);
        try {
            JSON.parse(text);
            setJsonError('');
        } catch (err) {
            setJsonError(`JSON Syntax Error: ${err.message}`);
        }
    };

    const handleFormatJson = () => {
        try {
            const parsed = JSON.parse(rawJsonText);
            setRawJsonText(JSON.stringify(parsed, null, 2));
            setJsonError('');
        } catch (err) {
            setJsonError(`Tidak dapat merapikan: ${err.message}`);
        }
    };

    const handleSaveJsonEditor = async () => {
        try {
            const parsed = JSON.parse(rawJsonText);
            setJsonError('');
            await savePromoData(parsed, activeTab);
        } catch (err) {
            setJsonError(`Format JSON tidak valid: ${err.message}`);
            alert(`Format JSON tidak valid: ${err.message}`);
        }
    };

    const handleResetToDefault = async () => {
        if (!window.confirm(`Kembalikan data ${activeFileData.filename} ke default awal?`)) return;
        const defaultData = activeFileData.defaultData || {};
        setRawJsonText(JSON.stringify(defaultData, null, 2));
        await savePromoData(defaultData, activeTab);
    };

    // --- Create New Promo File Handler ---
    const handleCreateNewPromoFile = async () => {
        if (!newFileForm.title.trim()) {
            alert('Judul berkas promo harus diisi!');
            return;
        }

        const rawId = newFileForm.id.trim() || newFileForm.title.trim();
        const cleanId = rawId.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');

        if (!cleanId) {
            alert('Nama ID berkas tidak valid.');
            return;
        }

        if (promoFiles.some(f => f.id === cleanId)) {
            alert(`Berkas dengan ID '${cleanId}' sudah ada! Gunakan nama lain.`);
            return;
        }

        let initialData = {};
        if (newFileForm.template === 'sales_dsf') {
            initialData = {
                meta: {
                    brand: "Mitsubishi Motors",
                    distributor: "PT Mitsubishi Motors Krama Yudha Sales Indonesia (MMKSI)",
                    periode: "November 2026",
                    note: "Semua program berlaku dengan syarat dan ketentuan"
                },
                models: []
            };
        } else if (newFileForm.template === 'service') {
            initialData = {
                schema_version: "2.0",
                document_title: newFileForm.title,
                periode: "November 2026",
                dealer_group: "PT Dwindo Berlian Samjaya",
                campaigns: []
            };
        } else if (newFileForm.template === 'referral') {
            initialData = {
                program: {
                    name: newFileForm.title,
                    reward: "Rp 1.000.000",
                    period: { start: "2026-11-01", end: "2026-11-30" },
                    summary: "Program referral khusus"
                },
                benefits: [],
                requirements: { referrer: [], receiver: [] }
            };
        } else {
            initialData = {
                document_title: newFileForm.title,
                periode: "November 2026",
                description: "Deskripsi program promo tambahan",
                items: []
            };
        }

        const success = await savePromoData(initialData, cleanId);
        if (success) {
            const newFileObj = {
                id: cleanId,
                title: newFileForm.title,
                filename: `${cleanId}.json`,
                icon: Tag,
                description: 'Berkas promo kustom tambahan',
                is_builtin: false,
                defaultData: initialData
            };
            setPromoFiles(prev => [...prev, newFileObj]);
            setActiveTab(cleanId);
            setIsNewFileModalOpen(false);
            setNewFileForm({ title: '', id: '', template: 'blank' });
            setStatusMessage({
                type: 'success',
                text: `Berkas promo baru '${cleanId}.json' berhasil dibuat dan siap dikelola!`
            });
        }
    };

    // --- Delete Promo File Handler ---
    const handleDeletePromoFile = (fileId, fileName) => {
        setDeleteModal({
            isOpen: true,
            fileId,
            fileName
        });
    };

    const confirmDeletePromoFile = async () => {
        const { fileId, fileName } = deleteModal;
        if (!fileId) return;

        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}?file=${fileId}&action=delete`, {
                method: 'POST'
            });
            const result = await res.json();
            if (result.status) {
                setPromoFiles(prev => prev.filter(f => f.id !== fileId));
                setPromoDataStore(prev => {
                    const next = { ...prev };
                    delete next[fileId];
                    return next;
                });
                setActiveTab('promo_dsf');
                setStatusMessage({
                    type: 'success',
                    text: `Berkas promo '${fileName}' berhasil dihapus.`
                });
                setDeleteModal({ isOpen: false, fileId: '', fileName: '' });
            } else {
                alert(result.message || 'Gagal menghapus berkas promo.');
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- AI Generator Handlers ---
    const handleGenerateAiJson = async () => {
        if (!aiRawInput.trim()) {
            alert('Silakan masukkan teks atau data mentah promo terlebih dahulu.');
            return;
        }

        setIsAiGenerating(true);
        setAiError('');

        try {
            const schemaSnippet = JSON.stringify(currentData, null, 2).slice(0, 3500);

            const systemPrompt = `Kamu adalah asisten AI spesialis penataan data JSON untuk dealer resmi Mitsubishi Dwindo.
Tugas kamu adalah membaca "Data Mentah" teks promo yang diberikan pengguna (dari brosur, WhatsApp, atau memo), lalu menyusun dan menghasilkan dokumen JSON lengkap yang 100% valid.

Target Berkas: ${activeFileData.filename} (${activeFileData.title}).
Contoh struktur dan skema target:
${schemaSnippet}

Panduan penting:
1. Pahami data mentah (nama model, varian, diskon, harga promo, DP, bunga tenor, benefit, syarat, dll).
2. Format output harus persis mengikuti struktur JSON yang sesuai dengan target berkas di atas.
3. Pastikan semua angka harga berupa number tanpa titik/koma (misal: 1089900 bukan "1.089.900").
4. Jawab HANYA berupa JSON valid murni tanpa teks pengantar, tanpa markdown code fence, dan tanpa penjelasan apapun di luar JSON.`;

            const res = await fetch('https://csdwindo.com/api/proxy_ai.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash-lite',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Data Mentah Promo:\n${aiRawInput}` }
                    ],
                    temperature: 0.2
                })
            });

            if (!res.ok) {
                throw new Error(`Gagal memanggil API AI (Status HTTP ${res.status})`);
            }

            const resData = await res.json();
            let reply = resData.choices?.[0]?.message?.content?.trim() || '';

            // Bersihkan markdown code fence jika ada
            reply = reply.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

            const parsed = JSON.parse(reply);
            const formatted = JSON.stringify(parsed, null, 2);
            setAiGeneratedJson(formatted);
        } catch (err) {
            console.error('AI Generate Error:', err);
            setAiError(err.message || 'Gagal mengubah data mentah menjadi format JSON.');
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleApplyAiJson = () => {
        if (!aiGeneratedJson) return;
        try {
            const parsed = JSON.parse(aiGeneratedJson);
            setRawJsonText(aiGeneratedJson);
            setPromoDataStore(prev => ({
                ...prev,
                [activeTab]: parsed
            }));
            setJsonError('');
            setIsAiModalOpen(false);
            setAiRawInput('');
            setAiGeneratedJson('');
            setStatusMessage({
                type: 'success',
                text: 'JSON dari AI berhasil diterapkan ke editor! Klik "Simpan Perubahan" untuk menyimpan ke database app_data.'
            });
        } catch (err) {
            alert('Format JSON hasil AI tidak valid: ' + err.message);
        }
    };

    const handleCopyAiJson = () => {
        if (!aiGeneratedJson) return;
        navigator.clipboard.writeText(aiGeneratedJson);
        setAiCopied(true);
        setTimeout(() => setAiCopied(false), 2000);
    };

    // --- Visual Mode: Delete Handlers ---
    const handleDeleteDsfModel = async (modelIndex, modelName) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus model promo: ${modelName}?`)) return;
        const updated = JSON.parse(JSON.stringify(currentData));
        if (updated.models) {
            updated.models.splice(modelIndex, 1);
            await savePromoData(updated);
        }
    };

    const handleDeleteServicePackage = async (campaignIndex, pkgIndex, pkgName) => {
        if (!window.confirm(`Hapus paket servis "${pkgName}"?`)) return;
        const updated = JSON.parse(JSON.stringify(currentData));
        if (updated.campaigns?.[campaignIndex]?.packages) {
            updated.campaigns[campaignIndex].packages.splice(pkgIndex, 1);
            await savePromoData(updated);
        }
    };

    const handleDeleteReferralBenefit = async (index) => {
        if (!window.confirm('Hapus benefit referral ini?')) return;
        const updated = JSON.parse(JSON.stringify(currentData));
        if (updated.benefits) {
            updated.benefits.splice(index, 1);
            await savePromoData(updated);
        }
    };

    // --- Meta Edit Handler ---
    const handleOpenMetaModal = () => {
        setMetaForm({
            periode: currentData?.meta?.periode || currentData?.periode || currentData?.program?.period?.start || '',
            title: currentData?.document_title || currentData?.program_name || '',
            distributor: currentData?.meta?.distributor || '',
            dealer_group: currentData?.dealer_group || '',
            note: currentData?.meta?.note || currentData?.description || ''
        });
        setIsMetaModalOpen(true);
    };

    const handleSaveMeta = async () => {
        const updated = JSON.parse(JSON.stringify(currentData));
        if (activeTab === 'promo_dsf') {
            if (!updated.meta) updated.meta = {};
            updated.meta.periode = metaForm.periode;
            updated.meta.distributor = metaForm.distributor;
            updated.meta.note = metaForm.note;
        } else if (activeTab === 'progam_service') {
            updated.periode = metaForm.periode;
            updated.dealer_group = metaForm.dealer_group;
        } else if (activeTab === 'progam_referral') {
            if (!updated.program) updated.program = {};
            updated.program.summary = metaForm.note;
        } else {
            updated.periode = metaForm.periode;
            updated.document_title = metaForm.title;
            updated.description = metaForm.note;
        }
        const success = await savePromoData(updated);
        if (success) setIsMetaModalOpen(false);
    };

    // --- Add New Model Handler (promo_dsf) ---
    const handleSaveNewModel = async () => {
        if (!newModelForm.name.trim()) {
            alert('Nama model harus diisi!');
            return;
        }
        const updated = JSON.parse(JSON.stringify(currentData));
        if (!updated.models) updated.models = [];

        const newModelObj = {
            name: newModelForm.name.trim(),
            slug: newModelForm.slug.trim() || newModelForm.name.toLowerCase().replace(/[\s-]+/g, '-'),
            programs: {
                trade_in: newModelForm.trade_in || 'DSS Motor (Jabodetabek & Bandung)',
                finance: {
                    provider: 'PT Dipo Star Finance',
                    dp_ringan: {
                        dp_min: newModelForm.dp_min || '10%',
                        tenor_max: '6 tahun'
                    },
                    bunga_ringan: {
                        interest_start: newModelForm.bunga_min || '1.99%',
                        tenor_max: '6 tahun'
                    },
                    bunga_0: [
                        newModelForm.bunga_0 || '0% 1 tahun'
                    ]
                }
            },
            benefits: newModelForm.benefits ? newModelForm.benefits.split(',').map(b => b.trim()) : [
                'Gratis servis & suku cadang berkala',
                'Garansi resmi Mitsubishi Motors'
            ]
        };

        updated.models.push(newModelObj);
        const success = await savePromoData(updated);
        if (success) {
            setIsAddModelModalOpen(false);
            setNewModelForm({
                name: '',
                slug: '',
                trade_in: '',
                dp_min: '10%',
                bunga_min: '1.99%',
                bunga_0: '0% 1 tahun',
                benefits: ''
            });
        }
    };

    // --- Add New Service Package Handler (progam_service) ---
    const handleSaveNewServicePackage = async () => {
        if (!newPackageForm.name.trim() || !newPackageForm.promo_price_idr) {
            alert('Nama paket dan harga promo harus diisi!');
            return;
        }
        const updated = JSON.parse(JSON.stringify(currentData));
        if (!updated.campaigns || updated.campaigns.length === 0) {
            updated.campaigns = [{
                campaign_id: 'promo_service_dwindo',
                campaign_name: 'Promo Servis Mitsubishi Dwindo',
                packages: []
            }];
        }

        const promoPrice = parseInt(newPackageForm.promo_price_idr, 10);
        const normalPrice = parseInt(newPackageForm.normal_price_idr, 10) || Math.round(promoPrice * 1.1);
        const discountIdr = normalPrice - promoPrice;

        const newPkg = {
            package_id: newPackageForm.package_id.trim() || newPackageForm.name.toLowerCase().replace(/[\s-]+/g, '_'),
            name: newPackageForm.name.trim(),
            eligible_models: newPackageForm.eligible_models ? newPackageForm.eligible_models.split(',').map(m => m.trim()) : ['Mitsubishi All Models'],
            promo_price_idr: promoPrice,
            normal_price_idr: normalPrice,
            discount_idr: discountIdr,
            discount_percent: parseInt(newPackageForm.discount_percent, 10) || 10,
            included: newPackageForm.included ? newPackageForm.included.split(',').map(i => i.trim()) : ['Jasa servis', 'Oli Mesin', 'Filter Oli', 'Gasket']
        };

        if (!updated.campaigns[0].packages) updated.campaigns[0].packages = [];
        updated.campaigns[0].packages.push(newPkg);

        const success = await savePromoData(updated);
        if (success) {
            setIsAddServicePackageModalOpen(false);
            setNewPackageForm({
                package_id: '',
                name: '',
                eligible_models: '',
                promo_price_idr: '',
                normal_price_idr: '',
                discount_percent: 10,
                included: ''
            });
        }
    };

    return (
        <div className="animate-in fade-in duration-300 pb-16 font-body">
            {/* Header Title & Actions */}
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-5 h-5 text-[#E60012]" />
                        <span className="text-xs uppercase font-bold text-[#E60012] tracking-widest font-display">
                            Knowledge Base Management
                        </span>
                    </div>
                    <h1 className="font-display font-extrabold text-[26px] text-gray-900 uppercase tracking-tight">
                        Kelola Promo &amp; Program
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Kelola seluruh berkas promo dinamis pada <code className="text-xs bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono">knowledge/promo</code> yang disimpan di tabel <code className="text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono">app_data</code>.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsNewFileModalOpen(true)}
                        className="px-3.5 py-2 bg-[#E60012] hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-xs"
                    >
                        <FilePlus2 size={15} />
                        <span>+ Berkas Promo Baru</span>
                    </button>

                    <button
                        type="button"
                        onClick={fetchAllPromoData}
                        disabled={isLoading}
                        className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh Data</span>
                    </button>

                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setViewMode('visual')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'visual'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Eye size={14} />
                            <span>Visual Builder</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('json')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                                viewMode === 'json'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Code size={14} />
                            <span>Editor JSON</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert Status Notification */}
            {statusMessage.text && (
                <div className={`p-4 mb-6 rounded-xl flex items-center justify-between text-sm shadow-xs ${
                    statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {statusMessage.type === 'success' ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                        <span className="font-medium">{statusMessage.text}</span>
                    </div>
                    <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Selector File Promo (Dinamis: Bawaan + Tambahan) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-6">
                {promoFiles.map((file) => {
                    const isSelected = activeTab === file.id;
                    const Icon = file.icon || Tag;
                    return (
                        <div
                            key={file.id}
                            onClick={() => setActiveTab(file.id)}
                            className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 cursor-pointer relative group ${
                                isSelected
                                    ? 'bg-red-50/60 border-red-300 ring-2 ring-red-100 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' : 'bg-gray-100 text-gray-600'}`}>
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0 flex-1 pr-6">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-red-900 font-display' : 'text-gray-900 font-display'}`}>
                                        {file.title}
                                    </h3>
                                </div>
                                <p className="text-[11px] font-mono text-gray-500 mb-1 flex items-center gap-1">
                                    <span>{file.filename}</span>
                                    {!file.is_builtin && (
                                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.2 rounded font-sans font-bold">Kustom</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {file.description}
                                </p>
                            </div>

                            {/* Delete custom promo file icon */}
                            {!file.is_builtin && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePromoFile(file.id, file.filename);
                                    }}
                                    className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Hapus berkas promo ini"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            {isSelected && (
                                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-600 shrink-0" />
                            )}
                        </div>
                    );
                })}

                {/* Card Tambah Berkas Cepat */}
                <button
                    type="button"
                    onClick={() => setIsNewFileModalOpen(true)}
                    className="p-4 rounded-2xl text-left border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-gray-500 hover:text-red-600 min-h-[110px]"
                >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <Plus size={18} />
                    </div>
                    <span className="text-xs font-bold font-display uppercase tracking-wider">
                        + Tambah Berkas Promo
                    </span>
                </button>
            </div>

            {/* Meta Information Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xs">
                <div className="flex flex-wrap items-center gap-6">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                            Target File
                        </span>
                        <span className="font-semibold text-gray-900 text-sm font-mono flex items-center gap-1.5">
                            <FileText size={14} className="text-red-500" />
                            {activeFileData.filename}
                        </span>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                            Periode Aktif
                        </span>
                        <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <Calendar size={14} className="text-blue-500" />
                            {currentData?.meta?.periode || currentData?.periode || currentData?.program?.period?.start || 'Aktif'}
                        </span>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                            Penyimpanan
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Tabel app_data (`{activeFileData.id}`)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleOpenMetaModal}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                        <Settings size={14} /> Edit Metadata
                    </button>

                    {activeFileData.is_builtin ? (
                        <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Reset Default
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleDeletePromoFile(activeFileData.id, activeFileData.filename)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={13} /> Hapus Berkas
                        </button>
                    )}
                </div>
            </div>

            {/* VIEW MODE: JSON EDITOR */}
            {viewMode === 'json' && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="bg-gray-900 text-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <Code size={16} className="text-red-400" />
                            <span className="font-mono text-xs font-semibold">
                                Editor JSON Mentah — {activeFileData.filename}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAiModalOpen(true);
                                    setAiGeneratedJson('');
                                    setAiError('');
                                }}
                                className="ml-2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group"
                                title="Buka AI Generator untuk mengubah data mentah menjadi format JSON"
                            >
                                <Sparkles size={14} className="text-amber-300 group-hover:rotate-12 transition-transform animate-pulse" />
                                <span>AI Generate JSON</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleFormatJson}
                                className="px-3 py-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                            >
                                Format / Prettify
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveJsonEditor}
                                disabled={isSaving || !!jsonError}
                                className="px-4 py-1.5 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-md flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                            >
                                <Save size={13} />
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </div>

                    {jsonError && (
                        <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-2 text-xs text-red-600 font-mono">
                            {jsonError}
                        </div>
                    )}

                    <textarea
                        value={rawJsonText}
                        onChange={handleJsonChange}
                        rows={24}
                        spellCheck={false}
                        className="w-full p-4 font-mono text-xs sm:text-sm bg-gray-950 text-gray-100 focus:outline-none focus:ring-0 leading-relaxed border-none resize-y selection:bg-red-900 selection:text-white"
                        placeholder="Masukkan data JSON..."
                    />
                </div>
            )}

            {/* VIEW MODE: VISUAL BUILDER */}
            {viewMode === 'visual' && (
                <div className="space-y-6">
                    {/* TAB 1: PROMO PENJUALAN KENDARAAN (DSF) */}
                    {activeTab === 'promo_dsf' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                                <div>
                                    <h2 className="font-display font-bold text-lg text-gray-900 uppercase">
                                        Daftar Program Promo Model Kendaraan ({currentData?.models?.length || 0} Model)
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Data promo pembiayaan DSF, bunga 0%, DP ringan, dan benefit per model kendaraan.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModelModalOpen(true)}
                                        className="px-4 py-2 bg-[#111111] hover:bg-[#E60012] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                                        style={{ clipPath: ANGULAR_CLIP }}
                                    >
                                        <Plus size={15} /> Tambah Model Baru
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(currentData?.models || []).map((model, idx) => (
                                    <div
                                        key={model.slug || idx}
                                        className="bg-white rounded-2xl border border-gray-200 hover:border-red-200 p-5 shadow-xs transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                                                        MODEL MITSUBISHI
                                                    </span>
                                                    <h3 className="font-display font-black text-lg text-gray-900 uppercase">
                                                        {model.name}
                                                    </h3>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDsfModel(idx, model.name)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Model"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Info Finance & Program */}
                                            {model.programs && (
                                                <div className="space-y-2 text-xs text-gray-600 mb-4 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                                                    {model.programs?.finance?.dp_ringan && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">DP Ringan:</span>
                                                            <span className="font-semibold text-gray-800">
                                                                Mulai {typeof model.programs.finance.dp_ringan === 'object' ? (model.programs.finance.dp_ringan.dp_min || '-') : String(model.programs.finance.dp_ringan)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {model.programs?.finance?.bunga_ringan && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">Bunga Ringan:</span>
                                                            <span className="font-semibold text-gray-800">
                                                                Mulai {typeof model.programs.finance.bunga_ringan === 'object' ? (model.programs.finance.bunga_ringan.interest_start || '-') : String(model.programs.finance.bunga_ringan)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {model.programs?.finance?.bunga_0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">Bunga 0%:</span>
                                                            <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                                                                {Array.isArray(model.programs.finance.bunga_0)
                                                                    ? model.programs.finance.bunga_0.map(b => typeof b === 'object' ? (b.tenor || b.note || '0%') : String(b)).join(', ')
                                                                    : typeof model.programs.finance.bunga_0 === 'object'
                                                                        ? (model.programs.finance.bunga_0.tenor || 'Tersedia')
                                                                        : String(model.programs.finance.bunga_0)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {model.programs?.trade_in && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">Trade-In:</span>
                                                            <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                                                                {typeof model.programs.trade_in === 'object'
                                                                    ? (model.programs.trade_in.provider ? `${model.programs.trade_in.provider}` : 'Tersedia')
                                                                    : String(model.programs.trade_in)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Support Model dengan Varian (contoh: New Xforce) */}
                                            {model.variants && model.variants.length > 0 && (
                                                <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                                        Varian Program ({model.variants.length}):
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {model.variants.map((v, vIdx) => (
                                                            <span key={vIdx} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-semibold text-gray-700">
                                                                {v.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Keuntungan / Benefits */}
                                            {((model.benefits && model.benefits.length > 0) || (model.common_benefits && model.common_benefits.length > 0)) && (
                                                <div className="space-y-1 mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                                        Keuntungan Tambahan ({((model.benefits || model.common_benefits) || []).length}):
                                                    </span>
                                                    <ul className="space-y-1">
                                                        {(model.benefits || model.common_benefits || []).slice(0, 3).map((b, bIdx) => (
                                                            <li key={bIdx} className="text-xs text-gray-600 flex items-start gap-1.5">
                                                                <span className="text-red-500 font-bold shrink-0">•</span>
                                                                <span className="truncate">{typeof b === 'string' ? b : JSON.stringify(b)}</span>
                                                            </li>
                                                        ))}
                                                        {((model.benefits || model.common_benefits) || []).length > 3 && (
                                                            <li className="text-[11px] text-gray-400 italic">
                                                                +{((model.benefits || model.common_benefits) || []).length - 3} benefit lainnya...
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                                            <span className="text-[11px] text-gray-400 font-mono">
                                                slug: {model.slug}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('json')}
                                                className="text-[#E60012] font-semibold hover:underline flex items-center gap-1"
                                            >
                                                <Edit3 size={12} /> Edit JSON
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PROMO & PROGRAM SERVIS */}
                    {activeTab === 'progam_service' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h2 className="font-display font-bold text-lg text-gray-900 uppercase">
                                        Paket Servis Hemat &amp; Ganti Oli
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Daftar paket harga promo servis berkala yang diberikan saat customer menanyakan promo bengkel.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsAddServicePackageModalOpen(true)}
                                    className="px-4 py-2 bg-[#111111] hover:bg-[#E60012] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                                    style={{ clipPath: ANGULAR_CLIP }}
                                >
                                    <Plus size={15} /> Tambah Paket Servis
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(currentData?.campaigns || []).map((camp, cIdx) => (
                                    <React.Fragment key={camp.campaign_id || cIdx}>
                                        {(camp.packages || []).map((pkg, pIdx) => (
                                            <div
                                                key={pkg.package_id || pIdx}
                                                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 p-5 shadow-xs transition-all flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                                                                Diskon {pkg.discount_percent || 10}%
                                                            </span>
                                                            <h3 className="font-bold text-base text-gray-900">
                                                                {pkg.name}
                                                            </h3>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteServicePackage(cIdx, pIdx, pkg.name)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Paket"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-baseline gap-2 mb-3">
                                                        <span className="font-display font-extrabold text-xl text-[#E60012]">
                                                            Rp {Number(pkg.promo_price_idr || 0).toLocaleString('id-ID')}
                                                        </span>
                                                        {pkg.normal_price_idr && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                Rp {Number(pkg.normal_price_idr || 0).toLocaleString('id-ID')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-3">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Model Kendaraan:</span>
                                                            <span className="font-medium text-gray-800">
                                                                {Array.isArray(pkg.eligible_models) ? pkg.eligible_models.join(', ') : String(pkg.eligible_models || '-')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Termasuk:</span>
                                                            <span className="text-gray-700">
                                                                {Array.isArray(pkg.included) ? pkg.included.join(', ') : String(pkg.included || '-')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                                                    <span className="text-[11px] text-gray-400 font-mono">
                                                        ID: {pkg.package_id}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewMode('json')}
                                                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        <Edit3 size={12} /> Edit di JSON
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PROGRAM REFERRAL */}
                    {activeTab === 'progam_referral' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display font-bold text-lg text-gray-900 uppercase mb-1">
                                    Detail Program Referral Konsumen
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Informasi reward, syarat perujuk (referrer), dan penerima rujukan (receiver).
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                            Nama Program
                                        </span>
                                        <p className="font-display font-bold text-lg text-gray-900">
                                            {currentData?.program?.name || 'Program Referral Dwindo'}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                            Besaran Reward
                                        </span>
                                        <p className="font-display font-extrabold text-lg text-[#E60012]">
                                            {currentData?.program?.reward || 'Rp 1.000.000 / unit'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                        Ringkasan Program
                                    </span>
                                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                        {currentData?.program?.summary || 'Konsumen mereferensikan kenalan untuk membeli mobil di Dwindo.'}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-2">
                                        Keuntungan Bagi Referrer ({currentData?.benefits?.length || 0}):
                                    </span>
                                    <div className="space-y-2">
                                        {(currentData?.benefits || []).map((b, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                                <span className="font-medium text-gray-800">{b}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReferralBenefit(idx)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: BERKAS PROMO TAMBAHAN / KUSTOM */}
                    {!['promo_dsf', 'progam_service', 'progam_referral'].includes(activeTab) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs text-center space-y-4">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-purple-100">
                                <Tag size={32} />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h3 className="font-display font-bold text-xl text-gray-900 uppercase">
                                    {activeFileData.title}
                                </h3>
                                <p className="text-xs font-mono text-gray-500 mt-1 mb-2">
                                    {activeFileData.filename}
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Berkas promo tambahan ini aktif dan tersimpan di database <code className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded font-mono">app_data</code> (`{activeFileData.id}`). Anda dapat mengisi atau menyusun datanya dengan cepat melalui Editor JSON atau AI Generator.
                                </p>
                            </div>

                            <div className="pt-2 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAiModalOpen(true);
                                        setAiGeneratedJson('');
                                        setAiError('');
                                    }}
                                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                                >
                                    <Sparkles size={15} className="text-amber-300" />
                                    <span>AI Generate JSON dari Data Mentah</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setViewMode('json')}
                                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                                >
                                    <Code size={15} />
                                    <span>Buka Editor JSON</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL BUAT BERKAS PROMO BARU */}
            {isNewFileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-50 text-[#E60012] rounded-xl">
                                    <FilePlus2 size={18} />
                                </div>
                                <h3 className="font-display font-bold text-base text-gray-900 uppercase">
                                    Tambah Berkas Promo Baru
                                </h3>
                            </div>
                            <button onClick={() => setIsNewFileModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Judul / Nama Promo:</label>
                                <input
                                    type="text"
                                    value={newFileForm.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        const autoId = title.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
                                        setNewFileForm({ ...newFileForm, title, id: autoId ? `promo_${autoId.replace(/^promo_/, '')}` : '' });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-xs"
                                    placeholder="Contoh: Promo Spesial Lebaran"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">ID File / Nama Berkas (.json):</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={newFileForm.id}
                                        onChange={(e) => setNewFileForm({ ...newFileForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-red-500 font-mono text-xs"
                                        placeholder="promo_lebaran"
                                    />
                                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg font-mono text-gray-500 text-xs">
                                        .json
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-400 mt-1 block">
                                    Hanya huruf kecil, angka, dan garis bawah (_).
                                </span>
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Pilihan Template Awal:</label>
                                <select
                                    value={newFileForm.template}
                                    onChange={(e) => setNewFileForm({ ...newFileForm, template: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-xs bg-white"
                                >
                                    <option value="blank">Dokumen JSON Kosong ({`{}`})</option>
                                    <option value="sales_dsf">Template Promo Penjualan (Kredit &amp; Model)</option>
                                    <option value="service">Template Promo Servis (Paket &amp; Bengkel)</option>
                                    <option value="referral">Template Program Referral</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsNewFileModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateNewPromoFile}
                                disabled={isSaving || !newFileForm.title.trim()}
                                className="px-4 py-2 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
                            >
                                {isSaving ? 'Membuat...' : 'Buat Berkas Promo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDIT METADATA */}
            {isMetaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <h3 className="font-display font-bold text-base text-gray-900 uppercase">
                                Edit Metadata ({activeFileData.filename})
                            </h3>
                            <button onClick={() => setIsMetaModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Periode Promo:</label>
                                <input
                                    type="text"
                                    value={metaForm.periode || ''}
                                    onChange={(e) => setMetaForm({ ...metaForm, periode: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    placeholder="Contoh: November 2026"
                                />
                            </div>

                            {activeTab === 'promo_dsf' && (
                                <>
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Distributor Resmi:</label>
                                        <input
                                            type="text"
                                            value={metaForm.distributor || ''}
                                            onChange={(e) => setMetaForm({ ...metaForm, distributor: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Catatan Syarat &amp; Ketentuan:</label>
                                        <input
                                            type="text"
                                            value={metaForm.note || ''}
                                            onChange={(e) => setMetaForm({ ...metaForm, note: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'progam_service' && (
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Nama Dealer Group:</label>
                                    <input
                                        type="text"
                                        value={metaForm.dealer_group || ''}
                                        onChange={(e) => setMetaForm({ ...metaForm, dealer_group: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            )}

                            {!['promo_dsf', 'progam_service'].includes(activeTab) && (
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Judul / Deskripsi Dokumen:</label>
                                    <input
                                        type="text"
                                        value={metaForm.title || ''}
                                        onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsMetaModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveMeta}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Metadata'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ADD MODEL (promo_dsf) */}
            {isAddModelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <h3 className="font-display font-bold text-base text-gray-900 uppercase">
                                Tambah Model Promo Baru (DSF)
                            </h3>
                            <button onClick={() => setIsAddModelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Nama Model:</label>
                                    <input
                                        type="text"
                                        value={newModelForm.name}
                                        onChange={(e) => setNewModelForm({ ...newModelForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="Contoh: All New Xforce"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Slug URL:</label>
                                    <input
                                        type="text"
                                        value={newModelForm.slug}
                                        onChange={(e) => setNewModelForm({ ...newModelForm, slug: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="all-new-xforce"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">DP Ringan:</label>
                                    <input
                                        type="text"
                                        value={newModelForm.dp_min}
                                        onChange={(e) => setNewModelForm({ ...newModelForm, dp_min: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="10%"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Bunga Ringan:</label>
                                    <input
                                        type="text"
                                        value={newModelForm.bunga_min}
                                        onChange={(e) => setNewModelForm({ ...newModelForm, bunga_min: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="1.99%"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Bunga 0%:</label>
                                    <input
                                        type="text"
                                        value={newModelForm.bunga_0}
                                        onChange={(e) => setNewModelForm({ ...newModelForm, bunga_0: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="0% 1 tahun"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Program Trade-In:</label>
                                <input
                                    type="text"
                                    value={newModelForm.trade_in}
                                    onChange={(e) => setNewModelForm({ ...newModelForm, trade_in: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    placeholder="DSS Motor (Jabodetabek & Bandung)"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Keuntungan Tambahan (Pisahkan dengan koma):</label>
                                <textarea
                                    value={newModelForm.benefits}
                                    onChange={(e) => setNewModelForm({ ...newModelForm, benefits: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    rows={2}
                                    placeholder="Gratis kaca film Solargard, Gratis servis hingga 50.000 km, Garansi 100.000 km"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsAddModelModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveNewModel}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Model Baru'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ADD SERVICE PACKAGE (progam_service) */}
            {isAddServicePackageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <h3 className="font-display font-bold text-base text-gray-900 uppercase">
                                Tambah Paket Servis Hemat Baru
                            </h3>
                            <button onClick={() => setIsAddServicePackageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Nama Paket Servis:</label>
                                <input
                                    type="text"
                                    value={newPackageForm.name}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    placeholder="Contoh: Paket Servis Hemat New Destinator"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Harga Promo (Rp):</label>
                                    <input
                                        type="number"
                                        value={newPackageForm.promo_price_idr}
                                        onChange={(e) => setNewPackageForm({ ...newPackageForm, promo_price_idr: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="1089900"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Harga Normal (Rp):</label>
                                    <input
                                        type="number"
                                        value={newPackageForm.normal_price_idr}
                                        onChange={(e) => setNewPackageForm({ ...newPackageForm, normal_price_idr: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                        placeholder="1211000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Model Kendaraan (Pisahkan koma):</label>
                                <input
                                    type="text"
                                    value={newPackageForm.eligible_models}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, eligible_models: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    placeholder="Mitsubishi Xpander, Mitsubishi Xforce"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Pekerjaan / Komponen Termasuk (Pisahkan koma):</label>
                                <input
                                    type="text"
                                    value={newPackageForm.included}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, included: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                    placeholder="Jasa servis berkala, Oli mesin Mitsubishi Genuine Oil, Filter oli, Gasket"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsAddServicePackageModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveNewServicePackage}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Paket Servis'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL AI JSON GENERATOR */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-xs">
                                    <Sparkles size={18} className="animate-pulse text-amber-300" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-base text-gray-900 uppercase flex items-center gap-2">
                                        <span>AI JSON Generator</span>
                                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md normal-case">
                                            {activeFileData.filename}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tempelkan data teks mentah (brosur promo, pesan WA, daftar rincian) untuk otomatis diubah menjadi format JSON valid.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAiModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                    <span>Input Data Teks Mentah Promo:</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (activeTab === 'promo_dsf') {
                                                setAiRawInput("Program Promo Mitsubishi November 2026:\n- Destinator: DP mulai 10%, Bunga ringan mulai 1.99%, Bunga 0% 1 tahun, Smart Cash tenor 1 th bunga 0%, Gratis kaca film Solargard, Gratis servis 60.000 km / 4 th, Garansi 120.000 km.\n- New Xforce: DP mulai 10%, Bunga 0% 1 th, Cashback spesial, Gratis servis 50.000 km.\n- Pajero Sport: Diskon hingga 15 juta, Bunga 0% 2 tahun, Asuransi all risk gratis 1 tahun.");
                                            } else if (activeTab === 'progam_service') {
                                                setAiRawInput("Promo Servis Bengkel Dwindo:\n- Paket Servis Hemat Xpander & Xforce: Rp 1.089.900 (normal Rp 1.211.000) diskon 10%, termasuk jasa servis, oli mesin resmi, filter oli, gasket.\n- Paket Servis Hemat Pajero Sport: Rp 1.806.300 (normal Rp 2.007.000) diskon 10%, jasa + oli diesel + filter + gasket.\n- Gratis 7 Pengecekan AC (blower, filter kabin, evaporator, kondensor, suhu, kecepatan, tekanan freon)\n- Gratis Fogging Interior sterilisasi kabin\n- Recall L300 gratis perbaikan & suku cadang.");
                                            } else {
                                                setAiRawInput("Program Promo Spesial Akhir Tahun:\n- Diskon khusus armada operasional hingga 20 juta rupiah\n- Gratis biaya administrasi dan provisi pembiayaan\n- Gratis paket perawatan berkala 3 tahun\n- Hadiah langsung voucher belanja 2 juta rupiah untuk 50 pembeli pertama.");
                                            }
                                        }}
                                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                    >
                                        Contoh Data
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setAiRawInput('')}
                                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                                    >
                                        Bersihkan
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={aiRawInput}
                                onChange={(e) => setAiRawInput(e.target.value)}
                                rows={6}
                                placeholder="Tempelkan teks atau data mentah promo di sini (bisa berupa teks pesan WhatsApp, rangkuman flyer, atau daftar promo)..."
                                className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed font-sans"
                            />

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleGenerateAiJson}
                                    disabled={isAiGenerating || !aiRawInput.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {isAiGenerating ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Menganalisis &amp; Menghasilkan JSON...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={14} />
                                            <span>Generate JSON dengan AI</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {aiError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                                    <span>{aiError}</span>
                                </div>
                            )}

                            {aiGeneratedJson && (
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                            <Check size={14} className="text-emerald-600" />
                                            <span>Hasil JSON yang Dihasilkan:</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyAiJson}
                                            className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            {aiCopied ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                            <span>{aiCopied ? 'Tersalin' : 'Salin JSON'}</span>
                                        </button>
                                    </div>

                                    <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 max-h-60 overflow-y-auto">
                                        <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                            {aiGeneratedJson}
                                        </pre>
                                    </div>

                                    <div className="pt-2 flex justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setAiGeneratedJson('')}
                                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Buang Hasil
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleApplyAiJson}
                                            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <Check size={14} />
                                            <span>Terapkan ke Editor JSON</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS BERKAS PROMO */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
                            <Trash2 size={26} />
                        </div>
                        
                        <h3 className="font-display font-bold text-lg text-gray-900 uppercase mb-2">
                            Hapus Berkas Promo?
                        </h3>
                        
                        <p className="text-xs text-gray-600 leading-relaxed mb-6">
                            Apakah Anda yakin ingin menghapus berkas <strong className="text-gray-900 font-mono">"{deleteModal.fileName}"</strong>? Tindakan ini akan menghapus data dari <code className="bg-gray-100 px-1 rounded text-red-600">app_data</code> dan file fisik. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, fileId: '', fileName: '' })}
                                disabled={isSaving}
                                className="w-1/2 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeletePromoFile}
                                disabled={isSaving}
                                className="w-1/2 py-2.5 text-xs font-bold bg-[#E60012] hover:bg-red-700 text-white rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Ya, Hapus</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
