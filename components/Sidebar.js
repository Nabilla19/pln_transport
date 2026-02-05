"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

/**
 * Komponen Sidebar
 * 
 * Deskripsi: Menu navigasi utama aplikasi. Menangani navigasi berbasis role,
 * sistem notifikasi (polling), dan tampilan responsif (Desktop/Mobile).
 */
export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [approvalCount, setApprovalCount] = useState(0);
    const [fleetCount, setFleetCount] = useState(0);
    const [securityCount, setSecurityCount] = useState(0);
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter');

    // Mengambil data user dari localStorage saat komponen dimuat
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Polling notifikasi setiap 1 menit jika user sudah login
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                // Fetch notifications for approval (Permohonan Baru)
                const approvalData = await api.get('/api/notifications?type=Permohonan Baru');
                setApprovalCount(approvalData.length);

                // Fetch notifications for fleet (Assign Fleet Needed)
                const fleetData = await api.get('/api/notifications?type=Assign Fleet Needed');
                setFleetCount(fleetData.length);

                // Fetch notifications for security (Ready for Security)
                const securityData = await api.get('/api/notifications?type=Ready for Security');
                setSecurityCount(securityData.length);
            } catch (err) {
                console.error('Gagal mengambil notifikasi:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    /**
     * Fungsi Logout
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (!user) return null;

    // Helper untuk mengecek role user
    const isAsmen = user.role.includes('Asmen');
    const isKKU = user.role === 'KKU';
    const isSecurity = user.role === 'Security';
    const isAdmin = user.role === 'Admin';
    const canSeeAll = ['Asmen', 'KKU', 'Admin', 'Security'].some(r => user.role.includes(r));

    /**
     * Konfigurasi menu navigasi
     */
    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: '🏠', show: true },
        { label: 'Permohonan Saya', href: '/my-requests', icon: '📋', show: !isSecurity, filter: null },
        { label: 'Buat Pengajuan', href: '/request', icon: '➕', show: !isSecurity },
        { label: 'Monitoring Seluruh', href: '/my-requests?filter=all', icon: '🔍', show: canSeeAll, filter: 'all' },
        { label: 'Persetujuan', href: '/my-requests?filter=approval', icon: '✅', show: isAsmen || isKKU, filter: 'approval' },
        { label: 'Manajemen Fleet', href: '/my-requests?filter=fleet', icon: '🚗', show: isKKU || isAdmin, filter: 'fleet' },
        { label: 'Pos Security', href: '/my-requests?filter=security', icon: '👮', show: isSecurity, filter: 'security' },
        { label: 'Manajemen Akun', href: '/users', icon: '👥', show: isAdmin },
    ];

    // Filter menu berdasarkan izin (show)
    const filteredNav = navItems.filter(item => item.show);

    /**
     * Mengecek apakah menu sedang aktif (berdasarkan path dan filter)
     */
    const isItemActive = (item) => {
        if (item.href.includes('?')) {
            const [path, query] = item.href.split('?');
            return pathname === path && currentFilter === item.filter;
        }
        if (item.href === '/my-requests') {
            return pathname === item.href && !currentFilter;
        }
        return pathname === item.href;
    };

    /**
     * Sub-Komponen Konten Sidebar (digunakan di Desktop & Mobile)
     */
    const SidebarContent = () => (
        <>
            {/* Logo & Info Unit */}
            <div className="mb-8 font-primary">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">E-Transport</h1>
                <p className="text-slate-500 text-xs font-medium">PLN UP2D RIAU</p>
            </div>

            {/* Link Navigasi */}
            <nav className="flex-1 space-y-2">
                {filteredNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isItemActive(item)
                            ? 'bg-sky-500/10 text-sky-600 shadow-sm border border-sky-400/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-semibold">{item.label}</span>
                        </div>
                        {/* Badge Notifikasi Merah (untuk menu tertentu) */}
                        {item.filter === 'approval' && approvalCount > 0 && (
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm animate-pulse"></span>
                        )}
                        {item.filter === 'fleet' && fleetCount > 0 && (
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm animate-pulse"></span>
                        )}
                        {item.filter === 'security' && securityCount > 0 && (
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm animate-pulse"></span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Info User & Tombol Logout */}
            <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 text-sm font-bold border border-sky-400/20 shadow-sm">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-slate-900 text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1 font-semibold">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold group"
                >
                    <span className="group-hover:translate-x-1 transition-transform">🚪</span> Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Tampilan Sidebar Desktop */}
            <aside className="w-64 glass-card h-screen sticky top-0 hidden md:flex flex-col p-6 m-4 ml-0">
                <SidebarContent />
            </aside>

            {/* Header Mobile dengan Tombol Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">E-Transport</h1>
                        <p className="text-slate-500 text-[10px] font-medium">PLN UP2D RIAU</p>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        aria-label="Menu"
                    >
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Overlay Menu Mobile */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Mobile (Slide-in) */}
            <aside className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } shadow-2xl flex flex-col p-6`}>
                <SidebarContent />
            </aside>

            {/* Spacer untuk header mobile agar konten tidak tertutup */}
            <div className="md:hidden h-16"></div>
        </>
    );
}
