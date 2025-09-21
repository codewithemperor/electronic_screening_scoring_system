import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const departmentId = searchParams.get('departmentId');
    const subjectId = searchParams.get('subjectId');
    
    const offset = (page - 1) * limit;
    
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (subjectId) where.subjectId = subjectId;
    
    const [questions, total] = await Promise.all([
      db.question.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true, code: true }
          },
          subject: {
            select: { id: true, name: true, code: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      db.question.count({ where })
    ]);
    
    // Parse options from JSON string to array
    const parsedQuestions = questions.map(question => ({
      ...question,
      options: JSON.parse(question.options)
    }));
    
    return NextResponse.json({
      questions: parsedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    const question = await db.question.create({
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
    
    return NextResponse.json(parsedQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}