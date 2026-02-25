import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orderId, deliverySignature } = await request.json();

        if (!orderId || !deliverySignature) {
            return NextResponse.json(
                { success: false, message: 'Order ID and signature are required' },
                { status: 400 }
            );
        }

        // Update the order with the delivery signature
        // AND update all items in this order to 'delivered'
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                deliverySignature,
                items: {
                    updateMany: {
                        where: {
                            status: { not: 'delivered' }
                        },
                        data: {
                            status: 'delivered'
                        }
                    }
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Delivery completed successfully',
            order: updatedOrder
        });
    } catch (error: any) {
        console.error('Error completing delivery:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to complete delivery', details: error.message },
            { status: 500 }
        );
    }
}
