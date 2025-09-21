import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const gradingRules = await db.gradingRule.findMany({
      orderBy: { marks: 'desc' }
    });
    
    return NextResponse.json(gradingRules);
  } catch (error) {
    console.error('Error fetching grading rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grading rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grade, marks } = body;
    
    if (!grade || marks === undefined) {
      return NextResponse.json(
        { error: 'Grade and marks are required' },
        { status: 400 }
      );
    }
    
    // Check if grade already exists
    const existingRule = await db.gradingRule.findUnique({
      where: { grade }
    });
    
    if (existingRule) {
      return NextResponse.json(
        { error: 'Grade already exists' },
        { status: 400 }
      );
    }
    
    const gradingRule = await db.gradingRule.create({
      data: {
        grade,
        marks
      }
    });
    
    return NextResponse.json(gradingRule, { status: 201 });
  } catch (error) {
    console.error('Error creating grading rule:', error);
    return NextResponse.json(
      { error: 'Failed to create grading rule' },
      { status: 500 }
    );
  }
}