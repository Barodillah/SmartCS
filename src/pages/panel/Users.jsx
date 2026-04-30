import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Edit, Trash2, X, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { ANGULAR_CLIP } from '../../utils/constants';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'staff',
        divisi: '',
        is_active: 1
    });

    const [submitting, setSubmitting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://csdwindo.com/api/users/index.php');
            const data = await res.json();
            if (data.status) {
                setUsers(data.data);
            } else {
                setError(data.message || 'Gagal memuat data');
            }
        } catch (err) {
            console.error("Fetch users error:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('https://csdwindo.com/api/users/index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status) {
                setIsAddModalOpen(false);
                fetchUsers();
                resetForm();
                showToast('User berhasil ditambahkan');
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Add user error:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = { ...formData, id: selectedUser.id, _method: 'PUT' };
            // Jangan kirim password kosong saat edit (walaupun di backend sudah diabaikan)
            const res = await fetch('https://csdwindo.com/api/users/index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status) {
                setIsEditModalOpen(false);
                fetchUsers();
                showToast('User berhasil diperbarui');
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Edit user error:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`https://csdwindo.com/api/users/index.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedUser.id, _method: 'DELETE' })
            });
            const data = await res.json();
            if (data.status) {
                setIsDeleteModalOpen(false);
                fetchUsers();
                showToast('User berhasil dihapus');
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Delete user error:", err);
            setError(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            role: 'staff',
            divisi: '',
            is_active: 1
        });
        setError('');
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            password: '', // Password tidak diedit dari sini
            role: user.role,
            divisi: user.divisi || '',
            is_active: parseInt(user.is_active)
        });
        setError('');
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="font-display font-bold text-[24px] text-[#111111] uppercase tracking-wide flex items-center gap-2">
                        <UserCog size={24} className="text-[#E60012]" />
                        CS & Admin Users
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola role dan user yang bisa mengakses dashboard ini.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="bg-[#E60012] text-white px-4 py-2 flex items-center gap-2 font-display text-sm uppercase tracking-wide hover:bg-[#B5000F] transition-colors"
                    style={{ clipPath: ANGULAR_CLIP }}
                >
                    <Plus size={16} />
                    <span>Tambah User</span>
                </button>
            </div>

            <div className="bg-white border border-[#E5E5E5] flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-[#E5E5E5] flex items-center gap-3">
                    <Search size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan nama, username, atau email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 focus:outline-none text-sm text-[#111111]"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#F5F5F5] text-gray-500 text-xs uppercase font-display border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 font-bold">Nama / Username</th>
                                <th className="px-6 py-4 font-bold">Kontak</th>
                                <th className="px-6 py-4 font-bold">Role & Divisi</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E60012] mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data user.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#111111]">{user.name}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[#111111]">{user.email}</div>
                                            <div className="text-xs text-gray-500">{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-sm ${user.role === 'admin' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                {user.role}
                                            </span>
                                            {user.divisi && (
                                                <div className="text-xs text-gray-500 mt-1 uppercase">{user.divisi}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${parseInt(user.is_active) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {parseInt(user.is_active) ? 'Aktif' : 'Nonaktif'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="text-gray-400 hover:text-[#111111] p-1 transition-colors mr-2"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(user)}
                                                className="text-gray-400 hover:text-[#E60012] p-1 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah / Edit */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center">
                            <h3 className="font-display font-bold text-lg text-[#111111] uppercase tracking-wide">
                                {isAddModalOpen ? 'Tambah User Baru' : 'Edit User'}
                            </h3>
                            <button 
                                onClick={() => isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-[#111111]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={isAddModalOpen ? handleAdd : handleEdit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-[#E60012] text-sm p-3 border border-red-200">{error}</div>}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. WhatsApp</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <select name="is_active" value={formData.is_active} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none">
                                        <option value={1}>Aktif</option>
                                        <option value={0}>Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            {formData.role === 'staff' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Divisi (Khusus Staff)</label>
                                    <select name="divisi" value={formData.divisi} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required>
                                        <option value="">-- Pilih Divisi --</option>
                                        <option value="sales">Sales</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                            )}

                            {isAddModalOpen && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border border-gray-300 p-2 focus:border-[#111111] focus:outline-none" required />
                                    <p className="text-xs text-gray-400 mt-1">Admin hanya dapat mengatur password saat mendaftarkan user.</p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
                                <button 
                                    type="button" 
                                    onClick={() => isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-4 py-2 bg-[#E60012] text-white hover:bg-[#B5000F] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    style={{ clipPath: ANGULAR_CLIP }}
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Hapus */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-sm w-full">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 rounded-full">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="font-display font-bold text-lg text-[#111111] mb-2">Hapus User?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            
                            {error && <div className="bg-red-50 text-[#E60012] text-sm p-3 border border-red-200 mb-4">{error}</div>}

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-[#E60012] text-white hover:bg-[#B5000F] transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Menghapus...' : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 shadow-lg font-display text-sm animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                    toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-[#E60012] text-white'
                }`} style={{ clipPath: ANGULAR_CLIP }}>
                    {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default Users;
