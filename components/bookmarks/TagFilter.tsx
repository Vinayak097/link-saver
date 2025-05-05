'use client';

import { useState, useEffect } from 'react';

interface TagFilterProps {
  onTagSelect: (tag: string | null) => void;
}

export default function TagFilter({ onTagSelect }: TagFilterProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all unique tags from bookmarks
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bookmarks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        
        const data = await response.json();
        
        // Extract all unique tags from bookmarks
        const allTags = data.bookmarks.flatMap((bookmark: any) => bookmark.tags);
        const uniqueTags = [...new Set(allTags)];
        
        setTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // If clicking the already selected tag, clear the filter
      setSelectedTag(null);
      onTagSelect(null);
    } else {
      // Otherwise, set the new tag filter
      setSelectedTag(tag);
      onTagSelect(tag);
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
      <h3 className="text-sm font-medium mb-2">Filter by tag:</h3>
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
              onTagSelect(null);
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
