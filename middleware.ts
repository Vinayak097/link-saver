import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// Paths that require authentication
const protectedPaths: string[] = [];

// Paths that should redirect to dashboard if already authenticated
const authPaths = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-protected paths
  if (!protectedPaths.some(path => pathname.startsWith(path)) &&
      !authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Check if the user is authenticated
  const isAuthenticated = token && verifyToken(token);

  // If the path requires authentication and the user is not authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If the user is already authenticated and trying to access auth pages


  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only apply middleware to login and register routes
    '/login',
    '/register',
  ],
};
