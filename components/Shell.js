"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Suspense } from 'react';

export default function Shell({ children }) {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
        } else {
            setAuthenticated(true);
        }
    }, [router]);

    if (!authenticated) return null;

    return (
        <div className="flex min-h-screen bg-white">
            <Suspense fallback={<div className="w-64 bg-slate-50 border-r border-slate-100" />}>
                <Sidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
