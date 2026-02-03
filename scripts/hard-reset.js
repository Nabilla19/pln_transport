// Script untuk BENAR-BENAR reset ID dari 1 dengan cara yang lebih agresif
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function hardResetDatabase() {
    try {
        console.log('🔥 HARD RESET - Menghapus SEMUA data transport...');

        // Delete in correct order (child tables first)
        await prisma.$executeRawUnsafe('DELETE FROM transport_security_logs');
        console.log('✅ Security logs dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_fleet');
        console.log('✅ Fleet assignments dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_approvals');
        console.log('✅ Approvals dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_requests');
        console.log('✅ Requests dihapus');

        // Force reset auto-increment to 1 (TiDB compatible)
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_INCREMENT = 1');
            console.log('✅ Auto-increment direset ke 1 (Method 1)');
        } catch (e) {
            console.log('⚠️  Method 1 gagal, coba method 2...');
            // Alternative method for TiDB
            await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_ID_CACHE = 1');
            console.log('✅ Auto-increment direset ke 1 (Method 2 - TiDB)');
        }

        console.log('\n🎉 Database berhasil direset! Permohonan baru HARUS mulai dari ID #1');
        console.log('📝 Coba buat permohonan baru sekarang!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  TiDB Cloud mungkin tidak support reset auto-increment.');
        console.log('💡 Solusi: Gunakan ID yang ada tapi tampilkan sebagai #1, #2, #3');
    } finally {
        await prisma.$disconnect();
    }
}

hardResetDatabase();
