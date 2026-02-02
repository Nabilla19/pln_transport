"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function VerifyPage() {
    const { hash } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                // We'll call an API to verify the hash
                const data = await api.get(`/api/verify/${hash}`);
                setResult(data);
            } catch (err) {
                setResult({ error: 'Barcode tidak valid atau tidak ditemukan.' });
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [hash]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-primary text-slate-400 italic">
            Memverifikasi Tanda Tangan Digital...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-primary">
            <div className="max-w-md w-full glass-card p-8 bg-white shadow-2xl border-t-8 border-sky-600 rounded-3xl text-center">
                <div className="mb-6">
                    {result.error ? (
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-4xl">❌</div>
                    ) : (
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifikasi Tanda Tangan</h1>

                {result.error ? (
                    <p className="text-rose-500 font-medium">{result.error}</p>
                ) : (
                    <div className="space-y-4">
                        <p className="text-slate-600 leading-relaxed py-4 border-y border-slate-100">
                            Surat ini sudah ditandai oleh <strong className="text-sky-700">{result.role}</strong> pada <strong className="text-slate-900">{new Date(result.timestamp).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>.
                        </p>
                        <div className="text-xs text-slate-400 font-mono break-all bg-slate-50 p-3 rounded-xl border border-slate-100">
                            Hash: {hash}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-8 text-sky-600 font-bold hover:text-sky-800 transition-colors uppercase tracking-widest text-xs"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}
