import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const clientData = await request.json();

        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name: clientData.name,
                phone: clientData.phone || null,
                email: clientData.email || null,
                street: clientData.street || null,
                number: clientData.number || null,
                postalCode: clientData.postalCode || null,
                city: clientData.city || null,
                country: clientData.country || null,
            },
        });

        return NextResponse.json({ success: true, client: updatedClient });
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ success: false, message: 'Failed to update client' }, { status: 500 });
    }
}
