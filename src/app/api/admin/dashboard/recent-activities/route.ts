import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RecentActivity {
  id: string;
  type: 'REGISTRATION' | 'TEST_SUBMISSION' | 'ADMISSION_UPDATE';
  candidateName: string;
  description: string;
  timestamp: string;
}

export async function GET() {
  try {
    // Get recent candidate registrations
    const recentCandidates = await db.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        createdAt: true,
        admissionStatus: true
      }
    });

    // Get recent test submissions
    const recentTestAttempts = await db.testAttempt.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { endTime: 'desc' },
      take: 3,
      select: {
        id: true,
        candidate: {
          select: {
            fullName: true
          }
        },
        endTime: true,
        score: true
      }
    });

    // Get recent admission status updates
    const recentAdmissionUpdates = await db.candidate.findMany({
      where: {
        admissionStatus: {
          in: ['ADMITTED', 'REJECTED']
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 2,
      select: {
        id: true,
        fullName: true,
        admissionStatus: true,
        updatedAt: true
      }
    });

    // Combine and format activities
    const activities: RecentActivity[] = [];

    // Add registration activities
    recentCandidates.forEach(candidate => {
      activities.push({
        id: `reg-${candidate.id}`,
        type: 'REGISTRATION',
        candidateName: candidate.fullName,
        description: `Registered for admission`,
        timestamp: candidate.createdAt.toISOString()
      });
    });

    // Add test submission activities
    recentTestAttempts.forEach(attempt => {
      activities.push({
        id: `test-${attempt.id}`,
        type: 'TEST_SUBMISSION',
        candidateName: attempt.candidate.fullName,
        description: `Submitted test with score ${attempt.score || 0}`,
        timestamp: attempt.endTime?.toISOString() || new Date().toISOString()
      });
    });

    // Add admission update activities
    recentAdmissionUpdates.forEach(candidate => {
      activities.push({
        id: `adm-${candidate.id}`,
        type: 'ADMISSION_UPDATE',
        candidateName: candidate.fullName,
        description: `Admission status updated to ${candidate.admissionStatus.replace('_', ' ')}`,
        timestamp: candidate.updatedAt.toISOString()
      });
    });

    // Sort by timestamp and take latest 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}