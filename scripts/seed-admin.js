const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdmin() {
    try {
        console.log('🌱 Menyiapkan Akun Admin di Database Baru...');

        const email = 'admin@pln.co.id';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.upsert({
            where: { email },
            update: {
                name: 'Hendri',
                password: hashedPassword
            },
            create: {
                id: 1,
                name: 'Hendri',
                email: email,
                password: hashedPassword,
                role: 'Admin',
                is_active: true
            }
        });

        console.log('\n✅ SELESAI!');
        console.log('📧 Email: admin@pln.co.id');
        console.log('🔑 Password: admin123');

    } catch (err) {
        console.error('❌ Error Seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
