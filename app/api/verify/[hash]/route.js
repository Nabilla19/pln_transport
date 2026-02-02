import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const { hash } = params;

    try {
        // 1. Check if it's an Applicant (Pemohon)
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

        // 2. Check if it's an Approver (Asmen/KKU Approval)
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

        // 3. Check if it's a Surat Jalan Issuer (KKU Fleet)
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

        return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
