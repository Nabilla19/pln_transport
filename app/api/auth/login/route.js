import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Endpoint API untuk Login Pengguna
 * 
 * Deskripsi: Melakukan verifikasi kredensial pengguna (email & password)
 * dan mengembalikan token JWT jika berhasil.
 */
export async function POST(req) {
    try {
        // Mengambil data email dan password dari body request
        const { email, password } = await req.json();
        console.log('🔐 Percobaan login untuk:', email);

        // Mencari pengguna di database berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Jika pengguna tidak ditemukan
        if (!user) {
            console.log('❌ Pengguna tidak ditemukan:', email);
            return NextResponse.json({ message: 'Kredensial tidak valid' }, { status: 400 });
        }

        console.log('✅ Pengguna ditemukan:', user.name, user.email);

        // Membandingkan password yang diinput dengan password terenkripsi di database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔍 Hasil pengecekan password:', isMatch);

        // Jika password tidak cocok
        if (!isMatch) {
            console.log('❌ Password salah');
            return NextResponse.json({ message: 'Kredensial tidak valid' }, { status: 400 });
        }

        // Membuat token JWT yang berlaku selama 1 hari
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ Login berhasil untuk:', user.email);

        // Mengirimkan respon sukses beserta token dan data pengguna
        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        // Menangani jika terjadi error sistem
        console.error('💥 Error saat login:', err);

        // Cek jika error dari Prisma (database)
        if (err.code && err.code.startsWith('P')) {
            return NextResponse.json({
                message: 'Kesalahan Database (Cek DATABASE_URL di Vercel)',
                details: err.message
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Kesalahan Server',
            details: err.message
        }, { status: 500 });
    }
}
