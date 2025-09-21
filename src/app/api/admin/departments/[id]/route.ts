import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await db.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            candidates: true,
            examinations: true,
            questions: true
          }
        },
        examinations: {
          select: {
            id: true,
            title: true,
            isActive: true
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
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
    
    const department = await db.department.update({
      where: { id: params.id },
      data: {
        name: body.name,
        code: body.code,
        description: body.description || null,
        examPercentage: body.examPercentage,
        olevelPercentage: body.olevelPercentage,
        finalCutoffMark: body.finalCutoffMark,
        utmeCutoffMark: body.utmeCutoffMark,
        olevelCutoffAggregate: body.olevelCutoffAggregate,
        status: body.status
      }
    });

    return NextResponse.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if department has candidates
    const candidateCount = await db.candidate.count({
      where: { departmentId: params.id }
    });

    if (candidateCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with associated candidates' },
        { status: 400 }
      );
    }

    await db.department.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}