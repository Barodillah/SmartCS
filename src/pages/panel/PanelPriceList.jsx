import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, X, Plus, Filter, Loader2, Settings, Trash2, Code } from 'lucide-react';
import defaultPriceListData from '../../../knowledge/price_list.json';
import { ANGULAR_CLIP } from '../../utils/constants';

const API_URL = 'https://csdwindo.com/api/pricelist/index.php';

const PanelPriceList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    const [rawPriceData, setRawPriceData] = useState(null);
    const [variants, setVariants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ price: 0 });

    // Modals state
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [metaForm, setMetaForm] = useState({ brand: '', periode: '', currency: '' });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        category: 'passenger_car',
        modelKey: '',
        subcategory: '',
        type: '',
        spec: '',
        price: ''
    });

    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonText, setJsonText] = useState('');

    const fetchPriceData = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.status && data.data) {
                setRawPriceData(data.data);
            } else {
                setRawPriceData(defaultPriceListData);
            }
        } catch (e) {
            console.error('Failed to fetch price list, using local fallback', e);
            setRawPriceData(defaultPriceListData);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPriceData();
    }, []);

    useEffect(() => {
        if (!rawPriceData) return;
        
        const flatData = [];
        let idCounter = 1;

        // Process Passenger Cars
        Object.entries(rawPriceData.passenger_car || {}).forEach(([modelKey, modelData]) => {
            const modelName = modelKey.replace(/_/g, ' ').toUpperCase();
            if(modelData.items) {
                modelData.items.forEach((item, idx) => {
                    flatData.push({
                        id: idCounter++,
                        category: 'Passenger Car',
                        model: modelName,
                        subcategory: '-',
                        type: item.type,
                        spec: '-',
                        price: item.price,
                        path: ['passenger_car', modelKey, 'items', idx]
                    });
                });
            }
        });

        // Process Commercial Cars
        Object.entries(rawPriceData.commercial_car || {}).forEach(([modelKey, modelData]) => {
            const modelName = modelKey.replace(/_/g, ' ').toUpperCase();
            if(modelData.categories) {
                Object.entries(modelData.categories).forEach(([subKey, subItems]) => {
                    const subcatName = subKey.replace(/_/g, ' ').toUpperCase();
                    subItems.forEach((item, idx) => {
                        flatData.push({
                            id: idCounter++,
                            category: 'Commercial Car',
                            model: modelName,
                            subcategory: subcatName,
                            type: item.type,
                            spec: item.spec || '-',
                            price: item.price,
                            path: ['commercial_car', modelKey, 'categories', subKey, idx]
                        });
                    });
                });
            }
        });

        setVariants(flatData);
    }, [rawPriceData]);

    const saveToApi = async (newRawData) => {
        setIsSaving(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRawData)
            });
            const data = await res.json();
            if (data.status) {
                setRawPriceData(newRawData);
                return true;
            } else {
                alert('Gagal menyimpan: ' + data.message);
                return false;
            }
        } catch (e) {
            console.error('Error saving data', e);
            alert('Terjadi kesalahan jaringan.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (variant) => {
        setEditingId(variant.id);
        setEditForm({ price: variant.price });
    };

    const handleSave = async (variant) => {
        if (isSaving) return;
        
        const newRawData = JSON.parse(JSON.stringify(rawPriceData));
        let current = newRawData;
        for (let i = 0; i < variant.path.length - 1; i++) {
            current = current[variant.path[i]];
        }
        current[variant.path[variant.path.length - 1]].price = parseInt(editForm.price, 10);
        
        const success = await saveToApi(newRawData);
        if (success) setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleDelete = async (variant) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus varian: ${variant.type}?`)) {
            return;
        }

        if (isSaving) return;
        
        const newRawData = JSON.parse(JSON.stringify(rawPriceData));
        let current = newRawData;
        
        for (let i = 0; i < variant.path.length - 1; i++) {
            current = current[variant.path[i]];
        }
        
        const indexToRemove = variant.path[variant.path.length - 1];
        current.splice(indexToRemove, 1);
        
        await saveToApi(newRawData);
    };

    // Meta Handlers
    const handleOpenMetaModal = () => {
        setMetaForm({
            brand: rawPriceData?.meta?.brand || '',
            periode: rawPriceData?.meta?.periode || '',
            currency: rawPriceData?.meta?.currency || ''
        });
        setIsMetaModalOpen(true);
    };

    const handleSaveMeta = async () => {
        const newRawData = JSON.parse(JSON.stringify(rawPriceData));
        newRawData.meta = { ...newRawData.meta, ...metaForm };
        const success = await saveToApi(newRawData);
        if (success) setIsMetaModalOpen(false);
    };

    // Add Variant Handlers
    const handleOpenAddModal = () => {
        setAddForm({
            category: 'passenger_car',
            modelKey: '',
            subcategory: '',
            type: '',
            spec: '',
            price: ''
        });
        setIsAddModalOpen(true);
    };

    const handleSaveNewVariant = async () => {
        if (!addForm.modelKey || !addForm.type || !addForm.price) {
            alert('Model, Tipe, dan Harga harus diisi!');
            return;
        }

        const newRawData = JSON.parse(JSON.stringify(rawPriceData));
        const cat = addForm.category;
        const mk = addForm.modelKey.toLowerCase().replace(/[\s-]+/g, '_');
        
        if (!newRawData[cat]) newRawData[cat] = {};
        if (!newRawData[cat][mk]) {
            newRawData[cat][mk] = { image: "" }; // default empty image
            if (cat === 'passenger_car') {
                newRawData[cat][mk].items = [];
            } else {
                newRawData[cat][mk].categories = {};
            }
        }
        
        const newItem = { type: addForm.type, price: parseInt(addForm.price, 10) };
        
        if (cat === 'passenger_car') {
            if (!newRawData[cat][mk].items) newRawData[cat][mk].items = [];
            newRawData[cat][mk].items.push(newItem);
        } else {
            const sub = addForm.subcategory.toLowerCase().replace(/[\s-]+/g, '_') || 'general';
            newItem.spec = addForm.spec;
            if (!newRawData[cat][mk].categories) newRawData[cat][mk].categories = {};
            if (!newRawData[cat][mk].categories[sub]) newRawData[cat][mk].categories[sub] = [];
            newRawData[cat][mk].categories[sub].push(newItem);
        }
        
        const success = await saveToApi(newRawData);
        if (success) setIsAddModalOpen(false);
    };

    // JSON Modal Handlers
    const handleOpenJsonModal = () => {
        setJsonText(JSON.stringify(rawPriceData, null, 4));
        setIsJsonModalOpen(true);
    };

    const handleSaveJson = async () => {
        try {
            const parsed = JSON.parse(jsonText);
            const success = await saveToApi(parsed);
            if (success) {
                setIsJsonModalOpen(false);
            }
        } catch (e) {
            alert("Format JSON tidak valid! Pastikan struktur JSON benar sebelum menyimpan.");
        }
    };

    const filteredVariants = variants.filter(v => {
        const matchesSearch = v.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#E60012]" size={32} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300 pb-10">
            <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Kelola Price List</h1>
                    <p className="text-gray-500 text-sm mt-1">Atur harga kendaraan yang akan ditampilkan di website.</p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={handleOpenJsonModal}
                        className="bg-white border border-[#111111] hover:bg-gray-100 text-[#111111] px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors" 
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        <Code size={16} /> Data JSON
                    </button>
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-[#111111] hover:bg-[#E60012] text-white px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors" 
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        <Plus size={16} /> Tambah Varian Baru
                    </button>
                </div>
            </div>

            {/* Meta Info Card */}
            <div className="bg-white p-6 border border-[#E5E5E5] mb-6 flex justify-between items-center">
                <div className="flex gap-8">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Periode Aktif</p>
                        <p className="font-display font-bold text-lg">{rawPriceData?.meta?.periode || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Brand</p>
                        <p className="font-display font-bold text-lg">{rawPriceData?.meta?.brand || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mata Uang</p>
                        <p className="font-display font-bold text-lg">{rawPriceData?.meta?.currency || '-'}</p>
                    </div>
                </div>
                <button onClick={handleOpenMetaModal} className="text-[#E60012] text-sm font-bold hover:underline flex items-center gap-1">
                    <Settings size={14} /> Edit Meta
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan tipe atau model..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-[#E60012] bg-white"
                    />
                </div>
                <div className="flex bg-gray-100 p-1 border border-gray-200">
                    {['All', 'Passenger Car', 'Commercial Car'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                                filterCategory === cat ? 'bg-white shadow-sm text-[#111111]' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[#E5E5E5] bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-bold">
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Model</th>
                            <th className="px-6 py-4">Varian / Tipe</th>
                            <th className="px-6 py-4">Spesifikasi</th>
                            <th className="px-6 py-4 text-right">Harga OTR (Rp)</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                        {filteredVariants.map((variant) => (
                            <tr key={variant.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase ${
                                        variant.category === 'Passenger Car' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {variant.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-800">{variant.model}</td>
                                <td className="px-6 py-4">
                                    {variant.type}
                                    {variant.subcategory !== '-' && <div className="text-[10px] text-gray-500 mt-0.5">{variant.subcategory}</div>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{variant.spec}</td>
                                <td className="px-6 py-4 text-right font-display font-bold">
                                    {editingId === variant.id ? (
                                        <input 
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-32 px-2 py-1 border border-[#E60012] text-right focus:outline-none"
                                            autoFocus
                                            disabled={isSaving}
                                        />
                                    ) : (
                                        variant.price.toLocaleString('id-ID')
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {editingId === variant.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleSave(variant)} disabled={isSaving} className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50" title="Simpan">
                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            </button>
                                            <button onClick={handleCancel} disabled={isSaving} className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" title="Batal">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleEdit(variant)} className="p-1.5 text-gray-400 hover:text-[#E60012] hover:bg-red-50 rounded transition-colors" title="Edit Harga">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(variant)} disabled={isSaving} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="Hapus Varian">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredVariants.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada varian yang sesuai dengan pencarian Anda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Meta Modal */}
            {isMetaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl uppercase">Edit Metadata</h2>
                            <button onClick={() => setIsMetaModalOpen(false)} className="text-gray-400 hover:text-[#E60012]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Periode Aktif</label>
                                <input 
                                    type="text" 
                                    value={metaForm.periode} 
                                    onChange={e => setMetaForm({...metaForm, periode: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                    placeholder="Contoh: April 2026"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Brand</label>
                                <input 
                                    type="text" 
                                    value={metaForm.brand} 
                                    onChange={e => setMetaForm({...metaForm, brand: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Mata Uang</label>
                                <input 
                                    type="text" 
                                    value={metaForm.currency} 
                                    onChange={e => setMetaForm({...metaForm, currency: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleSaveMeta}
                                disabled={isSaving}
                                className="w-full bg-[#E60012] hover:bg-[#B5000F] text-white py-2.5 font-bold tracking-wider uppercase mt-4 flex justify-center items-center gap-2"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Metadata'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Variant Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl uppercase">Tambah Varian Baru</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#E60012]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Kategori Utama</label>
                                <select 
                                    value={addForm.category}
                                    onChange={e => setAddForm({...addForm, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none bg-white"
                                >
                                    <option value="passenger_car">Passenger Car</option>
                                    <option value="commercial_car">Commercial Car</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nama Model (contoh: New Xpander)</label>
                                <input 
                                    type="text" 
                                    value={addForm.modelKey} 
                                    onChange={e => setAddForm({...addForm, modelKey: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                />
                            </div>
                            {addForm.category === 'commercial_car' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Subkategori (contoh: 6x4, Speed)</label>
                                    <input 
                                        type="text" 
                                        value={addForm.subcategory} 
                                        onChange={e => setAddForm({...addForm, subcategory: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipe / Varian (contoh: Ultimate CVT)</label>
                                <input 
                                    type="text" 
                                    value={addForm.type} 
                                    onChange={e => setAddForm({...addForm, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                />
                            </div>
                            {addForm.category === 'commercial_car' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Spesifikasi (contoh: 136 PS 6 Ban)</label>
                                    <input 
                                        type="text" 
                                        value={addForm.spec} 
                                        onChange={e => setAddForm({...addForm, spec: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Harga OTR (Rp)</label>
                                <input 
                                    type="number" 
                                    value={addForm.price} 
                                    onChange={e => setAddForm({...addForm, price: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#E60012] focus:outline-none"
                                    placeholder="Contoh: 345000000"
                                />
                            </div>
                            
                            <button 
                                onClick={handleSaveNewVariant}
                                disabled={isSaving}
                                className="w-full bg-[#E60012] hover:bg-[#B5000F] text-white py-2.5 font-bold tracking-wider uppercase mt-6 flex justify-center items-center gap-2"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Varian Baru'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JSON Modal */}
            {isJsonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 shadow-xl w-full max-w-4xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-display font-bold text-xl uppercase">Edit Data JSON</h2>
                            <button onClick={() => setIsJsonModalOpen(false)} className="text-gray-400 hover:text-[#E60012]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <p className="text-xs text-gray-500 mb-2">Peringatan: Mengubah JSON secara langsung dapat merusak struktur data jika tidak dilakukan dengan hati-hati. Pastikan format valid.</p>
                            <textarea 
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                className="w-full flex-1 p-4 bg-gray-50 border border-gray-300 focus:border-[#E60012] focus:outline-none font-mono text-sm resize-none"
                                spellCheck="false"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button 
                                onClick={() => setIsJsonModalOpen(false)}
                                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-bold uppercase tracking-wider text-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSaveJson}
                                disabled={isSaving}
                                className="bg-[#E60012] hover:bg-[#B5000F] text-white px-6 py-2.5 font-bold tracking-wider uppercase text-sm flex justify-center items-center gap-2 transition-colors"
                                style={{ clipPath: ANGULAR_CLIP }}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan JSON'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelPriceList;
