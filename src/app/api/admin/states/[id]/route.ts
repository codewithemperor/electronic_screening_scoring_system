import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Zod schema for state validation
const stateSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10)
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/states/[id] - Get single state
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const state = await db.state.findUnique({
      where: { id: params.id },
      include: {
        lgas: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            lgas: true,
            candidates: true
          }
        }
      }
    });

    if (!state) {
      return NextResponse.json(
        { error: 'State not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch state' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/states/[id] - Update state
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = stateSchema.parse(body);

    // Check if state exists
    const existingState = await db.state.findUnique({
      where: { id: params.id }
    });

    if (!existingState) {
      return NextResponse.json(
        { error: 'State not found' },
        { status: 404 }
      );
    }

    // Check if another state with same name or code already exists
    const duplicateState = await db.state.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { code: validatedData.code }
        ],
        NOT: {
          id: params.id
        }
      }
    });

    if (duplicateState) {
      return NextResponse.json(
        { error: 'State with this name or code already exists' },
        { status: 400 }
      );
    }

    const state = await db.state.update({
      where: { id: params.id },
      data: validatedData
    });

    return NextResponse.json({
      message: 'State updated successfully',
      state
    });
  } catch (error) {
    console.error('Error updating state:', error);
    
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
      { error: 'Failed to update state' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/states/[id] - Delete state
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if state exists
    const state = await db.state.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            lgas: true,
            candidates: true
          }
        }
      }
    });

    if (!state) {
      return NextResponse.json(
        { error: 'State not found' },
        { status: 404 }
      );
    }

    // Check if state has related LGAs or candidates
    if (state._count.lgas > 0 || state._count.candidates > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete state. It has related LGAs or candidates.',
          lgasCount: state._count.lgas,
          candidatesCount: state._count.candidates
        },
        { status: 400 }
      );
    }

    await db.state.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'State deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting state:', error);
    return NextResponse.json(
      { error: 'Failed to delete state' },
      { status: 500 }
    );
  }
}