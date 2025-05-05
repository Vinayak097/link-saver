import mongoose from 'mongoose';
import dbConnect from './db';

// Connect to the database before defining models
dbConnect();

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define User Model (only create the model if it doesn't exist)
export const User = mongoose.models.User || mongoose.model('User', UserSchema);


