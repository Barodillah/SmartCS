import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Activity,
    Calendar,
    Target,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Lock,
    Unlock,
    Clock,
    Users,
    Award,
    Building2,
    ChevronUp,
    ChevronDown,
    Search,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import { ANGULAR_CLIP } from '../utils/constants';

// --- Constants ---
const PIN_REQUIRED = '1066';
const SESSION_KEY = 'dwindo_monitor_auth_session';
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 Jam (3600 detik)
const AUTO_REFRESH_INTERVAL_SEC = 60;

const BRANCH_CONFIG = [
    { key: 'bintaro_pc', name: 'Bintaro PC', fullName: 'Bintaro Passenger Car', color: '#E60012', badgeBg: 'bg-red-50 text-red-700 border-red-200' },
    { key: 'bintaro_cv', name: 'Bintaro CV', fullName: 'Bintaro Commercial Vehicle', color: '#F97316', badgeBg: 'bg-orange-50 text-orange-700 border-orange-200' },
    { key: 'radin_inten', name: 'Radin Inten', fullName: 'Radin Inten (PC & CV)', color: '#2563EB', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'cakung', name: 'Cakung', fullName: 'Cakung (PC & CV)', color: '#7C3AED', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' }
];

export default function MonitorSales() {
    // --- PIN & Session State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [isPinChecking, setIsPinChecking] = useState(true);
    const [sessionRemainingMs, setSessionRemainingMs] = useState(0);

    // --- Monitoring Data State ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL_SEC);
    const [fetchError, setFetchError] = useState(null);

    // --- Clock State ---
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- UI Controls ---
    const [showRealisticTarget, setShowRealisticTarget] = useState(true);
    const [projectionScope, setProjectionScope] = useState('all'); // 'all' or branch key
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'spv'
    const [branchFilter, setBranchFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const pinInputRef = useRef(null);

    // --- 1. Check Session on Mount & Background Interval ---
    useEffect(() => {
        const verifySession = () => {
            try {
                const raw = localStorage.getItem(SESSION_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    const elapsed = Date.now() - (parsed.timestamp || 0);
                    if (parsed.pin === PIN_REQUIRED && elapsed < SESSION_DURATION_MS) {
                        setIsAuthenticated(true);
                        setSessionRemainingMs(SESSION_DURATION_MS - elapsed);
                        setIsPinChecking(false);
                        return true;
                    }
                }
            } catch (e) {
                console.error('Session verify error:', e);
            }
            setIsAuthenticated(false);
            setSessionRemainingMs(0);
            setIsPinChecking(false);
            return false;
        };

        verifySession();

        // Check validity periodically
        const sessionInterval = setInterval(() => {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    const elapsed = Date.now() - (parsed.timestamp || 0);
                    if (elapsed >= SESSION_DURATION_MS) {
                        localStorage.removeItem(SESSION_KEY);
                        setIsAuthenticated(false);
                        setSessionRemainingMs(0);
                    } else {
                        setSessionRemainingMs(SESSION_DURATION_MS - elapsed);
                    }
                } catch {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        }, 5000);

        return () => clearInterval(sessionInterval);
    }, []);

    // --- 2. Live Real-time Clock ---
    useEffect(() => {
        const clockTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockTimer);
    }, []);

    // --- 3. Data Fetching ---
    const fetchData = async () => {
        setIsRefreshing(true);
        setFetchError(null);

        let result = null;

        // Strategy 1: Local dev proxy if running on Vite dev
        if (import.meta.env.DEV) {
            try {
                const res = await fetch('/api-monitor/get_sales_data.php');
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.success) result = json;
                }
            } catch (e) {
                console.warn('Dev proxy error:', e);
            }
        }

        // Strategy 2: Direct Upstream API
        if (!result) {
            try {
                const res = await fetch('https://dwindo.co.id/2slmonitor/api/get_sales_data.php', {
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.success) result = json;
                }
            } catch (e) {
                console.warn('Direct fetch error:', e);
            }
        }

        // Strategy 3: Server backend proxy (csdwindo.com/api/monitor/sales.php)
        if (!result) {
            try {
                const res = await fetch('https://csdwindo.com/api/monitor/sales.php');
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.success) result = json;
                }
            } catch (e) {
                console.warn('Server proxy error:', e);
            }
        }

        if (result && result.success) {
            setData(result);
            setLastUpdated(new Date());
            setCountdown(AUTO_REFRESH_INTERVAL_SEC);
        } else {
            setFetchError('Gagal memuat data dari API. Silakan periksa koneksi atau klik Refresh.');
        }

        setLoading(false);
        setIsRefreshing(false);
    };

    // Auto-fetch on authentication
    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    // Countdown and Auto-Refresh Every 60s
    useEffect(() => {
        if (!isAuthenticated) return;

        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchData();
                    return AUTO_REFRESH_INTERVAL_SEC;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [isAuthenticated]);

    // Focus input on PIN screen
    useEffect(() => {
        if (!isAuthenticated && !isPinChecking) {
            setTimeout(() => pinInputRef.current?.focus(), 150);
        }
    }, [isAuthenticated, isPinChecking]);

    // Handle PIN Submission
    const handlePinSubmit = (val = pinInput) => {
        if (val === PIN_REQUIRED) {
            const sessionData = {
                pin: PIN_REQUIRED,
                timestamp: Date.now()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            setIsAuthenticated(true);
            setSessionRemainingMs(SESSION_DURATION_MS);
            setPinError('');
            setPinInput('');
        } else {
            setPinError('PIN salah! Silakan masukkan PIN yang valid.');
            setPinInput('');
        }
    };

    const handlePinDigit = (digit) => {
        if (pinInput.length < 4) {
            const next = pinInput + digit;
            setPinInput(next);
            setPinError('');
            if (next.length === 4) {
                handlePinSubmit(next);
            }
        }
    };

    const handlePinBackspace = () => {
        setPinInput(prev => prev.slice(0, -1));
        setPinError('');
    };

    const handlePinClear = () => {
        setPinInput('');
        setPinError('');
    };

    const handleLogout = () => {
        localStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
        setSessionRemainingMs(0);
        setPinInput('');
    };

    // Format remaining session time
    const formatRemainingSession = (ms) => {
        if (ms <= 0) return '0 menit';
        const mins = Math.floor(ms / (60 * 1000));
        return `${mins} menit tersisa`;
    };

    // --- Calculations from Actual API Data ---
    const summary = data?.summary || {};
    const targets = summary.targets || {};

    const branchStats = useMemo(() => {
        return BRANCH_CONFIG.map(b => {
            const current = summary[b.key] || 0;
            const target = targets[b.key] || 0;
            const deficit = Math.max(0, target - current);
            const pct = target > 0 ? ((current / target) * 100).toFixed(1) : 0;
            return {
                ...b,
                current,
                target,
                deficit,
                pct: Number(pct)
            };
        });
    }, [summary, targets]);

    const totalSales = useMemo(() => {
        return branchStats.reduce((acc, curr) => acc + curr.current, 0);
    }, [branchStats]);

    const totalTarget = useMemo(() => {
        return branchStats.reduce((acc, curr) => acc + curr.target, 0);
    }, [branchStats]);

    const totalDeficit = Math.max(0, totalTarget - totalSales);
    const totalProgressPct = totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : 0;

    // --- Projection Logic (exact replica from AnalisisBooking.jsx) ---
    const projectionData = useMemo(() => {
        const now = currentTime;
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const remainingDays = Math.max(0, daysInMonth - currentDay);

        let totalNow = totalSales;
        let targetUnit = totalTarget;
        let scopeName = 'Semua Cabang (Total)';

        if (projectionScope !== 'all') {
            const found = branchStats.find(b => b.key === projectionScope);
            if (found) {
                totalNow = found.current;
                targetUnit = found.target;
                scopeName = found.fullName;
            }
        }

        const targetDeficit = Math.max(0, targetUnit - totalNow);
        const targetPerDay = remainingDays > 0 ? Math.ceil(targetDeficit / remainingDays) : targetDeficit;
        const avgPerDayNow = currentDay > 0 ? (totalNow / currentDay).toFixed(1) : 0;
        const estimatedRemaining = Math.round(Number(avgPerDayNow) * remainingDays);
        const estimatedTotal = totalNow + estimatedRemaining;
        const realisticProgress = targetUnit > 0 ? Math.min(100, (estimatedTotal / targetUnit) * 100).toFixed(1) : 0;

        // Pacing & Action
        const idealPacingPerDay = targetUnit / daysInMonth;
        const targetSampaiHariIni = Math.round(idealPacingPerDay * currentDay);
        const statusPacing = totalNow - targetSampaiHariIni;
        const requiredIncreasePct = Number(avgPerDayNow) > 0 ? (((targetPerDay - Number(avgPerDayNow)) / Number(avgPerDayNow)) * 100).toFixed(1) : 0;

        return {
            scopeName,
            currentDay,
            daysInMonth,
            remainingDays,
            totalNow,
            targetUnit,
            targetDeficit,
            targetPerDay,
            avgPerDayNow,
            estimatedRemaining,
            estimatedTotal,
            realisticProgress,
            targetSampaiHariIni,
            statusPacing,
            requiredIncreasePct
        };
    }, [currentTime, totalSales, totalTarget, projectionScope, branchStats]);

    // --- Flattened & Filtered Sales List ---
    const salesList = useMemo(() => {
        if (!data?.sales) return [];
        let list = [];
        BRANCH_CONFIG.forEach(b => {
            const branchSales = data.sales[b.key] || [];
            branchSales.forEach(s => {
                list.push({
                    nama: s.nama_sales,
                    tim: s.tim,
                    total: s.total || 0,
                    branchKey: b.key,
                    branchName: b.name
                });
            });
        });

        // Filter by branch
        if (branchFilter !== 'all') {
            list = list.filter(s => s.branchKey === branchFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s => s.nama.toLowerCase().includes(q) || (s.tim && s.tim.toLowerCase().includes(q)));
        }

        // Sort descending by total
        return list.sort((a, b) => b.total - a.total);
    }, [data, branchFilter, searchQuery]);

    // --- Flattened & Filtered SPV List ---
    const spvList = useMemo(() => {
        if (!data?.spv) return [];
        let list = [];
        BRANCH_CONFIG.forEach(b => {
            const branchSpv = data.spv[b.key] || [];
            branchSpv.forEach(s => {
                list.push({
                    nama: s.nama_spv,
                    total: s.total || 0,
                    branchKey: b.key,
                    branchName: b.name
                });
            });
        });

        // Filter by branch
        if (branchFilter !== 'all') {
            list = list.filter(s => s.branchKey === branchFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s => s.nama.toLowerCase().includes(q));
        }

        // Sort descending by total
        return list.sort((a, b) => b.total - a.total);
    }, [data, branchFilter, searchQuery]);

    // --- Formatted Time String ---
    const formattedClock = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }) + ' WIB';

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // -------------------------------------------------------------
    // RENDER: PIN LOCK SCREEN
    // -------------------------------------------------------------
    if (isPinChecking) {
        return (
            <div className="min-h-screen bg-[#111111] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-gray-700 border-t-[#E60012] rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div
                className="min-h-screen bg-[#0E0E0E] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-['MMC_Office']"
                style={{ fontFamily: '"MMC Office", sans-serif' }}
            >
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E60012]/15 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full max-w-sm bg-[#161616] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-14 h-14 bg-[#E60012] flex items-center justify-center mb-4 shadow-lg shadow-[#E60012]/30" style={{ clipPath: ANGULAR_CLIP }}>
                            <Lock size={26} className="text-white" />
                        </div>
                        <h2 className="font-display font-black text-xl tracking-wider uppercase text-white" style={{ fontFamily: '"MMC", sans-serif' }}>
                            Sales Monitoring
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">PT Dwindo Berlian Samjaya</p>
                        <span className="text-[10px] text-gray-500 font-medium mt-1">Masukkan 4 digit PIN untuk membuka monitor</span>
                    </div>

                    {/* PIN Dots Indicator */}
                    <div className="flex justify-center items-center gap-4 my-4">
                        {[0, 1, 2, 3].map((idx) => {
                            const isFilled = pinInput.length > idx;
                            return (
                                <div
                                    key={idx}
                                    className={`w-4 h-4 rounded-full transition-all duration-200 ${isFilled
                                        ? 'bg-[#E60012] scale-110 shadow-md shadow-[#E60012]/50'
                                        : 'bg-gray-800 border border-gray-700'
                                        }`}
                                />
                            );
                        })}
                    </div>

                    {/* Error Feedback */}
                    {pinError && (
                        <div className="mb-4 text-center text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg p-2.5 flex items-center justify-center gap-1.5 animate-shake">
                            <AlertTriangle size={14} className="text-red-400 shrink-0" />
                            <span>{pinError}</span>
                        </div>
                    )}

                    {/* Hidden Form Input for physical keyboard */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handlePinSubmit();
                        }}
                        className="mb-4"
                    >
                        <input
                            ref={pinInputRef}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={pinInput}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setPinInput(val);
                                setPinError('');
                                if (val.length === 4) {
                                    handlePinSubmit(val);
                                }
                            }}
                            className="opacity-0 w-0 h-0 absolute -z-10"
                            autoComplete="off"
                        />
                    </form>

                    {/* Touch / Screen Keypad with MMC Font */}
                    <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                            <button
                                key={digit}
                                type="button"
                                onClick={() => handlePinDigit(digit)}
                                className="h-13 bg-[#202020] hover:bg-[#2A2A2A] active:bg-[#E60012] active:text-white text-gray-200 text-2xl font-display font-black rounded-xl transition-all border border-gray-800/80 shadow-sm flex items-center justify-center"
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                {digit}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handlePinClear}
                            className="h-13 bg-[#1C1C1C] hover:bg-[#252525] text-gray-400 text-xs font-display font-bold uppercase rounded-xl transition-all border border-gray-800/80 flex items-center justify-center"
                            style={{ fontFamily: '"MMC", sans-serif' }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePinDigit('0')}
                            className="h-13 bg-[#202020] hover:bg-[#2A2A2A] active:bg-[#E60012] active:text-white text-gray-200 text-2xl font-display font-black rounded-xl transition-all border border-gray-800/80 shadow-sm flex items-center justify-center"
                            style={{ fontFamily: '"MMC", sans-serif' }}
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={handlePinBackspace}
                            className="h-13 bg-[#1C1C1C] hover:bg-[#252525] text-gray-400 text-xs font-display font-bold uppercase rounded-xl transition-all border border-gray-800/80 flex items-center justify-center"
                            style={{ fontFamily: '"MMC", sans-serif' }}
                        >
                            ⌫
                        </button>
                    </div>

                    <div className="mt-6 text-center text-[11px] text-gray-500 font-['MMC_Office']">
                        Session aktif selama <strong className="text-gray-300 font-bold">1 jam</strong> setelah PIN diverifikasi.
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // RENDER: MAIN MONITOR DASHBOARD
    // -------------------------------------------------------------
    return (
        <div
            className="min-h-screen bg-[#F4F5F7] text-[#111111] flex flex-col antialiased font-['MMC_Office']"
            style={{ fontFamily: '"MMC Office", sans-serif' }}
        >
            {/* Top Navigation Bar */}
            <header className="bg-[#111111] text-white sticky top-0 z-40 border-b border-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    {/* Brand & Title */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 bg-[#E60012] flex items-center justify-center shadow-md shadow-[#E60012]/40" style={{ clipPath: ANGULAR_CLIP }}>
                            <BarChart3 size={18} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display font-black text-sm sm:text-base tracking-wider uppercase text-white" style={{ fontFamily: '"MMC", sans-serif' }}>
                                    Sales Monitoring
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-display font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" style={{ fontFamily: '"MMC", sans-serif' }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    LIVE
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">PT Dwindo Berlian Samjaya • Dealer Resmi Mitsubishi</p>
                        </div>
                    </div>

                    {/* Real-time Clock & Auto-refresh Controls */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {/* Live Clock with MMC Font */}
                        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl px-3.5 py-1.5 text-right flex flex-col justify-center">
                            <span className="text-[15px] sm:text-[17px] font-display font-black text-emerald-400 tracking-wider leading-tight" style={{ fontFamily: '"MMC", sans-serif' }}>
                                {formattedClock}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium font-['MMC_Office']">
                                {formattedDate}
                            </span>
                        </div>

                        {/* Auto-Refresh Badge & Manual Refresh */}
                        <div className="flex items-center gap-2 bg-[#1E1E1E] border border-gray-800 rounded-xl p-1.5">
                            <button
                                onClick={fetchData}
                                disabled={isRefreshing}
                                title="Refresh data sekarang"
                                className="px-3 py-1.5 bg-[#E60012] hover:bg-[#B5000F] active:scale-95 text-white rounded-lg text-xs font-display font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                                <span>{isRefreshing ? 'Sinkron...' : 'Refresh'}</span>
                            </button>
                            <div className="text-[10px] text-gray-300 font-display font-bold px-2 py-1" style={{ fontFamily: '"MMC", sans-serif' }}>
                                Auto: <strong className="text-white">{countdown}s</strong>
                            </div>
                        </div>

                        {/* Session & Logout Button */}
                        <button
                            onClick={handleLogout}
                            title="Kunci dashboard / Selesai sesi"
                            className="bg-[#242424] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 px-3 py-2 rounded-xl text-[11px] font-display font-bold flex items-center gap-1.5 transition-colors"
                            style={{ fontFamily: '"MMC", sans-serif' }}
                        >
                            <Lock size={13} className="text-[#E60012]" />
                            <span className="hidden sm:inline">{formatRemainingSession(sessionRemainingMs)}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col gap-6">
                {/* Error Banner if any */}
                {fetchError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 text-red-800 text-xs">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-600 shrink-0" />
                            <span>{fetchError}</span>
                        </div>
                        <button
                            onClick={fetchData}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shrink-0"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Info Bar (Timestamp API) */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                    <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#E60012]" />
                        <span>Timestamp Data API: <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{data?.timestamp || 'Menunggu data...'}</strong></span>
                    </div>
                    {summary.proyek_total !== undefined && summary.proyek_total > 0 && (
                        <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg font-display font-bold text-gray-700 shadow-sm" style={{ fontFamily: '"MMC", sans-serif' }}>
                            Proyek Total: <span className="text-[#E60012]">{summary.proyek_total} Unit</span>
                        </div>
                    )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. SUMMARY HERO CARDS (Cabang & Total)                        */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* TOTAL GABUNGAN CARD */}
                    <div className="bg-gradient-to-br from-[#111111] to-[#1F1F1F] text-white p-5 rounded-2xl shadow-md border border-gray-800 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none">
                            <Award size={96} />
                        </div>
                        <div>
                            <span className="text-[10px] font-display font-bold tracking-widest text-[#E60012] uppercase block mb-1" style={{ fontFamily: '"MMC", sans-serif' }}>
                                TOTAL GABUNGAN
                            </span>
                            <h3 className="text-xs text-gray-400 font-medium">Semua Cabang Dwindo</h3>
                            <div className="flex items-baseline gap-2 mt-3">
                                <span className="text-4xl font-display font-black text-white" style={{ fontFamily: '"MMC", sans-serif' }}>{totalSales}</span>
                                <span className="text-sm font-display font-bold text-gray-400" style={{ fontFamily: '"MMC", sans-serif' }}>/ {totalTarget} Target</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-2">
                                <div
                                    className="bg-gradient-to-r from-[#E60012] to-orange-500 h-full rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(100, totalProgressPct)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>
                                <span className="text-emerald-400">{totalProgressPct}% Tercapai</span>
                                <span className="text-gray-400">Kurang: {totalDeficit} Unit</span>
                            </div>
                        </div>
                    </div>

                    {/* 4 BRANCH CARDS */}
                    {branchStats.map((b) => (
                        <div
                            key={b.key}
                            className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-display font-bold tracking-widest uppercase text-gray-500" style={{ fontFamily: '"MMC", sans-serif' }}>
                                        {b.name}
                                    </span>
                                    <span className={`text-[9px] font-display font-bold px-2 py-0.5 rounded-full border ${b.badgeBg}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                        {b.pct}%
                                    </span>
                                </div>
                                <h3 className="text-xs text-gray-700 font-medium line-clamp-1">{b.fullName}</h3>
                                <div className="flex items-baseline gap-2 mt-3">
                                    <span className="text-3xl font-display font-black text-[#111111]" style={{ fontFamily: '"MMC", sans-serif' }}>{b.current}</span>
                                    <span className="text-xs font-display font-bold text-gray-400" style={{ fontFamily: '"MMC", sans-serif' }}>/ {b.target} Target</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            backgroundColor: b.color,
                                            width: `${Math.min(100, b.pct)}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-display font-bold text-gray-500" style={{ fontFamily: '"MMC", sans-serif' }}>
                                    <span>Tercapai: {b.current}</span>
                                    <span className="text-[#E60012]">Sisa: {b.deficit}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. FITUR PROYEKSI REALISTIS (Sesuai AnalisisBooking.jsx)        */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                        <button
                            onClick={() => setShowRealisticTarget(!showRealisticTarget)}
                            className="flex items-center gap-2.5 text-xs font-display font-bold text-gray-700 hover:text-blue-600 transition-colors uppercase tracking-widest self-start bg-gray-50 hover:bg-blue-50 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm"
                            style={{ fontFamily: '"MMC", sans-serif' }}
                        >
                            <Target size={16} className={showRealisticTarget ? "text-[#E60012]" : "text-gray-400"} />
                            <span>Proyeksi Realistis Akhir Bulan</span>
                            {showRealisticTarget ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Projection Scope Filter */}
                        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                            <span className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider mr-1" style={{ fontFamily: '"MMC", sans-serif' }}>Lingkup:</span>
                            <button
                                onClick={() => setProjectionScope('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${projectionScope === 'all'
                                    ? 'bg-[#111111] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                Total Gabungan
                            </button>
                            {BRANCH_CONFIG.map(b => (
                                <button
                                    key={b.key}
                                    onClick={() => setProjectionScope(b.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${projectionScope === b.key
                                        ? 'bg-[#E60012] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    style={{ fontFamily: '"MMC", sans-serif' }}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {showRealisticTarget && (
                        <div className="mt-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 fade-in">
                            <div className="text-xs text-gray-500 font-medium">
                                Menampilkan proyeksi untuk: <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.scopeName}</strong>
                            </div>

                            {/* Baris Pertama: Proyeksi Realistis Dasar (3 Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Avg per day */}
                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 text-blue-900 pointer-events-none">
                                        <Activity size={72} />
                                    </div>
                                    <span className="text-[10px] text-blue-600 font-display font-bold uppercase tracking-widest mb-2" style={{ fontFamily: '"MMC", sans-serif' }}>Rata-rata Berjalan</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-display font-black text-blue-700 leading-none" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.avgPerDayNow}</span>
                                        <span className="text-xs font-display font-bold text-blue-500 mb-1" style={{ fontFamily: '"MMC", sans-serif' }}>unit/hari</span>
                                    </div>
                                    <span className="text-[10px] text-blue-500/80 font-medium mt-3">Dari {projectionData.currentDay} hari efektif berjalan</span>
                                </div>

                                {/* Estimated Remaining */}
                                <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 text-amber-900 pointer-events-none">
                                        <Calendar size={72} />
                                    </div>
                                    <span className="text-[10px] text-amber-600 font-display font-bold uppercase tracking-widest mb-2" style={{ fontFamily: '"MMC", sans-serif' }}>Estimasi Tambahan</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-display font-black text-amber-700 leading-none" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.estimatedRemaining}</span>
                                        <span className="text-xs font-display font-bold text-amber-500 mb-1" style={{ fontFamily: '"MMC", sans-serif' }}>unit</span>
                                    </div>
                                    <span className="text-[10px] text-amber-500/80 font-medium mt-3">({projectionData.avgPerDayNow} rata-rata × {projectionData.remainingDays} sisa hari)</span>
                                </div>

                                {/* Estimated Total */}
                                <div className={`p-5 rounded-xl flex flex-col relative overflow-hidden border ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                                        <Target size={72} className={projectionData.estimatedTotal >= projectionData.targetUnit ? 'text-green-700' : 'text-red-700'} />
                                    </div>
                                    <span className={`text-[10px] font-display font-bold uppercase tracking-widest mb-2 ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                        Proyeksi Total Akhir
                                    </span>
                                    <div className="flex items-end gap-2 relative z-10">
                                        <span className={`text-4xl sm:text-5xl font-display font-black leading-none ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                            {projectionData.estimatedTotal}
                                        </span>
                                        <span className={`text-xs font-display font-bold mb-1 ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'text-green-500' : 'text-red-500'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                            / {projectionData.targetUnit} unit
                                        </span>
                                    </div>
                                    <div className="mt-4 w-full bg-white/60 rounded-full h-2 overflow-hidden shadow-inner relative z-10">
                                        <div
                                            className={`h-full rounded-full ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(100, projectionData.realisticProgress)}%` }}
                                        />
                                    </div>
                                    <div className="flex flex-col mt-3 gap-2 relative z-10">
                                        <span className={`text-[11px] font-display font-bold inline-flex items-center gap-1 ${projectionData.estimatedTotal >= projectionData.targetUnit ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                            {projectionData.estimatedTotal >= projectionData.targetUnit ? (
                                                <>✨ Target {projectionData.targetUnit} Akan Tercapai!</>
                                            ) : (
                                                <>⚠️ Beresiko Kurang {Math.max(0, projectionData.targetUnit - projectionData.estimatedTotal)} Unit dari Target ({projectionData.targetUnit})</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Baris Kedua: Pacing Harian & Required Run Rate */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Pacing Harian */}
                                <div className="border border-gray-200 bg-gray-50/70 rounded-xl p-5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-gray-500 font-display font-bold uppercase tracking-widest mb-1 block" style={{ fontFamily: '"MMC", sans-serif' }}>
                                            Status Pacing Hari Ini
                                        </span>
                                        <div className="flex items-start justify-between gap-4 mt-2">
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                                Idealnya, hingga hari ke-{projectionData.currentDay} total capaian adalah <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.targetSampaiHariIni} unit</strong>.
                                                <br />Capaian saat ini <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.totalNow} unit</strong>.
                                            </p>
                                            <div className={`px-3.5 py-1.5 rounded-lg font-display font-black text-sm shrink-0 border ${projectionData.statusPacing >= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                                {projectionData.statusPacing >= 0 ? `+${projectionData.statusPacing} Surplus` : `${projectionData.statusPacing} Defisit`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between text-[11px] font-display font-bold text-gray-500 mb-1.5" style={{ fontFamily: '"MMC", sans-serif' }}>
                                            <span>Progress Aktual ({projectionData.totalNow} unit)</span>
                                            <span>Target Ideal s/d Hari ini ({projectionData.targetSampaiHariIni} unit)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
                                            {/* Ideal marker line */}
                                            {projectionData.targetUnit > 0 && (
                                                <div
                                                    className="absolute top-0 bottom-0 w-1 bg-gray-800 z-10"
                                                    style={{ left: `${Math.min(100, (projectionData.targetSampaiHariIni / projectionData.targetUnit) * 100)}%` }}
                                                    title={`Target Ideal: ${projectionData.targetSampaiHariIni} unit`}
                                                />
                                            )}
                                            {/* Actual Bar */}
                                            <div
                                                className={`h-full transition-all duration-700 ${projectionData.statusPacing >= 0 ? 'bg-green-500' : 'bg-[#E60012]'}`}
                                                style={{ width: `${projectionData.targetUnit > 0 ? Math.min(100, (projectionData.totalNow / projectionData.targetUnit) * 100) : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Required Run Rate */}
                                <div className="border border-gray-200 bg-gray-50/70 rounded-xl p-5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] text-gray-500 font-display font-bold uppercase tracking-widest mb-1 block" style={{ fontFamily: '"MMC", sans-serif' }}>
                                            Required Run Rate (Aksi Dibutuhkan)
                                        </span>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2">
                                            Untuk mengejar sisa target <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.targetDeficit} unit</strong> di sisa <strong className="text-gray-800 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.remainingDays} hari</strong>, tim membutuhkan kinerja rata-rata minimal:
                                        </p>
                                    </div>
                                    <div className="my-3 text-center">
                                        <span className="text-4xl font-display font-black text-[#111111]" style={{ fontFamily: '"MMC", sans-serif' }}>{projectionData.targetPerDay}</span>
                                        <span className="text-[11px] font-display font-bold text-gray-500 ml-1.5" style={{ fontFamily: '"MMC", sans-serif' }}>unit / hari</span>
                                    </div>
                                    <div className={`p-3 rounded-lg text-xs font-display font-bold border flex items-center justify-center gap-2 ${projectionData.requiredIncreasePct > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`} style={{ fontFamily: '"MMC", sans-serif' }}>
                                        <Activity size={16} />
                                        {projectionData.requiredIncreasePct > 0
                                            ? `Perlu menaikkan kecepatan +${projectionData.requiredIncreasePct}% dari rata-rata saat ini.`
                                            : `Kecepatan saat ini sudah melampaui kebutuhan. Pertahankan!`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3. LEADERBOARD & DETAIL TABEL (Sales & SPV)                  */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {/* Header Controls */}
                    <div className="p-5 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Tab Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start">
                            <button
                                onClick={() => setActiveTab('sales')}
                                className={`px-4 py-2 rounded-lg text-xs font-display font-bold flex items-center gap-2 transition-all ${activeTab === 'sales'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-gray-600 hover:text-[#111111]'
                                    }`}
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                <Users size={14} className={activeTab === 'sales' ? 'text-[#E60012]' : ''} />
                                <span>Performa Sales ({salesList.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('spv')}
                                className={`px-4 py-2 rounded-lg text-xs font-display font-bold flex items-center gap-2 transition-all ${activeTab === 'spv'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-gray-600 hover:text-[#111111]'
                                    }`}
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                <Award size={14} className={activeTab === 'spv' ? 'text-[#E60012]' : ''} />
                                <span>Performa SPV ({spvList.length})</span>
                            </button>
                        </div>

                        {/* Search & Branch Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Branch filter pills */}
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-xs font-display font-bold rounded-xl px-3 py-2 text-gray-700 outline-none focus:border-[#E60012]"
                                style={{ fontFamily: '"MMC", sans-serif' }}
                            >
                                <option value="all">Semua Cabang</option>
                                {BRANCH_CONFIG.map(b => (
                                    <option key={b.key} value={b.key}>{b.fullName}</option>
                                ))}
                            </select>

                            {/* Search box */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'sales' ? 'Cari sales / tim...' : 'Cari SPV...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#E60012] w-44 sm:w-56 font-['MMC_Office']"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        {activeTab === 'sales' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 text-[11px] font-display font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{ fontFamily: '"MMC", sans-serif' }}>
                                        <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                                        <th className="py-3.5 px-4">Nama Sales</th>
                                        <th className="py-3.5 px-4">Tim / SPV</th>
                                        <th className="py-3.5 px-4">Cabang</th>
                                        <th className="py-3.5 px-4 text-right">Total Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs font-['MMC_Office']">
                                    {salesList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                                                Tidak ada data sales yang cocok.
                                            </td>
                                        </tr>
                                    ) : (
                                        salesList.map((s, idx) => (
                                            <tr key={`${s.branchKey}-${s.nama}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="py-3.5 px-4 text-center">
                                                    {idx === 0 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥇</span>
                                                    ) : idx === 1 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥈</span>
                                                    ) : idx === 2 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥉</span>
                                                    ) : (
                                                        <span className="text-gray-400 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>#{idx + 1}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-display font-bold text-gray-900" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                    {s.nama}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600 font-medium">
                                                    {s.tim || '-'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-display font-bold bg-gray-100 text-gray-700" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                        {s.branchName}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-display font-black text-base text-[#E60012]" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                    {s.total} <span className="text-[10px] font-display font-bold text-gray-400">unit</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 text-[11px] font-display font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200" style={{ fontFamily: '"MMC", sans-serif' }}>
                                        <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                                        <th className="py-3.5 px-4">Nama SPV</th>
                                        <th className="py-3.5 px-4">Cabang</th>
                                        <th className="py-3.5 px-4 text-right">Total Unit Tim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs font-['MMC_Office']">
                                    {spvList.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">
                                                Tidak ada data SPV yang cocok.
                                            </td>
                                        </tr>
                                    ) : (
                                        spvList.map((s, idx) => (
                                            <tr key={`${s.branchKey}-${s.nama}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="py-3.5 px-4 text-center">
                                                    {idx === 0 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥇</span>
                                                    ) : idx === 1 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥈</span>
                                                    ) : idx === 2 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-display font-black text-xs" style={{ fontFamily: '"MMC", sans-serif' }}>🥉</span>
                                                    ) : (
                                                        <span className="text-gray-400 font-display font-bold" style={{ fontFamily: '"MMC", sans-serif' }}>#{idx + 1}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-display font-bold text-gray-900" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                    {s.nama}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-display font-bold bg-gray-100 text-gray-700" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                        {s.branchName}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-display font-black text-base text-[#E60012]" style={{ fontFamily: '"MMC", sans-serif' }}>
                                                    {s.total} <span className="text-[10px] font-display font-bold text-gray-400">unit</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-400 font-['MMC_Office']">
                PT Dwindo Berlian Samjaya • Realtime Sales Monitor • Auto refresh 60 detik
            </footer>
        </div>
    );
}

