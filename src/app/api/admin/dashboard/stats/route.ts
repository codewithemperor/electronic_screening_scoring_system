import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total candidates
    const totalCandidates = await db.candidate.count();

    // Get total departments
    const totalDepartments = await db.department.count({
      where: { status: 'ACTIVE' }
    });

    // Get total questions
    const totalQuestions = await db.question.count();

    // Get total tests/examinations
    const totalTests = await db.examination.count({
      where: { isActive: true }
    });

    // Get admitted candidates
    const admittedCandidates = await db.candidate.count({
      where: { admissionStatus: 'ADMITTED' }
    });

    // Get pending candidates (IN_PROGRESS)
    const pendingCandidates = await db.candidate.count({
      where: { admissionStatus: 'IN_PROGRESS' }
    });

    // Get active tests (currently running test attempts)
    const activeTests = await db.testAttempt.count({
      where: { status: 'IN_PROGRESS' }
    });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await db.candidate.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const stats = {
      totalCandidates,
      totalDepartments,
      totalQuestions,
      totalTests,
      admittedCandidates,
      pendingCandidates,
      activeTests,
      recentRegistrations
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}