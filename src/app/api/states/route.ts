import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const states = await db.state.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    return NextResponse.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    );
  }
}