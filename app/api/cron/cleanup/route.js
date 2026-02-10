import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Endpoint GET /api/cron/cleanup
 * 
 * Deskripsi: Membersihkan permohonan yang "basi" secara otomatis.
 * Kriteria: Status 'Ready' tgl keberangkatan < Hari Ini (lewat tengah malam).
 * Aksi: Set status 'Batal', dan kembalikan mobil ke status 'Available'.
 */
export async function GET() {
    try {
        console.log('[Cleanup Job] Memulai pengecekan permohonan basi...');

        // Ambil waktu tengah malam hari ini (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Cari permohonan yang statusnya 'Ready' tapi tanggal berangkat < hari ini
        const staleRequests = await prisma.transportRequest.findMany({
            where: {
                status: 'Ready',
                tanggal_jam_berangkat: {
                    lt: today
                }
            },
            include: {
                fleet: true
            }
        });

        if (staleRequests.length === 0) {
            return NextResponse.json({ message: 'Tidak ada permohonan basi hari ini.' });
        }

        console.log(`[Cleanup Job] Menemukan ${staleRequests.length} permohonan basi.`);

        const results = await prisma.$transaction(async (tx) => {
            const updates = [];

            for (const request of staleRequests) {
                // a. Update status permohonan jadi 'Batal'
                updates.push(
                    tx.transportRequest.update({
                        where: { id: request.id },
                        data: { status: 'Batal' }
                    })
                );

                // b. Jika ada armada yang ditugaskan, kembalikan status mobil jadi Available
                if (request.fleet && request.fleet.length > 0) {
                    const platNomor = request.fleet[0].plat_nomor;
                    if (platNomor) {
                        updates.push(
                            tx.transportVehicle.update({
                                where: { plat_nomor: platNomor },
                                data: { status: 'Available' }
                            })
                        );
                    }
                }
            }

            return await Promise.all(updates);
        });

        console.log(`[Cleanup Job] Berhasil membatalkan ${staleRequests.length} permohonan.`);

        return NextResponse.json({
            message: `Cleanup berhasil. ${staleRequests.length} permohonan dibatalkan.`,
            cancelledIds: staleRequests.map(r => r.id)
        });

    } catch (err) {
        console.error('[Cleanup Job Error]:', err);
        return NextResponse.json({ message: 'Gagal menjalankan cleanup', error: err.message }, { status: 500 });
    }
}
