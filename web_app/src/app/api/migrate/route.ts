import { NextResponse } from 'next/server';

// Migration route - disabled after SQL migration completed

export async function GET() {
    // Migration already completed via SQL script
    // This route is disabled to prevent conflicts
    return NextResponse.json({ 
        message: 'Migration route disabled. Data migration was completed via SQL script.' 
    });
}
