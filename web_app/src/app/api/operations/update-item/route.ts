import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orderId, itemId, ...updates } = await request.json();

        // Update the item in the database
        const updatedItem = await prisma.carpetItem.update({
            where: {
                orderId_id: {
                    orderId: orderId,
                    id: itemId,
                },
            },
            data: updates,
        });

        // Check for automated approval logic
        // If all items are measured/estimated, and order requires approval, move to pending_approval
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (order && order.requiresApproval && order.approvalStatus === 'not_needed') {
            const allItemsMeasured = order.items.every(item =>
                ['measured', 'cleaning_estimated', 'repair_estimated'].includes(item.status)
            );

            // In a real app, you'd also check if repair estimates are done for worn/damaged items
            if (allItemsMeasured) {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { approvalStatus: 'pending' },
                });
            }
        }

        return NextResponse.json({ success: true, message: 'Item updated', item: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ success: false, message: 'Failed to update item' }, { status: 500 });
    }
}
