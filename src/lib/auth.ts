import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'ADMIN';
}

/**
 * Get the authenticated user from the request
 * For demo purposes, we'll use a simple approach with a user ID header
 * In production, you should use proper JWT tokens or sessions
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // For demo purposes, we'll get the user ID from a header
    // In production, you should validate a JWT token or session cookie
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      // Fallback: try to get from authorization header (Bearer token simulation)
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // For demo, we'll use the token as user ID directly
        // In production, you should validate the JWT token
        return {
          id: token,
          email: '', // Will be fetched from DB
          role: 'CANDIDATE'
        };
      }
      return null;
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Get the authenticated candidate from the request
 * Returns the candidate record associated with the authenticated user
 */
export async function getAuthenticatedCandidate(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || authUser.role !== 'CANDIDATE') {
      return null;
    }

    const candidate = await db.candidate.findUnique({
      where: { userId: authUser.id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        },
        state: {
          select: {
            name: true
          }
        },
        lga: {
          select: {
            name: true
          }
        },
        oLevelResults: {
          include: {
            subject: {
              select: {
                name: true
              }
            },
            gradingRule: {
              select: {
                grade: true,
                marks: true
              }
            }
          }
        },
        testAttempts: {
          include: {
            examination: {
              select: {
                title: true,
                totalMarks: true
              }
            }
          }
        }
      }
    });

    return candidate;
  } catch (error) {
    console.error('Error getting authenticated candidate:', error);
    return null;
  }
}

/**
 * Get the authenticated admin from the request
 * Returns the admin record associated with the authenticated user
 */
export async function getAuthenticatedAdmin(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return null;
    }

    const admin = await db.admin.findUnique({
      where: { userId: authUser.id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return admin;
  } catch (error) {
    console.error('Error getting authenticated admin:', error);
    return null;
  }
}

/**
 * Middleware to require authentication for API routes
 * Returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest, requiredRole?: 'CANDIDATE' | 'ADMIN') {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return {
      success: false,
      error: 'Authentication required',
      status: 401
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      success: false,
      error: `Access denied. Required role: ${requiredRole}`,
      status: 403
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Helper function to create authentication error responses
 */
export function createAuthResponse(message: string, status: number = 401) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}