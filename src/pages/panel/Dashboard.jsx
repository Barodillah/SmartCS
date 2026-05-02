import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, TrendingUp, AlertTriangle, Eye, CalendarCheck, FileText, ShieldAlert, Bell } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const StatCard = ({ title, value, icon, trend, invertTrendColor = false }) => {
    let trendColor = '';
    if (trend) {
        const isPositive = trend.startsWith('+');
        trendColor = invertTrendColor ? (isPositive ? 'text-red-600' : 'text-green-600') : (isPositive ? 'text-green-600' : 'text-red-600');
    }
    return (
        <div className="bg-white p-6 border border-[#E5E5E5] hover:border-[#E60012] transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#F5F5F5] group-hover:bg-[#E60012] group-hover:text-white transition-colors flex items-center justify-center text-gray-400" style={{ clipPath: ANGULAR_CLIP }}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 bg-gray-100 ${trendColor}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <p className="font-display font-bold text-2xl text-[#111111]">{value}</p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_percakapan: 0,
        unique_ip_percakapan: 0,
        trend_percakapan: '0%',
        semua_leads: 0,
        trend_leads: '0%',
        total_view_artikel: 0,
        trend_view: '0%',
        total_artikel: 0,
        waktu_respon: '0s',
        trend_respon: '0s',
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [opsStats, setOpsStats] = useState({
        bookingBesok: 0,
        surveyPerluFU: 0,
        warrantyBelumAktif: 0,
        perluKonfirmasi: 0
    });
    const [trendBooking, setTrendBooking] = useState([]);
    const [surveyRespons, setSurveyRespons] = useState({});

    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('https://csdwindo.com/api/chat/dashboard.php');
                const json = await res.json();
                if (json.status) {
                    setStats(json.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchOpsStats = async () => {
            try {
                // 1. Booking besok
                const besok = new Date();
                besok.setDate(besok.getDate() + 1);
                const besokStr = besok.toISOString().split('T')[0];
                const bookingRes = await fetch(`https://csdwindo.com/api/panel/data_booking.php?date=${besokStr}`);
                const bookingData = await bookingRes.json();
                const bookingBesok = bookingData.status ? (bookingData.data?.length || 0) : 0;

                // 2. Survey perlu follow up
                const surveyRes = await fetch('https://csdwindo.com/api/panel/sales_survey.php?action=list&filter=belum&days=30');
                const surveyData = await surveyRes.json();
                const surveyPerluFU = surveyData.status ? (surveyData.data?.length || 0) : 0;

                // 3. Perlu konfirmasi (REQUEST + UBAH)
                const konfirmasiRes = await fetch('https://csdwindo.com/api/panel/wa_followup.php?tab=konfirmasi');
                const konfirmasiData = await konfirmasiRes.json();
                const perluKonfirmasi = konfirmasiData.status ? (konfirmasiData.data?.length || 0) : 0;

                // 4. Warranty Belum Aktif (status PDI, 30 hari terakhir)
                const pdiRes = await fetch('https://csdwindo.com/api/panel/sales_survey.php?action=list&filter=pdi&days=30');
                const pdiData = await pdiRes.json();
                const warrantyBelumAktif = pdiData.status ? (pdiData.data?.length || 0) : 0;

                setOpsStats({
                    bookingBesok,
                    surveyPerluFU,
                    perluKonfirmasi,
                    warrantyBelumAktif
                });
            } catch (err) {
                console.error('Failed to fetch ops stats', err);
            }
        };

        const fetchChartsData = async () => {
            try {
                // 1. Trend Booking (last 14 days)
                const bookingPromises = [];
                const last14Days = [];
                for (let i = 13; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    last14Days.push(dateStr);
                    bookingPromises.push(fetch(`https://csdwindo.com/api/panel/data_booking.php?date=${dateStr}`).then(res => res.json()));
                }
                const bookingResults = await Promise.all(bookingPromises);

                const trendData = last14Days.map((date, idx) => {
                    const res = bookingResults[idx];
                    let booking = 0, datang = 0, cancel = 0;
                    if (res && res.status && res.data) {
                        res.data.forEach(item => {
                            const status = (item.status || '').toUpperCase();
                            if (status === 'BOOKING') booking++;
                            if (status === 'DATANG') datang++;
                            if (status === 'CANCEL' || status === 'BATAL') cancel++;
                        });
                    }
                    return { date, booking, datang, cancel, total: booking + datang + cancel };
                });
                setTrendBooking(trendData);

                // 2. Survey Respons (last 30 days)
                const surveyRes = await fetch('https://csdwindo.com/api/panel/sales_survey.php?action=list');
                const surveyData = await surveyRes.json();

                const targetCategories = ['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN', 'SARAN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'PERJANJIAN', 'SALAH SAMBUNG'];
                const responsCounts = {};
                targetCategories.forEach(cat => responsCounts[cat] = 0);

                if (surveyData.status && surveyData.data) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    surveyData.data.forEach(item => {
                        const wDate = item.wa_date ? new Date(item.wa_date) : null;
                        if (wDate && wDate >= thirtyDaysAgo) {
                            const status = (item.status || '').toUpperCase();
                            if (responsCounts[status] !== undefined) {
                                responsCounts[status]++;
                            }
                        }
                    });
                }
                setSurveyRespons(responsCounts);
            } catch (err) {
                console.error("Failed to fetch charts data", err);
            }
        };

        fetchStats();
        fetchOpsStats();
        fetchChartsData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E60012] border-t-transparent"></div>
            </div>
        );
    }

    const r = user?.role;
    const d = user?.divisi;
    const isAdmin = r === 'admin';
    const isServiceStaff = r === 'staff' && d === 'service';
    const isSalesStaff = r === 'staff' && d === 'sales';
    const isPkl = r === 'pkl';

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas hari ini.</p>
                </div>
            </div>

            {/* Stat Cards - role-based */}
            {(() => {

                const allCards = {
                    percakapan: <StatCard key="percakapan" title={`Total Percakapan (${stats.unique_ip_percakapan} Unique IP)`} value={stats.total_percakapan.toLocaleString('id-ID')} icon={<MessageSquare size={18} />} trend={stats.trend_percakapan} />,
                    leads: <StatCard key="leads" title="Semua Leads" value={stats.semua_leads.toLocaleString('id-ID')} icon={<Users size={18} />} trend={stats.trend_leads} />,
                    views: <StatCard key="views" title={`Total View (${stats.total_artikel} Artikel)`} value={stats.total_view_artikel.toLocaleString('id-ID')} icon={<Eye size={18} />} trend={stats.trend_view} />,
                    respon: <StatCard key="respon" title="Waktu Respon (DINA)" value={stats.waktu_respon} icon={<LayoutDashboard size={18} />} trend={stats.trend_respon} invertTrendColor={true} />,
                    bookingBesok: <StatCard key="bookingBesok" title="Booking Besok" value={opsStats.bookingBesok.toLocaleString('id-ID')} icon={<CalendarCheck size={18} />} />,
                    surveyFU: <StatCard key="surveyFU" title="Survey Perlu Follow Up" value={opsStats.surveyPerluFU.toLocaleString('id-ID')} icon={<FileText size={18} />} />,
                    warranty: <StatCard key="warranty" title="Warranty Belum Aktif" value={opsStats.warrantyBelumAktif.toLocaleString('id-ID')} icon={<ShieldAlert size={18} />} />,
                    konfirmasi: <StatCard key="konfirmasi" title="Perlu Konfirmasi" value={opsStats.perluKonfirmasi.toLocaleString('id-ID')} icon={<Bell size={18} />} />,
                };

                let cards = [];
                if (isAdmin) {
                    cards = [allCards.percakapan, allCards.leads, allCards.views, allCards.respon, allCards.bookingBesok, allCards.surveyFU, allCards.warranty, allCards.konfirmasi];
                } else if (isServiceStaff) {
                    cards = [allCards.percakapan, allCards.leads, allCards.bookingBesok, allCards.konfirmasi];
                } else if (isSalesStaff) {
                    cards = [allCards.leads, allCards.bookingBesok, allCards.surveyFU, allCards.warranty];
                } else if (isPkl) {
                    cards = [allCards.bookingBesok, allCards.konfirmasi];
                } else {
                    cards = [allCards.bookingBesok, allCards.konfirmasi];
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {cards}
                    </div>
                );
            })()}

            {!isPkl && (
                <div className="space-y-8 mb-8">
                    {/* Aktivitas Chat (Hanya Admin) */}
                    {isAdmin && (
                        <div className="bg-white p-8 border border-[#E5E5E5] text-center border-dashed">
                            {stats.recent_activity.length > 0 ? (
                                <div className="flex flex-col items-start text-left w-full">
                                    <h3 className="font-bold text-[#111111] mb-6 uppercase tracking-wider text-sm">Aktivitas Chat 7 Hari Terakhir</h3>
                                    <div className="flex items-end gap-2 w-full h-48 border-b border-l border-gray-200 p-4">
                                        {stats.recent_activity.map((item, idx) => {
                                            const maxCount = Math.max(...stats.recent_activity.map(d => d.count), 10);
                                            const height = `${(item.count / maxCount) * 100}%`;
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                                    <div className="w-full bg-[#E60012]/80 hover:bg-[#E60012] transition-all rounded-t-sm" style={{ height }}></div>
                                                    <span className="text-[10px] text-gray-500 rotate-45 transform origin-left truncate w-full text-center mt-2 font-medium">
                                                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity pointer-events-none z-10 font-bold shadow-lg">
                                                        {item.count} chat
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 py-10">Data Aktivitas Chat belum tersedia</p>
                            )}
                        </div>
                    )}

                    {/* Trend Booking (Admin & Service) */}
                    {(isAdmin || isServiceStaff) && (
                        <div className="bg-white p-8 border border-[#E5E5E5]">
                            <div className="flex flex-col items-start text-left w-full">
                                <div className="flex justify-between items-center w-full mb-6">
                                    <h3 className="font-bold text-[#111111] uppercase tracking-wider text-sm">Trend Booking 14 Hari Terakhir</h3>
                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div>BOOKING</div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>DATANG</div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>CANCEL</div>
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 w-full h-56 border-b border-l border-gray-200 p-4 pt-8">
                                    {trendBooking.map((item, idx) => {
                                        const maxCount = Math.max(...trendBooking.map(d => d.total), 10);
                                        const bookingHeight = `${(item.booking / maxCount) * 100}%`;
                                        const datangHeight = `${(item.datang / maxCount) * 100}%`;
                                        const cancelHeight = `${(item.cancel / maxCount) * 100}%`;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                                <div className="w-full flex flex-col justify-end h-full group-hover:opacity-80 transition-opacity">
                                                    {item.cancel > 0 && <div className="w-full bg-red-500" style={{ height: cancelHeight }}></div>}
                                                    {item.datang > 0 && <div className="w-full bg-green-500" style={{ height: datangHeight }}></div>}
                                                    {item.booking > 0 && <div className="w-full bg-purple-500" style={{ height: bookingHeight }}></div>}
                                                </div>
                                                <span className="text-[10px] text-gray-500 rotate-45 transform origin-left truncate w-full text-center mt-2 font-medium">
                                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-3 py-2 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                                                    <div className="font-bold mb-1 border-b border-gray-700 pb-1">{item.date}</div>
                                                    <div className="text-purple-400">Booking: {item.booking}</div>
                                                    <div className="text-green-400">Datang: {item.datang}</div>
                                                    <div className="text-red-400">Cancel: {item.cancel}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Survey Respons (Admin & Sales) */}
                    {(isAdmin || isSalesStaff) && (
                        <div className="bg-white p-8 border border-[#E5E5E5]">
                            <div className="flex flex-col items-start text-left w-full">
                                <h3 className="font-bold text-[#111111] mb-6 uppercase tracking-wider text-sm">Respons Sales Survey 30 Hari Terakhir</h3>
                                <div className="flex items-end gap-3 w-full h-56 border-b border-l border-gray-200 p-4 pt-8">
                                    {Object.entries(surveyRespons).map(([cat, count], idx) => {
                                        const maxCount = Math.max(...Object.values(surveyRespons), 10);
                                        const height = `${(count / maxCount) * 100}%`;
                                        const isPositive = ['PUAS'].includes(cat);
                                        const isOrange = cat === 'BIASA SAJA';
                                        const isNeutral = ['SARAN', 'PERJANJIAN'].includes(cat);
                                        const barColor = isPositive ? 'bg-green-500' : isOrange ? 'bg-orange-500' : isNeutral ? 'bg-blue-500' : 'bg-red-500';

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                                <div className={`w-full ${barColor} opacity-90 hover:opacity-100 transition-opacity rounded-t-sm`} style={{ height }}></div>
                                                <span className="text-[9px] font-bold text-gray-500 -rotate-45 transform origin-top-left w-full text-right mt-6 pr-2 whitespace-nowrap">
                                                    {cat}
                                                </span>
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-3 py-2 rounded transition-opacity pointer-events-none z-10 font-bold shadow-lg whitespace-nowrap">
                                                    <span className="text-gray-300 mr-1">{cat}</span> {count} data
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
