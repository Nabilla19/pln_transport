/**
 * Halaman Riwayat Permohonan (Server Component)
 * 
 * Deskripsi: Halaman pembungkus untuk daftar riwayat permohonan kendaraan.
 * Menggunakan Suspense untuk menangani loading state dari Client Component.
 */
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import MyRequestsClient from './MyRequestsClient';

export default function MyRequestsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Memuat daftar permohonan...</div>}>
            <MyRequestsClient />
        </Suspense>
    );
}
