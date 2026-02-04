const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk reset auto-increment ID transport_requests
 * 
 * Jalankan dengan: node scripts/reset-request-id.js
 */

async function main() {
    console.log('🔄 Resetting transport_requests auto-increment...\n');

    try {
        // 1. Cek ID terakhir yang ada
        const lastRequest = await prisma.transportRequest.findFirst({
            orderBy: { id: 'desc' }
        });

        const nextId = lastRequest ? lastRequest.id + 1 : 1;
        console.log(`📊 Last request ID: ${lastRequest?.id || 'none'}`);
        console.log(`🎯 Next ID will be: ${nextId}\n`);

        // 2. Reset auto-increment ke ID berikutnya
        await prisma.$executeRawUnsafe(
            `ALTER TABLE transport_requests AUTO_INCREMENT = ${nextId}`
        );

        console.log(`✅ Auto-increment reset to ${nextId}`);
        console.log('\n💡 Request ID sekarang akan mulai dari #' + nextId);

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
