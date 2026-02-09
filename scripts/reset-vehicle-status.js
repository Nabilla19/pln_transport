// Script untuk reset semua status kendaraan menjadi Available
// Jalankan dengan: node scripts/reset-vehicle-status.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetVehicleStatus() {
    try {
        console.log('🚗 Mereset status semua kendaraan...\n');

        // Update semua kendaraan menjadi Available dan hapus last_request_id
        const result = await prisma.transportVehicle.updateMany({
            data: {
                status: 'Available',
                last_request_id: null
            }
        });

        console.log(`✅ Berhasil update ${result.count} kendaraan\n`);

        // Tampilkan hasil
        const vehicles = await prisma.transportVehicle.findMany({
            orderBy: { id: 'asc' }
        });

        console.log('📊 STATUS KENDARAAN SEKARANG:');
        console.log('============================');
        vehicles.forEach(v => {
            console.log(`${v.id}. ${v.brand} ${v.model} (${v.plat_nomor}) - Status: ${v.status}`);
        });

        console.log('\n✨ Semua kendaraan sekarang Available!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

resetVehicleStatus()
    .catch((error) => {
        console.error('❌ Reset gagal:', error);
        process.exit(1);
    });
