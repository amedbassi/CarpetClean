/**
 * Script to clear the database by deleting all carpet items and orders.
 * Use with caution.
 */
import prisma from '../src/lib/prisma';

async function main() {
    console.log('Clearing database...');

    // Order of deletion matters if there are foreign keys, but Prisma handle it or we delete children first
    await prisma.carpetItem.deleteMany({});
    console.log('Deleted all carpet items.');

    await prisma.order.deleteMany({});
    console.log('Deleted all orders.');

    console.log('Database cleared successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
