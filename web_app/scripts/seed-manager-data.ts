import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLIENTS = [
    { name: 'Palais de Nations', email: 'contact@un.org', city: 'Geneva' },
    { name: 'Hotel de la Paix', email: 'info@hoteldelapaix.ch', city: 'Geneva' },
    { name: 'Grand Théâtre de Genève', email: 'admin@gtg.ch', city: 'Geneva' },
    { name: 'Villa La Grange', email: 'vlg@ge.ch', city: 'Geneva' },
    { name: 'Maison Tavel', email: 'museum@ge.ch', city: 'Geneva' },
    { name: 'Private Residence - Cologny', email: 'private.cologny@email.com', city: 'Cologny' },
    { name: 'Corporate Office - Chene-Bougeries', email: 'office@corp.ch', city: 'Chene-Bougeries' },
];

const MATERIALS = ['Wool', 'Silk', 'Synthetic', 'Cotton', 'Persian', 'Oriental'];
const STATUSES = ['pending', 'measured', 'cleaning', 'cleaned', 'ready_for_delivery', 'delivered'];
const APPROVAL_STATUSES = ['not_needed', 'pending', 'approved', 'rejected'];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    console.log('Seeding 77 orders...');

    // First ensure we have clients
    const dbClients = [];
    for (const c of CLIENTS) {
        const client = await prisma.client.upsert({
            where: { email: c.email },
            update: {},
            create: {
                name: c.name,
                email: c.email,
                city: c.city,
                phone: '+41 22 ' + getRandomInt(100, 999) + ' ' + getRandomInt(10, 99) + ' ' + getRandomInt(10, 99),
            },
        });
        dbClients.push(client);
    }

    for (let i = 0; i < 77; i++) {
        const client = getRandomItem(dbClients);
        const orderId = `ORD-${Date.now() % 100000}-${i}`;

        // Random date in the last 60 days
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

        const itemCount = getRandomInt(1, 5);
        for (let j = 0; j < itemCount; j++) {
            const cleaningCost = getRandomFloat(50, 500);
            const repairCost = Math.random() > 0.8 ? getRandomFloat(100, 1000) : 0;

            await prisma.carpetItem.create({
                data: {
                    id: `${j + 1}`,
                    orderId: order.id,
                    status: getRandomItem(STATUSES),
                    length: getRandomFloat(1, 5).toFixed(1),
                    width: getRandomFloat(1, 5).toFixed(1),
                    material: getRandomItem(MATERIALS),
                    state: getRandomItem(['Good', 'Worn', 'Major Damage', 'Stained']),
                    cleaningCost,
                    repairCost,
                    repairDescription: repairCost > 0 ? 'Surface re-weaving and edge binding repair.' : null,
                    individualClient: Math.random() > 0.7 ? `Guest Room ${getRandomInt(1, 20)}` : null,
                },
            });
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
