import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to calculate final score
function calculateFinalScore(candidate: any) {
  // Calculate O'Level percentage score based on maximum possible marks
  const olevelTotalMarks = candidate.olevelAggregate;
  const maxOlevelMarks = 45; // Maximum possible O'Level aggregate (5 subjects × 9 marks each)
  const olevelPercentage = Math.round((olevelTotalMarks / maxOlevelMarks) * 100);

  // Calculate exam percentage score
  let examTotalMarks = 0;
  let examObtainedMarks = 0;

  candidate.testAttempts.forEach((attempt: any) => {
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
  const examScore = Math.round(examPercentage * (department.examPercentage || 70) / 100);
  const olevelScore = Math.round(olevelPercentage * (department.olevelPercentage || 30) / 100);
  const finalScore = examScore + olevelScore;

  return {
    olevelPercentage,
    examPercentage,
    finalScore
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const admissionStatus = searchParams.get('admissionStatus');
    const departmentId = searchParams.get('departmentId');
    
    const offset = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (admissionStatus) {
      where.admissionStatus = admissionStatus;
    }
    
    if (departmentId) {
      where.departmentId = departmentId;
    }
    
    const [candidates, total] = await Promise.all([
      db.candidate.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true }
          },
          department: {
            select: { 
              id: true, 
              name: true, 
              code: true,
              examPercentage: true,
              olevelPercentage: true,
              utmeCutoffMark: true,
              olevelCutoffAggregate: true,
              finalCutoffMark: true
            }
          },
          state: {
            select: { id: true, name: true }
          },
          lga: {
            select: { id: true, name: true }
          },
          oLevelResults: {
            include: {
              subject: {
                select: { id: true, name: true }
              },
              gradingRule: {
                select: { grade: true, marks: true }
              }
            }
          },
          testAttempts: {
            include: {
              examination: {
                select: { id: true, title: true, department: { select: { name: true } } }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      db.candidate.count({ where })
    ]);
    
    // Calculate final scores for each candidate
    const candidatesWithScores = candidates.map(candidate => {
      const scores = calculateFinalScore(candidate);
      return {
        ...candidate,
        ...scores
      };
    });
    
    return NextResponse.json({
      candidates: candidatesWithScores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, admissionStatus, finalScore } = body;
    
    if (!candidateId || !admissionStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const candidate = await db.candidate.update({
      where: { id: candidateId },
      data: {
        admissionStatus,
        finalScore: finalScore || null
      },
      include: {
        user: {
          select: { id: true, email: true }
        },
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}