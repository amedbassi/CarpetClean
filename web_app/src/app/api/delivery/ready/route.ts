import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch orders and their items
        const orders = await prisma.order.findMany({
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter for orders where ALL items are 'ready_for_delivery'
        // And ensure the order isn't already fully delivered
        const readyOrders = orders.filter(order => {
            if (order.items.length === 0) return false;

            const allItemsReady = order.items.every(item =>
                ['ready_for_delivery', 'delivered'].includes(item.status)
            );

            // At least one item should be 'ready_for_delivery' (not all already 'delivered')
            const hasReadyItems = order.items.some(item => item.status === 'ready_for_delivery');

            return allItemsReady && hasReadyItems;
        });

        return NextResponse.json(readyOrders);
    } catch (error: unknown) {
        console.error('Error fetching delivery-ready orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
