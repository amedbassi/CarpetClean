require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:C:/Users/AhmedBassiouny/.gemini/antigravity/scratch/carpet_cleaning_system/web_app/dev.db'
        }
    }
});

async function main() {
    const filePath = path.join(__dirname, '..', 'data', 'orders.json');

    if (!fs.existsSync(filePath)) {
        console.log('No orders.json found. Skipping migration.');
        return;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const orders = JSON.parse(data);

    console.log(`Found ${orders.length} orders to migrate.`);

    for (const orderData of orders) {
        // Check if order already exists
        const exists = await prisma.order.findUnique({
            where: { id: orderData.id }
        });

        if (exists) {
            console.log(`Skipping existing order ${orderData.id}`);
            continue;
        }

        const clientName = orderData.clientName || orderData.name || 'Unknown Client';

        await prisma.order.create({
            data: {
                id: orderData.id,
                clientName: clientName,
                phone: orderData.phone || '',
                email: orderData.email || '',
                address: orderData.address || '',
                signature: orderData.signature || '',
                receipt: orderData.receipt || '',
                createdAt: new Date(orderData.createdAt || Date.now()),
                requiresApproval: false,
                approvalStatus: 'not_needed',
                items: {
                    create: (orderData.items || []).map((item) => ({
                        id: item.id,
                        status: item.status || 'pending',
                        length: item.length || '',
                        width: item.width || '',
                        material: item.material || '',
                        state: item.state || '',
                        photo: item.photo || '',
                        cleaningCost: item.cleaningCost || 0,
                        repairCost: item.repairEstimate?.cost || item.repairCost || 0,
                        repairDescription: item.repairEstimate?.description || item.repairDescription || '',
                    })),
                },
            },
        });
        console.log(`Migrated order ${orderData.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
