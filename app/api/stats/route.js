import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await prisma.$transaction([
            prisma.transportRequest.count(),
            prisma.transportRequest.count({ where: { status: 'Pending Asmen/KKU' } }),
            prisma.transportRequest.count({ where: { status: 'In Progress' } }),
            prisma.transportRequest.count({ where: { status: 'Selesai' } })
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
