import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Register the user
    const user = await registerUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to register user. Email may already be in use.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: 'User registered successfully',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
