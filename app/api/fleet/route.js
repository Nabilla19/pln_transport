import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifyRoles } from '@/lib/notifications';

/**
 * Endpoint GET: Mengambil daftar kendaraan yang tersedia
 * 
 * Deskripsi: Mengecek kendaraan mana yang sedang tidak digunakan (Ready/In Progress)
 * dan mengembalikan daftar kendaraan dengan status 'Available'.
 */
export async function GET(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const brand = searchParams.get('brand');

        // 1. Ambil semua penugasan aktif (Ready atau In Progress)
        const activeRequests = await prisma.transportRequest.findMany({
            where: {
                status: { in: ['Ready', 'In Progress'] }
            },
            include: {
                fleet: true
            }
        });

        // Ekstrak plat nomor kendaraan yang sedang digunakan
        const usedPlatNomors = activeRequests
            .flatMap(req => req.fleet.map(f => f.plat_nomor))
            .filter(Boolean);

        // 2. Cari kendaraan yang statusnya 'Available' DAN tidak ada dalam daftar yang sedang digunakan
        let vehicles = await prisma.transportVehicle.findMany({
            where: {
                status: 'Available',
                plat_nomor: { notIn: usedPlatNomors },
                ...(brand && {
                    brand: { contains: brand }
                })
            }
        });

        // Jika filter brand tidak ditemukan, tampilkan semua kendaraan yang tersedia
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
        return NextResponse.json({ message: 'Kesalahan Server' }, { status: 500 });
    }
}

/**
 * Endpoint POST: Menugaskan armada (Fleet Assignment)
 * 
 * Deskripsi: Menyimpan data penugasan kendaraan & driver, memperbarui status kendaraan 
 * menjadi 'In Use', dan mengirim notifikasi ke Security.
 */
export async function POST(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Hanya KKU atau Admin Fleet yang boleh menugaskan armada
    const allowedRoles = ['KKU', 'Admin Fleet', 'Admin'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: 'Terlarang' }, { status: 403 });
    }

    try {
        const { requestId, mobil, platNomor, pengemudi } = await req.json();

        // Generate barcode unik untuk penugasan fleet
        const barcode = crypto.createHash('md5')
            .update(`KKU-${user.id}-${Date.now()}-${requestId}`)
            .digest('hex');

        // Menggunakan Transaksi Database
        await prisma.$transaction([
            // 1. Buat record penugasan di tabel transport_fleet
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
            // 2. Update status kendaraan di inventaris menjadi 'In Use'
            prisma.transportVehicle.update({
                where: { plat_nomor: platNomor },
                data: { status: 'In Use', last_request_id: parseInt(requestId) }
            }),
            // 3. Update status permohonan menjadi 'Ready' (siap berangkat)
            prisma.transportRequest.update({
                where: { id: parseInt(requestId) },
                data: { status: 'Ready' }
            })
        ]);

        // Kirim notifikasi ke Security bahwa armada telah siap di pos gerbang
        await notifyRoles(['Security'], {
            type: 'Fleet Assigned',
            module: 'Transport',
            recordId: parseInt(requestId),
            recordName: platNomor,
            deskripsi: `Armada ${mobil} (${platNomor}) telah ditugaskan. Kendaraan siap berangkat.`
        });

        return NextResponse.json({ message: 'Fleet berhasil ditugaskan' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Kesalahan Server' }, { status: 500 });
    }
}
