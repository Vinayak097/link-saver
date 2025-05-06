import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Bookmark } from '@/lib/models/Bookmark';
import { verifyToken } from '@/lib/jwt';
import { extractUrlMetadata } from '@/lib/utils/urlMetadata';
import { generateSummary } from '@/lib/utils/summarize';
import { cookies } from 'next/headers';

// GET /api/bookmarks - Get all bookmarks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = (await cookies()).get('auth_token')?.value;

    // Connect to the database
    await dbConnect();

    if (!token) {
      // Return empty bookmarks array if not authenticated
      return NextResponse.json({ bookmarks: [] });
    }

    // Verify the token
    const user = verifyToken(token);

    if (!user) {
      // Return empty bookmarks array if token is invalid
      return NextResponse.json({ bookmarks: [] });
    }

    // Get all bookmarks for the user, sorted by order
    const bookmarks = await Bookmark.find({ userId: user.id }).sort({ order: 1 });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching bookmarks' },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = (await cookies()).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Please log in to save bookmarks' },
        { status: 401 }
      );
    }

    // Verify the token
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again.' },
        { status: 401 }
      );
    }

    
    const { url, tags = [] } = await request.json();

    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if the bookmark already exists for this user
    const existingBookmark = await Bookmark.findOne({ userId: user.id, url });

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Bookmark already exists' },
        { status: 400 }
      );
    }

    // Get the highest order value for the user's bookmarks
    const highestOrderBookmark = await Bookmark.findOne({ userId: user.id }).sort({ order: -1 });
    const newOrder = highestOrderBookmark ? highestOrderBookmark.order + 1 : 0;

    // Extract metadata from the URL
    const { title, favicon } = await extractUrlMetadata(url);

    // Generate a summary for the URL
    const summary = await generateSummary(url);

    // Create the new bookmark
    const newBookmark = new Bookmark({
      userId: user.id,
      url,
      title,
      favicon,
      summary,
      tags,
      order: newOrder,
    });

    // Save the bookmark
    await newBookmark.save();

    return NextResponse.json({
      message: 'Bookmark created successfully',
      bookmark: newBookmark
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the bookmark' },
      { status: 500 }
    );
  }
}
