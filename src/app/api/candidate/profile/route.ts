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
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Calculate O'Level aggregate dynamically from results
    let calculatedOlevelAggregate = 0;
    candidate.oLevelResults.forEach(result => {
      if (result.gradingRule) {
        calculatedOlevelAggregate += result.gradingRule.marks;
      }
    });

    // Update the candidate's O'Level aggregate if it's different
    if (candidate.olevelAggregate !== calculatedOlevelAggregate) {
      await db.candidate.update({
        where: { id: candidate.id },
        data: { olevelAggregate: calculatedOlevelAggregate }
      });
      candidate.olevelAggregate = calculatedOlevelAggregate;
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate profile' },
      { status: 500 }
    );
  }
}