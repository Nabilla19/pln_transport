const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk menambahkan tipe/brand kendaraan ke dropdown
 * 
 * Jalankan dengan: node scripts/seed-vehicle-types.js
 */

async function main() {
    console.log('🚗 Seeding vehicle types...\n');

    // Data tipe kendaraan
    const vehicleTypes = [
        { type_name: 'Toyota', description: 'Kendaraan merek Toyota' },
        { type_name: 'Daihatsu', description: 'Kendaraan merek Daihatsu' }
    ];

    // Cek apakah sudah ada data
    const existingCount = await prisma.transportVehicleType.count();

    if (existingCount > 0) {
        console.log(`⚠️  Database sudah memiliki ${existingCount} tipe kendaraan.`);
        console.log('Menghapus data lama...\n');
        await prisma.transportVehicleType.deleteMany({});
    }

    // Insert data tipe kendaraan
    console.log('➕ Adding vehicle types...');
    for (const type of vehicleTypes) {
        try {
            await prisma.transportVehicleType.create({
                data: type
            });
            console.log(`✅ Added: ${type.type_name}`);
        } catch (error) {
            console.error(`❌ Error adding ${type.type_name}:`, error.message);
        }
    }

    // Tampilkan summary
    const total = await prisma.transportVehicleType.count();
    console.log(`\n📊 Total tipe kendaraan: ${total}`);

    const allTypes = await prisma.transportVehicleType.findMany();
    console.log('\n📋 Daftar Tipe Kendaraan:');
    allTypes.forEach(t => {
        console.log(`   - ${t.type_name}`);
    });

    console.log('\n✅ Seeding completed!');
    console.log('\n💡 Sekarang dropdown "Macam Kendaraan" di form permohonan akan menampilkan Toyota dan Daihatsu');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
