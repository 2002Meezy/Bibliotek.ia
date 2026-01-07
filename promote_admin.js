const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'aaaaaa@gmail.com';
    console.log(`Promoting user ${email} to admin...`);
    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'admin' },
        });
        console.log(`Success! User ${user.name} (${user.email}) is now an ${user.role}.`);
    } catch (e) {
        console.error('Error promoting user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
