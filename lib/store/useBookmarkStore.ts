import { create } from 'zustand';

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  favicon: string;
  summary: string;
  tags: string[];
  order: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  filteredBookmarks: Bookmark[];
  selectedTag: string | null;
  isLoading: boolean;
  error: string | null;
  fetchBookmarks: () => Promise<void>;
  addBookmark: (url: string, tags: string[]) => Promise<void>;
  deleteBookmark: (id: string) => Promise<boolean>;
  reorderBookmarks: (bookmarkIds: string[]) => Promise<void>;
  setSelectedTag: (tag: string | null) => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  filteredBookmarks: [],
  selectedTag: null,
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/bookmarks');

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      set({
        bookmarks: data.bookmarks,
        filteredBookmarks: get().selectedTag
          ? data.bookmarks.filter((bookmark: Bookmark) => bookmark.tags.includes(get().selectedTag!))
          : data.bookmarks
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  addBookmark: async (url: string, tags: string[]) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, tags }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add bookmark');
      }


      await get().fetchBookmarks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      });
      throw error;
    }
  },

  deleteBookmark: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete bookmark');
      }

      // Update local state without refetching
      const updatedBookmarks = get().bookmarks.filter(bookmark => bookmark._id !== id);
      set({
        bookmarks: updatedBookmarks,
        filteredBookmarks: get().selectedTag
          ? updatedBookmarks.filter(bookmark => bookmark.tags.includes(get().selectedTag!))
          : updatedBookmarks
      });

      return true; // Return success
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      });
      return false; // Return failure
    } finally {
      set({ isLoading: false });
    }
  },

  reorderBookmarks: async (bookmarkIds: string[]) => {
    // Don't set loading state to avoid UI flicker
    set({ error: null });

    try {
      // Get the current bookmarks
      const currentBookmarks = [...get().bookmarks];

      // Create a map of id to new order
      const orderMap = bookmarkIds.reduce((map, id, index) => {
        map[id] = index;
        return map;
      }, {} as Record<string, number>);

      // Create a new array with the updated order
      const reorderedBookmarks = currentBookmarks.map(bookmark => ({
        ...bookmark,
        order: orderMap[bookmark._id] !== undefined ? orderMap[bookmark._id] : bookmark.order
      }));

      // Sort the bookmarks by the new order
      reorderedBookmarks.sort((a, b) => a.order - b.order);

      // Update the local state immediately for a responsive UI
      set({
        bookmarks: reorderedBookmarks,
        filteredBookmarks: get().selectedTag
          ? reorderedBookmarks.filter(bookmark => bookmark.tags.includes(get().selectedTag!))
          : reorderedBookmarks
      });

      // Then update the server in the background
      fetch('/api/bookmarks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmarkIds }),
      }).catch(error => {
        console.error('Error updating bookmark order:', error);
      });

      // Return immediately after updating the local state
      return Promise.resolve();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return Promise.reject(error);
    }
  },

  setSelectedTag: (tag: string | null) => {
    set({
      selectedTag: tag,
      filteredBookmarks: tag
        ? get().bookmarks.filter(bookmark => bookmark.tags.includes(tag))
        : get().bookmarks
    });
  },
}));
