import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const orderData = await request.json();

        if (!orderData.id) {
            return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
        }

        const newOrder = await prisma.order.create({
            data: {
                id: orderData.id,
                clientName: orderData.clientName,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                signature: orderData.signature,
                receipt: orderData.receipt,
                requiresApproval: false,
                approvalStatus: "not_needed",
                items: {
                    create: orderData.items.map((item: {
                        id: string;
                        status?: string;
                        length?: string;
                        width?: string;
                        material?: string;
                        state?: string;
                        photo?: string;
                    }) => ({
                        id: item.id,
                        status: item.status || "pending",
                        length: item.length,
                        width: item.width,
                        material: item.material,
                        state: item.state,
                        photo: item.photo,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json({ success: true, message: 'Order saved', order: newOrder }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error saving order:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message: 'Failed to save order', details: message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(orders);
    } catch (error: unknown) {
        console.error('Error fetching orders:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to fetch orders', details: message }, { status: 500 });
    }
}
