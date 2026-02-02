"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';

export default function MyRequestsClient() {
    const [requests, setRequests] = useState([]);
    const [user, setUser] = useState(null);
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchRequests = async () => {
            try {
                const url = filter ? `/api/requests?filter=${filter}` : '/api/requests';
                const data = await api.get(url);
                setRequests(data);

                // Mark notifications as read if viewing approval or security
                if (filter === 'approval' || filter === 'security') {
                    await fetch('/api/notifications', { method: 'PUT' });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequests();
    }, [filter]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Asmen/KKU':
            case 'Perlu Revisi': return 'text-amber-700 bg-amber-50 border border-amber-200';
            case 'Menunggu Surat Jalan': return 'text-sky-700 bg-sky-50 border border-sky-200';
            case 'Ready': return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
            case 'In Progress': return 'text-purple-700 bg-purple-50 border border-purple-200';
            case 'Selesai': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            default: return 'text-slate-600 bg-slate-50 border border-slate-200';
        }
    };

    const user_role = user?.role || '';
    const canSeeAll = user && ['Asmen', 'KKU', 'Admin', 'Security', 'Admin Fleet'].some(r => user_role.includes(r));

    return (
        <Shell>
            <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {
                                filter === 'all' ? 'Monitoring Seluruh' :
                                    filter === 'approval' ? 'Persetujuan' :
                                        filter === 'fleet' ? 'Manajemen Fleet' :
                                            filter === 'security' ? 'Pos Security' :
                                                'Permohonan Saya'
                            }
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            {
                                filter === 'all' ? 'Daftar seluruh pengajuan kendaraan dinas PLN UP2D RIAU.' :
                                    filter === 'approval' ? 'Daftar pengajuan yang membutuhkan persetujuan Anda.' :
                                        filter === 'fleet' ? 'Daftar pengajuan yang menunggu penerbitan Surat Jalan.' :
                                            filter === 'security' ? 'Monitoring kendaraan keluar/masuk di Pos Security.' :
                                                'Daftar pengajuan kendaraan pribadi Anda.'
                            }
                        </p>
                    </div>

                    <div className="glass-card overflow-hidden bg-white shadow-sm border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Pemohon</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tujuan</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Waktu Berangkat</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                                                Belum ada permohonan.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4 text-slate-500 font-mono text-xs font-bold">#{req.id}</td>
                                                <td className="p-4">
                                                    <div className="text-slate-900 font-bold text-sm">{req.nama || req.user?.name}</div>
                                                    <div className="text-slate-400 text-[10px] font-bold uppercase">{req.bagian}</div>
                                                </td>
                                                <td className="p-4 text-slate-900 font-bold">{req.tujuan}</td>
                                                <td className="p-4 text-slate-600 text-sm font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link href={`/request/${req.id}`} className="text-sky-600 hover:text-sky-700 text-sm font-bold transition-all">
                                                        Detail →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
