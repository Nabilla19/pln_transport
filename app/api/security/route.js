import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Allow Security, Admin, or Admin Fleet to log check-in/out
    const allowedRoles = ['Security', 'Admin', 'Admin Fleet'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: `Forbidden: Role ${user.role} cannot perform this action` }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { requestId, type, km, jam, fotoDriver, fotoKm } = body;

        console.log(`[Security API] Processing ${type} for Request #${requestId}`, { km, jam });

        if (!requestId || isNaN(parseInt(requestId))) {
            return NextResponse.json({ message: 'Invalid Request ID' }, { status: 400 });
        }

        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: { fleet: true }
        });

        if (!request) return NextResponse.json({ message: 'Request Not Found' }, { status: 404 });

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'transport');
        try {
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        } catch (e) {
            console.warn("Upload directory creation failed (Expected on Vercel)");
        }

        const saveImage = (base64) => {
            if (!base64 || !base64.includes('base64,')) return null;
            return base64; // Penyelamatan data dalam bentuk Base64 (Aman untuk Vercel)
        };

        if (type === 'checkin') {
            const pathDriver = saveImage(fotoDriver);
            const pathKm = saveImage(fotoKm);

            const kmVal = parseInt(km) || 0;

            await prisma.$transaction([
                prisma.transportSecurityLog.create({
                    data: {
                        request_id: parseInt(requestId),
                        km_awal: kmVal,
                        jam_berangkat: jam ? new Date(jam) : new Date(),
                        foto_driver_berangkat: pathDriver,
                        foto_km_berangkat: pathKm,
                        logged_by: user.id
                    }
                }),
                prisma.transportRequest.update({
                    where: { id: parseInt(requestId) },
                    data: { status: 'In Progress' }
                })
            ]);

            return NextResponse.json({ message: 'Log Berangkat Berhasil. Status: In Progress.' });
        } else {
            // Checkout
            const existingLog = await prisma.transportSecurityLog.findFirst({
                where: { request_id: parseInt(requestId) },
                orderBy: { created_at: 'desc' }
            });

            if (!existingLog) return NextResponse.json({ message: 'Log Keberangkatan tidak ditemukan. Silakan Check-In terlebih dahulu.' }, { status: 400 });

            const pathDriver = saveImage(fotoDriver);
            const pathKm = saveImage(fotoKm);

            const kmAkhir = parseInt(km) || 0;
            const kmAwal = existingLog.km_awal || 0;
            const jarak = Math.max(0, kmAkhir - kmAwal);

            const jamMasuk = jam ? new Date(jam) : new Date();
            const jamKeluar = existingLog.jam_berangkat;

            // Calculate duration
            const diff = Math.abs(jamMasuk - jamKeluar);
            const minutesTotal = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(minutesTotal / 60);
            const minutes = minutesTotal % 60;
            const lamaWaktu = `${hours} Jam ${minutes} Menit`;

            console.log(`[Security API] Checkout Debug: KM(${kmAwal}->${kmAkhir}), Jarak(${jarak}), Lama(${lamaWaktu})`);

            const platNomor = request.fleet?.[0]?.plat_nomor;

            await prisma.$transaction([
                prisma.transportSecurityLog.update({
                    where: { id: existingLog.id },
                    data: {
                        km_akhir: kmAkhir,
                        jam_kembali: jamMasuk,
                        lama_waktu: lamaWaktu,
                        jarak_tempuh: jarak,
                        foto_driver_kembali: pathDriver,
                        foto_km_kembali: pathKm,
                        updated_at: new Date()
                    }
                }),
                prisma.transportRequest.update({
                    where: { id: parseInt(requestId) },
                    data: { status: 'Selesai' }
                }),
                ...(platNomor ? [
                    prisma.transportVehicle.update({
                        where: { plat_nomor: platNomor },
                        data: { status: 'Available' }
                    })
                ] : [])
            ]);

            return NextResponse.json({ message: 'Check-Out Berhasil. Status: Selesai.' });
        }
    } catch (err) {
        console.error("API Error [POST /api/security]:", err);
        return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
    }
}
