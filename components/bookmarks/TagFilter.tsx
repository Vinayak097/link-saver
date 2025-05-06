'use client';

import { useState, useEffect } from 'react';
import { useBookmarkStore } from '@/lib/store/useBookmarkStore';

interface TagFilterProps {}

export default function TagFilter() {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get bookmarks and loading state from Zustand store
  const { bookmarks, isLoading, fetchBookmarks } = useBookmarkStore();

  // Fetch bookmarks and extract tags
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Extract unique tags from bookmarks
  useEffect(() => {
    if (bookmarks.length > 0) {
      // Extract all unique tags from bookmarks
      const allTags = bookmarks.flatMap(bookmark => bookmark.tags);
      const uniqueTags = [...new Set(allTags)];
      setTags(uniqueTags);
    }
  }, [bookmarks]);

  // Get setSelectedTag from Zustand store
  const { setSelectedTag: setStoreSelectedTag } = useBookmarkStore();

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // If clicking the already selected tag, clear the filter
      setSelectedTag(null);
      setStoreSelectedTag(null);
    } else {
      // Otherwise, set the new tag filter
      setSelectedTag(tag);
      setStoreSelectedTag(tag);
    }
  };

  if (isLoading) {
    return <div className="h-8">Loading tags...</div>;
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}

        {selectedTag && (
          <button
            onClick={() => {
              setSelectedTag(null);
              setStoreSelectedTag(null);
            }}
            className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 hover:bg-red-200"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
