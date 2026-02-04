/**
 * API Route: Manajemen Notifikasi (/api/notifications)
 * 
 * Deskripsi: Endpoint untuk mengambil daftar notifikasi yang belum dibaca (GET) 
 * dan memperbarui status notifikasi menjadi "sudah dibaca" (PUT).
 */

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Mengambil Daftar Notifikasi
 * Mengambil pesan berdasarkan ID user secara spesifik atau berdasarkan Role user.
 */
export async function GET(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type'); // Filter by notification type

        // Build where clause
        const whereClause = {
            OR: [
                { user_id: user.id },
                { role: user.role }
            ],
            status_baca: false
        };

        // Add type filter if provided
        if (type) {
            whereClause.jenis_aktivitas = type;
        }

        // Cari notifikasi yang ditujukan untuk user tersebut ATAU untuk role-nya yang belum dibaca
        const notifications = await prisma.notifikasiAktivitas.findMany({
            where: whereClause,
            orderBy: { tanggal_waktu: 'desc' },
            take: limit
        });

        return NextResponse.json(notifications);
    } catch (err) {
        console.error("API Error [GET /api/notifications]:", err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

/**
 * Menandai Notifikasi sebagai Terbaca
 * Mengubah status_baca menjadi true untuk seluruh notifikasi yang relevan.
 */
export async function PUT(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await prisma.notifikasiAktivitas.updateMany({
            where: {
                OR: [
                    { user_id: user.id },
                    { role: user.role }
                ],
                status_baca: false
            },
            data: { status_baca: true }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("API Error [PUT /api/notifications]:", err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
