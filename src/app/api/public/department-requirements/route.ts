import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const departments = await db.department.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        examPercentage: true,
        olevelPercentage: true,
        finalCutoffMark: true,
        utmeCutoffMark: true,
        olevelCutoffAggregate: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching department requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department requirements' },
      { status: 500 }
    );
  }
}