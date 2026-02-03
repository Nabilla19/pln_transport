/**
 * API Route: Statistik Dashboard (/api/stats)
 * 
 * Deskripsi: Mengambil jumlah ringkasan permohonan kendaraan 
 * (Total, Pending, In Progress, Selesai) untuk ditampilkan di Dashboard.
 */

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        // Validasi Sesi
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Eksekusi beberapa penghitungan sekaligus dalam satu transaksi database
        const stats = await prisma.$transaction([
            prisma.transportRequest.count(), // Total seluruh pengajuan
            prisma.transportRequest.count({ where: { status: 'Pending Asmen/KKU' } }), // Menunggu persetujuan
            prisma.transportRequest.count({ where: { status: 'In Progress' } }), // Kendaraan sedang digunakan
            prisma.transportRequest.count({ where: { status: 'Selesai' } }) // Penggunaan sudah selesai
        ]);

        return NextResponse.json({
            total: stats[0],
            pending: stats[1],
            active: stats[2],
            completed: stats[3]
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
