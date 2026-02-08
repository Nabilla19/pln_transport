export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifyRoles } from '@/lib/notifications';

/**
 * Endpoint GET: Mengambil daftar permohonan transportasi
 * 
 * Deskripsi: Mengambil data permohonan berdasarkan role pengguna dan filter yang diberikan.
 */
export async function GET(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter');

        const userRole = user?.role || '';
        // Cek apakah user memiliki role yang diizinkan melihat semua data
        const canSeeAll = ['Asmen', 'KKU', 'Admin', 'Security'].some(r => userRole.includes(r));

        // Default: Pemohon hanya bisa melihat permohonan miliknya sendiri
        let whereClause = { user_id: user.id };

        // MONITORING SELURUH: Semua role bisa lihat semua data
        if (filter === 'all') {
            whereClause = {}; // Tampilkan semua permohonan
        } else if (canSeeAll) {
            if (filter === 'approval') {
                // Filter untuk halaman persetujuan
                const asmenMap = {
                    'Asmen Perencanaan': 'Perencanaan',
                    'Asmen Pemeliharaan': 'Pemeliharaan',
                    'Asmen Operasi': 'Operasi Sistem Distribusi',
                    'Asmen Fasop': 'Fasilitas Operasi'
                };

                if (asmenMap[user.role]) {
                    // Asmen hanya melihat permohonan dari bagian mereka yang butuh approval
                    whereClause = {
                        status: { in: ['Pending Asmen/KKU', 'Perlu Revisi'] },
                        bagian: asmenMap[user.role]
                    };
                } else if (user.role === 'KKU') {
                    // KKU melihat departemen: KKU, K3L & KAM, Pengadaan, UP3
                    const asmenDepts = ['Perencanaan', 'Pemeliharaan', 'Operasi Sistem Distribusi', 'Fasilitas Operasi'];
                    whereClause = {
                        status: { in: ['Pending Asmen/KKU', 'Perlu Revisi'] },
                        bagian: { notIn: asmenDepts }
                    };
                } else {
                    // Admin melihat semua yang butuh approval
                    whereClause = { status: { in: ['Pending Asmen/KKU', 'Perlu Revisi'] } };
                }
            } else if (filter === 'fleet') {
                // Filter untuk penugasan armada (Fleet)
                whereClause = { status: { in: ['Menunggu Surat Jalan', 'Pending Fleet'] } };
            } else if (filter === 'security') {
                // Filter untuk monitoring Security (kendaraan aktif)
                whereClause = { status: { in: ['Ready', 'In Progress'] } };
            }
        }

        // Query ke database menggunakan Prisma
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

/**
 * Endpoint POST: Membuat permohonan transportasi baru
 * 
 * Deskripsi: Menerima data form, menyimpan ke DB, dan mengirim notifikasi ke role terkait.
 */
export async function POST(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    try {
        const body = await req.json();

        // Validasi waktu keberangkatan tidak boleh di masa lalu
        const departureTime = new Date(body.tanggal_jam_berangkat);
        const now = new Date();

        if (departureTime < now) {
            return NextResponse.json({
                message: 'Waktu keberangkatan tidak boleh di masa lalu. Silakan pilih waktu yang akan datang.'
            }, { status: 400 });
        }

        // Generate barcode unik untuk pemohon menggunakan MD5 hash
        const barcode = crypto.createHash('md5')
            .update(`PEMOHON-${user.id}-${Date.now()}`)
            .digest('hex');

        // MANUAL ID GENERATION: Cari ID terakhir dan tambah 1
        // Ini untuk bypass auto-increment yang loncat-loncat di TiDB Cloud
        const lastRequest = await prisma.transportRequest.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true }
        });
        const nextId = lastRequest ? lastRequest.id + 1 : 1;

        // Simpan permohonan baru ke database dengan ID manual
        const newRequest = await prisma.transportRequest.create({
            data: {
                id: nextId, // Set ID manual
                ...body,
                user_id: user.id,
                jumlah_penumpang: parseInt(body.jumlah_penumpang),
                // Konversi tanggal jam ke objek Date
                tanggal_jam_berangkat: new Date(body.tanggal_jam_berangkat),
                status: 'Pending Asmen/KKU',
                barcode_pemohon: barcode
            }
        });

        // Logika pengiriman notifikasi ke pihak terkait
        // Mapping departemen ke Asmen yang sesuai
        const deptToAsmenMap = {
            'Perencanaan': 'Asmen Perencanaan',
            'Pemeliharaan': 'Asmen Pemeliharaan',
            'Operasi Sistem Distribusi': 'Asmen Operasi',
            'Fasilitas Operasi': 'Asmen Fasop',
            // Departemen lain yang dihandle KKU:
            // KKU, K3L & KAM, Pengadaan, UP3
        };

        const targetRoles = []; // Security TIDAK dapat notif di awal

        if (deptToAsmenMap[body.bagian]) {
            // Jika departemen punya Asmen spesifik, kirim ke Asmen tersebut
            targetRoles.push(deptToAsmenMap[body.bagian]);
        } else {
            // Jika departemen lain (KKU, K3L & KAM, Pengadaan, UP3), kirim ke KKU
            targetRoles.push('KKU');
        }

        // Kirim notifikasi melalui sistem notifikasi
        await notifyRoles(targetRoles, {
            type: 'Permohonan Baru',
            module: 'Transport',
            recordId: newRequest.id,
            recordName: newRequest.nama,
            deskripsi: `Permohonan baru dari ${newRequest.nama} tujuan ${newRequest.tujuan}`
        });

        return NextResponse.json(newRequest);
    } catch (err) {
        console.error("API Error [POST /api/requests]:", err);
        return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
    }
}
