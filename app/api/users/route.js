/**
 * API Route: Manajemen Pengguna (/api/users)
 * 
 * Deskripsi: Endpoint untuk mengelola akun pengguna (GET untuk melihat daftar, 
 * POST untuk menambah pengguna baru). Dibatasi khusus untuk role Admin.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/lib/auth';

/**
 * Mendapatkan Daftar Seluruh Pengguna
 * Filter: Hanya Admin yang dapat mengakses.
 */
export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        // Proteksi: Hanya role Admin yang diizinkan
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

/**
 * Membuat Akun Pengguna Baru
 * Alur: Validasi input -> Cek Duplikasi Email -> Hash Password -> Simpan ke DB.
 */
export async function POST(request) {
    try {
        const user = await verifyAuth(request);

        // Proteksi: Hanya Admin yang boleh membuat akun baru
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();

        // Validasi: Pastikan semua data terisi
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Validasi: Password minimal 6 karakter
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Validasi: Cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Enkripsi password menggunakan Bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Eksekusi pembuatan data user baru
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('POST /api/users error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
