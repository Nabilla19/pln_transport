const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk menghapus semua data kendaraan dan menambahkan data kendaraan real
 * 
 * Jalankan dengan: node scripts/update-real-vehicles.js
 */

async function main() {
    console.log('🚗 Updating vehicle database with real data...\n');

    // 1. Hapus semua data kendaraan yang ada
    console.log('🗑️  Deleting old vehicle data...');
    const deleted = await prisma.transportVehicle.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} vehicles\n`);

    // 2. Data kendaraan real PLN UP2D Riau
    const realVehicles = [
        {
            brand: 'Toyota',
            model: 'Innova Zenix',
            plat_nomor: 'BM 1860 AAB',
            status: 'Available',
            tahun: 2023
        },
        {
            brand: 'Toyota',
            model: 'Double Cabin Hilux',
            plat_nomor: 'BM 8439 QI',
            status: 'Available',
            tahun: 2022
        },
        {
            brand: 'Daihatsu',
            model: 'Terios',
            plat_nomor: 'BM 1105 AAC',
            status: 'Available',
            tahun: 2021
        },
        {
            brand: 'Toyota',
            model: 'Rush',
            plat_nomor: 'BM 1153 AAC',
            status: 'Available',
            tahun: 2021
        }
    ];

    // 3. Insert data kendaraan real
    console.log('➕ Adding real vehicle data...');
    for (const vehicle of realVehicles) {
        try {
            await prisma.transportVehicle.create({
                data: vehicle
            });
            console.log(`✅ Added: ${vehicle.brand} ${vehicle.model} (${vehicle.plat_nomor})`);
        } catch (error) {
            console.error(`❌ Error adding ${vehicle.brand} ${vehicle.model}:`, error.message);
        }
    }

    // 4. Tampilkan summary
    const totalVehicles = await prisma.transportVehicle.count();
    const availableVehicles = await prisma.transportVehicle.count({
        where: { status: 'Available' }
    });

    console.log('\n📊 Summary:');
    console.log(`Total kendaraan: ${totalVehicles}`);
    console.log(`Kendaraan tersedia: ${availableVehicles}`);

    // Tampilkan semua kendaraan
    const allVehicles = await prisma.transportVehicle.findMany({
        orderBy: { brand: 'asc' }
    });

    console.log('\n📋 Daftar Kendaraan:');
    allVehicles.forEach(v => {
        console.log(`   ${v.brand} ${v.model} - ${v.plat_nomor} [${v.status}]`);
    });

    console.log('\n✅ Update completed!');
    console.log('\n💡 Info: Sistem sudah realtime!');
    console.log('   - Kendaraan yang sedang digunakan (status In Use atau request Ready/In Progress) tidak akan muncul di dropdown');
    console.log('   - Setelah kendaraan kembali (request selesai), otomatis muncul lagi di dropdown');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
