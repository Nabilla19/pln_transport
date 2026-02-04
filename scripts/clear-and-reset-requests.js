const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk menghapus semua request dan reset ID ke 1
 * 
 * ⚠️  WARNING: Ini akan menghapus SEMUA data transport requests!
 * 
 * Jalankan dengan: node scripts/clear-and-reset-requests.js
 */

async function main() {
    console.log('⚠️  WARNING: This will DELETE ALL transport requests!\n');
    console.log('Waiting 3 seconds... Press Ctrl+C to cancel\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🗑️  Deleting all transport requests...\n');

    try {
        // 1. Hapus semua data terkait (foreign keys)
        console.log('Deleting security logs...');
        await prisma.transportSecurityLog.deleteMany({});

        console.log('Deleting fleet assignments...');
        await prisma.transportFleet.deleteMany({});

        console.log('Deleting approvals...');
        await prisma.transportApproval.deleteMany({});

        console.log('Deleting requests...');
        const deleted = await prisma.transportRequest.deleteMany({});
        console.log(`✅ Deleted ${deleted.count} requests\n`);

        // 2. Reset auto-increment ke 1
        console.log('Resetting auto-increment to 1...');
        await prisma.$executeRawUnsafe(
            `ALTER TABLE transport_requests AUTO_INCREMENT = 1`
        );

        console.log('✅ Auto-increment reset to 1\n');
        console.log('💡 Request ID sekarang akan mulai dari #1');
        console.log('📝 Silakan buat request baru untuk testing');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
