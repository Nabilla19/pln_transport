// Script untuk reset database LOKAL (MAMP) - ID mulai dari #1
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetLocalDatabase() {
    try {
        console.log('🔥 RESET DATABASE LOKAL (MAMP)...');

        // Delete in correct order (child tables first)
        await prisma.$executeRawUnsafe('DELETE FROM transport_security_logs');
        console.log('✅ Security logs dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_fleet');
        console.log('✅ Fleet assignments dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_approvals');
        console.log('✅ Approvals dihapus');

        await prisma.$executeRawUnsafe('DELETE FROM transport_requests');
        console.log('✅ Requests dihapus');

        // Reset auto-increment to 1 (MySQL/MAMP)
        await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_INCREMENT = 1');
        console.log('✅ Auto-increment direset ke 1');

        console.log('\n🎉 Database LOKAL berhasil direset!');
        console.log('📝 Permohonan baru akan mulai dari ID #1');
        console.log('💡 Setelah semua OK, baru deploy ke TiDB dengan data fresh!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  Pastikan MAMP sudah jalan!');
    } finally {
        await prisma.$disconnect();
    }
}

resetLocalDatabase();
