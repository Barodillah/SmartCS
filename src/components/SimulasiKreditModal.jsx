import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Car, ChevronDown, ShieldCheck, CalendarClock, CreditCard } from 'lucide-react';
import defaultPriceListData from '../../knowledge/price_list.json';
import { formatCurrency } from '../utils/constants';

const SimulasiKreditModal = ({ isOpen, onClose }) => {
    const [priceList, setPriceList] = useState(defaultPriceListData);
    const [model, setModel] = useState('');
    const [varian, setVarian] = useState('');
    const [dpType, setDpType] = useState('persentase'); // 'persentase' or 'nominal'
    const [dpValue, setDpValue] = useState('');
    const [tenor, setTenor] = useState('12');
    const [skema, setSkema] = useState('ADDM');
    const [asuransi, setAsuransi] = useState('All Risk');

    useEffect(() => {
        if (isOpen) {
            fetch('https://csdwindo.com/api/pricelist/index.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status && data.data) {
                        setPriceList(data.data);
                    }
                })
                .catch(e => console.error('Failed to fetch price list', e));
        }
    }, [isOpen]);

    // Extract all models and variants
    const allModels = [];
    const modelsData = {};

    if (priceList.passenger_car) {
        Object.entries(priceList.passenger_car).forEach(([key, val]) => {
            allModels.push(key);
            modelsData[key] = val.items;
        });
    }

    const handleModelChange = (e) => {
        setModel(e.target.value);
        setVarian('');
    };

    const selectedVariantData = model && varian ? modelsData[model]?.find(v => v.type === varian) : null;
    const hargaOtr = selectedVariantData ? selectedVariantData.price : 0;

    const handleHitung = () => {
        if (!model || !varian || !dpValue) {
            alert('Mohon lengkapi data: Model, Varian, dan Uang Muka (DP).');
            return;
        }

        const modelName = model.replace(/_/g, ' ').toUpperCase();
        const dpLabel = dpType === 'persentase' ? `${dpValue}%` : `Rp ${Number(dpValue).toLocaleString('id-ID')}`;
        const tenorTahun = Math.floor(Number(tenor) / 12);
        const tenorLabel = `${tenor} bulan (${tenorTahun} tahun)`;

        const message = `Saya ingin simulasi kredit dengan data berikut:\n- Model: ${modelName}\n- Tipe: ${varian}\n- Harga OTR: Rp ${hargaOtr.toLocaleString('id-ID')}\n- DP: ${dpLabel}\n- Tenor: ${tenorLabel}\n- Skema: ${skema}\n- Asuransi: ${asuransi}\n\nTolong hitung rincian plafon kredit, cicilan bulanan, rincian TDP, dan rekomendasikan leasing terbaik.`;

        onClose();
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('openDinaChat', { detail: { message } }));
        }, 200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60012]/5 rounded-bl-full -mr-10 -mt-10"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-[#E60012] rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                                    <Calculator size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-gray-900 tracking-tight">Simulasi Kredit</h2>
                                    <p className="text-xs font-body text-gray-500 mt-0.5">Hitung estimasi cicilan kendaraan Anda</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200/80 rounded-full transition-colors text-gray-400 hover:text-gray-600 relative z-10">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="space-y-6">
                                
                                {/* Model & Varian Section */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Car size={16} className="text-[#E60012]" />
                                            Model Kendaraan
                                        </label>
                                        <div className="relative">
                                            <select value={model} onChange={handleModelChange} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-gray-700 font-medium focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] transition-all outline-none">
                                                <option value="">-- Pilih Model --</option>
                                                {allModels.map(m => (
                                                    <option key={m} value={m}>{m.replace(/_/g, ' ').toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                {model && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Varian / Tipe</label>
                                        <div className="relative">
                                            <select value={varian} onChange={e => setVarian(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-gray-700 font-medium focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] transition-all outline-none">
                                                <option value="">-- Pilih Varian --</option>
                                                {modelsData[model]?.map(v => (
                                                    <option key={v.type} value={v.type}>{v.type}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </motion.div>
                                )}
                                </div>

                                {/* Harga OTR Highlight */}
                                {hargaOtr > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                                            <Car size={100} />
                                        </div>
                                        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">Harga OTR Jabodetabek</p>
                                        <div className="text-3xl font-display font-bold tracking-tight text-white">
                                            {formatCurrency(hargaOtr)}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Kalkulasi Section */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <CreditCard size={16} className="text-gray-400" />
                                                Uang Muka (DP)
                                            </label>
                                            <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#E60012]/20 focus-within:border-[#E60012] transition-all">
                                                <select value={dpType} onChange={e => setDpType(e.target.value)} className="bg-gray-100 border-r border-gray-200 py-3 pl-3 pr-2 text-gray-600 font-medium text-sm outline-none cursor-pointer">
                                                    <option value="persentase">%</option>
                                                    <option value="nominal">Rp</option>
                                                </select>
                                                <input 
                                                    type="number" 
                                                    value={dpValue} 
                                                    onChange={e => setDpValue(e.target.value)} 
                                                    placeholder={dpType === 'persentase' ? "Min. 15" : "Nominal DP"}
                                                    className="w-full bg-transparent py-3 px-3 text-gray-700 font-medium outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <CalendarClock size={16} className="text-gray-400" />
                                                Tenor
                                            </label>
                                            <div className="relative">
                                                <select value={tenor} onChange={e => setTenor(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-gray-700 font-medium focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] transition-all outline-none">
                                                    {[12, 24, 36, 48, 60, 72, 84].map(t => (
                                                        <option key={t} value={t}>{t} Bulan</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Skema Angsuran</label>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <button 
                                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${skema === 'ADDM' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    onClick={() => setSkema('ADDM')}
                                                >
                                                    ADDM
                                                </button>
                                                <button 
                                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${skema === 'ADDB' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                    onClick={() => setSkema('ADDB')}
                                                >
                                                    ADDB
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <ShieldCheck size={16} className="text-gray-400" />
                                                Jenis Asuransi
                                            </label>
                                            <div className="relative">
                                                <select value={asuransi} onChange={e => setAsuransi(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-gray-700 font-medium focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] transition-all outline-none">
                                                    <option value="All Risk">All Risk (Komprehensif)</option>
                                                    <option value="TLO">Total Loss Only (TLO)</option>
                                                    <option value="Kombinasi">Kombinasi</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                            <button className="w-full sm:w-auto px-8 py-3 bg-[#E60012] text-white font-bold rounded-lg hover:bg-[#B5000F] transition-all shadow-lg shadow-[#E60012]/25 flex justify-center items-center gap-2" onClick={handleHitung}>
                                Hitung Simulasi
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SimulasiKreditModal;
