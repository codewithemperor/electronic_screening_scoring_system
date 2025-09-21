import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Zod schema for eligibility check
const eligibilityCheckSchema = z.object({
  utmeScore: z.number().min(0).max(400),
  oLevelResults: z.array(z.object({
    subject: z.string(),
    grade: z.enum(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'])
  })).min(5),
  departmentId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = eligibilityCheckSchema.parse(body);

    // Fetch department details
    const department = await db.department.findUnique({
      where: { id: validatedData.departmentId }
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Fetch grading rules
    const gradingRules = await db.gradingRule.findMany();

    // Calculate O'Level aggregate
    const gradeToMarks: { [key: string]: number } = {};
    gradingRules.forEach(rule => {
      gradeToMarks[rule.grade] = rule.marks;
    });

    const oLevelScores = validatedData.oLevelResults
      .map(result => gradeToMarks[result.grade] || 0)
      .sort((a, b) => b - a); // Sort in descending order

    // Take top 5 scores
    const oLevelAggregate = oLevelScores.slice(0, 5).reduce((sum, score) => sum + score, 0);

    // Check eligibility
    const utmePassed = validatedData.utmeScore >= department.utmeCutoffMark;
    const olevelPassed = oLevelAggregate >= department.olevelCutoffAggregate;
    const isEligible = utmePassed && olevelPassed;

    // Find alternative departments if not eligible
    let alternatives: Array<{
      name: string;
      utmeRequired: number;
      olevelRequired: number;
    }> = [];

    if (!isEligible) {
      const alternativeDepartments = await db.department.findMany({
        where: {
          id: { not: validatedData.departmentId },
          status: 'ACTIVE',
          OR: [
            {
              utmeCutoffMark: { lte: validatedData.utmeScore },
              olevelCutoffAggregate: { lte: oLevelAggregate }
            }
          ]
        },
        take: 5
      });

      alternatives = alternativeDepartments.map(dept => ({
        name: dept.name,
        utmeRequired: dept.utmeCutoffMark,
        olevelRequired: dept.olevelCutoffAggregate
      }));
    }

    const response = {
      eligible: isEligible,
      utme: {
        required: department.utmeCutoffMark,
        achieved: validatedData.utmeScore,
        passed: utmePassed
      },
      olevel: {
        required: department.olevelCutoffAggregate,
        achieved: oLevelAggregate,
        passed: olevelPassed
      },
      department: department.name,
      alternatives,
      message: isEligible 
        ? `Congratulations! You meet the requirements for ${department.name}.`
        : `Sorry, you don't meet the minimum requirements for ${department.name}. UTME: ${validatedData.utmeScore}/${department.utmeCutoffMark}, O'Level: ${oLevelAggregate}/${department.olevelCutoffAggregate}`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Eligibility check error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}