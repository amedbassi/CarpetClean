import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'orders.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ message: 'orders.json not found' });
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const orders = JSON.parse(data);

        console.log(`Starting migration of ${orders.length} orders...`);

        let migratedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const orderData of orders) {
            try {
                // Check if order already exists
                const exists = await prisma.order.findUnique({
                    where: { id: orderData.id }
                });

                if (exists) {
                    skippedCount++;
                    continue;
                }

                const clientName = orderData.clientName || orderData.name || 'Unknown Client';

                // Find or create client
                let client = await prisma.client.findFirst({
                    where: { name: clientName }
                });

                if (!client) {
                    client = await prisma.client.create({
                        data: {
                            name: clientName,
                            phone: orderData.phone || null,
                            email: orderData.email || null,
                            street: null,
                            number: null,
                            postalCode: null,
                            city: null,
                            country: null,
                        }
                    });
                }

                await prisma.order.create({
                    data: {
                        id: orderData.id,
                        clientId: client.id,
                        signature: orderData.signature || null,
                        receipt: orderData.receipt || null,
                        createdAt: new Date(orderData.createdAt || Date.now()),
                        requiresCleaningApproval: orderData.requiresApproval || false,
                        cleaningApprovalStatus: orderData.approvalStatus || 'not_needed',
                        requiresRepairApproval: false,
                        repairApprovalStatus: 'not_needed',
                        items: {
                            create: (orderData.items || []).map((item: any) => ({
                                id: item.id,
                                status: item.status || 'pending',
                                length: item.length || null,
                                width: item.width || null,
                                material: item.material || null,
                                state: item.state || null,
                                photo: item.photo || null,
                                cleaningCost: item.cleaningCost || null,
                                repairCost: item.repairCost || (item.repairEstimate?.cost) || null,
                                repairDescription: item.repairDescription || (item.repairEstimate?.description) || null,
                            })),
                        },
                    },
                });
                migratedCount++;
            } catch (err: unknown) {
                console.error(`Error migrating order ${orderData.id}:`, err);
                const message = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`${orderData.id}: ${message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Migration attempt finished',
            migrated: migratedCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: unknown) {
        console.error('Migration-wide error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
