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

        // Ambil waktu sekarang
        const now = new Date();

        // Ambil waktu tengah malam hari ini (00:00:00) untuk rule "lewat hari"
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);

        // 1. Cari permohonan yang statusnya 'Ready'
        const readyRequests = await prisma.transportRequest.findMany({
            where: {
                status: 'Ready'
            },
            include: {
                fleet: {
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            }
        });

        // Tentukan mana yang "basi" berdasarkan aturan:
        // Rule: Sudah lewat 1 jam dari waktu penugasan armada (Fleet Assignment)
        const staleRequests = readyRequests.filter(request => {
            // Kita hanya mengecek permohonan yang sudah ada penugasan fleet-nya
            const fleetAssignment = request.fleet?.[0];
            if (!fleetAssignment) return false;

            const jamPenugasan = new Date(fleetAssignment.created_at);
            const oneHourLater = new Date(jamPenugasan.getTime() + (60 * 60 * 1000));

            return now > oneHourLater;
        });

        if (staleRequests.length === 0) {
            return NextResponse.json({ message: 'Tidak ada permohonan basi saat ini.' });
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
