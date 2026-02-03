// Fix auto-increment yang loncat-loncat
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAutoIncrement() {
    try {
        console.log('🔧 Memperbaiki auto-increment...\n');

        // Get the highest ID
        const lastRecord = await prisma.transportRequest.findFirst({
            orderBy: { id: 'desc' }
        });

        const nextId = lastRecord ? lastRecord.id + 1 : 1;

        console.log(`📊 ID terakhir: ${lastRecord?.id || 0}`);
        console.log(`🔢 Next ID seharusnya: ${nextId}`);

        // Reset auto-increment to next ID
        await prisma.$executeRawUnsafe(`ALTER TABLE transport_requests AUTO_INCREMENT = ${nextId}`);

        console.log(`✅ Auto-increment direset ke ${nextId}`);
        console.log('📝 Permohonan baru akan mulai dari ID #' + nextId);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixAutoIncrement();
