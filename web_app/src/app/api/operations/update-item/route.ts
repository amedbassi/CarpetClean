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

        if (order && (order.requiresCleaningApproval || order.requiresRepairApproval)) {
            const allItemsMeasured = order.items.every(item =>
                ['measured', 'cleaning_estimated', 'repair_estimated'].includes(item.status)
            );

            // Update approval status to pending if all items are measured
            if (allItemsMeasured) {
                const updateData: any = {};
                
                if (order.requiresCleaningApproval && order.cleaningApprovalStatus === 'not_needed') {
                    updateData.cleaningApprovalStatus = 'pending';
                }
                
                if (order.requiresRepairApproval && order.repairApprovalStatus === 'not_needed') {
                    updateData.repairApprovalStatus = 'pending';
                }
                
                if (Object.keys(updateData).length > 0) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: updateData,
                    });
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Item updated', item: updatedItem });
    } catch (error: unknown) {
        console.error('Error updating item:', error);
        return NextResponse.json({ success: false, message: 'Failed to update item' }, { status: 500 });
    }
}
