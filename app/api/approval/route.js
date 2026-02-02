import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Strictly allow only Asmen or KKU
    if (!user.role.includes('Asmen') && user.role !== 'KKU') {
        return NextResponse.json({ message: 'Forbidden: No approval rights' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { requestId, catatan, tujuan, keperluan, macam_kendaraan, jumlah_penumpang } = body;

        const request = await prisma.transportRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request) return NextResponse.json({ message: 'Request Not Found' }, { status: 404 });

        // Department-based enforcement
        const mapping = {
            'Asmen Perencanaan': 'Perencanaan',
            'Asmen Pemeliharaan': 'Pemeliharaan',
            'Asmen Operasi': 'Operasi',
            'Asmen Fasilitas Operasi': 'Fasilitas Operasi'
        };
        const asmenFields = Object.values(mapping);

        let isAuthorized = false;
        if (mapping[user.role] === request.bagian) isAuthorized = true;
        if (user.role === 'KKU' && !asmenFields.includes(request.bagian)) isAuthorized = true;

        if (!isAuthorized) {
            return NextResponse.json({ message: `Akses Ditolak: Role ${user.role} tidak mengelola bidang ${request.bagian}` }, { status: 403 });
        }

        const barcode = crypto.createHash('md5')
            .update(`ASMEN-${user.id}-${Date.now()}-${requestId}`)
            .digest('hex');

        // Atomic update: Transaction
        await prisma.$transaction([
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
            prisma.transportRequest.update({
                where: { id: parseInt(requestId) },
                data: {
                    status: 'Menunggu Surat Jalan',
                    // Update fields if provided by the approver
                    ...(tujuan && { tujuan }),
                    ...(keperluan && { keperluan }),
                    ...(macam_kendaraan && { macam_kendaraan }),
                    ...(jumlah_penumpang && { jumlah_penumpang: parseInt(jumlah_penumpang) })
                }
            })
        ]);

        return NextResponse.json({ message: `Permohonan Bidang ${request.bagian} telah disetujui` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
