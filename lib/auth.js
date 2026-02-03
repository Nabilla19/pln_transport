import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Fungsi untuk memverifikasi autentikasi pengguna
 * 
 * Deskripsi: Mengambil token dari header Authorization, memverifikasinya menggunakan JWT_SECRET,
 * dan mengembalikan data pengguna jika token valid.
 * 
 * @param {Request} req - Objek request dari Next.js
 * @returns {Object|null} - Data user dari token atau null jika tidak valid
 */
export async function verifyAuth(req) {
    // Mengambil header Authorization
    const authHeader = req.headers.get('Authorization');
    // Mencoba mengambil token (format: 'Bearer <token>')
    const token = authHeader?.replace('Bearer ', '');

    // Jika token tidak ada
    if (!token) return null;

    try {
        // Verifikasi token menggunakan secret key
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // Jika token expired atau manipulasi, return null
        return null;
    }
}
