import React from 'react';
import { CarFront, Users as UsersIcon, AlertTriangle, Wrench, UserCog, BookOpen } from 'lucide-react';

const GenericPage = ({ title, desc, icon }) => (
    <div className="animate-in fade-in duration-300">
        <div className="mb-6">
            <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide">{title}</h1>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
        </div>
        
        <div className="bg-white p-12 border border-[#E5E5E5] text-center border-dashed">
            <div className="mx-auto text-gray-300 mb-4 flex justify-center">{icon}</div>
            <p className="text-gray-400">Data tabel {title} akan tampil di sini.</p>
        </div>
    </div>
);

export const TestDrive = () => <GenericPage title="Test Drive" desc="Kelola permohonan penjadwalan test drive kendaraan." icon={<CarFront size={32} />} />;
export const Prospect = () => <GenericPage title="Prospect Leads" desc="Data potensi prospek pembelian kendaraan dari chatbot." icon={<UsersIcon size={32} />} />;
export const Emergency = () => <GenericPage title="Emergency Center" desc="Daftar laporan layanan darurat (Mogok / Kecelakaan)." icon={<AlertTriangle size={32} />} />;
export const Sparepart = () => <GenericPage title="Sparepart Requests" desc="Permintaan ketersediaan dan harga suku cadang." icon={<Wrench size={32} />} />;
export const Users = () => <GenericPage title="CS & Admin Users" desc="Kelola role dan user yang bisa mengakses dashboard ini." icon={<UserCog size={32} />} />;
export const KnowledgeHub = ({ title }) => <GenericPage title={`Knowledge: ${title}`} desc={`Kelola data base pengetahuan AI untuk ${title}.`} icon={<BookOpen size={32} />} />;
