import React, { useState, useEffect } from 'react';
import { Calendar, BarChart2, PieChart, Users, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const AnalisisBooking = () => {
    // Determine "last month" and corresponding "year"
    const today = new Date();
    let defaultMonth = today.getMonth(); // 0-indexed, so getMonth() is the previous month (1-12 scale)
    let defaultYear = today.getFullYear();

    if (defaultMonth === 0) {
        defaultMonth = 12;
        defaultYear -= 1;
    }

    const [year, setYear] = useState(defaultYear.toString());
    const [month, setMonth] = useState(defaultMonth.toString().padStart(2, '0'));
    const [data, setData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [heatmapFilter, setHeatmapFilter] = useState('WALK IN');
    const [heatmapLoading, setHeatmapLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [capacityData, setCapacityData] = useState([]);
    const [capacityLoading, setCapacityLoading] = useState(false);
    const [arpu, setArpu] = useState(() => {
        const stored = localStorage.getItem('arpu_value');
        return stored ? parseInt(stored) : 1600000;
    });

    const [targetUnitEntry, setTargetUnitEntry] = useState(() => {
        const stored = localStorage.getItem('target_unit_entry');
        return stored ? parseInt(stored) : 783;
    });

    const handleTargetChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
            setTargetUnitEntry(parseInt(val));
            localStorage.setItem('target_unit_entry', val);
        } else {
            setTargetUnitEntry(0);
            localStorage.setItem('target_unit_entry', 0);
        }
    };

    const [summary, setSummary] = useState({
        totalBooking: 0,
        totalDatang: 0,
        totalWalkIn: 0,
        totalCancel: 0,
        rasioWalkIn: 0,
        rasioKehadiranTotal: 0,
        totalBookingMasuk: 0,
        totalUnitEntry: 0
    });

    const years = Array.from(new Array(5), (val, index) => today.getFullYear() - index);
    const months = [
        { value: '', label: 'Semua Bulan (Tahunan)' },
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    useEffect(() => {
        fetchData();
        fetchCapacityData();
    }, [year, month]);

    useEffect(() => {
        fetchHeatmapData();
    }, [year, month, heatmapFilter]);

    const fetchHeatmapData = async () => {
        setHeatmapLoading(true);
        try {
            let url = `https://csdwindo.com/api/panel/analisis_booking.php?tahun=${year}&action=heatmap&type=${heatmapFilter}`;
            if (month) {
                url += `&bulan=${month}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            if (json.status) {
                setHeatmapData(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch heatmap data", err);
        } finally {
            setHeatmapLoading(false);
        }
    };

    const fetchCapacityData = async () => {
        setCapacityLoading(true);
        try {
            let url = `https://csdwindo.com/api/panel/analisis_booking.php?tahun=${year}&action=capacity`;
            if (month) {
                url += `&bulan=${month}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            if (json.status) {
                setCapacityData(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch capacity data", err);
        } finally {
            setCapacityLoading(false);
        }
    };

    const handleArpuChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
            setArpu(parseInt(val));
            localStorage.setItem('arpu_value', val);
        } else {
            setArpu(0);
            localStorage.setItem('arpu_value', 0);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `https://csdwindo.com/api/panel/analisis_booking.php?tahun=${year}`;
            if (month) {
                url += `&bulan=${month}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            if (json.status) {
                setData(json.data);
                calculateSummary(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch analytics data", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (fetchedData) => {
        let tb = 0, td = 0, tw = 0, tc = 0;
        fetchedData.forEach(item => {
            tb += item.booking;
            td += item.datang;
            tw += item.walk_in;
            tc += item.cancel;
        });

        const totalBookingMasuk = td + tb + tc;
        const rDatang = totalBookingMasuk > 0 ? ((td / totalBookingMasuk) * 100).toFixed(1) : 0;
        const rBooking = totalBookingMasuk > 0 ? ((tb / totalBookingMasuk) * 100).toFixed(1) : 0;
        const rCancel = totalBookingMasuk > 0 ? ((tc / totalBookingMasuk) * 100).toFixed(1) : 0;

        // Ratio Walk In compared to total unit entry (Datang + Walk In)
        const totalUnitEntry = td + tw;
        const rWalkIn = totalUnitEntry > 0 ? ((tw / totalUnitEntry) * 100).toFixed(1) : 0;
        const rDatangEntry = totalUnitEntry > 0 ? ((td / totalUnitEntry) * 100).toFixed(1) : 0;

        setSummary({
            totalBooking: tb,
            totalDatang: td,
            totalWalkIn: tw,
            totalCancel: tc,
            rasioDatang: rDatang,
            rasioDatangEntry: rDatangEntry,
            rasioBooking: rBooking,
            rasioWalkIn: rWalkIn,
            rasioCancel: rCancel,
            totalBookingMasuk: totalBookingMasuk,
            totalUnitEntry: totalUnitEntry
        });
    };

    const todayDate = new Date();
    const isCurrentMonth = month === (todayDate.getMonth() + 1).toString().padStart(2, '0') && year === todayDate.getFullYear().toString();
    
    let targetInfo = null;
    if (isCurrentMonth) {
        const currentDay = todayDate.getDate();
        const daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
        const remainingDays = daysInMonth - currentDay;

        const totalEntryNow = summary.totalUnitEntry;
        const targetDeficit = Math.max(0, targetUnitEntry - totalEntryNow);
        const targetPerDay = remainingDays > 0 ? Math.ceil(targetDeficit / remainingDays) : targetDeficit;

        let potensiBooking = 0;
        data.forEach(item => {
            if (item.tanggal) {
                const itemDate = new Date(item.tanggal);
                if (itemDate.getDate() > currentDay && item.booking > 0) {
                    potensiBooking += item.booking;
                }
            }
        });

        const progressPercent = targetUnitEntry > 0 ? Math.min(100, (totalEntryNow / targetUnitEntry) * 100).toFixed(1) : 0;
        const unbookedDeficit = Math.max(0, targetDeficit - potensiBooking);
        const potensiPerDay = remainingDays > 0 ? (potensiBooking / remainingDays).toFixed(1) : potensiBooking;

        targetInfo = (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm mb-8 relative overflow-hidden border border-[#E5E5E5] text-[#111111] flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#E60012]/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex-1 w-full z-10 relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-gray-500 font-display font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <Activity size={14} className="text-[#E60012]" /> Target Unit Entry Bulan Ini
                            </h3>
                            <div className="flex items-end gap-3 mt-2">
                                <span className="text-5xl font-display font-black text-[#111111] leading-none">{totalEntryNow}</span>
                                <span className="text-gray-300 font-bold mb-1 text-2xl">/</span>
                                <input 
                                    type="text" 
                                    value={targetUnitEntry}
                                    onChange={handleTargetChange}
                                    className="bg-transparent text-2xl font-display font-bold text-[#E60012] border-b border-dashed border-[#E60012] focus:border-[#111111] focus:text-[#111111] focus:outline-none w-20 text-center pb-1 transition-colors"
                                    title="Edit Target"
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 shadow-sm inline-block">
                                Sisa {remainingDays} Hari
                            </span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-4 mt-6 mb-3 overflow-hidden border border-gray-200 shadow-inner">
                        <div className="bg-gradient-to-r from-[#E60012] to-orange-500 h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className={progressPercent >= 100 ? 'text-green-600' : 'text-gray-500'}>Progress: {progressPercent}%</span>
                        <span className="text-[#E60012]">Kurang: {targetDeficit} Unit</span>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0 z-10 relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[150px] shadow-sm hover:bg-gray-100 transition-colors">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Target Harian<br/>(Sisa Hari)</span>
                        <span className="text-4xl font-display font-black text-yellow-500 my-1">{targetPerDay}</span>
                        <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Unit / Hari</span>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[160px] shadow-sm hover:bg-gray-100 transition-colors">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Potensi Booking<br/>(H+1 dst)</span>
                        <span className="text-4xl font-display font-black text-blue-500 my-1">{potensiBooking}</span>
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">{potensiPerDay} Unit / Hari</span>
                            <span className="text-[9px] text-[#E60012] font-bold mt-1">Sisa Target: {unbookedDeficit} Unit</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300 flex flex-col min-h-screen pb-10 text-[#111111]">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5] rounded-lg text-[#E60012]">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Analisis Booking</h1>
                        <p className="text-gray-500 text-sm mt-1">Laporan komprehensif performa booking service.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center bg-white p-2 border border-[#E5E5E5] rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-600">Filter:</span>
                    </div>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-gray-50 border border-[#E5E5E5] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#E60012] font-medium"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-gray-50 border border-[#E5E5E5] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#E60012] font-bold"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E60012] border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 border border-[#E5E5E5] hover:border-purple-500 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                    {summary.rasioBooking}% Rasio
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Booking Saja</h3>
                                <div className="flex items-end gap-2">
                                    <p className="font-display font-black text-3xl text-[#111111]">{summary.totalBooking}</p>
                                    <span className="text-xs font-bold text-gray-400 mb-1">Unit</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Total Booking: {summary.totalBookingMasuk}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-[#E5E5E5] hover:border-green-500 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                        <ArrowUpRight size={12} /> {summary.rasioDatang}% Booking
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                                        {summary.rasioDatangEntry}% dr Total Entry
                                    </span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Booking Datang</h3>
                                <div className="flex items-end gap-2">
                                    <p className="font-display font-black text-3xl text-green-600">{summary.totalDatang}</p>
                                    <span className="text-xs font-bold text-gray-400 mb-1">Unit</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-400 font-medium">Total Booking: {summary.totalBookingMasuk}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Total Entry: {summary.totalUnitEntry}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-[#E5E5E5] hover:border-blue-500 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                    {summary.rasioWalkIn}% dari Total Entry
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Walk In</h3>
                                <div className="flex items-end gap-2">
                                    <p className="font-display font-black text-3xl text-blue-600">{summary.totalWalkIn}</p>
                                    <span className="text-xs font-bold text-gray-400 mb-1">Unit</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Total Entry: {summary.totalUnitEntry}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-[#E5E5E5] hover:border-red-500 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                    <PieChart size={20} />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                    <ArrowDownRight size={12} /> {summary.rasioCancel}% Rasio
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Cancel / Batal</h3>
                                <div className="flex items-end gap-2">
                                    <p className="font-display font-black text-3xl text-red-600">{summary.totalCancel}</p>
                                    <span className="text-xs font-bold text-gray-400 mb-1">Unit</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Total Booking: {summary.totalBookingMasuk}</p>
                            </div>
                        </div>
                    </div>

                    {/* Target Infographic */}
                    {targetInfo}

                    {/* Chart Section */}
                    <div className="bg-white p-8 border border-[#E5E5E5] rounded-xl shadow-sm mb-8">
                        <div className="flex flex-col items-start text-left w-full">
                            <div className="flex justify-between items-center w-full mb-8">
                                <div>
                                    <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm">Grafik Trend Layanan</h3>
                                    <p className="text-xs text-gray-400 mt-1">Distribusi status berdasarkan {month ? 'hari' : 'bulan'}</p>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div>BOOKING</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>DATANG</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div>WALK IN</div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>CANCEL</div>
                                </div>
                            </div>

                            {data.length > 0 ? (
                                <div className="flex items-end gap-0.5 sm:gap-1 w-full h-72 border-b border-l border-gray-200 p-4 pt-8">
                                    {data.map((item, idx) => {
                                        const maxCount = Math.max(...data.map(d => d.total), 10);
                                        const bookingHeight = `${(item.booking / maxCount) * 100}%`;
                                        const datangHeight = `${(item.datang / maxCount) * 100}%`;
                                        const walkinHeight = `${(item.walk_in / maxCount) * 100}%`;
                                        const cancelHeight = `${(item.cancel / maxCount) * 100}%`;

                                        let label = '';
                                        let shortLabel = '';
                                        const dateObj = new Date(item.tanggal);
                                        if (month) {
                                            label = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                                            shortLabel = dateObj.toLocaleDateString('id-ID', { day: 'numeric' });
                                        } else {
                                            label = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                                            shortLabel = dateObj.toLocaleDateString('id-ID', { month: 'short' });
                                        }

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                                <div className="w-full max-w-[12px] sm:max-w-[24px] flex flex-col justify-end h-full group-hover:opacity-80 transition-opacity mx-auto">
                                                    {item.cancel > 0 && <div className="w-full bg-red-500 rounded-t-sm mb-px" style={{ height: cancelHeight }}></div>}
                                                    {item.walk_in > 0 && <div className="w-full bg-blue-500 rounded-t-sm mb-px" style={{ height: walkinHeight }}></div>}
                                                    {item.datang > 0 && <div className="w-full bg-green-500 rounded-t-sm mb-px" style={{ height: datangHeight }}></div>}
                                                    {item.booking > 0 && <div className="w-full bg-purple-500 rounded-t-sm" style={{ height: bookingHeight }}></div>}
                                                </div>
                                                <span className="text-[10px] text-gray-400 w-full text-center mt-2 font-bold">
                                                    {shortLabel}
                                                </span>
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg transition-opacity pointer-events-none z-10 shadow-xl border border-gray-700 w-max min-w-[130px]">
                                                    <div className="font-bold mb-1.5 border-b border-gray-700 pb-1.5 text-center text-gray-300">{label}</div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center gap-4"><span className="text-purple-400 font-bold">Booking:</span><span className="font-mono">{item.booking}</span></div>
                                                        <div className="flex justify-between items-center gap-4"><span className="text-green-400 font-bold">Datang:</span><span className="font-mono">{item.datang}</span></div>
                                                        <div className="flex justify-between items-center gap-4"><span className="text-blue-400 font-bold">Walk In:</span><span className="font-mono">{item.walk_in}</span></div>
                                                        <div className="flex justify-between items-center gap-4"><span className="text-red-400 font-bold">Cancel:</span><span className="font-mono">{item.cancel}</span></div>
                                                    </div>
                                                    <div className="mt-1.5 pt-1.5 border-t border-gray-700 font-bold flex justify-between items-center">
                                                        <span>Total:</span> <span className="font-mono">{item.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                                    <BarChart2 size={48} className="mb-4 text-gray-300" />
                                    <p className="font-medium text-sm">Tidak ada data untuk periode ini</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4 New Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* A. Tren Kedatangan (Area Chart) */}
                        <div className="bg-white p-8 border border-[#E5E5E5] rounded-xl shadow-sm flex flex-col">
                            <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm mb-4">Tren Kedatangan</h3>
                            <div className="h-64 relative w-full flex-1">
                                {data.length > 0 ? (() => {
                                    const maxVal = Math.max(...data.map(d => Math.max(d.datang, d.walk_in)), 10);
                                    const pointsDatang = data.map((d, i) => `${(i / (data.length - 1 || 1)) * 100},${100 - (d.datang / maxVal * 100)}`).join(' ');
                                    const pointsWalkIn = data.map((d, i) => `${(i / (data.length - 1 || 1)) * 100},${100 - (d.walk_in / maxVal * 100)}`).join(' ');
                                    
                                    return (
                                        <div className="w-full h-full relative flex flex-col">
                                            <div className="absolute inset-0 border-b border-l border-gray-200 bottom-8">
                                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                                    <polyline points={pointsDatang} fill="none" stroke="#22c55e" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                                                    <polyline points={pointsWalkIn} fill="none" stroke="#3b82f6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                                                </svg>
                                                
                                                {/* Tooltip Overlay */}
                                                <div className="absolute inset-0 flex">
                                                    {data.map((d, i) => {
                                                        let label = '';
                                                        const dateObj = new Date(d.tanggal);
                                                        if (month) {
                                                            label = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                                                        } else {
                                                            label = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                                                        }

                                                        return (
                                                            <div key={i} className="flex-1 h-full relative group cursor-pointer">
                                                                <div className="absolute inset-y-0 left-1/2 w-px bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1/2 pointer-events-none z-0"></div>
                                                                
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-max shadow-xl border border-gray-700">
                                                                    <div className="font-bold mb-1.5 border-b border-gray-700 pb-1.5 text-center text-gray-300">{label}</div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex justify-between gap-4"><span className="text-green-400 font-bold">Datang:</span><span className="font-mono">{d.datang}</span></div>
                                                                        <div className="flex justify-between gap-4"><span className="text-blue-400 font-bold">Walk In:</span><span className="font-mono">{d.walk_in}</span></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Dots on line */}
                                                                <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" style={{ bottom: `${(d.datang / maxVal) * 100}%`, marginBottom: '-4px' }}></div>
                                                                <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" style={{ bottom: `${(d.walk_in / maxVal) * 100}%`, marginBottom: '-4px' }}></div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-auto pt-2 text-[10px] text-gray-400 absolute bottom-0 w-full">
                                                <span>Awal Periode</span>
                                                <div className="flex gap-4 font-bold uppercase">
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Datang</div>
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>Walk In</div>
                                                </div>
                                                <span>Akhir Periode</span>
                                            </div>
                                        </div>
                                    );
                                })() : <div className="h-full flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">Tidak ada data</div>}
                            </div>
                        </div>

                        {/* B. Komposisi Status Kedatangan (Donut Chart) */}
                        <div className="bg-white p-8 border border-[#E5E5E5] rounded-xl shadow-sm flex flex-col">
                            <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm mb-4">Komposisi Status Kedatangan</h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-64 flex-1">
                                {(() => {
                                    const tBooking = summary.totalBooking;
                                    const tDatang = summary.totalDatang;
                                    const tWalkIn = summary.totalWalkIn;
                                    const tCancel = summary.totalCancel;
                                    const totalAll = tBooking + tDatang + tWalkIn + tCancel;

                                    if (totalAll === 0) return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">Tidak ada data</div>;

                                    const pctB = (tBooking / totalAll) * 100;
                                    const pctD = (tDatang / totalAll) * 100;
                                    const pctW = (tWalkIn / totalAll) * 100;
                                    const pctC = (tCancel / totalAll) * 100;

                                    const grad = `conic-gradient(
                                        #a855f7 0% ${pctB}%, 
                                        #22c55e ${pctB}% ${pctB + pctD}%, 
                                        #3b82f6 ${pctB + pctD}% ${pctB + pctD + pctW}%, 
                                        #ef4444 ${pctB + pctD + pctW}% 100%
                                    )`;

                                    return (
                                        <>
                                            <div className="w-40 h-40 rounded-full relative flex justify-center items-center shrink-0 shadow-inner" style={{ background: grad }}>
                                                <div className="w-24 h-24 bg-white rounded-full flex flex-col justify-center items-center shadow-sm z-10 relative">
                                                    <span className="text-2xl font-black">{totalAll}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">TOTAL</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 w-full sm:w-auto">
                                                <div className="flex items-center justify-between gap-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div><span className="font-bold text-gray-700">Booking</span></div><span className="font-mono">{pctB.toFixed(1)}%</span></div>
                                                <div className="flex items-center justify-between gap-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="font-bold text-gray-700">Datang</span></div><span className="font-mono">{pctD.toFixed(1)}%</span></div>
                                                <div className="flex items-center justify-between gap-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span className="font-bold text-gray-700">Walk In</span></div><span className="font-mono">{pctW.toFixed(1)}%</span></div>
                                                <div className="flex items-center justify-between gap-4 text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div><span className="font-bold text-gray-700">Cancel</span></div><span className="font-mono">{pctC.toFixed(1)}%</span></div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* C. Analisis Konversi Booking (Funnel Chart) */}
                        <div className="bg-white p-8 border border-[#E5E5E5] rounded-xl shadow-sm flex flex-col">
                            <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm mb-4">Analisis Konversi Booking</h3>
                            <div className="flex flex-col justify-center h-64 gap-3 flex-1">
                                {(() => {
                                    const totalMasuk = summary.totalBookingMasuk; // BOOKING + DATANG + CANCEL
                                    if (totalMasuk === 0) return <div className="h-full flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">Tidak ada data</div>;

                                    const confirmed = summary.totalDatang + summary.totalCancel; // Responded
                                    const realized = summary.totalDatang;

                                    const pctConfirmed = ((confirmed / totalMasuk) * 100).toFixed(1);
                                    const pctRealized = ((realized / totalMasuk) * 100).toFixed(1);

                                    return (
                                        <div className="w-full flex flex-col items-center gap-3">
                                            <div className="w-full bg-gray-50 rounded-sm h-[60px] flex justify-between items-center px-4 border-l-4 border-gray-400 relative group overflow-hidden">
                                                <div className="flex flex-col z-10">
                                                    <span className="text-xs font-bold text-gray-700">1. Total Booking Masuk</span>
                                                    <span className="text-[10px] text-gray-500">Semua reservasi terdaftar</span>
                                                </div>
                                                <div className="font-black text-lg text-gray-700 z-10">{totalMasuk}</div>
                                                <div className="absolute inset-0 bg-gray-200/50 w-full"></div>
                                            </div>

                                            <div className="w-[85%] bg-blue-50 rounded-sm h-[60px] flex justify-between items-center px-4 border-l-4 border-blue-400 relative group transition-all overflow-hidden">
                                                <div className="flex flex-col z-10">
                                                    <span className="text-xs font-bold text-blue-800">2. Confirmed / Merespon</span>
                                                    <span className="text-[10px] text-blue-500">Datang atau konfirmasi batal</span>
                                                </div>
                                                <div className="flex items-center gap-3 z-10">
                                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{pctConfirmed}%</span>
                                                    <span className="font-black text-lg text-blue-700">{confirmed}</span>
                                                </div>
                                                <div className="absolute inset-y-0 left-0 bg-blue-200/30" style={{ width: `${pctConfirmed}%` }}></div>
                                            </div>

                                            <div className="w-[70%] bg-green-50 rounded-sm h-[60px] flex justify-between items-center px-4 border-l-4 border-green-500 relative group transition-all overflow-hidden">
                                                <div className="flex flex-col z-10">
                                                    <span className="text-xs font-bold text-green-800">3. Realized / Datang</span>
                                                    <span className="text-[10px] text-green-500">Pelanggan benar-benar datang</span>
                                                </div>
                                                <div className="flex items-center gap-3 z-10">
                                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">{pctRealized}%</span>
                                                    <span className="font-black text-lg text-green-700">{realized}</span>
                                                </div>
                                                <div className="absolute inset-y-0 left-0 bg-green-200/30" style={{ width: `${(realized / confirmed * 100) || 0}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* D. Heatmap Waktu Kedatangan */}
                        <div className="bg-white p-8 border border-[#E5E5E5] rounded-xl shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm mb-1">Heatmap Waktu Kedatangan</h3>
                                    <p className="text-xs text-gray-400">Konsentrasi jam kedatangan {heatmapFilter} (08:00 - 17:00)</p>
                                </div>
                                <div className="flex items-center bg-gray-100 p-1 rounded-lg shrink-0 ml-4">
                                    <button 
                                        onClick={() => setHeatmapFilter('WALK IN')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${heatmapFilter === 'WALK IN' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        WALK IN
                                    </button>
                                    <button 
                                        onClick={() => setHeatmapFilter('BOOKING')}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${heatmapFilter === 'BOOKING' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        BOOKING
                                    </button>
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1 relative">
                                {heatmapLoading && (
                                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-transparent"></div>
                                    </div>
                                )}
                                {(() => {
                                    if (heatmapData.length === 0 && !heatmapLoading) {
                                        return <div className="h-48 flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg w-full">Tidak ada data {heatmapFilter} untuk heatmap</div>;
                                    }

                                    const days = [
                                        {id: 2, label: 'Senin'},
                                        {id: 3, label: 'Selasa'},
                                        {id: 4, label: 'Rabu'},
                                        {id: 5, label: 'Kamis'},
                                        {id: 6, label: 'Jumat'},
                                        {id: 7, label: 'Sabtu'},
                                        {id: 1, label: 'Minggu'},
                                    ];
                                    const hours = ['08','09','10','11','12','13','14','15','16','17'];
                                    
                                    const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

                                    return (
                                        <div className="min-w-[450px]">
                                            <div className="flex border-b border-gray-100 pb-2 mb-2">
                                                <div className="w-16 shrink-0"></div>
                                                {hours.map(h => (
                                                    <div key={h} className="flex-1 text-center text-[10px] font-bold text-gray-400">{h}</div>
                                                ))}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {days.map(day => (
                                                    <div key={day.id} className="flex items-center gap-1 h-7">
                                                        <div className="w-16 shrink-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{day.label}</div>
                                                        {hours.map(hour => {
                                                            const slot = heatmapData.find(d => d.day === day.id && d.hour === hour);
                                                            const count = slot ? slot.count : 0;
                                                            const intensity = count === 0 ? 0 : Math.max(0.15, count / maxCount);
                                                            
                                                            const baseColor = heatmapFilter === 'BOOKING' ? '168, 85, 247' : '239, 68, 68'; // purple vs red
                                                            const textColor = heatmapFilter === 'BOOKING' ? '#7e22ce' : '#b91c1c';

                                                            return (
                                                                <div 
                                                                    key={`${day.id}-${hour}`} 
                                                                    className={`flex-1 h-full rounded-sm flex items-center justify-center text-[10px] font-bold transition-all hover:ring-1 ${heatmapFilter === 'BOOKING' ? 'hover:ring-purple-400' : 'hover:ring-red-400'} relative group cursor-pointer`}
                                                                    style={{ 
                                                                        backgroundColor: count > 0 ? `rgba(${baseColor}, ${intensity})` : '#f9fafb',
                                                                        color: intensity > 0.5 ? 'white' : (count > 0 ? textColor : '#d1d5db')
                                                                    }}
                                                                >
                                                                    {count > 0 ? count : '-'}
                                                                    {count > 0 && (
                                                                        <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap shadow-md">
                                                                            {day.label}, {hour}:00 - {count} {heatmapFilter}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Capacity & Utilization Card */}
                    <div className="bg-white border border-[#E5E5E5] rounded-none md:rounded-sm mt-6">
                        <div className="p-4 md:p-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="text-[#E60012]" size={18} />
                                    Service Capacity & Utilization
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Kapasitas statis 8 slot per jam. Overload: {'>'}8, Low Demand: {'<'}5
                                </p>
                            </div>
                            <div className="flex flex-col md:items-end gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ARPU (Avg Revenue/Unit)</label>
                                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded w-fit md:w-auto">
                                    <span className="text-xs font-bold text-gray-500">Rp</span>
                                    <input 
                                        type="text" 
                                        value={arpu.toLocaleString('id-ID')} 
                                        onChange={handleArpuChange}
                                        className="bg-transparent border-none text-xs font-bold text-[#111111] w-24 outline-none text-right"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-6">
                            {capacityLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E60012] border-t-transparent"></div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-wrap lg:flex-nowrap gap-6 items-start">
                                        <div className="w-full lg:w-3/4 overflow-x-auto pb-4">
                                            <div className="min-w-[450px] relative h-64 flex items-end justify-between border-l border-b border-gray-200 pt-10 px-4">
                                                {/* Threshold Line at 8 */}
                                                <div className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 z-0" style={{ bottom: '80%' }}>
                                                    <span className="absolute -left-6 -top-3 text-[10px] font-bold text-gray-500 bg-white pr-1">8</span>
                                                </div>
                                                <div className="absolute left-0 right-0 border-t border-gray-100 z-0" style={{ bottom: '50%' }}>
                                                    <span className="absolute -left-6 -top-3 text-[10px] font-bold text-gray-400 bg-white pr-1">5</span>
                                                </div>
                                                <div className="absolute left-0 right-0 border-t border-gray-100 z-0" style={{ bottom: '100%' }}>
                                                    <span className="absolute -left-6 -top-3 text-[10px] font-bold text-gray-400 bg-white pr-1">10</span>
                                                </div>

                                                {capacityData.map((d, i) => {
                                                    const datangH = Math.min((d.datang / 10) * 100, 100);
                                                    const walkInH = Math.min((d.walk_in / 10) * 100, 100 - datangH);
                                                    const bookingH = Math.min((d.booking / 10) * 100, 100);
                                                    const totalUtil = d.datang + d.walk_in;
                                                    const isOverload = totalUtil > 8;
                                                    const isLowDemand = totalUtil < 5;
                                                    
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative z-10 group cursor-pointer px-1">
                                                            <div className="w-full max-w-[40px] flex flex-col justify-end h-full relative">
                                                                {/* Ghost bar for Booking (No Show) */}
                                                                {d.booking > 0 && (
                                                                    <div className="w-full absolute bottom-0 border-2 border-dashed border-gray-400 rounded-t-sm" style={{ height: `${bookingH}%`, zIndex: 5 }}></div>
                                                                )}
                                                                
                                                                {/* Walk In Top Bar */}
                                                                {d.walk_in > 0 && (
                                                                    <div className="w-full bg-[#3B82F6] rounded-t-sm mb-[1px] relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" style={{ height: `${walkInH}%` }}></div>
                                                                )}
                                                                {/* Datang Bottom Bar */}
                                                                {d.datang > 0 && (
                                                                    <div className="w-full bg-[#10B981] rounded-t-sm relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" style={{ height: `${datangH}%` }}></div>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-bold mt-2 ${isOverload ? 'text-red-500' : isLowDemand ? 'text-amber-500' : 'text-gray-500'}`}>{d.hour}:00</span>

                                                            {/* Tooltip */}
                                                            <div className={`absolute top-0 mt-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg transition-opacity pointer-events-none z-[9999] shadow-xl border border-gray-700 w-max min-w-[160px] ${i === 0 ? 'left-0' : i === capacityData.length - 1 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                                                                <div className="font-bold mb-1.5 border-b border-gray-700 pb-1.5 text-center text-gray-300">Jam {d.hour}:00</div>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex justify-between items-center gap-4"><span className="text-green-400 font-bold">Datang:</span><span className="font-mono">{d.datang}</span></div>
                                                                    <div className="flex justify-between items-center gap-4"><span className="text-blue-400 font-bold">Walk In:</span><span className="font-mono">{d.walk_in}</span></div>
                                                                    <div className="flex justify-between items-center gap-4 pt-1 mt-1 border-t border-gray-700"><span className="text-gray-300 font-bold">Booking No-Show:</span><span className="font-mono text-gray-400">{d.booking}</span></div>
                                                                </div>
                                                                {isOverload && <div className="mt-2 text-[10px] text-red-400 font-bold text-center bg-red-400/10 py-1 rounded">⚠️ OVERLOAD</div>}
                                                                {isLowDemand && <div className="mt-2 text-[10px] text-amber-400 font-bold text-center bg-amber-400/10 py-1 rounded">📉 LOW DEMAND</div>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Legend */}
                                            <div className="flex flex-wrap justify-center gap-6 mt-8">
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#10B981] rounded-sm"></div><span className="text-xs font-bold text-gray-600">Datang</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div><span className="text-xs font-bold text-gray-600">Walk In</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-dashed border-gray-400 rounded-sm"></div><span className="text-xs font-bold text-gray-600">Booking (No-Show)</span></div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-1/4 flex flex-col gap-3">
                                            {(() => {
                                                let totalNoShow = 0;
                                                let overloadedHours = [];
                                                let lowDemandHours = [];
                                                
                                                capacityData.forEach(d => {
                                                    totalNoShow += d.booking;
                                                    const util = d.datang + d.walk_in;
                                                    if (util > 8) overloadedHours.push(d.hour);
                                                    if (util < 5) lowDemandHours.push(d.hour);
                                                });
                                                
                                                const revLost = totalNoShow * arpu;

                                                return (
                                                    <>
                                                        <div className="bg-red-50 border border-red-100 p-3 rounded-sm">
                                                            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Potential Revenue Lost</div>
                                                            <div className="text-base font-black text-red-700 tracking-tight">Rp {revLost.toLocaleString('id-ID')}</div>
                                                            <p className="text-[9px] text-red-600 mt-1 leading-relaxed">
                                                                Berdasarkan rata-rata <b>{totalNoShow.toFixed(1)} slot</b> yang terbuang.
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm">
                                                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 border-b border-gray-200 pb-1">Actionable Insight</div>
                                                            <ul className="text-[9px] text-gray-600 space-y-1.5 mt-2">
                                                                <li className="flex items-start gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0"></div>
                                                                    <span>
                                                                        {overloadedHours.length > 0 ? 
                                                                            `Batas Walk-in di jam ${overloadedHours.join(', ')} karena telah melewati batas ideal mekanik.` : 
                                                                            `Tidak ada jam yang overload, kapasitas mekanik memadai.`}
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-start gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                                                                    <span>
                                                                        {lowDemandHours.length > 0 ? 
                                                                            `Tawarkan jadwal booking di jam ${lowDemandHours.join(', ')} untuk mengisi kekosongan.` : 
                                                                            `Distribusi kedatangan pelanggan sangat baik.`}
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-start gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                                                    <span>Follow-up segera booking yang tidak hadir untuk memulihkan potensi lost revenue.</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalisisBooking;
