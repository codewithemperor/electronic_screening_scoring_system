import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { stateId: string } }
) {
  try {
    const lgas = await db.lga.findMany({
      where: {
        stateId: params.stateId
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });

    return NextResponse.json(lgas);
  } catch (error) {
    console.error('Error fetching LGAs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LGAs' },
      { status: 500 }
    );
  }
}