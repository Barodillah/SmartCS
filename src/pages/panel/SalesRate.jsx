import React, { useState, useEffect } from 'react';
import { Users, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalesRate = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format YYYY-MM-DD
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const [startDate, setStartDate] = useState(formatDate(firstDay));
    const [endDate, setEndDate] = useState(formatDate(today));
    const [loading, setLoading] = useState(false);
    const [spvData, setSpvData] = useState([]);
    
    // Tabs state
    const [activeTab, setActiveTab] = useState('spv');
    const [minData, setMinData] = useState(0); // 0 means show all
    
    // For Expandable Rows and Modals
    const [expandedSpv, setExpandedSpv] = useState(null);
    const [showAllSpvModal, setShowAllSpvModal] = useState(false);
    const [selectedSurveyDetails, setSelectedSurveyDetails] = useState(null);
    const [selectedNpsDetails, setSelectedNpsDetails] = useState(null);

    // Compute flattened sales list
    const allSales = React.useMemo(() => {
        let combined = [];
        spvData.forEach(spvGroup => {
            if (spvGroup.sales_list) {
                spvGroup.sales_list.forEach(sale => {
                    combined.push({
                        ...sale,
                        spvName: spvGroup.spv
                    });
                });
            }
        });
        // Sort descending by skor
        combined.sort((a, b) => b.skor - a.skor);
        return combined;
    }, [spvData]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
                const res = await fetch(`https://csdwindo.com/api/panel/sales_rate.php?${params}`);
                const json = await res.json();

                if (json.status && json.data) {
                    setSpvData(json.data.spv_data || []);
                } else {
                    setSpvData([]);
                }
            } catch (err) {
                console.error('Failed to fetch sales rate:', err);
                setSpvData([]);
            } finally {
                setLoading(false);
            }
        };

        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate]);

    return (
        <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex flex-col animate-in fade-in duration-300">
            {/* Header & Date Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Sales Rate</h1>
                    <p className="text-gray-500 text-sm mt-1">Analisis Rasio dan Performa per Supervisor (SPV)</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAllSpvModal(true)}
                        className="hidden sm:flex items-center gap-2 bg-[#111111] hover:bg-[#E60012] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                        <Users size={16} />
                        Semua Tim
                    </button>
                    
                    {/* Filter Minimal Data */}
                    <div className="flex items-center bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
                        <div className="px-3 py-1.5 bg-gray-50 border-r border-[#E5E5E5] text-xs font-bold text-gray-600">
                            Min. Data
                        </div>
                        <button 
                            onClick={() => setMinData(Math.max(0, minData - 1))}
                            className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors border-r border-[#E5E5E5]"
                        >
                            -
                        </button>
                        <input 
                            type="number" 
                            min="0"
                            value={minData} 
                            onChange={(e) => setMinData(parseInt(e.target.value) || 0)}
                            className="w-12 text-center py-1.5 text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                        />
                        <button 
                            onClick={() => setMinData(minData + 1)}
                            className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors border-l border-[#E5E5E5]"
                        >
                            +
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] p-1.5 rounded-lg shadow-sm">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-1 text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                        />
                        <span className="text-gray-400 font-bold">-</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-1 text-sm font-bold text-gray-700 bg-transparent focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E5E5] mb-6 gap-6 shrink-0">
                <button
                    onClick={() => setActiveTab('spv')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'spv' ? 'text-[#E60012]' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    <Users size={18} />
                    Berdasarkan SPV
                    {activeTab === 'spv' && (
                        <motion.div layoutId="salestab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'sales' ? 'text-[#E60012]' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    <Info size={18} />
                    Semua Sales
                    {activeTab === 'sales' && (
                        <motion.div layoutId="salestab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                    )}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {activeTab === 'spv' ? (
                    <>
                    {/* Table SPV Qualified */}
                    <div className="mb-8">
                        {minData > 0 && <h3 className="font-display font-bold text-lg mb-4 text-[#111111]">SPV Memenuhi Syarat (Min. {minData} Data)</h3>}
                        <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                                    <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                        <th className="p-3 text-center border-r border-gray-200 w-12">Rank</th>
                                        <th className="p-3 border-r border-gray-200 text-center w-24">Skor<br />Akhir</th>
                                        <th className="p-3 border-r border-gray-200 w-48">Supervisor (SPV)</th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Rasio Survey Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Tersurvey / Total)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Distribusi NPS Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Promotor / Passive / Detractor)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 text-center border-r border-gray-200 w-32">
                                            <div className="flex flex-col items-center">
                                                <span>Skor NPS Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(-100 s/d 100)</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin"></div>
                                                    Memuat data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : spvData.filter(d => d.total >= minData).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">
                                                Tidak ada data yang memenuhi kriteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        spvData.filter(d => d.total >= minData).map((row, idx) => {
                                            const isExpanded = expandedSpv === row.spv;
                                            return (
                                            <React.Fragment key={idx}>
                                            <tr 
                                                className={`hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                                onClick={() => setExpandedSpv(isExpanded ? null : row.spv)}
                                            >
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className={`font-black text-lg ${row.skor >= 80 ? 'text-green-600' : row.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {row.skor}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} className="text-gray-400" />
                                                        <span className="border-b-2 border-dashed border-gray-300 pb-0.5 group-hover:border-red-400 transition-colors">
                                                            {row.spv}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1 font-medium ml-6">
                                                        {row.sales_list.length} Sales
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-700">{row.ratio}%</span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{row.surveyed}/{row.total} Tersurvey</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${row.ratio >= 80 ? 'bg-green-500' : row.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${row.ratio}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <div className="flex flex-col items-center justify-center w-12 bg-green-50 rounded py-1 border border-green-100">
                                                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">Prom</span>
                                                            <span className="text-sm font-black text-green-700">{row.promotor}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-amber-50 rounded py-1 border border-amber-100">
                                                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Pass</span>
                                                            <span className="text-sm font-black text-amber-700">{row.passiver}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-red-50 rounded py-1 border border-red-100">
                                                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Detr</span>
                                                            <span className="text-sm font-black text-red-700">{row.detraktor}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-black ${row.nps >= 50 ? 'bg-green-100 text-green-700' :
                                                                row.nps >= 0 ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {row.nps > 0 ? `+${row.nps}` : row.nps}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable Sales List */}
                                            {isExpanded && (
                                                <tr className="bg-[#F8F9FA] border-b border-gray-200">
                                                    <td colSpan={6} className="p-4">
                                                        <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden ml-8">
                                                            <div className="px-4 py-3 bg-gray-50 border-b border-[#E5E5E5] flex justify-between items-center">
                                                                <h4 className="font-bold text-[#111111] text-sm flex items-center gap-2">
                                                                    <div className="w-1.5 h-4 bg-[#E60012] rounded-full"></div>
                                                                    Daftar Sales - Tim {row.spv}
                                                                </h4>
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left border-collapse">
                                                                    <thead className="bg-white border-b border-gray-100">
                                                                        <tr className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                                                                            <th className="p-2.5 text-center border-r border-gray-50 w-10">No</th>
                                                                            <th className="p-2.5 border-r border-gray-50 text-center w-16">Skor</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48">Nama Sales</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48 text-center">Rasio Survey</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48 text-center">Distribusi NPS</th>
                                                                            <th className="p-2.5 text-center w-20">NPS</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-sm">
                                                                        {row.sales_list && row.sales_list.length > 0 ? (
                                                                            row.sales_list.map((salesRow, sIdx) => (
                                                                                <tr key={sIdx} className="border-b border-gray-50 hover:bg-gray-50/50 last:border-0 transition-colors">
                                                                                    <td className="p-2.5 text-center text-gray-400 font-bold border-r border-gray-50">{sIdx + 1}</td>
                                                                                    <td className="p-2.5 text-center border-r border-gray-50">
                                                                                        <span className={`font-black ${salesRow.skor >= 80 ? 'text-green-600' : salesRow.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                                            {salesRow.skor}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="p-2.5 font-bold text-gray-800 border-r border-gray-50">{salesRow.sales}</td>
                                                                                    <td className="p-2.5 border-r border-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors rounded-md m-1"
                                                                                        onClick={() => setSelectedSurveyDetails({ sales: salesRow.sales, details: salesRow.detail_survey, nps_details: salesRow.detail_nps })}
                                                                                    >
                                                                                        <div className="flex items-center justify-between mb-1 px-1">
                                                                                            <span className="text-xs font-bold text-gray-700">{salesRow.ratio}%</span>
                                                                                            <span className="text-[10px] text-gray-400 font-medium">{salesRow.surveyed}/{salesRow.total}</span>
                                                                                        </div>
                                                                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mx-1">
                                                                                            <div className={`h-full ${salesRow.ratio >= 80 ? 'bg-green-500' : salesRow.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${salesRow.ratio}%` }}></div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="p-2.5 border-r border-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors rounded-md m-1"
                                                                                        onClick={() => setSelectedNpsDetails({ sales: salesRow.sales, details: salesRow.detail_nps })}
                                                                                    >
                                                                                        <div className="flex items-center justify-center gap-1">
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50/50 rounded text-green-700 border border-green-100">
                                                                                                <span className="text-[9px] font-bold uppercase">P:</span><span className="font-black text-xs">{salesRow.promotor}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50/50 rounded text-amber-700 border border-amber-100">
                                                                                                <span className="text-[9px] font-bold uppercase">A:</span><span className="font-black text-xs">{salesRow.passiver}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50/50 rounded text-red-700 border border-red-100">
                                                                                                <span className="text-[9px] font-bold uppercase">D:</span><span className="font-black text-xs">{salesRow.detraktor}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="p-2.5 text-center">
                                                                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black ${salesRow.nps >= 50 ? 'bg-green-100 text-green-700' : salesRow.nps >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                                                            {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan={6} className="p-4 text-center text-gray-400 font-bold text-xs">Belum ada data sales di tim ini</td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table SPV Unqualified */}
                {minData > 0 && spvData.filter(d => d.total < minData).length > 0 && (
                    <div className="mb-8 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="font-display font-bold text-lg mb-4 text-[#111111]">SPV Kurang dari {minData} Data</h3>
                        <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                                    <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                        <th className="p-3 border-r border-gray-200 text-center w-24">Skor<br />Akhir</th>
                                        <th className="p-3 border-r border-gray-200 w-48">Supervisor (SPV)</th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Rasio Survey Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Tersurvey / Total)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Distribusi NPS Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Promotor / Passive / Detractor)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 text-center border-r border-gray-200 w-32">
                                            <div className="flex flex-col items-center">
                                                <span>Skor NPS Tim</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(-100 s/d 100)</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {spvData.filter(d => d.total < minData).map((row, idx) => {
                                        const isExpanded = expandedSpv === row.spv;
                                        return (
                                        <React.Fragment key={idx}>
                                            <tr 
                                                className={`hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                                onClick={() => setExpandedSpv(isExpanded ? null : row.spv)}
                                            >
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className={`font-black text-lg ${row.skor >= 80 ? 'text-green-600' : row.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {row.skor}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} className="text-gray-400" />
                                                        <span className="border-b-2 border-dashed border-gray-300 pb-0.5 group-hover:border-red-400 transition-colors">
                                                            {row.spv}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1 font-medium ml-6">
                                                        {row.sales_list.length} Sales
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-700">{row.ratio}%</span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{row.surveyed}/{row.total} Tersurvey</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${row.ratio >= 80 ? 'bg-green-500' : row.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${row.ratio}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <div className="flex flex-col items-center justify-center w-12 bg-green-50 rounded py-1 border border-green-100">
                                                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">Prom</span>
                                                            <span className="text-sm font-black text-green-700">{row.promotor}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-amber-50 rounded py-1 border border-amber-100">
                                                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Pass</span>
                                                            <span className="text-sm font-black text-amber-700">{row.passiver}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-red-50 rounded py-1 border border-red-100">
                                                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Detr</span>
                                                            <span className="text-sm font-black text-red-700">{row.detraktor}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-black ${row.nps >= 50 ? 'bg-green-100 text-green-700' :
                                                                row.nps >= 0 ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {row.nps > 0 ? `+${row.nps}` : row.nps}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable Sales List */}
                                            {isExpanded && (
                                                <tr className="bg-[#F8F9FA] border-b border-gray-200">
                                                    <td colSpan={5} className="p-4">
                                                        <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden ml-8">
                                                            <div className="px-4 py-3 bg-gray-50 border-b border-[#E5E5E5] flex justify-between items-center">
                                                                <h4 className="font-bold text-[#111111] text-sm flex items-center gap-2">
                                                                    <div className="w-1.5 h-4 bg-[#E60012] rounded-full"></div>
                                                                    Daftar Sales - Tim {row.spv}
                                                                </h4>
                                                            </div>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left border-collapse">
                                                                    <thead className="bg-white border-b border-gray-100">
                                                                        <tr className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                                                                            <th className="p-2.5 border-r border-gray-50 text-center w-16">Skor</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48">Nama Sales</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48 text-center">Rasio Survey</th>
                                                                            <th className="p-2.5 border-r border-gray-50 w-48 text-center">Distribusi NPS</th>
                                                                            <th className="p-2.5 text-center w-20">NPS</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-sm">
                                                                        {row.sales_list && row.sales_list.length > 0 ? (
                                                                            row.sales_list.map((salesRow, sIdx) => (
                                                                                <tr key={sIdx} className="border-b border-gray-50 hover:bg-gray-50/50 last:border-0 transition-colors">
                                                                                    <td className="p-2.5 text-center border-r border-gray-50">
                                                                                        <span className={`font-black ${salesRow.skor >= 80 ? 'text-green-600' : salesRow.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                                            {salesRow.skor}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="p-2.5 font-bold text-gray-800 border-r border-gray-50">{salesRow.sales}</td>
                                                                                    <td className="p-2.5 border-r border-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors rounded-md m-1"
                                                                                        onClick={() => setSelectedSurveyDetails({ sales: salesRow.sales, details: salesRow.detail_survey, nps_details: salesRow.detail_nps })}
                                                                                    >
                                                                                        <div className="flex items-center justify-between mb-1 px-1">
                                                                                            <span className="text-xs font-bold text-gray-700">{salesRow.ratio}%</span>
                                                                                            <span className="text-[10px] text-gray-400 font-medium">{salesRow.surveyed}/{salesRow.total}</span>
                                                                                        </div>
                                                                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mx-1">
                                                                                            <div className={`h-full ${salesRow.ratio >= 80 ? 'bg-green-500' : salesRow.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${salesRow.ratio}%` }}></div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="p-2.5 border-r border-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors rounded-md m-1"
                                                                                        onClick={() => setSelectedNpsDetails({ sales: salesRow.sales, details: salesRow.detail_nps })}
                                                                                    >
                                                                                        <div className="flex items-center justify-center gap-1">
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50/50 rounded text-green-700 border border-green-100">
                                                                                                <span className="text-[9px] font-bold uppercase">P:</span><span className="font-black text-xs">{salesRow.promotor}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50/50 rounded text-amber-700 border border-amber-100">
                                                                                                <span className="text-[9px] font-bold uppercase">A:</span><span className="font-black text-xs">{salesRow.passiver}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50/50 rounded text-red-700 border border-red-100">
                                                                                                <span className="text-[9px] font-bold uppercase">D:</span><span className="font-black text-xs">{salesRow.detraktor}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="p-2.5 text-center">
                                                                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black ${salesRow.nps >= 50 ? 'bg-green-100 text-green-700' : salesRow.nps >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                                                            {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan={5} className="p-4 text-center text-gray-400 font-bold text-xs">Belum ada data sales di tim ini</td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </>
                ) : (
                <>
                    <div className="mb-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                                    <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                        <th className="p-3 text-center border-r border-gray-200 w-12">Rank</th>
                                        <th className="p-3 border-r border-gray-200 text-center w-24">Skor<br />Akhir</th>
                                        <th className="p-3 border-r border-gray-200 w-64">Nama Sales</th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Rasio Survey</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Tersurvey / Total)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 border-r border-gray-200 w-64">
                                            <div className="flex flex-col items-center">
                                                <span>Distribusi NPS</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(Promotor / Passive / Detractor)</span>
                                            </div>
                                        </th>
                                        <th className="p-3 text-center border-r border-gray-200 w-32">
                                            <div className="flex flex-col items-center">
                                                <span>Skor NPS</span>
                                                <span className="text-[9px] text-gray-400 font-medium normal-case">(-100 s/d 100)</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin"></div>
                                                    Memuat data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : allSales.filter(d => d.total >= minData).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">
                                                Tidak ada data yang memenuhi kriteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        allSales.filter(d => d.total >= minData).map((salesRow, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <span className={`font-black text-lg ${salesRow.skor >= 80 ? 'text-green-600' : salesRow.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {salesRow.skor}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">
                                                    <div>{salesRow.sales}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1 mt-1">
                                                        <div className="w-1.5 h-1.5 bg-[#E60012] rounded-full"></div>
                                                        {salesRow.spvName}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors group"
                                                    onClick={() => setSelectedSurveyDetails({ sales: salesRow.sales, details: salesRow.detail_survey, nps_details: salesRow.detail_nps })}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-700 group-hover:scale-105 transition-transform origin-left">{salesRow.ratio}%</span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{salesRow.surveyed}/{salesRow.total} Tersurvey</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className={`h-full ${salesRow.ratio >= 80 ? 'bg-green-500' : salesRow.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${salesRow.ratio}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100 cursor-pointer group"
                                                    onClick={() => setSelectedNpsDetails({ sales: salesRow.sales, details: salesRow.detail_nps })}
                                                >
                                                    <div className="flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
                                                        <div className="flex flex-col items-center justify-center w-12 bg-green-50 rounded py-1 border border-green-100">
                                                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">Prom</span>
                                                            <span className="text-sm font-black text-green-700">{salesRow.promotor}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-amber-50 rounded py-1 border border-amber-100">
                                                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Pass</span>
                                                            <span className="text-sm font-black text-amber-700">{salesRow.passiver}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-red-50 rounded py-1 border border-red-100">
                                                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Detr</span>
                                                            <span className="text-sm font-black text-red-700">{salesRow.detraktor}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-black ${salesRow.nps >= 50 ? 'bg-green-100 text-green-700' : salesRow.nps >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                            {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table Sales Unqualified */}
                    {minData > 0 && allSales.filter(d => d.total < minData).length > 0 && (
                        <div className="mb-8 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="font-display font-bold text-lg mb-4 text-[#111111]">Sales Kurang dari {minData} Data</h3>
                            <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                                <table className="w-full text-left border-collapse bg-white">
                                    <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                                        <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                            <th className="p-3 border-r border-gray-200 text-center w-24">Skor<br />Akhir</th>
                                            <th className="p-3 border-r border-gray-200 w-64">Nama Sales</th>
                                            <th className="p-3 border-r border-gray-200 w-64">
                                                <div className="flex flex-col items-center">
                                                    <span>Rasio Survey</span>
                                                    <span className="text-[9px] text-gray-400 font-medium normal-case">(Tersurvey / Total)</span>
                                                </div>
                                            </th>
                                            <th className="p-3 border-r border-gray-200 w-64">
                                                <div className="flex flex-col items-center">
                                                    <span>Distribusi NPS</span>
                                                    <span className="text-[9px] text-gray-400 font-medium normal-case">(Promotor / Passive / Detractor)</span>
                                                </div>
                                            </th>
                                            <th className="p-3 text-center border-r border-gray-200 w-32">
                                                <div className="flex flex-col items-center">
                                                    <span>Skor NPS</span>
                                                    <span className="text-[9px] text-gray-400 font-medium normal-case">(-100 s/d 100)</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {allSales.filter(d => d.total < minData).map((salesRow, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <span className={`font-black text-lg ${salesRow.skor >= 80 ? 'text-green-600' : salesRow.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {salesRow.skor}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">
                                                    <div>{salesRow.sales}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1 mt-1">
                                                        <div className="w-1.5 h-1.5 bg-[#E60012] rounded-full"></div>
                                                        {salesRow.spvName}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors group"
                                                    onClick={() => setSelectedSurveyDetails({ sales: salesRow.sales, details: salesRow.detail_survey, nps_details: salesRow.detail_nps })}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-700 group-hover:scale-105 transition-transform origin-left">{salesRow.ratio}%</span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{salesRow.surveyed}/{salesRow.total} Tersurvey</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className={`h-full ${salesRow.ratio >= 80 ? 'bg-green-500' : salesRow.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${salesRow.ratio}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-100 cursor-pointer group"
                                                    onClick={() => setSelectedNpsDetails({ sales: salesRow.sales, details: salesRow.detail_nps })}
                                                >
                                                    <div className="flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
                                                        <div className="flex flex-col items-center justify-center w-12 bg-green-50 rounded py-1 border border-green-100">
                                                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">Prom</span>
                                                            <span className="text-sm font-black text-green-700">{salesRow.promotor}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-amber-50 rounded py-1 border border-amber-100">
                                                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Pass</span>
                                                            <span className="text-sm font-black text-amber-700">{salesRow.passiver}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center w-12 bg-red-50 rounded py-1 border border-red-100">
                                                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter">Detr</span>
                                                            <span className="text-sm font-black text-red-700">{salesRow.detraktor}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center border-r border-gray-100">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-black ${salesRow.nps >= 50 ? 'bg-green-100 text-green-700' : salesRow.nps >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                            {salesRow.nps > 0 ? `+${salesRow.nps}` : salesRow.nps}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>


            {/* Modal Semua SPV & Sales */}
            <AnimatePresence>
                {showAllSpvModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-[#111111]">Daftar Semua Tim & Sales</h3>
                                    <p className="text-sm text-gray-500 font-medium">Struktur seluruh Supervisor dan Sales di bawahnya</p>
                                </div>
                                <button
                                    onClick={() => setShowAllSpvModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto bg-gray-50/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {spvData.map((spv, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <div className="font-bold text-[#111111] flex items-center gap-2">
                                                    <div className="w-1.5 h-4 bg-[#E60012] rounded-full"></div>
                                                    SPV: {spv.spv}
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                                    {spv.sales_list.length} Sales
                                                </div>
                                            </div>
                                            <div className="p-0">
                                                <table className="w-full text-left">
                                                    <tbody>
                                                        {spv.sales_list.length > 0 ? (
                                                            spv.sales_list.map((salesRow, sIdx) => (
                                                                <tr key={sIdx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                                    <td className="p-2.5 pl-4 text-xs font-bold text-gray-800">
                                                                        {sIdx + 1}. {salesRow.sales}
                                                                    </td>
                                                                    <td className="p-2.5 pr-4 text-right">
                                                                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${salesRow.skor >= 80 ? 'bg-green-100 text-green-700' : salesRow.skor >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                            Skor: {salesRow.skor}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={2} className="p-4 text-center text-xs text-gray-400 font-bold">Tidak ada sales</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detail Survey Status (Reused from SalesSurveyAnalysis) */}
            <AnimatePresence>
                {selectedSurveyDetails && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-[#111111]">Detail Status Survey</h3>
                                    <p className="text-sm text-gray-500 font-medium">Sales: <span className="font-bold text-gray-800">{selectedSurveyDetails.sales}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedSurveyDetails(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-0 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 shadow-sm">
                                        <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                            <th className="p-3 pl-4">No</th>
                                            <th className="p-3">Nama Konsumen</th>
                                            <th className="p-3">Kendaraan / Rangka</th>
                                            <th className="p-3 text-center">Status Survey</th>
                                            <th className="p-3 text-center">NPS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {selectedSurveyDetails.details && selectedSurveyDetails.details.length > 0 ? (
                                            selectedSurveyDetails.details.map((item, idx) => {
                                                const npsItem = selectedSurveyDetails.nps_details?.find(n => n.rangka === item.rangka);
                                                return (
                                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                                                        <td className="p-3 pl-4 text-gray-500 font-bold">{idx + 1}</td>
                                                        <td className="p-3 font-bold text-[#111111]">{item.nama}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-800 text-xs">{item.kendaraan}</div>
                                                            <div className="text-[10px] text-gray-500 font-medium">{item.rangka}</div>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${item.status_survey === 'Sudah' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {item.status_survey}
                                                                </span>
                                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                                    {item.status_detail}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {npsItem ? (
                                                                <div className="flex flex-col items-center justify-center">
                                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${npsItem.kategori === 'promotor' ? 'bg-green-100 text-green-700' :
                                                                            npsItem.kategori === 'passive' ? 'bg-amber-100 text-amber-700' :
                                                                                'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {npsItem.kategori}
                                                                    </span>
                                                                    {npsItem.score !== null && (
                                                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                                            Score: {npsItem.score}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 font-bold text-xs">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Belum ada detail data konsumen</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Detail NPS (Reused from SalesSurveyAnalysis) */}
            <AnimatePresence>
                {selectedNpsDetails && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-[#111111]">Detail Simple NPS</h3>
                                    <p className="text-sm text-gray-500 font-medium">Sales: <span className="font-bold text-gray-800">{selectedNpsDetails.sales}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedNpsDetails(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="p-0 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 shadow-sm">
                                        <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                            <th className="p-3 pl-4">No</th>
                                            <th className="p-3">Nama Konsumen</th>
                                            <th className="p-3">Kendaraan / Rangka</th>
                                            <th className="p-3 text-center">Score</th>
                                            <th className="p-3 text-center">Kategori</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {selectedNpsDetails.details && selectedNpsDetails.details.length > 0 ? (
                                            selectedNpsDetails.details.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                                                    <td className="p-3 pl-4 text-gray-500 font-bold">{idx + 1}</td>
                                                    <td className="p-3 font-bold text-[#111111]">{item.nama}</td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-800 text-xs">{item.kendaraan}</div>
                                                        <div className="text-[10px] text-gray-500 font-medium">{item.rangka}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {item.score !== null ? (
                                                            <div className="relative group inline-block cursor-help" onClick={(e) => { e.stopPropagation(); }}>
                                                                <span className={`font-black ${item.note ? 'border-b-2 border-dashed border-gray-300 text-[#111111]' : ''}`}>
                                                                    {item.score}
                                                                </span>
                                                                {item.note && (
                                                                    <div className="absolute z-[60] bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-[#111111] text-white text-xs rounded-lg shadow-xl whitespace-normal text-left font-normal animate-in fade-in zoom-in-95 duration-200">
                                                                        <div className="text-gray-400 mb-1 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                                                                            <Info size={12} />
                                                                            Catatan Survey
                                                                        </div>
                                                                        <div className="leading-relaxed">{item.note}</div>
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#111111]"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.kategori === 'promotor' ? 'bg-green-100 text-green-700' :
                                                                item.kategori === 'passive' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {item.kategori}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Belum ada detail NPS</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalesRate;
