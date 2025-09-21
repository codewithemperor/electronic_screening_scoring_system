import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Get candidate with department and O'Level results
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      include: {
        department: true,
        oLevelResults: {
          include: {
            gradingRule: true
          }
        },
        testAttempts: {
          where: {
            status: 'SUBMITTED'
          },
          include: {
            examination: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Calculate O'Level aggregate from actual results
    let olevelAggregate = 0;
    candidate.oLevelResults.forEach(result => {
      if (result.gradingRule) {
        olevelAggregate += result.gradingRule.marks;
      }
    });

    // Calculate O'Level percentage score based on maximum possible marks
    const maxOlevelMarks = 45; // Maximum possible O'Level aggregate (5 subjects × 9 marks each)
    const olevelPercentage = Math.round((olevelAggregate / maxOlevelMarks) * 100);

    // Calculate exam percentage score
    let examTotalMarks = 0;
    let examObtainedMarks = 0;

    candidate.testAttempts.forEach(attempt => {
      if (attempt.score !== null) {
        examObtainedMarks += attempt.score;
        examTotalMarks += attempt.examination.totalMarks;
      }
    });

    const examPercentage = examTotalMarks > 0 
      ? Math.round((examObtainedMarks / examTotalMarks) * 100) 
      : 0;

    // Calculate final score using department weights
    const department = candidate.department;
    const examScore = Math.round(examPercentage * department.examPercentage / 100);
    const olevelScore = Math.round(olevelPercentage * department.olevelPercentage / 100);
    const finalScore = examScore + olevelScore;

    // Determine admission status
    let admissionStatus: 'NOT_ADMITTED' | 'IN_PROGRESS' | 'ADMITTED' | 'REJECTED';
    
    // Check if candidate meets minimum requirements
    const meetsUtmeCutoff = candidate.utmeScore >= department.utmeCutoffMark;
    const meetsOlevelCutoff = olevelAggregate >= department.olevelCutoffAggregate;
    const meetsFinalCutoff = finalScore >= department.finalCutoffMark;

    // If candidate has submitted at least one test, they should be IN_PROGRESS
    const hasSubmittedTest = candidate.testAttempts.length > 0;

    if (!hasSubmittedTest) {
      admissionStatus = 'NOT_ADMITTED';
    } else if (!meetsUtmeCutoff || !meetsOlevelCutoff) {
      admissionStatus = 'REJECTED';
    } else if (meetsFinalCutoff) {
      admissionStatus = 'ADMITTED';
    } else {
      admissionStatus = 'IN_PROGRESS';
    }

    // Update candidate with calculated scores
    const updatedCandidate = await db.candidate.update({
      where: { id: candidateId },
      data: {
        olevelAggregate, // Update the stored aggregate with calculated value
        olevelPercentage,
        examPercentage,
        finalScore,
        admissionStatus
      }
    });

    return NextResponse.json({
      message: 'Final score calculated successfully',
      candidate: {
        id: updatedCandidate.id,
        fullName: updatedCandidate.fullName,
        utmeScore: updatedCandidate.utmeScore,
        olevelAggregate: olevelAggregate, // Use the calculated value
        olevelPercentage,
        examPercentage,
        finalScore,
        admissionStatus,
        department: {
          name: updatedCandidate.department.name,
          utmeCutoffMark: updatedCandidate.department.utmeCutoffMark,
          olevelCutoffAggregate: updatedCandidate.department.olevelCutoffAggregate,
          finalCutoffMark: updatedCandidate.department.finalCutoffMark
        },
        requirements: {
          meetsUtmeCutoff,
          meetsOlevelCutoff,
          meetsFinalCutoff
        }
      }
    });

  } catch (error) {
    console.error('Error calculating final score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate final score' },
      { status: 500 }
    );
  }
}