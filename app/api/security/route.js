import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Endpoint POST: Menangani Log Security (Check-In & Check-Out)
 * 
 * Deskripsi: Mencatat waktu keberangkatan/kepulangan, KM (odometer), dan foto live driver serta KM.
 * Mengelola status permohonan menjadi 'In Progress' atau 'Selesai'.
 */
export async function POST(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Hanya Security, Admin, atau Admin Fleet yang diizinkan mencatatkan log security
    const allowedRoles = ['Security', 'Admin', 'Admin Fleet'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: `Terlarang: Role ${user.role} tidak memiliki akses ini` }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { requestId, type, km, jam, fotoDriver, fotoKm } = body;

        console.log(`[Security API] Memproses ${type} untuk Permohonan #${requestId}`, { km, jam });

        if (!requestId || isNaN(parseInt(requestId))) {
            return NextResponse.json({ message: 'ID Permohonan tidak valid' }, { status: 400 });
        }

        // Cari data permohonan beserta data armada terkait
        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: { fleet: true }
        });

        if (!request) return NextResponse.json({ message: 'Permohonan Tidak Ditemukan' }, { status: 404 });

        // Fungsi pembantu untuk memvalidasi dan mengembalikan data foto Base64
        // Base64 digunakan agar foto tetap tersimpan meskipun di environment cloud seperti Vercel (yang memory-nya ephemeral)
        const saveImage = (base64) => {
            if (!base64 || !base64.includes('base64,')) return null;
            return base64;
        };

        if (type === 'checkin') {
            // PROSES KEBERANGKATAN (CHECK-IN)
            const pathDriver = saveImage(fotoDriver);
            const pathKm = saveImage(fotoKm);
            const kmVal = parseInt(km) || 0;

            await prisma.$transaction([
                // 1. Buat log security keberangkatan
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
                // 2. Tandai status permohonan sedang berjalan (In Progress)
                prisma.transportRequest.update({
                    where: { id: parseInt(requestId) },
                    data: { status: 'In Progress' }
                })
            ]);

            return NextResponse.json({ message: 'Log Berangkat Berhasil. Status: In Progress.' });
        } else {
            // PROSES KEPULANGAN (CHECK-OUT)
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

            // Hitung durasi perjalanan
            const diff = Math.abs(jamMasuk - jamKeluar);
            const minutesTotal = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(minutesTotal / 60);
            const minutes = minutesTotal % 60;
            const lamaWaktu = `${hours} Jam ${minutes} Menit`;

            console.log(`[Security API] Checkout Debug: KM(${kmAwal}->${kmAkhir}), Jarak(${jarak}), Lama(${lamaWaktu})`);

            const platNomor = request.fleet?.[0]?.plat_nomor;

            await prisma.$transaction([
                // 1. Update log security dengan data kepulangan
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
                // 2. Update status permohonan selesai
                prisma.transportRequest.update({
                    where: { id: parseInt(requestId) },
                    data: { status: 'Selesai' }
                }),
                // 3. Kembalikan status kendaraan menjadi tersedia (Available)
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
        return NextResponse.json({ message: 'Kesalahan Server', error: err.message }, { status: 500 });
    }
}
