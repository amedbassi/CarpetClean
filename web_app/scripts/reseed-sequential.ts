import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLIENTS = [
    { name: 'Palais de Nations', email: 'contact@un.org', city: 'Geneva' },
    { name: 'Hotel de la Paix', email: 'info@hoteldelapaix.ch', city: 'Geneva' },
    { name: 'CERN Globe', email: 'visits.service@cern.ch', city: 'Meyrin' },
    { name: 'Grand Théâtre de Genève', email: 'billetterie@gtg.ch', city: 'Geneva' },
    { name: 'Bains des Pâquis', email: 'info@aubp.ch', city: 'Geneva' },
    { name: 'Richemont International', email: 'concierge@richemont.com', city: 'Bellevue' },
    { name: 'Patek Philippe Museum', email: 'museum@patek.com', city: 'Geneva' },
    { name: 'Villa la Grange', email: 'culture@ville-ge.ch', city: 'Geneva' }
];

const MATERIALS = ['Wool', 'Silk', 'Synthetic', 'Cotton', 'Persian', 'Oriental'];
const STATUSES = ['pending', 'measured', 'cleaning', 'cleaned', 'ready_for_delivery', 'delivered'];
const APPROVAL_STATUSES = ['not_needed', 'pending', 'approved', 'rejected'] as const;

function getRandomItem<T>(arr: T[] | readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    console.log('--- Order ID Sequence Cleanup ---');

    // 1. Identify and Delete "Bad" Seeded Orders
    const allOrders = await prisma.order.findMany({
        select: { id: true }
    });

    const badOrderIds = allOrders
        .filter(o => o.id.includes('-') && o.id.split('-').length > 2)
        .map(o => o.id);

    if (badOrderIds.length > 0) {
        console.log(`Deleting ${badOrderIds.length} incorrectly formatted orders...`);
        // Note: Cascade delete should handle items if configured, but let's be explicit
        await prisma.carpetItem.deleteMany({
            where: { orderId: { in: badOrderIds } }
        });
        await prisma.order.deleteMany({
            where: { id: { in: badOrderIds } }
        });
    }

    // 2. Find High Sequence Number
    const remainingOrders = await prisma.order.findMany({
        select: { id: true }
    });

    let maxSequence = 0;
    remainingOrders.forEach(o => {
        const match = o.id.match(/ORD-(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSequence) maxSequence = num;
        }
    });

    console.log(`Highest existing sequence: ORD-${String(maxSequence).padStart(3, '0')}`);
    let nextSeq = maxSequence + 1;

    // 3. Seed 77 Orders with correct incrementing IDs
    console.log(`Seeding 77 new orders starting from ORD-${String(nextSeq).padStart(3, '0')}...`);

    const dbClients = await prisma.client.findMany();
    if (dbClients.length === 0) {
        console.error('No clients found in DB. Please run initial seed first.');
        return;
    }

    for (let i = 0; i < 77; i++) {
        const client = getRandomItem(dbClients);
        const orderId = `ORD-${String(nextSeq).padStart(3, '0')}`;
        nextSeq++;

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - getRandomInt(0, 60));

        const order = await prisma.order.create({
            data: {
                id: orderId,
                clientId: client.id,
                createdAt,
                requiresCleaningApproval: Math.random() > 0.7,
                cleaningApprovalStatus: getRandomItem(APPROVAL_STATUSES),
                requiresRepairApproval: Math.random() > 0.8,
                repairApprovalStatus: getRandomItem(APPROVAL_STATUSES),
            },
        });

        const itemCount = getRandomInt(1, 4);
        for (let j = 0; j < itemCount; j++) {
            const cleaningCost = getRandomFloat(40, 450);
            const repairCost = Math.random() > 0.85 ? getRandomFloat(80, 800) : 0;

            await prisma.carpetItem.create({
                data: {
                    id: `${j + 1}`,
                    orderId: order.id,
                    status: getRandomItem(STATUSES),
                    length: getRandomFloat(0.8, 4.5).toFixed(1),
                    width: getRandomFloat(0.8, 3.5).toFixed(1),
                    material: getRandomItem(MATERIALS),
                    state: getRandomItem(['Good', 'Worn', 'Minor Damage', 'Stained']),
                    cleaningCost,
                    repairCost,
                    repairDescription: repairCost > 0 ? 'Surface treatment and edge correction.' : null,
                    individualClient: Math.random() > 0.75 ? `Suite ${getRandomInt(100, 500)}` : null,
                },
            });
        }
    }

    console.log('--- Sequential Seeding Completed! ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
