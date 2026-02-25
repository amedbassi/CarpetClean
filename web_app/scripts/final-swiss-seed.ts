import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    console.log('--- Final Swiss Pricing Reseed ---');

    // 1. Delete ALL orders from ORD-007 onwards (preserving real ORD-001 to ORD-006)
    const allOrders = await prisma.order.findMany({ select: { id: true } });
    const seedIds = allOrders
        .filter(o => {
            const match = o.id.match(/ORD-(\d+)/);
            return match ? parseInt(match[1], 10) >= 7 : o.id.includes('-');
        })
        .map(o => o.id);

    if (seedIds.length > 0) {
        console.log(`Purging ${seedIds.length} old seeded orders...`);
        await prisma.carpetItem.deleteMany({ where: { orderId: { in: seedIds } } });
        await prisma.order.deleteMany({ where: { id: { in: seedIds } } });
    }

    // 2. Seed 77 Fresh Orders with Swiss Pricing
    const dbClients = await prisma.client.findMany();
    let nextSeq = 7;

    console.log(`Seeding 77 fresh Swiss orders starting from ORD-007...`);

    for (let i = 0; i < 77; i++) {
        const client = getRandomItem(dbClients);
        const orderId = `ORD-${String(nextSeq).padStart(3, '0')}`;
        nextSeq++;

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - getRandomInt(0, 60));

        await prisma.order.create({
            data: {
                id: orderId,
                clientId: client.id,
                createdAt,
                requiresCleaningApproval: Math.random() > 0.6,
                cleaningApprovalStatus: getRandomItem(APPROVAL_STATUSES),
                requiresRepairApproval: Math.random() > 0.8,
                repairApprovalStatus: getRandomItem(APPROVAL_STATUSES),
                items: {
                    create: Array.from({ length: getRandomInt(1, 3) }).map((_, idx) => {
                        const length = parseFloat(getRandomFloat(0.8, 4.0).toFixed(1));
                        const width = parseFloat(getRandomFloat(0.8, 3.0).toFixed(1));
                        const area = length * width;
                        const rate = getRandomInt(45, 85); // Realistic Swiss rates
                        const cleaningCost = area * rate;
                        const hasRepair = Math.random() > 0.85;
                        const repairCost = hasRepair ? getRandomFloat(150, 950) : 0;

                        return {
                            id: (idx + 1).toString(),
                            status: getRandomItem(STATUSES),
                            length: length.toString(),
                            width: width.toString(),
                            material: getRandomItem(MATERIALS),
                            state: getRandomItem(['Good', 'Worn', 'Major Damage', 'Stained']),
                            cleaningCost,
                            repairCost,
                            repairDescription: hasRepair ? 'Professional Swiss restoration service.' : null,
                            individualClient: Math.random() > 0.8 ? `Apartment ${getRandomInt(1, 40)}` : null,
                        };
                    })
                }
            }
        });
    }

    console.log('--- Swiss Seeding Complete! ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
