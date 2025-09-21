import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gradingRule = await db.gradingRule.findUnique({
      where: { id: params.id }
    });
    
    if (!gradingRule) {
      return NextResponse.json(
        { error: 'Grading rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(gradingRule);
  } catch (error) {
    console.error('Error fetching grading rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grading rule' },
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
    const { grade, marks } = body;
    
    if (!grade || marks === undefined) {
      return NextResponse.json(
        { error: 'Grade and marks are required' },
        { status: 400 }
      );
    }
    
    const gradingRule = await db.gradingRule.update({
      where: { id: params.id },
      data: {
        grade,
        marks
      }
    });
    
    return NextResponse.json(gradingRule);
  } catch (error) {
    console.error('Error updating grading rule:', error);
    return NextResponse.json(
      { error: 'Failed to update grading rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.gradingRule.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Grading rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting grading rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete grading rule' },
      { status: 500 }
    );
  }
}