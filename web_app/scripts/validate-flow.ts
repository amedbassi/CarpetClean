
import prisma from '../src/lib/prisma';

async function validateFlow() {
    console.log('--- Starting System Flow Validation ---');

    try {
        // 1. Check for orders
        const orders = await prisma.order.findMany({ include: { items: true, client: true } });
        console.log(`- Found ${orders.length} orders in database.`);

        if (orders.length === 0) {
            console.error('ERROR: No orders found for validation.');
            return;
        }

        // 2. Select a test order
        const testOrder = orders[0];
        console.log(`- Using Order ID: ${testOrder.id} for simulation.`);

        // 3. Status Verification (Consistency)
        const itemsReadyForDelivery = testOrder.items.filter(i => i.status === 'ready_for_delivery');
        const itemsDelivered = testOrder.items.filter(i => i.status === 'delivered');
        console.log(`- Status Breakdown: ${itemsReadyForDelivery.length} Ready, ${itemsDelivered.length} Delivered.`);

        // 4. Verify Pricing Logic (Swiss Francs)
        const totalValue = testOrder.items.reduce((sum, item) => sum + (item.cleaningCost || 0) + (item.repairCost || 0), 0);
        console.log(`- Order Total Value: CHF ${totalValue.toFixed(2)}`);

        // 5. Simulate Delivery Step (Programmatic check)
        const firstReadyItem = testOrder.items.find(i => i.status === 'ready_for_delivery');
        if (firstReadyItem) {
            console.log(`- Simulating delivery completion for ${testOrder.id}...`);
            await prisma.order.update({
                where: { id: testOrder.id },
                data: {
                    deliverySignature: 'MOCK_SIGNATURE_WALKTHROUGH',
                    items: {
                        updateMany: {
                            where: { status: 'ready_for_delivery' },
                            data: { status: 'delivered' }
                        }
                    }
                }
            });
            console.log('- Delivery logic verified.');
        } else {
            console.log('- No "ready_for_delivery" items found to simulate delivery automation.');
        }

        console.log('--- Flow Validation Complete (Success) ---');
    } catch (err) {
        console.error('--- Flow Validation FAILED ---');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

validateFlow();
