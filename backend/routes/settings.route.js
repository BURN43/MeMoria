// backend/routes/settings.route.js
import express from 'express';
import { updateSettings, getSettings, deleteSettings } from '../controllers/settings.controller.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';  // Import both middleware

const router = express.Router();

// Only admins can get and update settings, with authMiddleware first
router.get('/:userId', authMiddleware, requireRole('admin'), getSettings); 
router.post('/:userId', authMiddleware, requireRole('admin'), updateSettings);

// Route to delete settings (ensure only admins can delete)
router.delete('/:userId', authMiddleware, requireRole('admin'), deleteSettings);

export default router;
