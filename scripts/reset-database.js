// Script untuk reset semua data transport dan mulai ID dari #1
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('🗑️  Menghapus semua data transport...');

        // Delete in correct order (child tables first)
        await prisma.transportSecurityLog.deleteMany({});
        console.log('✅ Security logs dihapus');

        await prisma.transportFleet.deleteMany({});
        console.log('✅ Fleet assignments dihapus');

        await prisma.transportApproval.deleteMany({});
        console.log('✅ Approvals dihapus');

        await prisma.transportRequest.deleteMany({});
        console.log('✅ Requests dihapus');

        // Reset auto-increment via raw SQL
        await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_INCREMENT = 1');
        console.log('✅ Auto-increment direset ke 1');

        console.log('\n🎉 Database berhasil direset! Permohonan baru akan mulai dari ID #1');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
