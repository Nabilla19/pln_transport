// SUPER RESET - Paksa reset auto-increment ke 1
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function superReset() {
    try {
        console.log('🔥 SUPER RESET - Memaksa ID mulai dari 1...\n');

        // Disable foreign key checks
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

        // TRUNCATE tables (this resets auto-increment automatically)
        await prisma.$executeRawUnsafe('TRUNCATE TABLE transport_security_logs');
        console.log('✅ Security logs truncated');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE transport_fleet');
        console.log('✅ Fleet truncated');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE transport_approvals');
        console.log('✅ Approvals truncated');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE transport_requests');
        console.log('✅ Requests truncated');

        // Re-enable foreign key checks
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n🎉 SUPER RESET SELESAI!');
        console.log('📝 Permohonan baru PASTI mulai dari ID #1');
        console.log('🔄 Restart server Next.js sekarang!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

superReset();
