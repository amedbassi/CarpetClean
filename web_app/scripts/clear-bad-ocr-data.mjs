import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Clear out the bad "Total Items" values that were written by the faulty OCR parser
    const result = await prisma.carpetItem.updateMany({
        where: { individualClient: 'Total Items' },
        data: { individualClient: null },
    });
    console.log(`✅ Cleared ${result.count} items with bad "Total Items" value.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
