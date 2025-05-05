'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BookmarkItemProps {
  bookmark: {
    _id: string;
    url: string;
    title: string;
    favicon: string;
    summary: string;
    tags: string[];
  };
  onDelete: (id: string) => void;
}

export default function BookmarkItem({ bookmark, onDelete }: BookmarkItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: bookmark._id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      setIsDeleting(true);
      await onDelete(bookmark._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4 transition-all"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {bookmark.favicon && (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-6 h-6 mr-3"
                onError={(e) => {
                  // If favicon fails to load, hide it
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <h3 className="text-lg font-semibold">{bookmark.title}</h3>
          </div>
          
          <div className="flex items-center">
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-move mr-2"
              {...listeners}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm mt-1 block truncate"
        >
          {bookmark.url}
        </a>
        
        {bookmark.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {isExpanded && bookmark.summary && (
        <div className="px-4 pb-4">
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-1">Summary:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{bookmark.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
