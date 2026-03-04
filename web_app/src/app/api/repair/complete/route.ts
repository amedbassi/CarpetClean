import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, itemId } = await request.json();

    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: 'Missing orderId or itemId' },
        { status: 400 }
      );
    }

    await prisma.carpetItem.update({
      where: {
        orderId_id: {
          orderId,
          id: itemId
        }
      },
      data: {
        repairCompleted: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking repair complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark repair complete' },
      { status: 500 }
    );
  }
}
