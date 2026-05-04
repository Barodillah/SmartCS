import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Calendar, Info, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomMonthPicker from '../../components/ui/CustomMonthPicker';

const NPSReport = () => {
    const navigate = useNavigate();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [cabang, setCabang] = useState('All');
    const [divisi, setDivisi] = useState('Sales');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [quarterData, setQuarterData] = useState([]);
    const [prevChartData, setPrevChartData] = useState([]);
    const [prevQuarterData, setPrevQuarterData] = useState([]);
    const [fyData, setFyData] = useState([]);
    const [fyPrevData, setFyPrevData] = useState([]);
    const [summary, setSummary] = useState({ promoters: 0, passives: 0, detractors: 0, total: 0, nps: 0 });
    const [loading, setLoading] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState(null);
    const monthPickerRef = useRef(null);

    const getQuarterInfo = (monthStr) => {
        if (!monthStr) return null;
        const m = parseInt(monthStr.split('-')[1]);
        const y = monthStr.split('-')[0];
        if (m <= 3) return { label: 'Q1', months: [`${y}-01`, `${y}-02`, `${y}-03`], range: 'Jan - Mar' };
        if (m <= 6) return { label: 'Q2', months: [`${y}-04`, `${y}-05`, `${y}-06`], range: 'Apr - Jun' };
        if (m <= 9) return { label: 'Q3', months: [`${y}-07`, `${y}-08`, `${y}-09`], range: 'Jul - Sep' };
        return { label: 'Q4', months: [`${y}-10`, `${y}-11`, `${y}-12`], range: 'Oct - Dec' };
    };

    const getPrevQuarterInfo = (monthStr) => {
        const q = getQuarterInfo(monthStr);
        if (!q) return null;
        const firstMonth = q.months[0];
        const d = new Date(firstMonth + '-01');
        d.setMonth(d.getMonth() - 1);
        const prevMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return getQuarterInfo(prevMonthStr);
    };

    const getCurrentFY = (monthStr) => {
        if (!monthStr) return null;
        const [y, m] = monthStr.split('-').map(Number);
        return m >= 4 ? y : y - 1;
    };

    const getFYMonths = (fyYear) => {
        const months = [];
        for (let m = 4; m <= 12; m++) months.push(`${fyYear}-${String(m).padStart(2, '0')}`);
        for (let m = 1; m <= 3; m++) months.push(`${fyYear + 1}-${String(m).padStart(2, '0')}`);
        return months;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch NPS data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Current Month
                const params = new URLSearchParams({ bulan: month, divisi, cabang });
                const res = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${params}`);
                const json = await res.json();

                // 2. Previous Month (for diff)
                const d = new Date(month + '-01');
                d.setMonth(d.getMonth() - 1);
                const prevMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const prevParams = new URLSearchParams({ bulan: prevMonthStr, divisi, cabang });
                const prevRes = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${prevParams}`);
                const prevJson = await prevRes.json();

                // 3. Quarterly Data
                const qInfo = getQuarterInfo(month);
                const qParams = new URLSearchParams({ bulan: qInfo.months.join(','), divisi, cabang });
                const qRes = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${qParams}`);
                const qJson = await qRes.json();

                // 4. Previous Quarterly Data (for diff)
                const prevQInfo = getPrevQuarterInfo(month);
                const prevQParams = new URLSearchParams({ bulan: prevQInfo.months.join(','), divisi, cabang });
                const prevQRes = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${prevQParams}`);
                const prevQJson = await prevQRes.json();

                // 5. Fiscal Year Data (Current & Previous)
                const currentFY = getCurrentFY(month);
                const fyMonths = getFYMonths(currentFY);
                const prevFYMonths = getFYMonths(currentFY - 1);

                const fyParams = new URLSearchParams({ bulan: fyMonths.join(','), divisi, cabang });
                const fyRes = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${fyParams}`);
                const fyJson = await fyRes.json();

                const pFyParams = new URLSearchParams({ bulan: prevFYMonths.join(','), divisi, cabang });
                const pFyRes = await fetch(`https://csdwindo.com/api/panel/nps_report.php?${pFyParams}`);
                const pFyJson = await pFyRes.json();

                // Process Monthly Data
                if (json.status && json.data && json.data.length > 0) {
                    let rows = json.data.map(r => ({
                        label: r.cabang,
                        promoters: r.promoters,
                        passives: r.passives,
                        detractors: r.detractors
                    }));

                    if (cabang === 'All') {
                        const order = ['Bintaro', 'Raden Inten', 'Cakung', 'Dwindo'];
                        rows.sort((a, b) => {
                            const indexA = order.indexOf(a.label);
                            const indexB = order.indexOf(b.label);
                            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                        });
                    }
                    setChartData(rows);

                    // Summary Calculation
                    const sumRow = cabang === 'All' ? rows.find(r => r.label === 'Dwindo') || rows[rows.length - 1] : rows[0];
                    const total = sumRow.promoters + sumRow.passives + sumRow.detractors;
                    const nps = total > 0 ? Math.round(((sumRow.promoters - sumRow.detractors) / total) * 100) : 0;
                    setSummary({ promoters: sumRow.promoters, passives: sumRow.passives, detractors: sumRow.detractors, total, nps });
                } else {
                    setChartData([]);
                    setSummary({ promoters: 0, passives: 0, detractors: 0, total: 0, nps: 0 });
                }

                // Process Prev Month Data
                if (prevJson.status && prevJson.data && prevJson.data.length > 0) {
                    const pRows = prevJson.data.map(r => ({
                        label: r.cabang,
                        nps: (r.promoters + r.passives + r.detractors) > 0 ? Math.round(((r.promoters - r.detractors) / (r.promoters + r.passives + r.detractors)) * 100) : 0
                    }));
                    setPrevChartData(pRows);
                } else {
                    setPrevChartData([]);
                }

                // Process Quarterly Data
                if (qJson.status && qJson.data && qJson.data.length > 0) {
                    let qRows = qJson.data.map(r => ({
                        label: r.cabang,
                        promoters: r.promoters,
                        passives: r.passives,
                        detractors: r.detractors
                    }));
                    if (cabang === 'All') {
                        const order = ['Bintaro', 'Raden Inten', 'Cakung', 'Dwindo'];
                        qRows.sort((a, b) => {
                            const indexA = order.indexOf(a.label);
                            const indexB = order.indexOf(b.label);
                            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                        });
                    }
                    setQuarterData(qRows);
                } else {
                    setQuarterData([]);
                }

                // Process Prev Quarterly Data
                if (prevQJson.status && prevQJson.data && prevQJson.data.length > 0) {
                    const pqRows = prevQJson.data.map(r => ({
                        label: r.cabang,
                        nps: (r.promoters + r.passives + r.detractors) > 0 ? Math.round(((r.promoters - r.detractors) / (r.promoters + r.passives + r.detractors)) * 100) : 0
                    }));
                    setPrevQuarterData(pqRows);
                } else {
                    setPrevQuarterData([]);
                }

                // Process FY Data
                if (fyJson.status && fyJson.data) {
                    setFyData(fyJson.data);
                }
                if (pFyJson.status && pFyJson.data) {
                    setFyPrevData(pFyJson.data);
                }

            } catch (err) {
                console.error('Failed to fetch NPS data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [month, cabang, divisi]);

    const handlePrevMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() - 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m);
    };

    const handleNextMonth = () => {
        const current = month ? new Date(month + '-01') : new Date();
        current.setMonth(current.getMonth() + 1);
        const m = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        setMonth(m);
    };

    const getMonthLabel = () => {
        if (!month) return 'Pilih Bulan';
        const d = new Date(month + '-01');
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        setTimeout(() => setCopiedLabel(null), 2000);
    };

    const maxTotal = Math.max(...chartData.map(d => d.promoters + d.passives + d.detractors), 1);

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-8rem)] text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">NPS Report</h1>
                            <button
                                onClick={() => navigate('/panel/nps-report/upload')}
                                className="flex items-center gap-1.5 px-3 py-1 bg-[#E60012]/10 text-[#E60012] text-xs font-bold rounded hover:bg-[#E60012] hover:text-white transition-colors border border-[#E60012]/20"
                            >
                                <Upload size={14} /> Upload Data
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">NPS {divisi} Cabang {cabang === 'All' ? 'Semua' : cabang} - {getMonthLabel()}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: 'All', label: 'Dwindo' },
                            { id: 'Bintaro', label: 'Bintaro' },
                            { id: 'Raden Inten', label: 'Raden Inten' },
                            { id: 'Cakung', label: 'Cakung' }
                        ].map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCabang(c.id)}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${cabang === c.id
                                    ? 'bg-white text-[#E60012] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] p-1 rounded w-fit relative h-[42px]" ref={monthPickerRef}>
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded text-gray-500 hover:text-[#111111] transition-colors">
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center justify-center px-2 py-1 gap-2 cursor-pointer hover:bg-gray-50 rounded transition-colors text-sm font-bold text-[#111111]"
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

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: 'Sales', label: 'Sales' },
                            { id: 'Service', label: 'Service' }
                        ].map((d) => (
                            <button
                                key={d.id}
                                onClick={() => setDivisi(d.id)}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${divisi === d.id
                                    ? 'bg-white text-[#E60012] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 pb-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Net Promoter Score</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-[#111111]">{summary.nps}</span>
                            <span className="text-sm text-gray-400 mb-1">Score</span>
                        </div>
                        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-red-500" style={{ width: `${(summary.detractors / summary.total) * 100}%` }}></div>
                            <div className="h-full bg-orange-500" style={{ width: `${(summary.passives / summary.total) * 100}%` }}></div>
                            <div className="h-full bg-green-500" style={{ width: `${(summary.promoters / summary.total) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Promoters
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-[#111111]">{summary.promoters}</span>
                            <span className="text-sm text-gray-400 mb-1">org ({summary.total ? Math.round((summary.promoters / summary.total) * 100) : 0}%)</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div> Passives
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-[#111111]">{summary.passives}</span>
                            <span className="text-sm text-gray-400 mb-1">org ({summary.total ? Math.round((summary.passives / summary.total) * 100) : 0}%)</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Detractors
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-[#111111]">{summary.detractors}</span>
                            <span className="text-sm text-gray-400 mb-1">org ({summary.total ? Math.round((summary.detractors / summary.total) * 100) : 0}%)</span>
                        </div>
                    </div>
                </div>

                {/* Monthly Chart */}
                <NPSBenchmarkCard
                    title="NPS Benchmark (Monthly)"
                    subtitle={`Tingkat kepuasan pelanggan bulan ${getMonthLabel()}.`}
                    data={chartData}
                    cabang={cabang}
                    prevData={prevChartData}
                    handleCopy={handleCopy}
                    copiedLabel={copiedLabel}
                />
                {/* Quarterly Chart */}
                {(() => {
                    const qInfo = getQuarterInfo(month);
                    const prevQInfo = getPrevQuarterInfo(month);
                    return (
                        <NPSBenchmarkCard
                            title={`NPS Benchmark (${qInfo?.label || 'Quarterly'})`}
                            subtitle={`Akumulasi tingkat kepuasan pelanggan periode ${qInfo?.range || ''} ${month.split('-')[0]}. Komparasi vs ${prevQInfo?.label} ${prevQInfo?.months[0].split('-')[0]}.`}
                            data={quarterData}
                            cabang={cabang}
                            prevData={prevQuarterData}
                            handleCopy={handleCopy}
                            copiedLabel={copiedLabel}
                            isQuarterly={true}
                        />
                    );
                })()}

                {/* Data Table Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-lg text-[#111111]">NPS Detailed Analysis</h2>
                            <p className="text-sm text-gray-500">Rekapitulasi data sampling dan perbandingan Fiscal Year.</p>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded">
                            KLIK NILAI UNTUK COPY
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider">
                                    <th className="p-4 bg-gray-50 border-b border-gray-200">Dealer Name</th>
                                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-center">Total Sampling</th>
                                    <th className="p-4 bg-green-500 text-white border-b border-gray-200 text-center">Promotor</th>
                                    <th className="p-4 bg-amber-400 text-white border-b border-gray-200 text-center">Passiver</th>
                                    <th className="p-4 bg-red-500 text-white border-b border-gray-200 text-center">Detractor</th>
                                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-center border-l-2 border-black">NPS Bulan ini</th>
                                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-center border-l">FY {String(getCurrentFY(month) - 1).slice(-2)}</th>
                                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-center">FY {String(getCurrentFY(month)).slice(-2)}</th>
                                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-center border-l">FY{String(getCurrentFY(month) - 1).slice(-2)} VS FY{String(getCurrentFY(month)).slice(-2)}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {(() => {
                                    const branches = cabang === 'All' ? ['Bintaro', 'Raden Inten', 'Cakung', 'Dwindo'] : [cabang];
                                    return branches.map((bName, idx) => {
                                        const curMonth = chartData.find(d => d.label === bName) || { promoters: 0, passives: 0, detractors: 0 };
                                        const curTotal = curMonth.promoters + curMonth.passives + curMonth.detractors;
                                        const curNps = curTotal > 0 ? Math.round(((curMonth.promoters - curMonth.detractors) / curTotal) * 100) : 0;

                                        const fPrev = fyPrevData.find(d => d.cabang === bName) || { promoters: 0, passives: 0, detractors: 0, total: 0 };
                                        const fPrevNps = fPrev.total > 0 ? Math.round(((fPrev.promoters - fPrev.detractors) / fPrev.total) * 100) : 0;

                                        const fCur = fyData.find(d => d.cabang === bName) || { promoters: 0, passives: 0, detractors: 0, total: 0 };
                                        const fCurNps = fCur.total > 0 ? Math.round(((fCur.promoters - fCur.detractors) / fCur.total) * 100) : 0;

                                        const diff = fCurNps - fPrevNps;
                                        const isDwindo = bName === 'Dwindo';

                                        return (
                                            <tr key={bName} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-red-50/30 transition-colors ${isDwindo ? 'font-black border-t-2 border-gray-200 bg-blue-50/30' : ''}`}>
                                                <td className="p-4 uppercase text-xs font-bold">{isDwindo ? 'DWINDO GROUP' : bName}</td>
                                                <td className="p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleCopy(curTotal, bName + '-total')}>{curTotal}</td>
                                                <td className="p-4 text-center cursor-pointer hover:bg-green-50 transition-colors text-green-600" onClick={() => handleCopy(curMonth.promoters, bName + '-p')}>{curMonth.promoters}</td>
                                                <td className="p-4 text-center cursor-pointer hover:bg-amber-50 transition-colors text-amber-600" onClick={() => handleCopy(curMonth.passives, bName + '-a')}>{curMonth.passives}</td>
                                                <td className="p-4 text-center cursor-pointer hover:bg-red-50 transition-colors text-red-600" onClick={() => handleCopy(curMonth.detractors, bName + '-d')}>{curMonth.detractors}</td>
                                                <td className="p-4 text-center border-l-2 border-gray-100 font-black text-[#E60012] cursor-pointer" onClick={() => handleCopy(curNps + '%', bName + '-nps')}>
                                                    {copiedLabel === bName + '-nps' ? <span className="text-[10px] animate-pulse">COPIED</span> : `${curNps}%`}
                                                </td>
                                                <td className="p-4 text-center border-l border-gray-100 cursor-pointer" onClick={() => handleCopy(fPrevNps + '%', bName + '-fyprev')}>{fPrevNps}%</td>
                                                <td className="p-4 text-center cursor-pointer" onClick={() => handleCopy(fCurNps + '%', bName + '-fycur')}>{fCurNps}%</td>
                                                <td className="p-4 text-center border-l border-gray-100">
                                                    <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => handleCopy((diff > 0 ? '+' : '') + diff + '%', bName + '-fydiff')}>
                                                        {diff > 0 ? <ArrowUp size={12} className="text-green-500" /> : diff < 0 ? <ArrowDown size={12} className="text-red-500" /> : null}
                                                        <span className={diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}>
                                                            {Math.abs(diff)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NPSBenchmarkCard = ({ title, subtitle, data, cabang, prevData, handleCopy, copiedLabel, isQuarterly = false }) => {
    return (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="font-bold text-xl text-[#111111]">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className="flex gap-6 text-xs font-bold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div> Promoters</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-400"></div> Passives</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div> Detractors</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-0.5 border-t-2 border-dashed border-black"></div> NPS Score</div>
                </div>
            </div>

            <div className="relative h-96 flex items-end pb-16">
                {/* Y-axis labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-28 pt-10">
                    {[100, 75, 50, 25, 0].map((val) => (
                        <div key={val} className="flex items-center w-full">
                            <span className="text-[10px] text-gray-400 w-10 text-right pr-3 font-bold">{val}%</span>
                            <div className="flex-1 border-b border-gray-100 border-dashed"></div>
                        </div>
                    ))}
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex items-end justify-around pl-10 h-full pb-28 pt-10 relative">
                    {data.map((item, idx) => {
                        const total = item.promoters + item.passives + item.detractors;
                        const pPct = total > 0 ? Math.round((item.promoters / total) * 100) : 0;
                        const aPct = total > 0 ? Math.round((item.passives / total) * 100) : 0;
                        const dPct = total > 0 ? (100 - pPct - aPct) : 0;
                        const npsScore = total > 0 ? Math.round(((item.promoters - item.detractors) / total) * 100) : 0;

                        return (
                            <div key={item.label} className="flex flex-col items-center group relative h-full flex-1">
                                {/* Vertical Separator for Dwindo Group */}
                                {cabang === 'All' && item.label === 'Dwindo' && (
                                    <div className="absolute left-[-20%] top-[-5%] bottom-[-5%] w-px border-l-2 border-red-400 border-dashed opacity-50"></div>
                                )}

                                {/* 100% Stacked Bar */}
                                <div className="w-full max-w-[80px] h-full flex flex-col-reverse rounded overflow-hidden shadow-md border border-white relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                                    <div className="w-full bg-red-500 flex items-center justify-center text-[10px] text-white font-black overflow-hidden" style={{ height: `${dPct}%` }}>
                                        {dPct > 3 && `${dPct}%`}
                                    </div>
                                    <div className="w-full bg-amber-400 flex items-center justify-center text-[10px] text-white font-black overflow-hidden" style={{ height: `${aPct}%` }}>
                                        {aPct > 3 && `${aPct}%`}
                                    </div>
                                    <div className="w-full bg-green-500 flex items-center justify-center text-[10px] text-white font-black overflow-hidden" style={{ height: `${pPct}%` }}>
                                        {pPct > 3 && `${pPct}%`}
                                    </div>
                                </div>

                                {/* NPS Value Point */}
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black rounded-full border-2 border-white shadow-lg z-30"
                                    style={{ bottom: `calc(${npsScore}% - 5px)` }}
                                >
                                    <div className="absolute -right-2 -top-6 bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-black whitespace-nowrap shadow-xl">
                                        {npsScore}%
                                    </div>
                                </div>

                                {/* Label Cabang */}
                                <div className="absolute -bottom-10 text-[11px] text-gray-700 font-black uppercase tracking-wider text-center px-1">
                                    {item.label === 'Dwindo' ? 'DWINDO GROUP' : item.label}
                                </div>

                                {/* Selisih Section */}
                                {prevData && (
                                    <div
                                        onClick={() => {
                                            const prevItem = prevData.find(p => p.label === item.label);
                                            const prevNps = prevItem ? prevItem.nps : 0;
                                            const diff = npsScore - prevNps;
                                            handleCopy(`${diff > 0 ? '+' : ''}${diff}%`, item.label);
                                        }}
                                        className="absolute -bottom-24 w-full max-w-[80px] border border-dashed border-gray-300 rounded-md p-1.5 flex items-center justify-center gap-1 cursor-pointer select-none bg-gray-50/50 transition-all hover:bg-white hover:border-[#E60012]/30 active:scale-95 group/diff"
                                        title="Click to copy diff"
                                    >
                                        {copiedLabel === item.label ? (
                                            <span className="text-[10px] font-black text-[#E60012] animate-bounce">Copied!</span>
                                        ) : (
                                            (() => {
                                                const prevItem = prevData.find(p => p.label === item.label);
                                                const prevNps = prevItem ? prevItem.nps : 0;
                                                const diff = npsScore - prevNps;
                                                if (diff > 0) return <><ArrowUp size={14} className="text-green-500" strokeWidth={3} /><span className="text-[11px] font-black text-green-600">{diff}%</span></>;
                                                if (diff < 0) return <><ArrowDown size={14} className="text-red-500" strokeWidth={3} /><span className="text-[11px] font-black text-red-600">{Math.abs(diff)}%</span></>;
                                                return <span className="text-[11px] font-black text-gray-400">0%</span>;
                                            })()
                                        )}
                                    </div>
                                )}

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-4 bg-white border border-gray-200 p-3 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] min-w-[140px] translate-y-2 group-hover:translate-y-0 text-left">
                                    <div className="font-black text-[#111111] mb-2 border-b pb-1 uppercase text-xs">{item.label}</div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-green-600">PROMOTERS</span>
                                            <span>{item.promoters} ({pPct}%)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-amber-500">PASSIVES</span>
                                            <span>{item.passives} ({aPct}%)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-red-500">DETRACTORS</span>
                                            <span>{item.detractors} ({dPct}%)</span>
                                        </div>
                                        <div className="pt-1.5 mt-1.5 border-t border-dashed flex justify-between items-center text-xs font-black">
                                            <span>NPS SCORE</span>
                                            <span className="text-[#E60012]">{npsScore}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* SVG Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" style={{ paddingLeft: 'calc(10% + 40px)', paddingRight: 'calc(10% + 40px)', paddingTop: '1rem', paddingBottom: isQuarterly ? '3rem' : '7rem' }}>
                        <NPSLine data={data} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

// Sub-component for the dashed NPS line
const NPSLine = ({ data }) => {
    if (!data || data.length < 2) return null;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const total = d.promoters + d.passives + d.detractors;
        const npsScore = total > 0 ? Math.round(((d.promoters - d.detractors) / total) * 100) : 0;
        const y = 100 - npsScore;
        return `${x}% ${y}%`;
    }).join(', ');

    return (
        <polyline
            points={points}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="4,4"
            style={{ vectorEffect: 'non-scaling-stroke' }}
        />
    );
};


export default NPSReport;
