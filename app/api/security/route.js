import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Only Security role can log check-in/out
    if (user.role !== 'Security') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { requestId, type, km, jam, fotoDriver, fotoKm } = await req.json();

        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: { fleet: true }
        });

        if (!request) return NextResponse.json({ message: 'Request Not Found' }, { status: 404 });

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'transport');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const saveImage = (base64, prefix) => {
            if (!base64 || !base64.includes('base64,')) return null;
            const data = base64.split(';base64,').pop();
            const fileName = `${prefix}_${requestId}_${Date.now()}.jpg`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, data, { encoding: 'base64' });
            return `/uploads/transport/${fileName}`;
        };

        if (type === 'checkin') {
            const pathDriver = saveImage(fotoDriver, 'driver_in');
            const pathKm = saveImage(fotoKm, 'km_in');

            await prisma.$transaction([
                prisma.transportSecurityLog.create({
                    data: {
                        request_id: parseInt(requestId),
                        km_awal: parseInt(km),
                        jam_berangkat: new Date(jam),
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

            if (!existingLog) return NextResponse.json({ message: 'Log Inset Not Found' }, { status: 400 });

            const pathDriver = saveImage(fotoDriver, 'driver_out');
            const pathKm = saveImage(fotoKm, 'km_out');

            const kmAkhir = parseInt(km);
            const jarak = kmAkhir - existingLog.km_awal;

            const jamMasuk = new Date(jam);
            const diff = Math.abs(jamMasuk - existingLog.jam_berangkat);
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(minutes / 60);
            const lamaWaktu = `${hours} Jam ${minutes % 60} Menit`;

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
        console.error(err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
