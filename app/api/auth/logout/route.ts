import { NextResponse } from 'next/server';

// Disable TypeScript checking for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST() {
  try {
    // Create a new response
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Set an expired cookie to clear it
    response.cookies.set('auth_token', '', {
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
