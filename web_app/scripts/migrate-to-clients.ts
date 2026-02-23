import prisma from '../src/lib/prisma';
import ordersData from '../data/orders.json';

interface OldOrder {
  id: string;
  clientName: string;
  phone?: string;
  email?: string;
  address?: string;
  items: any[];
  receipt?: string;
  signature?: string;
  createdAt: string;
}

async function migrateToClients() {
  console.log('Starting migration to new Client structure...');

  const oldOrders = ordersData as OldOrder[];
  const clientMap = new Map<string, string>(); // clientName -> clientId

  try {
    // Step 1: Create unique clients
    for (const oldOrder of oldOrders) {
      if (!clientMap.has(oldOrder.clientName)) {
        const client = await prisma.client.create({
          data: {
            name: oldOrder.clientName,
            phone: oldOrder.phone || null,
            email: oldOrder.email || null,
            street: null,
            number: null,
            postalCode: null,
            city: null,
            country: null,
          },
        });
        clientMap.set(oldOrder.clientName, client.id);
        console.log(`Created client: ${oldOrder.clientName} (ID: ${client.id})`);
      }
    }

    // Step 2: Migrate orders
    for (const oldOrder of oldOrders) {
      const clientId = clientMap.get(oldOrder.clientName);
      if (!clientId) {
        console.error(`Client not found for order ${oldOrder.id}`);
        continue;
      }

      // Check if order already exists
      const existingOrder = await prisma.order.findUnique({
        where: { id: oldOrder.id },
      });

      if (existingOrder) {
        console.log(`Order ${oldOrder.id} already exists, skipping...`);
        continue;
      }

      // Create order with items
      await prisma.order.create({
        data: {
          id: oldOrder.id,
          clientId: clientId,
          signature: oldOrder.signature || null,
          receipt: oldOrder.receipt || null,
          requiresCleaningApproval: false,
          cleaningApprovalStatus: 'not_needed',
          requiresRepairApproval: false,
          repairApprovalStatus: 'not_needed',
          createdAt: new Date(oldOrder.createdAt),
          items: {
            create: oldOrder.items.map((item: any) => ({
              id: item.id,
              status: item.status || 'pending',
              length: item.length || null,
              width: item.width || null,
              material: item.material || null,
              state: item.state || null,
              photo: item.photo || null,
              cleaningCost: item.cleaningCost || null,
              repairCost: item.repairCost || null,
              repairDescription: item.repairDescription || null,
            })),
          },
        },
      });

      console.log(`Migrated order: ${oldOrder.id}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateToClients();
