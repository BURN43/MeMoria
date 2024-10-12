import express from 'express';
import { updateSettings, getSettings, deleteSettings } from '../controllers/settings.controller.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Get settings
router.get('/', getSettings);

// Update settings
router.put('/', updateSettings);

// Delete settings
router.delete('/', requireRole('admin'), deleteSettings);

export default router;