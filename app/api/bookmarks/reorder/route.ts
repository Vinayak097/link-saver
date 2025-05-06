import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Bookmark } from '@/lib/models/Bookmark';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// POST /api/bookmarks/reorder - Update the order of bookmarks
export async function POST(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = (await cookies()).get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const { bookmarkIds } = await request.json();
    
    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds)) {
      return NextResponse.json(
        { error: 'bookmarkIds array is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await dbConnect();
    
    // Update the order of each bookmark
    const updatePromises = bookmarkIds.map((id, index) => {
      return Bookmark.findOneAndUpdate(
        { _id: id, userId: user.id },
        { order: index, updatedAt: new Date() }
      );
    });
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      message: 'Bookmark order updated successfully'
    });
  } catch (error) {
    console.error('Error updating bookmark order:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating bookmark order' },
      { status: 500 }
    );
  }
}
