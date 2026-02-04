const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk FORCE reset auto-increment dengan cara yang lebih agresif
 * Cocok untuk TiDB Cloud yang mungkin punya behavior berbeda
 */

async function main() {
    console.log('🔧 FORCE resetting auto-increment...\n');

    try {
        // 1. Hapus semua data
        console.log('Step 1: Deleting all data...');
        await prisma.transportSecurityLog.deleteMany({});
        await prisma.transportFleet.deleteMany({});
        await prisma.transportApproval.deleteMany({});
        await prisma.transportRequest.deleteMany({});
        console.log('✅ All data deleted\n');

        // 2. Coba beberapa cara reset auto-increment
        console.log('Step 2: Trying multiple reset methods...\n');

        // Method 1: ALTER TABLE
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_INCREMENT = 1');
            console.log('✅ Method 1 (ALTER TABLE) success');
        } catch (e) {
            console.log('⚠️  Method 1 failed:', e.message);
        }

        // Method 2: Truncate (lebih agresif)
        try {
            await prisma.$executeRawUnsafe('TRUNCATE TABLE transport_requests');
            console.log('✅ Method 2 (TRUNCATE) success');
        } catch (e) {
            console.log('⚠️  Method 2 failed:', e.message);
        }

        // 3. Insert dummy row dengan ID 1, lalu hapus
        try {
            console.log('\nStep 3: Forcing ID sequence...');
            await prisma.$executeRawUnsafe(`
                INSERT INTO transport_requests (id, user_id, nama, tujuan, keperluan, tanggal_jam_berangkat, status) 
                VALUES (1, 1, 'DUMMY', 'DUMMY', 'DUMMY', NOW(), 'DUMMY')
            `);
            await prisma.$executeRawUnsafe('DELETE FROM transport_requests WHERE id = 1');
            await prisma.$executeRawUnsafe('ALTER TABLE transport_requests AUTO_INCREMENT = 1');
            console.log('✅ Force sequence success');
        } catch (e) {
            console.log('⚠️  Force sequence failed:', e.message);
        }

        console.log('\n✅ Reset completed!');
        console.log('\n💡 Coba buat request baru sekarang');
        console.log('   Jika masih loncat, ini adalah behavior TiDB Cloud yang tidak bisa diubah');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
