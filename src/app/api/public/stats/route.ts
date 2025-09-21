import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total departments count
    const totalDepartments = await db.department.count({
      where: { status: 'ACTIVE' }
    });

    // Get active candidates count
    const activeCandidates = await db.candidate.count();

    // Get total tests count
    const totalTests = await db.examination.count({
      where: { isActive: true }
    });

    // Calculate admission rate (admitted candidates / total candidates)
    const totalCandidates = await db.candidate.count();
    const admittedCandidates = await db.candidate.count({
      where: { admissionStatus: 'ADMITTED' }
    });
    
    const admissionRate = totalCandidates > 0 
      ? Math.round((admittedCandidates / totalCandidates) * 100) 
      : 0;

    const stats = {
      totalDepartments,
      activeCandidates,
      totalTests,
      admissionRate
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
}