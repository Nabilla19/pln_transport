const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking auto-increment status...\n');

    // Cek current auto-increment value
    const result = await prisma.$queryRawUnsafe(
        "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transport_requests'"
    );

    console.log('Current AUTO_INCREMENT:', result[0]?.AUTO_INCREMENT || 'unknown');

    // Cek jumlah request
    const count = await prisma.transportRequest.count();
    console.log('Total requests in DB:', count);

    if (count > 0) {
        const requests = await prisma.transportRequest.findMany({
            select: { id: true },
            orderBy: { id: 'asc' }
        });
        console.log('Request IDs:', requests.map(r => r.id).join(', '));
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
