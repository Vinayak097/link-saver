import mongoose from 'mongoose';

// Define the bookmark schema
const BookmarkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  favicon: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model if it doesn't exist
export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
