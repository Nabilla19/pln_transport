"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';
import Toast from '@/components/Toast';

/**
 * Halaman Manajemen Akun (Admin Only)
 * 
 * Deskripsi: Fitur khusus Admin untuk menambah, melihat, dan menghapus akun pengguna.
 * Dilengkapi dengan validasi input dan tampilan responsif (Tabel Desktop & Kartu Mobile).
 */
export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Perencanaan' // Role default saat tambah pengguna
    });

    // State untuk mode Edit
    const [editUser, setEditUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });

    useEffect(() => {
        // Proteksi Halaman: Hanya Role 'Admin' yang boleh mengakses
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'Admin') {
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, [router]);

    /**
     * Menyiapkan form edit saat tombol edit diklik
     */
    const handleEditClick = (user) => {
        setEditUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '' // Kosongkan awal agar tidak ganti password jika tidak diisi
        });
    };

    /**
     * Menangani proses update pengguna (PATCH)
     */
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            await api.patch(`/api/users/${editUser.id}`, editFormData);
            showToast('✓ Data pengguna berhasil diperbarui!', 'success');
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Gagal memperbarui pengguna', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Mengambil daftar seluruh pengguna dari API
     */
    const fetchUsers = async () => {
        try {
            const data = await api.get('/api/users');
            setUsers(data);
        } catch (err) {
            showToast('Gagal memuat data pengguna', 'error');
        }
    };

    /**
     * Menampilkan notifikasi popup (Toast)
     */
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    /**
     * Menangani proses submit form tambah pengguna
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi: Field tidak boleh kosong
        if (!formData.name || !formData.email || !formData.password) {
            showToast('Semua field harus diisi!', 'warning');
            return;
        }

        // Validasi: Panjang password minimal 6 karakter
        if (formData.password.length < 6) {
            showToast('Password minimal 6 karakter!', 'warning');
            return;
        }

        try {
            await api.post('/api/users', formData);
            showToast('✓ Pengguna berhasil ditambahkan!', 'success');
            setShowForm(false); // Sembunyikan form setelah sukses
            setFormData({ name: '', email: '', password: '', role: 'Perencanaan' }); // Reset form
            fetchUsers(); // Refresh daftar pengguna
        } catch (err) {
            showToast(err.message || 'Gagal menambahkan pengguna', 'error');
        }
    };

    /**
     * Menangani penghapusan akun pengguna
     */
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

    // Daftar role yang tersedia di sistem
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

    // Konfigurasi warna label role
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
                {/* Judul Halaman */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">👥 Manajemen Akun</h1>
                    <p className="text-sm md:text-base text-slate-600">Kelola pengguna sistem E-Transport</p>
                </div>

                {/* Tombol Tampil/Sembunyikan Form Tambah */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="text-xl">{showForm ? '✕' : '➕'}</span>
                        {showForm ? 'Batal' : 'Tambah Pengguna Baru'}
                    </button>
                </div>

                {/* Form Tambah Pengguna (Input Data) */}
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

                {/* Daftar Pengguna yang Sudah Ada */}
                <div className="glass-card overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 md:px-6 py-4 border-b border-slate-200">
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Daftar Pengguna ({users.length})</h2>
                    </div>

                    {/* Tampilan Tabel (Untuk Desktop/Tablet) */}
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
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-sky-600 hover:text-sky-700 font-bold text-sm hover:underline flex items-center gap-1"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="text-red-600 hover:text-red-700 font-bold text-sm hover:underline flex items-center gap-1"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tampilan Kartu (Untuk Mobile) */}
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
                                <div className="flex gap-4 mt-2">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="text-sky-600 hover:text-sky-700 font-bold text-sm"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.name)}
                                        className="text-red-600 hover:text-red-700 font-bold text-sm"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* State jika data kosong */}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-4xl mb-2">👥</p>
                            <p>Belum ada pengguna</p>
                        </div>
                    )}
                </div>

                {/* MODAL EDIT USER */}
                {editUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform animate-slideUp overflow-hidden">
                            <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Edit Pengguna</h3>
                                <button onClick={() => setEditUser(null)} className="text-white hover:text-sky-100 text-2xl">✕</button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-sky-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-sky-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                        <select
                                            value={editFormData.role}
                                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-sky-500 outline-none transition-all"
                                            required
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Password Baru (Opsional)</label>
                                        <input
                                            type="password"
                                            value={editFormData.password}
                                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-sky-500 outline-none transition-all text-sm"
                                            placeholder="Kosongkan jika tidak ingin ganti"
                                            minLength="6"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">* Kosongkan kolom password jika tidak ingin mengubah password.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditUser(null)}
                                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifikasi Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Animasi Lokal */}
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
