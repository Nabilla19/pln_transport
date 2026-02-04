const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vehicles = await prisma.transportVehicle.findMany();
    console.log('Total vehicles:', vehicles.length);
    console.log('\nVehicles:');
    vehicles.forEach(v => {
        console.log(`- ${v.brand} ${v.model} (${v.plat_nomor}) - Status: ${v.status}`);
    });
}

main().finally(() => prisma.$disconnect());
