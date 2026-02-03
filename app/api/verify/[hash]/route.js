/**
 * API Route: Verifikasi Barcode/QR (/api/verify/[hash])
 * 
 * Deskripsi: Endpoint publik (tanpa token) untuk memverifikasi keaslian hash QR Code.
 * Mengecek apakah hash tersebut milik Pemohon, Asmen (Persetujuan), atau Fleet (Surat Jalan).
 */

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    // Penanganan parameter dinamis untuk kompatibilitas Next.js 14/15/16
    const resolvedParams = params instanceof Promise ? await params : params;
    const hash = resolvedParams?.hash;

    try {
        // 1. Cek apakah hash milik Pemohon (Pendaftaran Awal)
        const request = await prisma.transportRequest.findFirst({
            where: { barcode_pemohon: hash },
            include: { user: true }
        });
        if (request) {
            return NextResponse.json({
                role: `Pemohon (${request.nama})`,
                timestamp: request.created_at
            });
        }

        // 2. Cek apakah hash milik Approver (Persetujuan Asmen/KKU)
        const approval = await prisma.transportApproval.findFirst({
            where: { barcode_asmen: hash },
            include: { asmen: true }
        });
        if (approval) {
            return NextResponse.json({
                role: `${approval.asmen.role} (${approval.asmen.name})`,
                timestamp: approval.approved_at
            });
        }

        // 3. Cek apakah hash milik Penerbit Surat Jalan (Bagian Fleet/KKU)
        const fleet = await prisma.transportFleet.findFirst({
            where: { barcode_fleet: hash },
            include: { admin: true }
        });
        if (fleet) {
            return NextResponse.json({
                role: `Penerbit Surat Jalan (${fleet.admin.role} - ${fleet.admin.name})`,
                timestamp: fleet.created_at
            });
        }

        // Jika hash tidak ditemukan di ketiga tabel tersebut
        return NextResponse.json({ message: 'Tanda tangan digital tidak valid atau tidak ditemukan' }, { status: 404 });
    } catch (err) {
        console.error("Verifikasi Error:", err);
        return NextResponse.json({ message: 'Kesalahan Server', error: err.message }, { status: 500 });
    }
}
