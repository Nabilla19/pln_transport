import { PrismaClient } from '@prisma/client';

/**
 * Konfigurasi Koneksi Database (Prisma Client)
 * 
 * Deskripsi: Singleton pattern untuk Prisma Client untuk mencegah pembuatan
 * banyak koneksi database yang tidak perlu saat masa pengembangan (development).
 */
const globalForPrisma = global;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // Menampilkan log query SQL di console saat development
        log: ['query'],
    });

// Simpan instance prisma ke global variable jika bukan di production
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
