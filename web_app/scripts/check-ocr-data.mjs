import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Check what columns CarpetItem has
    const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'CarpetItem'
    ORDER BY ordinal_position;
  `;
    console.log('CarpetItem columns:', JSON.stringify(cols, null, 2));

    // Fetch last 3 orders with items
    const orders = await prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
    });

    console.log('\nLast 3 orders:');
    orders.forEach(o => {
        console.log(`Order ${o.id}:`);
        o.items.forEach(item => {
            console.log(`  Item ${item.id}: individualClient=${JSON.stringify(item.individualClient)}`);
        });
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
