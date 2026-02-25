import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(clients);
    } catch (error: unknown) {
        console.error('Error fetching clients:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to fetch clients', details: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const clientData = await request.json();

        if (!clientData.name) {
            return NextResponse.json({ success: false, message: 'Client name is required' }, { status: 400 });
        }

        // Check if email already exists (if provided)
        if (clientData.email) {
            const existingClient = await prisma.client.findFirst({
                where: { email: clientData.email },
            });

            if (existingClient) {
                return NextResponse.json({ 
                    success: false, 
                    message: 'A client with this email already exists',
                    clientId: existingClient.id 
                }, { status: 409 });
            }
        }

        const newClient = await prisma.client.create({
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

        return NextResponse.json({ success: true, message: 'Client created', client: newClient }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating client:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, message: 'Failed to create client', details: message }, { status: 500 });
    }
}
