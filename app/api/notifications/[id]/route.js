export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = params;

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
