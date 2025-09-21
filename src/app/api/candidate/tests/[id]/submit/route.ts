import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Zod schema for test submission
const submitSchema = z.object({
  answers: z.record(z.number().min(0).max(3)) // questionIndex: answerIndex (0-3)
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = submitSchema.parse(body);

    // Get test attempt with questions
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

    // Calculate score and create test answers
    let totalScore = 0;
    const questions = testAttempt.examination.examinationQuestions;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const selectedAnswer = validatedData.answers[i];
      
      if (selectedAnswer !== undefined) {
        const isCorrect = selectedAnswer === question.question.correctAnswer;
        const marksObtained = isCorrect ? question.question.marks : 0;
        
        totalScore += marksObtained;

        // Create or update test answer
        await db.testAnswer.upsert({
          where: {
            testAttemptId_questionId: {
              testAttemptId: testAttempt.id,
              questionId: question.questionId
            }
          },
          update: {
            selectedAnswer,
            isCorrect,
            marksObtained
          },
          create: {
            testAttemptId: testAttempt.id,
            questionId: question.questionId,
            selectedAnswer,
            isCorrect,
            marksObtained
          }
        });
      }
    }

    // Update test attempt
    const updatedTestAttempt = await db.testAttempt.update({
      where: { id: params.id },
      data: {
        status: 'SUBMITTED',
        endTime: new Date(),
        score: totalScore
      }
    });

    // Calculate final score and update admission status
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/candidate/calculate-final-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: testAttempt.candidateId
        })
      });
    } catch (calcError) {
      console.error('Error calculating final score:', calcError);
      // Don't fail the test submission if final score calculation fails
    }

    return NextResponse.json({
      message: 'Test submitted successfully',
      result: {
        score: totalScore,
        totalMarks: testAttempt.examination.totalMarks,
        percentage: Math.round((totalScore / testAttempt.examination.totalMarks) * 100)
      }
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}