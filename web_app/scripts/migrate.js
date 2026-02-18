const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./dev.db'
        }
    }
});

async function main() {
    const jsonPath = path.join(__dirname, '../data/orders.json');
    if (!fs.existsSync(jsonPath)) {
        console.log('No orders.json found. Skipping migration.');
        return;
    }

    const data = fs.readFileSync(jsonPath, 'utf8');
    const orders = JSON.parse(data);

    console.log(`Migrating ${orders.length} orders...`);

    for (const orderData of orders) {
        try {
            await prisma.order.create({
                data: {
                    id: orderData.id,
                    createdAt: new Date(orderData.createdAt),
                    clientName: orderData.clientName,
                    phone: orderData.phone,
                    email: orderData.email,
                    address: orderData.address,
                    signature: orderData.signature,
                    receipt: orderData.receipt,
                    requiresApproval: false,
                    approvalStatus: "not_needed",
                    items: {
                        create: orderData.items.map((item) => ({
                            id: item.id,
                            status: item.status || "pending",
                            length: item.length,
                            width: item.width,
                            material: item.material,
                            state: item.state,
                            photo: item.photo,
                            cleaningCost: item.cleaningCost,
                            repairCost: item.repairEstimate?.cost,
                            repairDescription: item.repairEstimate?.description,
                        })),
                    },
                },
            });
            console.log(`Migrated order: ${orderData.id}`);
        } catch (error) {
            console.error(`Failed to migrate order ${orderData.id}:`, error);
        }
    }

    console.log('Migration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
