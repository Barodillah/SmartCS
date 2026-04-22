import React from 'react';
import { LayoutDashboard, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 border border-[#E5E5E5] hover:border-[#E60012] transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#F5F5F5] group-hover:bg-[#E60012] group-hover:text-white transition-colors flex items-center justify-center text-gray-400" style={{ clipPath: ANGULAR_CLIP }}>
                {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 bg-gray-100 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
            </span>
        </div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="font-display font-bold text-2xl text-[#111111]">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas hari ini.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Percakapan" value="1,284" icon={<MessageSquare size={18} />} trend="+12%" />
                <StatCard title="Booking Service" value="45" icon={<TrendingUp size={18} />} trend="+5%" />
                <StatCard title="Prospek Masuk" value="28" icon={<Users size={18} />} trend="+18%" />
                <StatCard title="Waktu Respon (DINA)" value="1.2s" icon={<LayoutDashboard size={18} />} trend="-0.4s" />
            </div>

            <div className="bg-white p-12 border border-[#E5E5E5] text-center border-dashed">
                <p className="text-gray-400">Area Grafik Aktivitas (Under Construction)</p>
            </div>
        </div>
    );
}

export default Dashboard;
