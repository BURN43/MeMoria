// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  const albumToken = req.query.token;

  // Check if either token is present
  if (!token && !albumToken) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    if (token) {
      // Authentication for logged-in users using JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;

      // Retrieve user data from MongoDB
      const user = await User.findById(req.userId).select('role albumId');
      if (!user) {
        console.log("JWT token valid but user not found in database");
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user; // Attach user info to request object
      console.log("User authenticated via JWT:", user);
    } else if (albumToken) {
      // Authentication for guests using albumToken
      const user = await User.findOne({ albumToken }).select('role albumId');
      if (!user) {
        console.log("Album token invalid or expired:", albumToken);
        return res.status(403).json({ message: 'Invalid or expired album token' });
      }

      // Set role to 'guest' to ensure this user has guest privileges
      req.user = { ...user.toObject(), role: 'guest' };
      console.log("Guest authenticated via album token:", req.user);
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check user role
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
