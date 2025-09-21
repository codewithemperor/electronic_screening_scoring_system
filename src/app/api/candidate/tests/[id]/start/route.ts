import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Update test attempt status to IN_PROGRESS
    const testAttempt = await db.testAttempt.update({
      where: { id: params.id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });

    return NextResponse.json({
      message: 'Test started successfully',
      testAttempt: {
        id: testAttempt.id,
        status: testAttempt.status,
        startTime: testAttempt.startTime
      }
    });
  } catch (error) {
    console.error('Error starting test:', error);
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    );
  }
}