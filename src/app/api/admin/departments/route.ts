import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    // Get departments with candidate count
    const departments = await db.department.findMany({
      where,
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });

    // Get total count for pagination
    const total = await db.department.count({ where });

    // Transform data
    const transformedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      status: dept.status,
      candidateCount: dept._count.candidates,
      description: dept.description,
      utmeCutoffMark: dept.utmeCutoffMark,
      olevelCutoffAggregate: dept.olevelCutoffAggregate,
      finalCutoffMark: dept.finalCutoffMark,
      examPercentage: dept.examPercentage,
      olevelPercentage: dept.olevelPercentage
    }));

    return NextResponse.json({
      departments: transformedDepartments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const department = await db.department.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description || null,
        examPercentage: body.examPercentage || 70,
        olevelPercentage: body.olevelPercentage || 30,
        finalCutoffMark: body.finalCutoffMark,
        utmeCutoffMark: body.utmeCutoffMark,
        olevelCutoffAggregate: body.olevelCutoffAggregate,
        status: body.status || 'ACTIVE'
      }
    });

    return NextResponse.json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}