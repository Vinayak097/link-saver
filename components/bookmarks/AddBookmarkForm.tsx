'use client';

import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBookmarkStore } from '@/lib/store/useBookmarkStore';

interface AddBookmarkFormProps {
  onBookmarkAdded: () => void;
}

export default function AddBookmarkForm({ onBookmarkAdded }: AddBookmarkFormProps) {
  const { user } = useAuthStore();
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get addBookmark function and loading state from Zustand store
  const { addBookmark } = useBookmarkStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate URL
      if (!url) {
        throw new Error('URL is required');
      }

      // Try to parse the URL to validate it
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      // Check if user is logged in
      if (!user) {
        throw new Error('Please log in to save bookmarks');
      }

      // Process tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Use the Zustand store to add the bookmark
      await addBookmark(url, tagArray);

      // Reset form
      setUrl('');
      setTags('');
      setSuccess('Bookmark added successfully!');

      // Notify parent component
      onBookmarkAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Add New Bookmark</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tech, news, tutorial"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Bookmark'}
        </button>

        {!user && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
            <strong>Note:</strong> You need to be logged in to save bookmarks.
            <a href="/login" className="text-blue-600 hover:underline ml-1">
              Log in here
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
