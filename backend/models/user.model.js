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
    default: 'admin',  // Default role is 'admin'
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  lastLogin: Date,
  albumId: {
    type: String, // Change this to ObjectId if using a separate Album model
    default: uuidv4,  // Automatically generate a UUID when a user is created
  },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
