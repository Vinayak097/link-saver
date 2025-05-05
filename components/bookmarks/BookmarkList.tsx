'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import BookmarkItem from './BookmarkItem';

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  favicon: string;
  summary: string;
  tags: string[];
  order: number;
}

interface BookmarkListProps {
  filterTag?: string | null;
  onRefreshNeeded: () => void;
}

export default function BookmarkList({ filterTag, onRefreshNeeded }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bookmarks');

        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }

        const data = await response.json();
        setBookmarks(data.bookmarks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Filter bookmarks by tag if filterTag is provided
  const filteredBookmarks = filterTag
    ? bookmarks.filter(bookmark => bookmark.tags.includes(filterTag))
    : bookmarks;

  // Handle bookmark deletion
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bookmark');
      }

      // Remove the bookmark from the state
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== id));

      // Notify parent that a refresh might be needed
      onRefreshNeeded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Update the local state first for immediate feedback
      setBookmarks((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      // Then update the server
      try {
        const bookmarkIds = bookmarks.map(bookmark => bookmark._id);

        const response = await fetch('/api/bookmarks/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookmarkIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to update bookmark order');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // If there's an error, we could refetch the bookmarks to reset the order
        onRefreshNeeded();
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading bookmarks...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        Error: {error}
      </div>
    );
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center">
        {filterTag
          ? `No bookmarks found with the tag "${filterTag}"`
          : 'No bookmarks yet. Add your first bookmark above!'}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredBookmarks.map(b => b._id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {filteredBookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark._id}
              bookmark={bookmark}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
