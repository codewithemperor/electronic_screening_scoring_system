import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const examination = await db.examination.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        examinationQuestions: {
          include: {
            question: {
              select: { 
                id: true, 
                content: true, 
                options: true, 
                correctAnswer: true, 
                marks: true,
                subject: { select: { id: true, name: true, code: true } }
              }
            }
          }
        },
        testAttempts: {
          select: { 
            id: true, 
            status: true, 
            score: true, 
            totalMarks: true,
            startTime: true,
            endTime: true,
            candidate: {
              select: { 
                id: true, 
                fullName: true, 
                utmeScore: true, 
                admissionStatus: true
              }
            }
          }
        }
      }
    });
    
    if (!examination) {
      return NextResponse.json(
        { error: 'Examination not found' },
        { status: 404 }
      );
    }
    
    // Parse question options from JSON strings to arrays
    const parsedExamination = {
      ...examination,
      examinationQuestions: examination.examinationQuestions.map(eq => ({
        ...eq,
        question: {
          ...eq.question,
          options: JSON.parse(eq.question.options)
        }
      }))
    };
    
    return NextResponse.json(parsedExamination);
  } catch (error) {
    console.error('Error fetching examination:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examination' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      departmentId,
      isActive
    } = body;
    
    const examination = await db.examination.update({
      where: { id },
      data: {
        title,
        description,
        duration,
        totalMarks,
        passingMarks,
        departmentId,
        isActive
      },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    
    return NextResponse.json(examination);
  } catch (error) {
    console.error('Error updating examination:', error);
    return NextResponse.json(
      { error: 'Failed to update examination' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Delete related examination questions first
    await db.examinationQuestion.deleteMany({
      where: { examinationId: id }
    });
    
    // Delete the examination
    await db.examination.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Examination deleted successfully' });
  } catch (error) {
    console.error('Error deleting examination:', error);
    return NextResponse.json(
      { error: 'Failed to delete examination' },
      { status: 500 }
    );
  }
}