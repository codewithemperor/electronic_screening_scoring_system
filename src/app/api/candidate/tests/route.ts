import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // For demo purposes, we'll get test attempts for the first candidate
    // In a real app, you would get the candidate ID from the authenticated user
    const candidate = await db.candidate.findFirst();
    
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