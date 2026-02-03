/**
 * Halaman Buat Pengajuan (Server Component)
 * 
 * Deskripsi: Halaman pembungkus untuk formulir pengajuan transportasi.
 * Menggunakan Suspense untuk menangani loading state dari Client Component.
 */
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import RequestFormClient from './RequestFormClient';

export default function RequestPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Memuat formulir...</div>}>
            <RequestFormClient />
        </Suspense>
    );
}
