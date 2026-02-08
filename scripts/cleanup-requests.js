// Script untuk menghapus semua data permohonan transport
// Jalankan dengan: node scripts/cleanup-requests.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupRequests() {
    try {
        console.log('🧹 Memulai cleanup data permohonan...\n');

        // Nonaktifkan foreign key checks (via raw query)
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

        // Hapus security logs
        const deletedSecurityLogs = await prisma.transportSecurityLog.deleteMany({});
        console.log(`✅ Dihapus ${deletedSecurityLogs.count} security logs`);

        // Hapus fleet assignments
        const deletedFleet = await prisma.transportFleet.deleteMany({});
        console.log(`✅ Dihapus ${deletedFleet.count} fleet assignments`);

        // Hapus approvals
        const deletedApprovals = await prisma.transportApproval.deleteMany({});
        console.log(`✅ Dihapus ${deletedApprovals.count} approvals`);

        // Hapus transport requests
        const deletedRequests = await prisma.transportRequest.deleteMany({});
        console.log(`✅ Dihapus ${deletedRequests.count} permohonan transport`);

        // Reset auto-increment
        await prisma.$executeRaw`ALTER TABLE transport_requests AUTO_INCREMENT = 1`;
        await prisma.$executeRaw`ALTER TABLE transport_approvals AUTO_INCREMENT = 1`;
        await prisma.$executeRaw`ALTER TABLE transport_fleet AUTO_INCREMENT = 1`;
        await prisma.$executeRaw`ALTER TABLE transport_security_logs AUTO_INCREMENT = 1`;
        console.log('\n✅ Auto-increment direset ke 1');

        // Aktifkan kembali foreign key checks
        await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

        // Verifikasi
        console.log('\n📊 VERIFIKASI HASIL:');
        console.log('==================');

        const requestCount = await prisma.transportRequest.count();
        const approvalCount = await prisma.transportApproval.count();
        const fleetCount = await prisma.transportFleet.count();
        const securityCount = await prisma.transportSecurityLog.count();
        const userCount = await prisma.user.count();
        const vehicleCount = await prisma.transportVehicle.count();

        console.log(`\nTabel Permohonan (harus 0):`);
        console.log(`  - transport_requests: ${requestCount}`);
        console.log(`  - transport_approvals: ${approvalCount}`);
        console.log(`  - transport_fleet: ${fleetCount}`);
        console.log(`  - transport_security_logs: ${securityCount}`);

        console.log(`\nTabel Master (tetap ada):`);
        console.log(`  - users: ${userCount}`);
        console.log(`  - transport_vehicles: ${vehicleCount}`);

        console.log('\n✨ Cleanup selesai! Permohonan baru akan mulai dari ID #1\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanupRequests()
    .catch((error) => {
        console.error('❌ Cleanup gagal:', error);
        process.exit(1);
    });
