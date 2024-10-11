import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'guest'],
    default: 'admin',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  lastLogin: Date,
  albumId: {
    type: String,
    default: uuidv4,
  },
  albumToken: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  profilePicUrl: { type: String },
}, { timestamps: true });

// Indexing for performance
userSchema.index({ albumToken: 1 });
userSchema.index({ albumId: 1 });
userSchema.index({ profilePicUrl: 1 });

export const User = mongoose.model('User', userSchema);
