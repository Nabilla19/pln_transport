"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';
import Link from 'next/link';

/**
 * Halaman Dashboard Utama
 * 
 * Deskripsi: Halaman pertama setelah login. Menampilkan ringkasan statistik permohonan,
 * menu aksi cepat, dan informasi role pengguna yang sedang aktif.
 */
export default function DashboardPage() {
    const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Ambil data user dari penyimpanan lokal
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        // Ambil statistik permohonan dari API
        const fetchStats = async () => {
            try {
                const data = await api.get('/api/stats');
                setStats(data);
            } catch (err) {
                console.error("Gagal memuat statistik:", err);
            }
        };
        fetchStats();
    }, []);

    // Definisi kartu statistik
    const cards = [
        { label: 'Total Permohonan', value: stats.total, color: 'sky', icon: '📊' },
        { label: 'Menunggu Persetujuan', value: stats.pending, color: 'yellow', icon: '⏳' },
        { label: 'Sedang Perjalanan', value: stats.active, color: 'purple', icon: '🚗' },
        { label: 'Selesai', value: stats.completed, color: 'emerald', icon: '✅' },
    ];

    return (
        <Shell>
            <div className="p-4 pt-8 md:p-8 lg:p-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header Selamat Datang */}
                    <header className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Selamat Datang, {user?.name || 'User'}!</h1>
                        <p className="text-slate-500 font-medium">Monitoring sistem transportasi PLN UP2D RIAU secara real-time.</p>
                    </header>

                    {/* Grid Kartu Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {cards.map((card, i) => (
                            <div key={i} className="glass-card p-6 border-b-4 bg-white" style={{ borderColor: `var(--color-${card.color}-500)` }}>
                                <div className="text-3xl mb-4">{card.icon}</div>
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{card.label}</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Grid Aksi & Informasi */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tombol Aksi Cepat (Disembunyikan untuk Security) */}
                        {user?.role !== 'Security' && (
                            <div className="glass-card p-8 bg-white">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Aksi Cepat</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/request" className="btn-primary flex items-center justify-center gap-2 py-4 shadow-lg">
                                        <span>➕</span> Buat Pengajuan
                                    </Link>
                                    <Link href="/my-requests" className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 py-4 transition-all">
                                        <span>📋</span> Riwayat Saya
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Kotak Informasi Sesuai Role */}
                        <div className={`glass-card p-8 bg-sky-50 border border-sky-100 ${user?.role === 'Security' ? 'lg:col-span-2' : ''}`}>
                            <h2 className="text-xl font-bold text-sky-700 mb-4">Informasi Sistem</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                                Anda login sebagai <span className="text-sky-700 font-bold uppercase">{user?.role}</span>.
                                Gunakan menu sidebar untuk mengakses fitur sesuai role Anda.
                                {user?.role === 'Security'
                                    ? ' Fokus pada monitoring kendaraan keluar/masuk dan pastikan pencatatan KM akurat.'
                                    : ' Pastikan selalu mencatat KM pada pos security saat keberangkatan dan kepulangan.'}
                            </p>
                            <div className="text-xs text-sky-400 font-mono">
                                Sinkronisasi terakhir: {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Variabel Warna CSS Kustom */}
            <style jsx>{`
                :root {
                    --color-sky-500: #0ea5e9;
                    --color-yellow-500: #eab308;
                    --color-purple-500: #a855f7;
                    --color-emerald-500: #10b981;
                }
            `}</style>
        </Shell>
    );
}
