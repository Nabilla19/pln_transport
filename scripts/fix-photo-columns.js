// Fix kolom foto yang terlalu kecil
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPhotoColumns() {
    try {
        console.log('🔧 Memperbaiki kolom foto...\n');

        // Alter table to change column types to LONGTEXT
        await prisma.$executeRawUnsafe(`
            ALTER TABLE transport_security_logs 
            MODIFY COLUMN foto_driver_berangkat LONGTEXT,
            MODIFY COLUMN foto_km_berangkat LONGTEXT,
            MODIFY COLUMN foto_driver_kembali LONGTEXT,
            MODIFY COLUMN foto_km_kembali LONGTEXT
        `);

        console.log('✅ Kolom foto berhasil diubah ke LONGTEXT');
        console.log('📸 Sekarang bisa upload foto besar!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixPhotoColumns();
