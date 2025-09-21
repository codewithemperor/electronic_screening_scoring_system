import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testAttempt = await db.testAttempt.findUnique({
      where: { id: params.id },
      include: {
        examination: {
          include: {
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    const test = {
      id: testAttempt.id,
      title: testAttempt.examination.title,
      description: testAttempt.examination.description,
      duration: testAttempt.examination.duration,
      totalMarks: testAttempt.examination.totalMarks,
      status: testAttempt.status,
      examination: {
        title: testAttempt.examination.title,
        department: {
          name: testAttempt.examination.department.name
        }
      }
    };

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}