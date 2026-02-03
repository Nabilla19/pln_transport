/**
 * API Route: Manajemen User Spesifik (/api/users/[id])
 * 
 * Deskripsi: Endpoint untuk menghapus user tertentu berdasarkan ID.
 * Akses: Terbatas hanya untuk Role 'Admin'.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * Menghapus User (DELETE)
 */
export async function DELETE(request, { params }) {
    // Penanganan parameter dinamis untuk Next.js 14/15
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams?.id;

    try {
        const user = await verifyAuth(request);

        // Validasi Role Admin
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Terlarang - Hanya Admin yang dapat menghapus user' }, { status: 403 });
        }

        const userId = parseInt(id);

        // Mencegah Admin menghapus akunnya sendiri secara tidak sengaja
        if (userId === user.id) {
            return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
        }

        // Proses penghapusan di database menggunakan Prisma
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('DELETE /api/users/[id] error:', error);
        // Tangani error jika ID tidak ditemukan (Prisma Error P2025)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Kesalahan Server Internal' }, { status: 500 });
    }
}
