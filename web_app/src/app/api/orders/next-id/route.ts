import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Read existing orders from DB
        const orders = await prisma.order.findMany({
            select: { id: true }
        });

        // Generate next sequential ID
        let nextNumber = 1;
        if (orders.length > 0) {
            // Extract numbers from existing order IDs (e.g., "ORD-003" -> 3)
            const existingNumbers = orders
                .map((order: { id: string }) => {
                    const match = order.id?.match(/ORD-(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                })
                .filter((num: number) => num > 0);

            if (existingNumbers.length > 0) {
                nextNumber = Math.max(...existingNumbers) + 1;
            }
        }

        // Format with leading zeros (e.g., ORD-001, ORD-002)
        const nextId = `ORD-${String(nextNumber).padStart(3, '0')}`;

        return NextResponse.json({ nextId });
    } catch (error) {
        console.error('Error generating next order ID:', error);
        return NextResponse.json({ error: 'Failed to generate order ID' }, { status: 500 });
    }
}
