import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get test attempt to find examination
    const testAttempt = await db.testAttempt.findUnique({
      where: { id: params.id },
      include: {
        examination: {
          include: {
            examinationQuestions: {
              include: {
                question: true
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

    // Transform questions to the expected format
    const questions = testAttempt.examination.examinationQuestions.map(eq => ({
      id: eq.question.id,
      content: eq.question.content,
      options: JSON.parse(eq.question.options), // Parse JSON string to array
      correctAnswer: eq.question.correctAnswer,
      marks: eq.question.marks
    }));

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching test questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test questions' },
      { status: 500 }
    );
  }
}