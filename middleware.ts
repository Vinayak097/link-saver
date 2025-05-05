import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
];

// Paths that should redirect to dashboard if already authenticated
const authPaths = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Check if the user is authenticated
  const isAuthenticated = token && verifyToken(token);

  // If the path requires authentication and the user is not authenticated
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If the user is already authenticated and trying to access auth pages
  if (authPaths.some(path => pathname.startsWith(path)) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

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
};
