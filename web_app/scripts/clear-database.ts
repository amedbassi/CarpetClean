import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    console.log('Starting database cleanup...');

    try {
        // Delete in correct order due to foreign key constraints
        console.log('Deleting carpet items...');
        const deletedItems = await prisma.carpetItem.deleteMany({});
        console.log(`✓ Deleted ${deletedItems.count} carpet items`);

        console.log('Deleting orders...');
        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`✓ Deleted ${deletedOrders.count} orders`);

        console.log('Deleting clients...');
        const deletedClients = await prisma.client.deleteMany({});
        console.log(`✓ Deleted ${deletedClients.count} clients`);

        console.log('\n✅ Database cleaned successfully!');
        console.log('You can now start with a fresh database.');
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
