import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.settings.findUnique({
            where: { id: 'default' }
        });

        // Create default settings if they don't exist
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    pricePerSquareMeter: 25.0,
                    repairHourlyRate: 50.0,
                    taxRate: 7.7,
                    currency: 'CHF',
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();

        const settings = await prisma.settings.upsert({
            where: { id: 'default' },
            update: data,
            create: {
                id: 'default',
                ...data
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
