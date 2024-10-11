// In your comments route file (e.g., comments.route.js)
import express from 'express';
import { getComments } from '../controllers/comments.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:albumId', authMiddleware, getComments);

export default router;