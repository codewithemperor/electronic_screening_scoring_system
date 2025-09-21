import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedCandidate, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request, 'CANDIDATE');
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Get the authenticated candidate
    const candidate = await getAuthenticatedCandidate(request);

    if (!candidate) {
      return NextResponse.json([]);
    }

    const testAttempts = await db.testAttempt.findMany({
      where: {
        candidateId: candidate.id
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const tests = testAttempts.map(attempt => ({
      id: attempt.id,
      title: attempt.examination.title,
      description: attempt.examination.description,
      duration: attempt.examination.duration,
      totalMarks: attempt.examination.totalMarks,
      status: attempt.status,
      score: attempt.score,
      examination: {
        title: attempt.examination.title,
        department: {
          name: attempt.examination.department.name
        }
      }
    }));

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching candidate tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate tests' },
      { status: 500 }
    );
  }
}