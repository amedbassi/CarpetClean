import prisma from '@/lib/prisma';

async function main() {
    console.log('Updating items to ready_for_delivery...');

    // Mark items in ORD-001 and ORD-002 as ready
    await prisma.carpetItem.updateMany({
        where: { orderId: 'ORD-001' },
        data: { status: 'ready_for_delivery' }
    });

    await prisma.carpetItem.updateMany({
        where: { orderId: 'ORD-002' },
        data: { status: 'ready_for_delivery' }
    });

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
