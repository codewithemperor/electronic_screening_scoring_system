import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = [
    '/candidate/dashboard',
    '/candidate/profile',
    '/candidate/exam',
    '/candidate/recommendations',
    '/admin/dashboard',
    '/admin/departments',
    '/admin/questions',
    '/admin/candidates',
    '/admin/examinations'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // For demo purposes, we'll skip actual authentication check
    // In a real application, you would check for a valid session/token here
    
    // Example of how you might check for authentication:
    // const token = request.cookies.get('auth-token')?.value;
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }

    // For now, we'll just allow access to all routes
    // In production, you should implement proper authentication
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}