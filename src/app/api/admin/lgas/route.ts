import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createLgaSchema = z.object({
  name: z.string().min(1, 'LGA name is required'),
  code: z.string().min(1, 'LGA code is required'),
  stateId: z.string().min(1, 'State ID is required')
});

const updateLgaSchema = z.object({
  name: z.string().min(1, 'LGA name is required'),
  code: z.string().min(1, 'LGA code is required'),
  stateId: z.string().min(1, 'State ID is required')
});

// GET /api/admin/lgas - List all LGAs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');

    const whereClause = stateId ? { stateId } : {};

    const lgas = await db.lga.findMany({
      where: whereClause,
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            candidates: true
          }
        }
      },
      orderBy: [
        { state: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ lgas });
  } catch (error) {
    console.error('Error fetching LGAs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LGAs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/lgas - Create new LGA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLgaSchema.parse(body);

    // Check if state exists
    const state = await db.state.findUnique({
      where: { id: validatedData.stateId }
    });

    if (!state) {
      return NextResponse.json(
        { error: 'State not found' },
        { status: 404 }
      );
    }

    // Check if LGA with same name or code already exists in the state
    const existingLga = await db.lga.findFirst({
      where: {
        OR: [
          { name: validatedData.name, stateId: validatedData.stateId },
          { code: validatedData.code, stateId: validatedData.stateId }
        ]
      }
    });

    if (existingLga) {
      return NextResponse.json(
        { error: 'LGA with this name or code already exists in the state' },
        { status: 400 }
      );
    }

    const lga = await db.lga.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        stateId: validatedData.stateId
      },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    return NextResponse.json(lga);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating LGA:', error);
    return NextResponse.json(
      { error: 'Failed to create LGA' },
      { status: 500 }
    );
  }
}