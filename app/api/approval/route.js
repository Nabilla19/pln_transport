import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifyRoles } from '@/lib/notifications';

/**
 * Endpoint POST: Menangani Persetujuan (Approval) Permohonan
 * 
 * Deskripsi: Melakukan verifikasi hak akses, menyimpan data persetujuan, 
 * memperbarui status permohonan, dan mengirim notifikasi untuk penugasan armada.
 */
export async function POST(req) {
    // Verifikasi autentikasi user
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Membatasi akses: Hanya Asmen atau KKU yang boleh melakukan approval
    if (!user.role.includes('Asmen') && user.role !== 'KKU') {
        return NextResponse.json({ message: 'Terlarang: Anda tidak memiliki hak akses persetujuan' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { requestId, catatan, tujuan, keperluan, macam_kendaraan, jumlah_penumpang } = body;

        // Mencari data permohonan yang akan di-approve
        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request) return NextResponse.json({ message: 'Permohonan Tidak Ditemukan' }, { status: 404 });

        // Pemetaan Role Asmen ke Bagian/Departemen
        const mapping = {
            'Asmen Perencanaan': 'Perencanaan',
            'Asmen Pemeliharaan': 'Pemeliharaan',
            'Asmen Operasi': 'Operasi',
            'Asmen Fasilitas Operasi': 'Fasilitas Operasi'
        };
        const asmenFields = Object.values(mapping);

        // Verifikasi apakah user berwenang meng-approve bagian tersebut
        let isAuthorized = false;
        if (mapping[user.role] === request.bagian) isAuthorized = true;
        // KKU berwenang meng-approve bagian yang tidak dimiliki oleh Asmen spesifik
        if (user.role === 'KKU' && !asmenFields.includes(request.bagian)) isAuthorized = true;

        if (!isAuthorized) {
            return NextResponse.json({ message: `Akses Ditolak: Role ${user.role} tidak mengelola bidang ${request.bagian}` }, { status: 403 });
        }

        // Generate barcode untuk persetujuan Asmen/KKU
        const barcode = crypto.createHash('md5')
            .update(`ASMEN-${user.id}-${Date.now()}-${requestId}`)
            .digest('hex');

        // Menggunakan Transaksi Database untuk memastikan kedua operasi berhasil
        await prisma.$transaction([
            // 1. Simpan data persetujuan ke tabel transport_approvals
            prisma.transportApproval.create({
                data: {
                    request_id: parseInt(requestId),
                    asmen_id: user.id,
                    is_approved: true,
                    catatan,
                    approved_at: new Date(),
                    barcode_asmen: barcode
                }
            }),
            // 2. Update status permohonan menjadi 'Menunggu Surat Jalan'
            prisma.transportRequest.update({
                where: { id: parseInt(requestId) },
                data: {
                    status: 'Menunggu Surat Jalan',
                    // Update field jika diubah oleh pemberi persetujuan
                    ...(tujuan && { tujuan }),
                    ...(keperluan && { keperluan }),
                    ...(macam_kendaraan && { macam_kendaraan }),
                    ...(jumlah_penumpang && { jumlah_penumpang: parseInt(jumlah_penumpang) })
                }
            })
        ]);

        // Kirim notifikasi ke KKU untuk segera menugaskan armada (Assign Fleet)
        await notifyRoles(['KKU'], {
            type: 'Assign Fleet Needed',
            module: 'Transport',
            recordId: parseInt(requestId),
            recordName: request.nama,
            deskripsi: `Permohonan dari ${request.nama} telah disetujui. Silakan tugaskan armada.`
        });

        return NextResponse.json({ message: `Permohonan Bidang ${request.bagian} telah disetujui` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Kesalahan Server' }, { status: 500 });
    }
}
