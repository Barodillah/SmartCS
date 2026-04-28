import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 border border-[#E5E5E5] hover:border-[#E60012] transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#F5F5F5] group-hover:bg-[#E60012] group-hover:text-white transition-colors flex items-center justify-center text-gray-400" style={{ clipPath: ANGULAR_CLIP }}>
                {icon}
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 bg-gray-100 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
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

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E60012] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas hari ini.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title={`Total Percakapan (${stats.unique_ip_percakapan} Unique IP)`} 
                    value={stats.total_percakapan.toLocaleString('id-ID')} 
                    icon={<MessageSquare size={18} />} 
                    trend={stats.trend_percakapan} 
                />
                <StatCard 
                    title="Semua Leads" 
                    value={stats.semua_leads.toLocaleString('id-ID')} 
                    icon={<Users size={18} />} 
                    trend={stats.trend_leads} 
                />
                <StatCard 
                    title={`Total View (${stats.total_artikel} Artikel)`} 
                    value={stats.total_view_artikel.toLocaleString('id-ID')} 
                    icon={<Eye size={18} />} 
                    trend={stats.trend_view} 
                />
                <StatCard 
                    title="Waktu Respon (DINA)" 
                    value={stats.waktu_respon} 
                    icon={<LayoutDashboard size={18} />} 
                    trend={stats.trend_respon} 
                />
            </div>

            <div className="bg-white p-12 border border-[#E5E5E5] text-center border-dashed mb-8">
                {stats.recent_activity.length > 0 ? (
                    <div className="flex flex-col items-start text-left w-full">
                        <h3 className="font-bold text-gray-900 mb-6">Aktivitas Chat 7 Hari Terakhir</h3>
                        <div className="flex items-end gap-2 w-full h-48 border-b border-l border-gray-200 p-4">
                            {stats.recent_activity.map((item, idx) => {
                                const maxCount = Math.max(...stats.recent_activity.map(d => d.count), 10);
                                const height = `${(item.count / maxCount) * 100}%`;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                        <div className="w-full bg-[#E60012]/80 hover:bg-[#E60012] transition-all rounded-t-sm" style={{ height }}></div>
                                        <span className="text-xs text-gray-400 rotate-45 transform origin-left truncate w-full text-center mt-2">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity pointer-events-none">
                                            {item.count} chat
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">Area Grafik Aktivitas (Belum Ada Data)</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
