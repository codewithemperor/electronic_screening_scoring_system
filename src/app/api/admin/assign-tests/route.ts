import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin, requireAuth } from '@/lib/auth';
import { assignTestsToAllCandidatesWithoutTests, assignDepartmentalTests } from '@/lib/test-assignment';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request, 'ADMIN');
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Get the authenticated admin
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { candidateId } = body;

    let result;

    if (candidateId) {
      // Assign tests to specific candidate
      result = await assignDepartmentalTests(candidateId);
    } else {
      // Assign tests to all candidates without tests
      result = await assignTestsToAllCandidatesWithoutTests();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error assigning tests:', error);
    return NextResponse.json(
      { error: 'Failed to assign tests' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request, 'ADMIN');
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Get the authenticated admin
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Get candidates without test attempts
    const candidatesWithoutTests = await db.candidate.findMany({
      where: {
        testAttempts: {
          none: {}
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    // Get statistics
    const totalCandidates = await db.candidate.count();
    const candidatesWithTests = totalCandidates - candidatesWithoutTests.length;

    return NextResponse.json({
      totalCandidates,
      candidatesWithTests,
      candidatesWithoutTests: candidatesWithoutTests.length,
      candidatesWithoutTestsList: candidatesWithoutTests
    });
  } catch (error) {
    console.error('Error fetching test assignment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test assignment status' },
      { status: 500 }
    );
  }
}