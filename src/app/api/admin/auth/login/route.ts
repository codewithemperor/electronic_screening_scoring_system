import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

// Zod schema for admin login
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = adminLoginSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
      include: {
        admin: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (user.role !== 'ADMIN' || !user.admin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if admin is active
    if (!user.admin.isActive) {
      return NextResponse.json(
        { error: 'Admin account is deactivated' },
        { status: 403 }
      );
    }

    // In a real app, you would create a JWT session here
    // For now, we'll just return success
    return NextResponse.json({
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        admin: {
          id: user.admin.id,
          role: user.admin.role
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}