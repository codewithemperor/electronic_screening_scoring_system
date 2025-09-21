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
      return NextResponse.json({
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        admissionProgress: 0,
        utmeScore: 0,
        olevelAggregate: 0,
        finalScore: 0
      });
    }

    // Get test attempts
    const testAttempts = await db.testAttempt.findMany({
      where: {
        candidateId: candidate.id
      }
    });

    const totalTests = testAttempts.length;
    const completedTests = testAttempts.filter(attempt => 
      ['COMPLETED', 'SUBMITTED'].includes(attempt.status)
    ).length;

    // Calculate average score
    const completedAttemptsWithScores = testAttempts.filter(attempt => 
      attempt.score !== null && ['COMPLETED', 'SUBMITTED'].includes(attempt.status)
    );
    
    const averageScore = completedAttemptsWithScores.length > 0
      ? Math.round(
          completedAttemptsWithScores.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / 
          completedAttemptsWithScores.length
        )
      : 0;

    // Calculate admission progress
    let admissionProgress = 0;
    
    // Progress based on test completion
    if (totalTests > 0) {
      admissionProgress += (completedTests / totalTests) * 50; // 50% weight for test completion
    }

    // Progress based on admission status
    switch (candidate.admissionStatus) {
      case 'ADMITTED':
        admissionProgress += 50;
        break;
      case 'IN_PROGRESS':
        admissionProgress += 25;
        break;
      case 'REJECTED':
        admissionProgress += 10;
        break;
      default:
        admissionProgress += 0;
    }

    admissionProgress = Math.min(100, Math.round(admissionProgress));

    return NextResponse.json({
      totalTests,
      completedTests,
      averageScore,
      admissionProgress,
      utmeScore: candidate.utmeScore,
      olevelAggregate: candidate.olevelAggregate,
      finalScore: candidate.finalScore
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}