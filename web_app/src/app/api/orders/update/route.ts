import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orderId, ...updates } = await request.json();

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updates,
        });

        return NextResponse.json({ success: true, message: 'Order updated', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
    }
}
