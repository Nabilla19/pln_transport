import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const brand = searchParams.get('brand');

        // 1. Get all active assignments first (Ready or In Progress)
        const activeRequests = await prisma.transportRequest.findMany({
            where: {
                status: { in: ['Ready', 'In Progress'] }
            },
            include: {
                fleet: true
            }
        });

        // Extract plat nomor of vehicles currently being used
        const usedPlatNomors = activeRequests
            .flatMap(req => req.fleet.map(f => f.plat_nomor))
            .filter(Boolean);

        // 2. Fetch vehicles that are 'Available' AND not in the 'In Use' list
        let vehicles = await prisma.transportVehicle.findMany({
            where: {
                status: 'Available',
                plat_nomor: { notIn: usedPlatNomors },
                ...(brand && {
                    brand: { contains: brand }
                })
            }
        });

        // Fallback: if filtered brand yields nothing, show all free ones
        if (brand && vehicles.length === 0) {
            vehicles = await prisma.transportVehicle.findMany({
                where: {
                    status: 'Available',
                    plat_nomor: { notIn: usedPlatNomors }
                }
            });
        }

        return NextResponse.json(vehicles);
    } catch (err) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Only KKU or Admin Fleet can assign fleet
    const allowedRoles = ['KKU', 'Admin Fleet', 'Admin'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { requestId, mobil, platNomor, pengemudi } = await req.json();

        const barcode = crypto.createHash('md5')
            .update(`KKU-${user.id}-${Date.now()}-${requestId}`)
            .digest('hex');

        await prisma.$transaction([
            prisma.transportFleet.create({
                data: {
                    request_id: parseInt(requestId),
                    admin_id: user.id,
                    mobil,
                    plat_nomor: platNomor,
                    pengemudi,
                    barcode_fleet: barcode
                }
            }),
            prisma.transportVehicle.update({
                where: { plat_nomor: platNomor },
                data: { status: 'In Use', last_request_id: parseInt(requestId) }
            }),
            prisma.transportRequest.update({
                where: { id: parseInt(requestId) },
                data: { status: 'Ready' }
            })
        ]);

        return NextResponse.json({ message: 'Fleet berhasil ditugaskan' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
