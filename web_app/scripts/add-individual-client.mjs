import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding individualClient column to CarpetItem...');
    try {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE "CarpetItem" ADD COLUMN IF NOT EXISTS "individualClient" TEXT;`
        );
        console.log('✅ Column added successfully (or already existed).');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
