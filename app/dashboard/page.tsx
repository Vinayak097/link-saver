'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBookmarkStore } from '@/lib/store/useBookmarkStore';
import AddBookmarkForm from '@/components/bookmarks/AddBookmarkForm';
import BookmarkList from '@/components/bookmarks/BookmarkList';

export default function DashboardPage() {
  const { user, loading, checkAuth } = useAuthStore();
  const { fetchBookmarks } = useBookmarkStore();

  // Check authentication status when the component mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch bookmarks when the component mounts
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Link Saver</h1>
          {!user && (
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <AddBookmarkForm onBookmarkAdded={() => {}} />
          </div>

          <div className="w-full md:w-2/3">
            <BookmarkList />
          </div>
        </div>
      </div>
    </div>
  );
}
