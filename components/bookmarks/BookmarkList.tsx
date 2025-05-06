'use client';

import { useEffect } from 'react';
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
import { useBookmarkStore } from '@/lib/store/useBookmarkStore';

export default function BookmarkList() {
  // Get bookmark state and actions from Zustand store
  const {
    filteredBookmarks,
    isLoading,
    error,
    fetchBookmarks,
    deleteBookmark,
    reorderBookmarks
  } = useBookmarkStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);


  const handleDelete = async (id: string) => {
    try {
      const success = await deleteBookmark(id);
      if (!success) {
        console.error('Failed to delete bookmark');
      }
      // No need to call onRefreshNeeded() since the store updates the state
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {

      const currentBookmarks = [...filteredBookmarks];


      const oldIndex = currentBookmarks.findIndex(item => item._id === active.id);
      const newIndex = currentBookmarks.findIndex(item => item._id === over.id);


      const reorderedBookmarks = arrayMove(currentBookmarks, oldIndex, newIndex);

      // Get the IDs in the new order
      const bookmarkIds = reorderedBookmarks.map(bookmark => bookmark._id);

      // Update the server in the background without awaiting
      // This prevents the UI from waiting for the server response
      reorderBookmarks(bookmarkIds).catch(err => {
        console.error('Error reordering bookmarks:', err);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>
        <div className="text-center py-8">Loading bookmarks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center">
          No bookmarks yet. Add your first bookmark!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredBookmarks.map(b => b._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
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
    </div>
  );
}
