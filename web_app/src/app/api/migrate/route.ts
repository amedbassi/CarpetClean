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
                        requiresApproval: orderData.requiresApproval || false,
                        approvalStatus: orderData.approvalStatus || 'not_needed',
                        items: {
                            create: (orderData.items || []).map((item: any) => ({
                                id: item.id,
                                status: item.status || 'pending',
                                length: item.length || '',
                                width: item.width || '',
                                material: item.material || '',
                                state: item.state || '',
                                photo: item.photo || '',
                                cleaningCost: item.cleaningCost || 0,
                                repairCost: item.repairCost || (item.repairEstimate?.cost) || 0,
                                repairDescription: item.repairDescription || (item.repairEstimate?.description) || '',
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
