import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Calendar, Users, Star, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';

const SalesScoreTab = ({ month }) => {
    const [loading, setLoading] = useState(false);
    const [qualified, setQualified] = useState([]);
    const [nonQualified, setNonQualified] = useState([]);
    const [selectedNpsDetails, setSelectedNpsDetails] = useState(null);
    const [selectedSurveyDetails, setSelectedSurveyDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ bulan: month });
                const res = await fetch(`https://csdwindo.com/api/panel/sales_score.php?${params}`);
                const json = await res.json();
                
                if (json.status && json.data) {
                    setQualified(json.data.qualified || []);
                    setNonQualified(json.data.non_qualified || []);
                } else {
                    setQualified([]);
                    setNonQualified([]);
                }
            } catch (err) {
                console.error('Failed to fetch sales score:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month]);

    const Table = ({ data, title, showRank = true }) => (
        <div className="mb-8">
            <h3 className="font-display font-bold text-lg mb-4 text-[#111111]">{title}</h3>
            <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                        <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                            {showRank && <th className="p-3 text-center border-r border-gray-200 w-12">Rank</th>}
                            <th className="p-3 border-r border-gray-200 text-center w-24">Skor<br/>Akhir</th>
                            <th className="p-3 border-r border-gray-200 w-48">Sales</th>
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
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">
                                    Tidak ada data untuk periode ini.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                    {showRank && (
                                        <td className="p-3 text-center border-r border-gray-100">
                                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-3 text-center border-r border-gray-100">
                                        <div className={`font-black text-lg ${row.skor >= 80 ? 'text-green-600' : row.skor >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                                            {row.skor}
                                        </div>
                                    </td>
                                    <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">
                                        <div className="relative group inline-block cursor-help">
                                            <span className={`border-b-2 border-dashed ${row.spv ? 'border-gray-300' : 'border-transparent pb-0.5'}`}>
                                                {row.sales}
                                            </span>
                                            {row.spv && (
                                                <div className="absolute z-[60] bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-auto p-2 px-3 bg-[#111111] text-white text-xs rounded-lg shadow-xl whitespace-nowrap font-normal animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="text-gray-400 mb-0.5 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
                                                        Supervisor
                                                    </div>
                                                    <div className="font-bold text-sm">{row.spv}</div>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#111111]"></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td 
                                        className="p-3 border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group"
                                        onClick={() => setSelectedSurveyDetails({ sales: row.sales, details: row.detail_survey })}
                                        title="Klik untuk melihat detail status survey"
                                    >
                                        <div className="flex items-center justify-between mb-1 group-hover:scale-105 transition-transform origin-left">
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
                                        <div 
                                            className="flex items-center justify-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => setSelectedNpsDetails({ sales: row.sales, details: row.detail_nps })}
                                            title="Klik untuk melihat detail NPS"
                                        >
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
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-black ${
                                                row.nps >= 50 ? 'bg-green-100 text-green-700' : 
                                                row.nps >= 0 ? 'bg-blue-100 text-blue-700' : 
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {row.nps > 0 ? `+${row.nps}` : row.nps}
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
    );

    return (
        <div className="animate-in fade-in duration-300">
            <Table data={qualified} title="Ranking Survey Sales (Min. 2 Konsumen)" showRank={true} />
            <Table data={nonQualified} title="Sales dengan Kurang dari 2 Konsumen" showRank={false} />

            <AnimatePresence>
                {selectedNpsDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                                                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                            item.kategori === 'promotor' ? 'bg-green-100 text-green-700' :
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

            <AnimatePresence>
                {selectedSurveyDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {selectedSurveyDetails.details && selectedSurveyDetails.details.length > 0 ? (
                                            selectedSurveyDetails.details.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                                                    <td className="p-3 pl-4 text-gray-500 font-bold">{idx + 1}</td>
                                                    <td className="p-3 font-bold text-[#111111]">{item.nama}</td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-800 text-xs">{item.kendaraan}</div>
                                                        <div className="text-[10px] text-gray-500 font-medium">{item.rangka}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                                                item.status_survey === 'Sudah' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {item.status_survey}
                                                            </span>
                                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                                {item.status_detail}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">Belum ada detail data konsumen</td>
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

const SalesPerformaTab = ({ month }) => {
    const [loading, setLoading] = useState(false);
    const [performaData, setPerformaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ bulan: month });
                const res = await fetch(`https://csdwindo.com/api/panel/sales_score.php?${params}`);
                const json = await res.json();
                
                if (json.status && json.data) {
                    setPerformaData(json.data.performa || []);
                } else {
                    setPerformaData([]);
                }
            } catch (err) {
                console.error('Failed to fetch performa score:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
        if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
        return 'text-red-700 bg-red-50 border-red-200';
    };

    const getScoreBadge = (score) => {
        let text = 'Needs Improvement';
        let badgeColor = 'bg-red-500 text-white';
        if (score >= 85) {
            text = 'Excellent';
            badgeColor = 'bg-green-500 text-white';
        } else if (score >= 70) {
            text = 'Good';
            badgeColor = 'bg-blue-500 text-white';
        } else if (score >= 50) {
            text = 'Fair';
            badgeColor = 'bg-amber-500 text-white';
        }

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-8">
                <h3 className="font-display font-bold text-lg mb-4 text-[#111111]">Ranking Performa Sales (Evaluasi Follow Up)</h3>
                
                <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                        <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                            <tr className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                                <th className="p-3 text-center border-r border-gray-200">Rank</th>
                                <th className="p-3 border-r border-gray-200 text-center">Skor<br/>Performa</th>
                                <th className="p-3 border-r border-gray-200">Sales</th>
                                <th className="p-3 border-r border-gray-200 text-center">Total<br/>Konsumen</th>
                                <th className="p-3 border-r border-gray-200">
                                    <div className="flex flex-col items-center">
                                        <span>Tingkat Validitas Data</span>
                                        <span className="text-[9px] text-gray-400 font-medium normal-case">(No. Tlp Valid)</span>
                                    </div>
                                </th>
                                <th className="p-3 border-r border-gray-200 text-center">
                                    <div className="flex flex-col items-center">
                                        <span>Avg. Follow Up</span>
                                        <span className="text-[9px] text-gray-400 font-medium normal-case">(Call/Cust)</span>
                                    </div>
                                </th>
                                <th className="p-3 border-r border-gray-200">
                                    <div className="flex flex-col items-center">
                                        <span>Kepatuhan PKT</span>
                                        <span className="text-[9px] text-gray-400 font-medium normal-case">(Kehadiran Delivery)</span>
                                    </div>
                                </th>
                                <th className="p-3 text-center border-r border-gray-200">Tingkat<br/>Komplain</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500 font-bold">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#E60012] border-t-transparent rounded-full animate-spin"></div>
                                            Memuat data performa...
                                        </div>
                                    </td>
                                </tr>
                            ) : performaData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-400 font-bold">
                                        Tidak ada data performa untuk periode ini.
                                    </td>
                                </tr>
                            ) : (
                                performaData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                        <td className="p-3 text-center border-r border-gray-100">
                                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className={`p-3 text-center border-r border-gray-100 ${getScoreColor(row.performa_score)}`}>
                                            <div className="font-black text-lg">{row.performa_score}</div>
                                            <div className="mt-1">{getScoreBadge(row.performa_score)}</div>
                                        </td>
                                        <td className="p-3 font-bold text-[#111111] border-r border-gray-100 whitespace-nowrap">{row.sales}</td>
                                        <td className="p-3 text-center font-bold border-r border-gray-100">{row.total_konsumen}</td>
                                        
                                        <td className="p-3 border-r border-gray-100 w-48">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-gray-700">{row.valid_rate}%</span>
                                                <span className="text-[10px] text-gray-500 font-medium">{row.total_konsumen - row.invalid_numbers}/{row.total_konsumen} Valid</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${row.valid_rate >= 90 ? 'bg-green-500' : row.valid_rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${row.valid_rate}%` }}
                                                ></div>
                                            </div>
                                        </td>

                                        <td className="p-3 text-center border-r border-gray-100">
                                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${row.avg_attempts <= 1.5 ? 'bg-green-100 text-green-700' : row.avg_attempts <= 2.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {row.avg_attempts}x
                                            </span>
                                        </td>

                                        <td className="p-3 border-r border-gray-100 w-48">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-gray-700">{row.pkt_compliance}%</span>
                                                <span className="text-[10px] text-gray-500 font-medium">{row.pkt_yes} Hadir / {row.pkt_yes + row.pkt_no} Total</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${row.pkt_compliance >= 80 ? 'bg-blue-500' : row.pkt_compliance >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${row.pkt_compliance}%` }}
                                                ></div>
                                            </div>
                                        </td>

                                        <td className="p-3 text-center border-r border-gray-100">
                                            <span className={`font-bold ${row.komplen_rate === 0 ? 'text-green-600' : row.komplen_rate <= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {row.komplen_rate}%
                                            </span>
                                            <div className="text-[10px] text-gray-500">{row.komplen} komplain</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CSFollowUpTab = ({ month }) => {
    const [loading, setLoading] = useState(false);
    const [csData, setCsData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ bulan: month });
                const res = await fetch(`https://csdwindo.com/api/panel/sales_score.php?${params}`);
                const json = await res.json();
                
                if (json.status && json.data && json.data.cs_performa) {
                    setCsData(json.data.cs_performa);
                } else {
                    setCsData(null);
                }
            } catch (err) {
                console.error('Failed to fetch CS performa:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-bold">
                <div className="w-8 h-8 border-4 border-[#E60012] border-t-transparent rounded-full animate-spin mb-4"></div>
                Memuat Infografis CS Follow Up...
            </div>
        );
    }

    if (!csData || csData.total_data === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-bold">
                Tidak ada data follow up untuk bulan ini.
            </div>
        );
    }

    const { pola_harian } = csData;
    const maxPola = Math.max(...Object.values(pola_harian));
    
    // Hitung persentase kehadiran (Hari Kerja Efektif / Total Hari Kerja Senin-Jumat)
    const kehadiranPct = csData.total_hari_kerja > 0 ? Math.round((csData.hari_kerja_efektif / csData.total_hari_kerja) * 100) : 0;

    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            <h3 className="font-display font-bold text-xl text-[#111111]">Produktivitas Staff Follow Up (CS)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Data */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
                    <div className="text-gray-500 font-bold text-sm mb-1">Total Follow Up</div>
                    <div className="text-3xl font-black text-[#111111]">{csData.total_data} <span className="text-sm font-medium text-gray-400">data</span></div>
                    <div className="mt-3 text-xs text-gray-500">
                        Ditangani oleh <span className="font-bold text-gray-700">1 orang Staff CS</span>
                    </div>
                </div>

                {/* Card 2: Hari Kerja Efektif */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
                    <div className="text-gray-500 font-bold text-sm mb-1">Kehadiran / Aktif</div>
                    <div className="text-3xl font-black text-[#111111]">{csData.hari_kerja_efektif} <span className="text-sm font-medium text-gray-400">dari {csData.total_hari_kerja} hari</span></div>
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                            <span>{kehadiranPct}% Efektif</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${kehadiranPct < 50 ? 'bg-red-500' : kehadiranPct < 80 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${kehadiranPct}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Rata-rata Follow Up/Hari */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
                    <div className="text-gray-500 font-bold text-sm mb-1">Rata-rata Harian</div>
                    <div className="text-3xl font-black text-[#111111]">{csData.avg_follow_up_per_hari} <span className="text-sm font-medium text-gray-400">data/hari</span></div>
                    <div className="mt-3 text-xs font-bold">
                        <span className={`${csData.avg_follow_up_per_hari < 10 ? 'text-red-500' : csData.avg_follow_up_per_hari < 20 ? 'text-amber-500' : 'text-green-500'}`}>
                            {csData.avg_follow_up_per_hari < 10 ? 'Kapasitas Sangat Rendah' : csData.avg_follow_up_per_hari < 20 ? 'Kapasitas Sedang' : 'Kapasitas Tinggi'}
                        </span>
                    </div>
                </div>

                {/* Card 4: Response Time */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
                    <div className="text-gray-500 font-bold text-sm mb-1">Avg. Response Time</div>
                    <div className="text-3xl font-black text-[#111111]">{csData.avg_response_time} <span className="text-sm font-medium text-gray-400">hari</span></div>
                    <div className="mt-3 text-xs font-bold">
                        <span className={`${csData.avg_response_time > 14 ? 'text-red-500' : csData.avg_response_time > 7 ? 'text-amber-500' : 'text-green-500'}`}>
                            {csData.avg_response_time > 14 ? 'Terlambat Fatal' : csData.avg_response_time > 7 ? 'Respon Lambat' : 'Respon Cepat (Ideal)'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Konten Kiri: Kontak Efektif & Kesimpulan */}
                <div className="space-y-6">
                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                        <h4 className="font-display font-bold text-md text-[#111111] mb-4">Rasio Kontak Efektif</h4>
                        
                        <div className="flex items-end justify-between mb-2">
                            <div>
                                <div className="text-4xl font-black text-[#111111]">{csData.kontak_efektif_pct}%</div>
                                <div className="text-sm text-gray-500 font-medium">Berhasil mendapat feedback</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-gray-400">{100 - csData.kontak_efektif_pct}%</div>
                                <div className="text-sm text-gray-400 font-medium">Gagal (Reject/No. Salah)</div>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex mt-4">
                            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${csData.kontak_efektif_pct}%` }}></div>
                            <div className="bg-red-300 h-full transition-all duration-1000" style={{ width: `${100 - csData.kontak_efektif_pct}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between mt-3 text-xs font-bold">
                            <div className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {csData.kontak_efektif} Kontak Sukses</div>
                            <div className="flex items-center gap-1 text-red-500"><span className="w-2 h-2 rounded-full bg-red-400"></span> {csData.kontak_gagal} Kontak Gagal</div>
                        </div>
                    </div>

                    <div className={`border rounded-xl p-6 shadow-sm ${
                        csData.skor_produktivitas === 'Tinggi' ? 'bg-green-50 border-green-200' :
                        csData.skor_produktivitas === 'Sedang' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                                csData.skor_produktivitas === 'Tinggi' ? 'bg-green-100 text-green-700' :
                                csData.skor_produktivitas === 'Sedang' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="font-display font-bold text-lg">Skor Produktivitas: {csData.skor_produktivitas}</h4>
                                <p className="text-sm opacity-80 font-medium">Kesimpulan berdasarkan metrik sistem</p>
                            </div>
                        </div>
                        <p className="text-sm mt-3 font-medium opacity-90 leading-relaxed">
                            {csData.skor_produktivitas === 'Tinggi' 
                                ? "Kinerja sangat baik. Volume harian tinggi dengan response time yang sangat ideal."
                                : csData.skor_produktivitas === 'Sedang' 
                                ? "Kinerja cukup baik namun bisa ditingkatkan. Perhatikan akumulasi data di hari tertentu."
                                : `Konsisten dengan volume harian yang sangat rendah (${csData.avg_follow_up_per_hari} data/hari) dan response time yang lambat (${csData.avg_response_time} hari). Terindikasi penumpukan tugas atau kendala operasional.`
                            }
                        </p>
                    </div>
                </div>

                {/* Konten Kanan: Pola Kerja Harian */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                    <h4 className="font-display font-bold text-md text-[#111111] mb-6">Pola Kerja Harian</h4>
                    
                    <div className="space-y-4">
                        {Object.entries(pola_harian).map(([hari, jumlah]) => {
                            const pct = maxPola > 0 ? (jumlah / maxPola) * 100 : 0;
                            const totalPct = csData.total_data > 0 ? Math.round((jumlah / csData.total_data) * 100) : 0;
                            
                            // Highlight khusus hari Minggu atau hari dengan aktivitas mencolok
                            const isWeekend = hari === 'Sabtu' || hari === 'Minggu';
                            const barColor = isWeekend ? 'bg-gray-300' : (pct === 100 ? 'bg-[#E60012]' : 'bg-gray-800');
                            
                            return (
                                <div key={hari} className="flex items-center gap-4">
                                    <div className={`w-16 text-sm font-bold ${isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>{hari}</div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden flex items-center">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full ${barColor} rounded-md`}
                                            ></motion.div>
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="font-black text-[#111111]">{jumlah}</span>
                                            <span className="text-xs text-gray-500 ml-1 font-medium">({totalPct}%)</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100">
                        <strong className="text-[#111111]">Indikasi Analisis: </strong> 
                        Hari dengan persentase dominan (warna merah) seringkali menunjukkan akumulasi kerja akibat tertunda di hari-hari sebelumnya. Hari Sabtu dan Minggu ditandai abu-abu karena berada di luar 5 hari kerja efektif.
                    </div>
                </div>
            </div>

            {/* Daily Trend Line Chart */}
            <DailyTrendChart data={csData.trend_harian || {}} month={month} />
        </div>
    );
};

const DailyTrendChart = ({ data, month }) => {
    const [hoverInfo, setHoverInfo] = useState(null);
    const [year, monthNum] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    
    // Build array of values for each day
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
        // Mendukung format key "YYYY-MM-DD" atau "D" (angka hari)
        const val = (data && (data[dateStr] !== undefined ? data[dateStr] : (data[day] !== undefined ? data[day] : 0))) || 0;
        return { day, val };
    });

    const maxValue = Math.max(...chartData.map(d => d.val), 5); // min axis 5
    
    const w = 1000;
    const h = 250;
    const padX = 40;
    const padY = 40;
    
    const points = chartData.map((d, i) => {
        const x = padX + (i / (daysInMonth - 1)) * (w - 2 * padX);
        const y = h - padY - (d.val / maxValue) * (h - 2 * padY);
        return { x, y, val: d.val, day: d.day };
    });

    const createSmoothPath = (pts) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            // Horizontal tangent smoothing
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp1y = p0.y;
            const cp2x = p1.x - (p1.x - p0.x) / 3;
            const cp2y = p1.y;
            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        }
        return path;
    };

    const pathData = createSmoothPath(points);

    return (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm col-span-full mt-6">
            <h4 className="font-display font-bold text-md text-[#111111] mb-6">Tren Harian (Bulan {month})</h4>
            <div className="w-full h-64 relative" onMouseLeave={() => setHoverInfo(null)}>
                
                {/* HTML Tooltip Overlay */}
                <AnimatePresence>
                    {hoverInfo && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-10 bg-[#111111] text-white p-3 rounded-lg shadow-xl pointer-events-none"
                            style={{
                                left: `${(hoverInfo.x / w) * 100}%`, 
                                top: `${(hoverInfo.y / h) * 100}%`,
                                transform: 'translate(-50%, -130%)'
                            }}
                        >
                            <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Tgl {hoverInfo.day}</div>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-black text-white leading-none">{hoverInfo.val}</span>
                                <span className="text-xs text-gray-300 mb-0.5">data</span>
                            </div>
                            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#111111]"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                        const y = h - padY - (pct * (h - 2 * padY));
                        const val = Math.round(maxValue * pct);
                        return (
                            <g key={`y-${pct}`}>
                                <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                <text x={padX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-medium">{val}</text>
                            </g>
                        );
                    })}

                    {/* X Axis Labels */}
                    {points.map((d) => {
                        const showLabel = daysInMonth <= 15 || d.day % 2 !== 0 || d.day === daysInMonth;
                        return (
                            <g key={`x-${d.day}`}>
                                {showLabel && (
                                    <text x={d.x} y={h - padY + 20} textAnchor="middle" className="text-[10px] fill-gray-400 font-medium">{d.day}</text>
                                )}
                                {/* Invisible larger circle to increase hover area */}
                                <circle cx={d.x} cy={d.y} r="12" fill="transparent" 
                                        onMouseEnter={() => setHoverInfo(d)} 
                                        className="cursor-pointer" />
                                {/* Visible Dot */}
                                <circle cx={d.x} cy={d.y} r={d.val > 0 || hoverInfo?.day === d.day ? "4" : "2"} 
                                        fill={hoverInfo?.day === d.day ? "#111111" : (d.val > 0 ? "#E60012" : "#d1d5db")} 
                                        className="transition-all pointer-events-none" />
                            </g>
                        );
                    })}

                    {/* Area Fill */}
                    <polygon 
                        fill="url(#gradient-line)" 
                        points={`${padX},${h - padY} ${pathData.replace(/^M/, 'L')} L ${w - padX},${h - padY}`}
                        opacity="0.15"
                    />
                    
                    {/* The Smooth Line */}
                    <path 
                        d={pathData}
                        fill="none" 
                        stroke="#E60012" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                    />

                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#E60012" stopOpacity="1" />
                            <stop offset="100%" stopColor="#E60012" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

const SalesSurveyAnalysis = () => {
    const [month, setMonth] = useState('2026-05');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [activeTab, setActiveTab] = useState('score'); // 'score' | 'performa'
    const monthPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() - 1);
        setMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() + 1);
        setMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    };

    const getMonthLabel = () => {
        if (!month) return 'Pilih Bulan';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            {/* Header & Filters */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Sales Survey Analysis</h1>
                        <p className="text-gray-500 text-sm mt-1">Analisis dan komparasi performa survey sales bulanan</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded-lg relative h-[42px] shrink-0 shadow-sm" ref={monthPickerRef}>
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center justify-center px-4 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
                            onClick={() => setShowMonthPicker(!showMonthPicker)}>
                            <Calendar size={16} className="text-[#E60012]" />
                            {getMonthLabel()}
                        </div>

                        <AnimatePresence>
                            {showMonthPicker && (
                                <CustomMonthPicker
                                    currentMonth={month}
                                    onSelect={(m) => { setMonth(m); setShowMonthPicker(false); }}
                                    onClose={() => setShowMonthPicker(false)}
                                />
                            )}
                        </AnimatePresence>

                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E5E5] mb-6 gap-6 shrink-0">
                <button
                    onClick={() => setActiveTab('score')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
                        activeTab === 'score' ? 'text-[#E60012]' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <Star size={18} />
                    Sales Score
                    {activeTab === 'score' && (
                        <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('performa')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
                        activeTab === 'performa' ? 'text-[#E60012]' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <Users size={18} />
                    Sales Performa
                    {activeTab === 'performa' && (
                        <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('cs')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
                        activeTab === 'cs' ? 'text-[#E60012]' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <Info size={18} />
                    CS Follow Up
                    {activeTab === 'cs' && (
                        <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E60012]" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {activeTab === 'score' ? <SalesScoreTab month={month} /> : 
                 activeTab === 'performa' ? <SalesPerformaTab month={month} /> : 
                 <CSFollowUpTab month={month} />}
            </div>
        </div>
    );
};

export default SalesSurveyAnalysis;
