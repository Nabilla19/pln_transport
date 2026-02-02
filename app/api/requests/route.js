export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter');

        const userRole = user?.role || '';
        const canSeeAll = ['Asmen', 'KKU', 'Admin', 'Security', 'Admin Fleet'].some(r => userRole.includes(r));

        let whereClause = { user_id: user.id }; // Default: only own requests

        if (canSeeAll) {
            if (filter === 'all') {
                whereClause = {};
            } else if (filter === 'approval') {
                whereClause = { status: { in: ['Pending Asmen/KKU', 'Perlu Revisi'] } };
            } else if (filter === 'fleet') {
                whereClause = { status: { in: ['Menunggu Surat Jalan', 'Pending Fleet'] } };
            } else if (filter === 'security') {
                whereClause = { status: { in: ['Ready', 'In Progress'] } };
            }
        }

        const requests = await prisma.transportRequest.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, role: true } },
            },
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json(requests);
    } catch (err) {
        console.error("API Error [GET /api/requests]:", err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const barcode = crypto.createHash('md5')
            .update(`PEMOHON-${user.id}-${Date.now()}`)
            .digest('hex');

        const newRequest = await prisma.transportRequest.create({
            data: {
                ...body,
                user_id: user.id,
                jumlah_penumpang: parseInt(body.jumlah_penumpang),
                tanggal_jam_berangkat: new Date(body.tanggal_jam_berangkat),
                status: 'Pending Asmen/KKU',
                barcode_pemohon: barcode
            }
        });

        return NextResponse.json(newRequest);
    } catch (err) {
        console.error("API Error [POST /api/requests]:", err);
        return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
    }
}
