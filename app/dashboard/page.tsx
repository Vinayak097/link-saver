'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AddBookmarkForm from '@/components/bookmarks/AddBookmarkForm';
import BookmarkList from '@/components/bookmarks/BookmarkList';
import TagFilter from '@/components/bookmarks/TagFilter';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleBookmarkAdded = () => {
    // Force a refresh of the bookmark list
    setRefreshKey(prev => prev + 1);
  };

  const handleRefreshNeeded = () => {
    // Force a refresh of the bookmark list
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Link Saver Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />

        {/* Tag Filter */}
        <TagFilter
          key={`tag-filter-${refreshKey}`}
          onTagSelect={setSelectedTag}
        />

        {/* Bookmark List */}
        <BookmarkList
          key={`bookmark-list-${refreshKey}`}
          filterTag={selectedTag}
          onRefreshNeeded={handleRefreshNeeded}
        />
      </div>
    </div>
  );
}
