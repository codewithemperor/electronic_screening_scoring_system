import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const departmentId = searchParams.get('departmentId');
    
    const offset = (page - 1) * limit;
    
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    
    const [examinations, total] = await Promise.all([
      db.examination.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true, code: true }
          },
          examinationQuestions: {
            include: {
              question: {
                select: { id: true, content: true, marks: true }
              }
            }
          },
          testAttempts: {
            select: { id: true, status: true, score: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      db.examination.count({ where })
    ]);
    
    return NextResponse.json({
      examinations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching examinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examinations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      departmentId,
      questionIds = []
    } = body;
    
    if (!title || !duration || !totalMarks || !passingMarks || !departmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const examination = await db.examination.create({
      data: {
        title,
        description,
        duration,
        totalMarks,
        passingMarks,
        departmentId,
        isActive: true
      },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    
    // Add questions to examination if provided
    if (questionIds.length > 0) {
      await db.examinationQuestion.createMany({
        data: questionIds.map((questionId: string) => ({
          examinationId: examination.id,
          questionId
        }))
      });
    }
    
    return NextResponse.json(examination, { status: 201 });
  } catch (error) {
    console.error('Error creating examination:', error);
    return NextResponse.json(
      { error: 'Failed to create examination' },
      { status: 500 }
    );
  }
}