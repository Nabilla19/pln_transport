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
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const brand = searchParams.get('brand');

        console.log('[Fleet API] Fetching vehicles with brand:', brand);

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

        console.log('[Fleet API] Used vehicles:', usedPlatNomors);

        // 2. Cari kendaraan yang statusnya 'Available' DAN tidak ada dalam daftar yang sedang digunakan
        // Note: MySQL doesn't support mode: 'insensitive', so we fetch all and filter in JS
        let vehicles = await prisma.transportVehicle.findMany({
            where: {
                status: 'Available',
                plat_nomor: { notIn: usedPlatNomors }
            }
        });

        // Filter by brand in JavaScript (case-insensitive)
        if (brand) {
            const brandLower = brand.toLowerCase();
            vehicles = vehicles.filter(v => v.brand.toLowerCase().includes(brandLower));
        }

        console.log('[Fleet API] Available vehicles with brand filter:', vehicles.length);

        console.log('[Fleet API] Total vehicles returned:', vehicles.length);

        return NextResponse.json(vehicles);
    } catch (err) {
        console.error('[Fleet API] Error:', err);
        return NextResponse.json({ message: 'Kesalahan server', error: err.message }, { status: 500 });
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
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    // Hanya KKU atau Admin yang boleh menugaskan armada
    const allowedRoles = ['KKU', 'Admin'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: 'Terlarang' }, { status: 403 });
    }

    let body;
    try {
        body = await req.json();
    } catch (parseError) {
        console.error('[Fleet API] JSON Parse Error:', parseError);
        return NextResponse.json({ message: 'Format data tidak valid' }, { status: 400 });
    }

    try {
        const { requestId, mobil, platNomor, pengemudi } = body;

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

/**
 * Endpoint PUT: Menolak Penugasan Fleet
 * 
 * Deskripsi: Menolak penugasan armada dengan alasan dropdown,
 * mengembalikan status request ke 'Pending Fleet', dan mengirim notifikasi.
 */
export async function PUT(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    // Hanya KKU atau Admin yang boleh menolak penugasan armada
    const allowedRoles = ['KKU', 'Admin'];
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ message: 'Terlarang' }, { status: 403 });
    }

    let body;
    try {
        body = await req.json();
    } catch (parseError) {
        console.error('[Fleet Rejection API] JSON Parse Error:', parseError);
        return NextResponse.json({ message: 'Format data tidak valid' }, { status: 400 });
    }

    try {
        const { requestId, rejection_reason } = body;

        // Validasi alasan penolakan
        const validReasons = ['BBM Habis/Kritis', 'Mobil lagi service', 'Mobil lagi dipakai Manager'];
        if (!validReasons.includes(rejection_reason)) {
            return NextResponse.json({ message: 'Alasan penolakan tidak valid' }, { status: 400 });
        }

        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request) {
            return NextResponse.json({ message: 'Permohonan tidak ditemukan' }, { status: 404 });
        }

        // Simpan data penolakan fleet dan update status request
        await prisma.$transaction([
            // 1. Buat record penolakan di tabel transport_fleet
            prisma.transportFleet.create({
                data: {
                    request_id: parseInt(requestId),
                    admin_id: user.id,
                    is_rejected: true,
                    rejection_reason
                }
            }),
            // 2. Update status permohonan menjadi 'Ditolak' (final, tidak bisa di-assign lagi)
            prisma.transportRequest.update({
                where: { id: parseInt(requestId) },
                data: { status: 'Ditolak' }
            })
        ]);

        // Kirim notifikasi ke pemohon tentang penolakan fleet
        await notifyRoles(['Pemohon'], {
            type: 'Fleet Rejected',
            module: 'Transport',
            recordId: parseInt(requestId),
            recordName: request.nama,
            deskripsi: `Permohonan transport untuk ${request.nama} ditolak oleh KKU. Alasan: ${rejection_reason}. Silakan buat pengajuan baru.`
        });

        return NextResponse.json({ message: 'Penugasan fleet ditolak' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Kesalahan Server' }, { status: 500 });
    }
}
