import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedCandidate, requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // Get all active departments
    const allDepartments = await db.department.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    // Calculate O'Level aggregate from actual results
    let olevelAggregate = 0;
    candidate.oLevelResults.forEach(result => {
      if (result.gradingRule) {
        olevelAggregate += result.gradingRule.marks;
      }
    });

    // Calculate O'Level percentage score
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

    // Generate recommendations for all departments
    const recommendations = allDepartments.map(dept => {
      // Calculate final score for this department
      const finalScore = Math.round(
        (examPercentage * dept.examPercentage / 100) +
        (olevelPercentage * dept.olevelPercentage / 100)
      );

      // Check requirements
      const meetsUtmeCutoff = candidate.utmeScore >= dept.utmeCutoffMark;
      const meetsOlevelCutoff = olevelAggregate >= dept.olevelCutoffAggregate;
      const meetsFinalCutoff = finalScore >= dept.finalCutoffMark;

      // Determine eligibility and recommendation
      let eligibility: 'NOT_ELIGIBLE' | 'MAYBE_ELIGIBLE' | 'ELIGIBLE' | 'HIGHLY_RECOMMENDED';
      let recommendation: string;
      let priority: number;

      if (!meetsUtmeCutoff || !meetsOlevelCutoff) {
        eligibility = 'NOT_ELIGIBLE';
        recommendation = 'Does not meet minimum UTME or O\'Level requirements';
        priority = 4;
      } else if (meetsFinalCutoff) {
        if (finalScore >= dept.finalCutoffMark + 10) {
          eligibility = 'HIGHLY_RECOMMENDED';
          recommendation = 'Strong candidate - exceeds requirements significantly';
          priority = 1;
        } else {
          eligibility = 'ELIGIBLE';
          recommendation = 'Meets all admission requirements';
          priority = 2;
        }
      } else {
        eligibility = 'MAYBE_ELIGIBLE';
        recommendation = 'Close to requirements - consider if cutoff is flexible';
        priority = 3;
      }

      return {
        department: {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          description: dept.description
        },
        scores: {
          finalScore,
          examPercentage,
          olevelPercentage
        },
        requirements: {
          utmeCutoff: dept.utmeCutoffMark,
          olevelCutoff: dept.olevelCutoffAggregate,
          finalCutoff: dept.finalCutoffMark,
          meetsUtmeCutoff,
          meetsOlevelCutoff,
          meetsFinalCutoff
        },
        eligibility,
        recommendation,
        priority,
        isCurrentDepartment: dept.id === candidate.departmentId
      };
    });

    // Sort recommendations by priority
    recommendations.sort((a, b) => a.priority - b.priority);

    // Get the best recommendation
    const bestRecommendation = recommendations.find(r => r.eligibility !== 'NOT_ELIGIBLE');

    return NextResponse.json({
      message: 'Admission recommendations generated successfully',
      currentDepartment: candidate.department.name,
      currentStatus: candidate.admissionStatus,
      recommendations,
      bestRecommendation,
      summary: {
        totalDepartments: allDepartments.length,
        eligibleDepartments: recommendations.filter(r => r.eligibility === 'ELIGIBLE' || r.eligibility === 'HIGHLY_RECOMMENDED').length,
        highlyRecommended: recommendations.filter(r => r.eligibility === 'HIGHLY_RECOMMENDED').length
      }
    });

  } catch (error) {
    console.error('Error generating admission recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate admission recommendations' },
      { status: 500 }
    );
  }
}