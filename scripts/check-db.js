// Cek status database dan auto-increment
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Mengecek database...\n');

        // Count records
        const count = await prisma.transportRequest.count();
        console.log(`📊 Jumlah data: ${count}`);

        // Get latest ID
        const latest = await prisma.transportRequest.findFirst({
            orderBy: { id: 'desc' }
        });

        if (latest) {
            console.log(`🔢 ID terakhir: ${latest.id}`);
        } else {
            console.log('✅ Database kosong!');
        }

        // Check auto-increment value
        const result = await prisma.$queryRawUnsafe(`
            SELECT AUTO_INCREMENT 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'db_transport' 
            AND TABLE_NAME = 'transport_requests'
        `);

        console.log(`⚙️  Auto-increment saat ini: ${result[0].AUTO_INCREMENT}`);

        if (result[0].AUTO_INCREMENT !== 1) {
            console.log('\n⚠️  Auto-increment BUKAN 1! Perlu direset ulang.');
        } else {
            console.log('\n✅ Auto-increment sudah benar (1)');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
