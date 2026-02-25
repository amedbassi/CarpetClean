import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    console.log('Last 100 orders:');
    orders.forEach(o => {
        console.log(`${o.id} - ${o.createdAt}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
