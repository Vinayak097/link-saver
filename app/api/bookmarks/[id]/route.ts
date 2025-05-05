import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Bookmark } from '@/lib/models/Bookmark';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// DELETE /api/bookmarks/[id] - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('auth_token')?.value;
    
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
    
    // Connect to the database
    await dbConnect();
    
    // Find the bookmark
    const bookmark = await Bookmark.findById(params.id);
    
    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }
    
    // Check if the bookmark belongs to the user
    if (bookmark.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Delete the bookmark
    await Bookmark.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the bookmark' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookmarks/[id] - Update a bookmark
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('auth_token')?.value;
    
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
    const updates = await request.json();
    
    // Connect to the database
    await dbConnect();
    
    // Find the bookmark
    const bookmark = await Bookmark.findById(params.id);
    
    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }
    
    // Check if the bookmark belongs to the user
    if (bookmark.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Update the bookmark
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    return NextResponse.json({ 
      message: 'Bookmark updated successfully',
      bookmark: updatedBookmark
    });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the bookmark' },
      { status: 500 }
    );
  }
}
