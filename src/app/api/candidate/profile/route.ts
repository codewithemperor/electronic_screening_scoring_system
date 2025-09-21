import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This is a simplified version - in a real app, you would get the candidate ID from the session/JWT
export async function GET() {
  try {
    // For demo purposes, we'll get the first candidate
    // In a real app, you would get the candidate ID from the authenticated user
    const candidate = await db.candidate.findFirst({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        },
        state: {
          select: {
            name: true
          }
        },
        lga: {
          select: {
            name: true
          }
        },
        oLevelResults: {
          include: {
            subject: {
              select: {
                name: true
              }
            },
            gradingRule: {
              select: {
                grade: true,
                marks: true
              }
            }
          }
        },
        testAttempts: {
          include: {
            examination: {
              select: {
                title: true,
                totalMarks: true
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

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate profile' },
      { status: 500 }
    );
  }
}