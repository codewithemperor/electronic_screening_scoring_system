import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Zod schema for state validation
const stateSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10)
});

// GET /api/admin/states - Get all states
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const [states, total] = await Promise.all([
      db.state.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              lgas: true,
              candidates: true
            }
          }
        }
      }),
      db.state.count({ where })
    ]);

    return NextResponse.json({
      states,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    );
  }
}

// POST /api/admin/states - Create new state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = stateSchema.parse(body);

    // Check if state with same name or code already exists
    const existingState = await db.state.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { code: validatedData.code }
        ]
      }
    });

    if (existingState) {
      return NextResponse.json(
        { error: 'State with this name or code already exists' },
        { status: 400 }
      );
    }

    const state = await db.state.create({
      data: validatedData
    });

    return NextResponse.json({
      message: 'State created successfully',
      state
    });
  } catch (error) {
    console.error('Error creating state:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create state' },
      { status: 500 }
    );
  }
}