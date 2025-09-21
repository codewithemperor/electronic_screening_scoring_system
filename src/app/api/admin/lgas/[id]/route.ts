import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateLgaSchema = z.object({
  name: z.string().min(1, 'LGA name is required'),
  code: z.string().min(1, 'LGA code is required'),
  stateId: z.string().min(1, 'State ID is required')
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/lgas/[id] - Get single LGA
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const lga = await db.lga.findUnique({
      where: { id: params.id },
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

    if (!lga) {
      return NextResponse.json(
        { error: 'LGA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lga);
  } catch (error) {
    console.error('Error fetching LGA:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LGA' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lgas/[id] - Update LGA
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateLgaSchema.parse(body);

    // Check if LGA exists
    const existingLga = await db.lga.findUnique({
      where: { id: params.id }
    });

    if (!existingLga) {
      return NextResponse.json(
        { error: 'LGA not found' },
        { status: 404 }
      );
    }

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

    // Check if another LGA with same name or code already exists in the state
    const duplicateLga = await db.lga.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          { stateId: validatedData.stateId },
          {
            OR: [
              { name: validatedData.name },
              { code: validatedData.code }
            ]
          }
        ]
      }
    });

    if (duplicateLga) {
      return NextResponse.json(
        { error: 'LGA with this name or code already exists in the state' },
        { status: 400 }
      );
    }

    const lga = await db.lga.update({
      where: { id: params.id },
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

    console.error('Error updating LGA:', error);
    return NextResponse.json(
      { error: 'Failed to update LGA' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lgas/[id] - Delete LGA
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if LGA exists
    const lga = await db.lga.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    if (!lga) {
      return NextResponse.json(
        { error: 'LGA not found' },
        { status: 404 }
      );
    }

    // Check if LGA has candidates
    if (lga._count.candidates > 0) {
      return NextResponse.json(
        { error: 'Cannot delete LGA with associated candidates' },
        { status: 400 }
      );
    }

    await db.lga.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'LGA deleted successfully' });
  } catch (error) {
    console.error('Error deleting LGA:', error);
    return NextResponse.json(
      { error: 'Failed to delete LGA' },
      { status: 500 }
    );
  }
}