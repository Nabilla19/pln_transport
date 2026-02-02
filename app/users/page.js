"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';
import Toast from '@/components/Toast';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Perencanaan'
    });

    useEffect(() => {
        // Check if user is Admin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'Admin') {
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/api/users');
            setUsers(data);
        } catch (err) {
            showToast('Gagal memuat data pengguna', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            showToast('Semua field harus diisi!', 'warning');
            return;
        }

        if (formData.password.length < 6) {
            showToast('Password minimal 6 karakter!', 'warning');
            return;
        }

        try {
            await api.post('/api/users', formData);
            showToast('✓ Pengguna berhasil ditambahkan!', 'success');
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', role: 'Perencanaan' });
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Gagal menambahkan pengguna', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus pengguna "${name}"?`)) return;

        try {
            await api.delete(`/api/users/${id}`);
            showToast('✓ Pengguna berhasil dihapus!', 'success');
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Gagal menghapus pengguna', 'error');
        }
    };

    const roles = [
        'Perencanaan',
        'Pemeliharaan',
        'Operasi Sistem Distribusi',
        'Fasilitas Operasi',
        'K3L & KAM',
        'Pengadaan Keuangan',
        'UP3',
        'Asmen Perencanaan',
        'Asmen Pemeliharaan',
        'Asmen Operasi',
        'Asmen Fasop',
        'KKU',
        'Admin Fleet',
        'Security',
        'Admin'
    ];

    const roleColors = {
        'Admin': 'bg-purple-100 text-purple-700 border-purple-300',
        'KKU': 'bg-blue-100 text-blue-700 border-blue-300',
        'Asmen Perencanaan': 'bg-green-100 text-green-700 border-green-300',
        'Asmen Operasi': 'bg-green-100 text-green-700 border-green-300',
        'Asmen Pemeliharaan': 'bg-green-100 text-green-700 border-green-300',
        'Asmen Fasop': 'bg-green-100 text-green-700 border-green-300',
        'Admin Fleet': 'bg-amber-100 text-amber-700 border-amber-300',
        'Security': 'bg-red-100 text-red-700 border-red-300',
        'UP3': 'bg-sky-100 text-sky-700 border-sky-300',
        'Perencanaan': 'bg-slate-100 text-slate-700 border-slate-300',
        'Pemeliharaan': 'bg-slate-100 text-slate-700 border-slate-300',
        'Operasi Sistem Distribusi': 'bg-slate-100 text-slate-700 border-slate-300',
        'Fasilitas Operasi': 'bg-slate-100 text-slate-700 border-slate-300',
        'K3L & KAM': 'bg-slate-100 text-slate-700 border-slate-300',
        'Pengadaan Keuangan': 'bg-slate-100 text-slate-700 border-slate-300'
    };

    return (
        <Shell>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">👥 Manajemen Akun</h1>
                    <p className="text-sm md:text-base text-slate-600">Kelola pengguna sistem E-Transport</p>
                </div>

                {/* Add User Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="text-xl">{showForm ? '✕' : '➕'}</span>
                        {showForm ? 'Batal' : 'Tambah Pengguna Baru'}
                    </button>
                </div>

                {/* Add User Form */}
                {showForm && (
                    <div className="glass-card p-4 md:p-6 mb-6 animate-slideDown">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Tambah Pengguna Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="glass-input w-full p-3 rounded-xl"
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="glass-input w-full p-3 rounded-xl"
                                        placeholder="nama@pln.co.id"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="glass-input w-full p-3 rounded-xl"
                                        placeholder="Minimal 6 karakter"
                                        minLength="6"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="glass-input w-full p-3 rounded-xl"
                                        required
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all active:scale-95"
                                >
                                    ✓ Simpan Pengguna
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-300 transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users List */}
                <div className="glass-card overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 md:px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Daftar Pengguna ({users.length})</h2>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || roleColors['Pemohon']}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="text-red-600 hover:text-red-700 font-bold text-sm hover:underline"
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {users.map((user) => (
                            <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-slate-900">{user.name}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || roleColors['Pemohon']}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="text-red-600 hover:text-red-700 font-bold text-sm mt-2"
                                >
                                    🗑️ Hapus
                                </button>
                            </div>
                        ))}
                    </div>

                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-4xl mb-2">👥</p>
                            <p>Belum ada pengguna</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </Shell>
    );
}
