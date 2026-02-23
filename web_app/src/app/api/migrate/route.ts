import { NextResponse } from 'next/server';

// Migration route - disabled after SQL migration completed
// Data migration was completed via SQL script in migration.sql

export async function GET() {
    return NextResponse.json({ 
        message: 'Migration route disabled. Data migration was completed via SQL script.',
        status: 'completed'
    });
}
