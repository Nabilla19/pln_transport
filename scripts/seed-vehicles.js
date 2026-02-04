const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script untuk menambahkan data kendaraan sample ke database
 * 
 * Jalankan dengan: node scripts/seed-vehicles.js
 */

async function main() {
    console.log('🚗 Seeding vehicle data...');

    // Data kendaraan sample
    const vehicles = [
        // Toyota
        { brand: 'Toyota', model: 'Avanza', plat_nomor: 'BM 1234 AB', status: 'Available', tahun: 2020 },
        { brand: 'Toyota', model: 'Innova', plat_nomor: 'BM 5678 CD', status: 'Available', tahun: 2021 },
        { brand: 'Toyota', model: 'Fortuner', plat_nomor: 'BM 9012 EF', status: 'Available', tahun: 2022 },
        { brand: 'Toyota', model: 'Hilux', plat_nomor: 'BM 3456 GH', status: 'Available', tahun: 2021 },

        // Daihatsu
        { brand: 'Daihatsu', model: 'Xenia', plat_nomor: 'BM 7890 IJ', status: 'Available', tahun: 2020 },
        { brand: 'Daihatsu', model: 'Terios', plat_nomor: 'BM 2345 KL', status: 'Available', tahun: 2021 },
        { brand: 'Daihatsu', model: 'Gran Max', plat_nomor: 'BM 6789 MN', status: 'Available', tahun: 2019 },
        { brand: 'Daihatsu', model: 'Luxio', plat_nomor: 'BM 0123 OP', status: 'Available', tahun: 2020 },
    ];

    // Cek apakah sudah ada data kendaraan
    const existingCount = await prisma.transportVehicle.count();

    if (existingCount > 0) {
        console.log(`⚠️  Database sudah memiliki ${existingCount} kendaraan.`);
        console.log('Apakah Anda ingin menambahkan data sample? (Ctrl+C untuk batal)');

        // Tunggu 3 detik
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Insert data kendaraan
    for (const vehicle of vehicles) {
        try {
            // Cek apakah plat nomor sudah ada
            const existing = await prisma.transportVehicle.findUnique({
                where: { plat_nomor: vehicle.plat_nomor }
            });

            if (existing) {
                console.log(`⏭️  Skip: ${vehicle.brand} ${vehicle.model} (${vehicle.plat_nomor}) - sudah ada`);
            } else {
                await prisma.transportVehicle.create({
                    data: vehicle
                });
                console.log(`✅ Added: ${vehicle.brand} ${vehicle.model} (${vehicle.plat_nomor})`);
            }
        } catch (error) {
            console.error(`❌ Error adding ${vehicle.brand} ${vehicle.model}:`, error.message);
        }
    }

    // Tampilkan summary
    const totalVehicles = await prisma.transportVehicle.count();
    const availableVehicles = await prisma.transportVehicle.count({
        where: { status: 'Available' }
    });

    console.log('\n📊 Summary:');
    console.log(`Total kendaraan: ${totalVehicles}`);
    console.log(`Kendaraan tersedia: ${availableVehicles}`);

    // Tampilkan breakdown per brand
    const toyota = await prisma.transportVehicle.count({ where: { brand: { contains: 'Toyota', mode: 'insensitive' } } });
    const daihatsu = await prisma.transportVehicle.count({ where: { brand: { contains: 'Daihatsu', mode: 'insensitive' } } });

    console.log(`\nBreakdown:`);
    console.log(`- Toyota: ${toyota}`);
    console.log(`- Daihatsu: ${daihatsu}`);

    console.log('\n✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
