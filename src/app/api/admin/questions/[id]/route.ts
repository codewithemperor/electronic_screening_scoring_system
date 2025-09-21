import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await db.question.findUnique({
      where: { id: params.id },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        subject: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Parse options from JSON string to array
    const parsedQuestion = {
      ...question,
      options: JSON.parse(question.options)
    };
    
    return NextResponse.json(parsedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      content,
      options,
      correctAnswer,
      marks,
      difficulty,
      departmentId,
      subjectId
    } = body;
    
    if (!content || !options || !correctAnswer || !departmentId || !subjectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Options must be an array with at least 2 items' },
        { status: 400 }
      );
    }
    
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return NextResponse.json(
        { error: 'Correct answer must be a valid option index' },
        { status: 400 }
      );
    }
    
    const question = await db.question.update({
      where: { id: params.id },
      data: {
        content,
        options: JSON.stringify(options),
        correctAnswer,
        marks: marks || 1,
        difficulty,
        departmentId,
        subjectId
      },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        subject: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    
    // Parse options for the response
    const parsedQuestion = {
      ...question,
      options: JSON.parse(question.options)
    };
    
    return NextResponse.json(parsedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.question.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}