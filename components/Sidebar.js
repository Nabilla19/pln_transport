"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const data = await api.get('/api/notifications');
                setUnreadCount(data.length);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Polling every 1 minute
        return () => clearInterval(interval);
    }, [user]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (!user) return null;

    const isAsmen = user.role.includes('Asmen');
    const isKKU = user.role === 'KKU';
    const isSecurity = user.role === 'Security';
    const isAdmin = user.role === 'Admin';
    const isAdminFleet = user.role === 'Admin Fleet';

    const canSeeAll = ['Asmen', 'KKU', 'Admin', 'Security', 'Admin Fleet'].some(r => user.role.includes(r));

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: '🏠', show: true },
        { label: 'Permohonan Saya', href: '/my-requests', icon: '📋', show: !isSecurity, filter: null },
        { label: 'Buat Pengajuan', href: '/request', icon: '➕', show: !isSecurity }, // Hidden for Security
        { label: 'Monitoring Seluruh', href: '/my-requests?filter=all', icon: '🔍', show: canSeeAll, filter: 'all' },
        { label: 'Persetujuan', href: '/my-requests?filter=approval', icon: '✅', show: isAsmen || isKKU, filter: 'approval' },
        { label: 'Manajemen Fleet', href: '/my-requests?filter=fleet', icon: '🚗', show: isKKU || isAdminFleet, filter: 'fleet' },
        { label: 'Pos Security', href: '/my-requests?filter=security', icon: '👮', show: isSecurity, filter: 'security' },
        { label: 'Manajemen Akun', href: '/users', icon: '👥', show: isAdmin }, // New for Admin
    ];

    const filteredNav = navItems.filter(item => item.show);

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

    const SidebarContent = () => (
        <>
            <div className="mb-8 font-primary">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">E-Transport</h1>
                <p className="text-slate-500 text-xs font-medium">PLN UP2D RIAU</p>
            </div>

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
                        {unreadCount > 0 && (item.filter === 'approval' || item.filter === 'security') && (
                            <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

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
            {/* Desktop Sidebar */}
            <aside className="w-64 glass-card h-screen sticky top-0 hidden md:flex flex-col p-6 m-4 ml-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">E-Transport</h1>
                        <p className="text-slate-500 text-[10px] font-medium">PLN UP2D RIAU</p>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-slate-700 rounded-full transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-40 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } shadow-2xl flex flex-col p-6`}>
                <SidebarContent />
            </aside>

            {/* Spacer for mobile */}
            <div className="md:hidden h-16"></div>
        </>
    );
}
