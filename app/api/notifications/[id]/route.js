/**
 * API Route: Manajemen Notifikasi Spesifik (/api/notifications/[id])
 * 
 * Deskripsi: Endpoint untuk memperbarui status baca satu notifikasi spesifik.
 */

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Menandai Satu Notifikasi sebagai Terbaca (PATCH)
 */
export async function PATCH(req, { params }) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    // Penanganan parameter dinamis untuk Next.js 14/15
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams?.id;

    try {
        await prisma.notifikasiAktivitas.update({
            where: { id: parseInt(id) },
            data: { status_baca: true }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("API Error [PATCH /api/notifications/[id]]:", err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
