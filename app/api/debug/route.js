export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Test connection by counting users
        const userCount = await prisma.user.count();
        return NextResponse.json({
            status: 'ok',
            userCount,
            database: 'connected'
        });
    } catch (err) {
        console.error('Debug API Error:', err);
        return NextResponse.json({
            status: 'error',
            message: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
