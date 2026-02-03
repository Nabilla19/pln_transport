"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Suspense } from 'react';

/**
 * Komponen Shell (Layout Utama)
 * 
 * Deskripsi: Wrapper utama untuk semua halaman yang memerlukan login.
 * Menangani pengecekan token autentikasi, menyediakan struktur layout,
 * serta fitur KEAMANAN tambahan berupa Auto-Logout saat idle.
 */
export default function Shell({ children }) {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    // Timer ID untuk melacak sesi idle
    const idleTimerRef = useRef(null);
    // Batas waktu aktivitas: 10 Menit (600.000 ms)
    const IDLE_TIMEOUT = 10 * 60 * 1000;

    /**
     * Fungsi Logout Otomatis
     */
    const handleAutoLogout = () => {
        console.log("Sesi berakhir karena tidak ada aktivitas selama 10 menit.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    /**
     * Fungsi untuk me-reset timer setiap kali ada interaksi user
     */
    const resetIdleTimer = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(handleAutoLogout, IDLE_TIMEOUT);
    };

    useEffect(() => {
        // 1. Cek Token Awal
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
        } else {
            setAuthenticated(true);

            // 2. Setup Idle Monitoring
            resetIdleTimer(); // Inisialisasi timer awal

            // Daftar event interaksi yang dianggap sebagai "aktivitas"
            const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

            // Tambahkan event listener ke window
            activityEvents.forEach(event => {
                window.addEventListener(event, resetIdleTimer);
            });

            // Cleanup saat komponen dibongkar (unmount)
            return () => {
                if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
                activityEvents.forEach(event => {
                    window.removeEventListener(event, resetIdleTimer);
                });
            };
        }
    }, [router]);

    // Jangan tampilkan apapun jika belum terverifikasi login
    if (!authenticated) return null;

    return (
        <div className="flex min-h-screen bg-white">
            {/* Bagian Sidebar Kiri */}
            <Suspense fallback={<div className="w-64 bg-slate-50 border-r border-slate-100" />}>
                <Sidebar />
            </Suspense>

            {/* Bagian Konten Utama Kanan */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
