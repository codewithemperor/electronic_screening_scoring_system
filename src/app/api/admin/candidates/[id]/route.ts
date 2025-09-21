import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true }
        },
        department: {
          select: { 
            id: true, 
            name: true, 
            code: true, 
            utmeCutoffMark: true, 
            olevelCutoffAggregate: true, 
            finalCutoffMark: true,
            examPercentage: true,
            olevelPercentage: true
          }
        },
        state: {
          select: { id: true, name: true, code: true }
        },
        lga: {
          select: { id: true, name: true }
        },
        oLevelResults: {
          include: {
            subject: {
              select: { id: true, name: true, code: true }
            },
            gradingRule: {
              select: { grade: true, marks: true }
            }
          }
        },
        testAttempts: {
          include: {
            examination: {
              select: { 
                id: true, 
                title: true, 
                duration: true, 
                totalMarks: true, 
                passingMarks: true,
                department: { select: { name: true } }
              }
            },
            testAnswers: {
              include: {
                question: {
                  select: { id: true, content: true, options: true, correctAnswer: true, marks: true }
                }
              }
            }
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
    
    // Parse question options from JSON strings to arrays
    const parsedCandidate = {
      ...candidate,
      testAttempts: candidate.testAttempts.map(ta => ({
        ...ta,
        testAnswers: ta.testAnswers.map(answer => ({
          ...answer,
          question: {
            ...answer.question,
            options: JSON.parse(answer.question.options)
          }
        }))
      }))
    };
    
    return NextResponse.json(parsedCandidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}