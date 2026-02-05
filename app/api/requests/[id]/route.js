/**
 * API Route: Detail Permohonan Kendaraan (/api/requests/[id])
 * 
 * Deskripsi: Menangani pengambilan detail satu permohonan (GET) 
 * dan pemutakhiran data permohonan oleh pemohon atau admin (PUT).
 */

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Mendapatkan Detail Lengkap Permohonan
 * Termasuk data: Pemohon, Approval, Fleet, dan Log Security.
 */
export async function GET(req, { params }) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    try {
        // Penanganan parameter dinamis untuk kompatibilitas Next.js 14/15/16
        const resolvedParams = params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
        }

        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { name: true, role: true } },
                approvals: { include: { asmen: { select: { name: true, role: true } } } },
                fleet: { include: { admin: { select: { name: true, role: true } } } },
                securityLogs: {
                    orderBy: { created_at: 'desc' },
                    include: { security: { select: { name: true, role: true } } }
                }
            }
        });

        if (!request) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

        return NextResponse.json(request);
    } catch (err) {
        console.error("API Error [GET /api/requests/[id]]:", err);
        return NextResponse.json({
            message: 'Server Error',
            error: err.message
        }, { status: 500 });
    }
}

/**
 * Memperbarui Data Permohonan
 * Hanya dapat dilakukan oleh pemilik pengajuan atau role Admin.
 */
export async function PUT(req, { params }) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });

    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const id = resolvedParams?.id;
        const body = await req.json();

        // Cari data lama untuk validasi kepemilikan
        const existingRequest = await prisma.transportRequest.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingRequest) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

        // Validasi: Hanya pemilik atau Admin yang boleh mengubah data pengajuan
        if (existingRequest.user_id !== user.id && user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Jalankan update data
        const updatedRequest = await prisma.transportRequest.update({
            where: { id: parseInt(id) },
            data: {
                nama: body.nama,
                jabatan: body.jabatan,
                bagian: body.bagian,
                macam_kendaraan: body.macam_kendaraan,
                jumlah_penumpang: parseInt(body.jumlah_penumpang),
                tujuan: body.tujuan,
                keperluan: body.keperluan,
                tanggal_jam_berangkat: new Date(body.tanggal_jam_berangkat),
                lama_pakai: body.lama_pakai,
                status: body.status || existingRequest.status
            }
        });

        return NextResponse.json(updatedRequest);
    } catch (err) {
        console.error("API Error [PUT /api/requests/[id]]:", err);
        return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
    }
}
