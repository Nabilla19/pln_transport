export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;

        // Fetch based on user_id OR role (since some notifications are role-wide)
        const notifications = await prisma.notifikasiAktivitas.findMany({
            where: {
                OR: [
                    { user_id: user.id },
                    { role: user.role }
                ],
                status_baca: false
            },
            orderBy: { tanggal_waktu: 'desc' },
            take: limit
        });

        return NextResponse.json(notifications);
    } catch (err) {
        console.error("API Error [GET /api/notifications]:", err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

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
