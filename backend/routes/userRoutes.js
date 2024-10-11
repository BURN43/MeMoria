import express from 'express';
import { User } from '../models/user.model.js';

const router = express.Router();

// Endpoint to get albumId from albumToken
router.get('/album-id', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'No token provided.' });
  }
  try {
    const user = await User.findOne({ albumToken: token });
    if (!user) {
      return res.status(404).json({ error: 'Album ID not found.' });
    }
    return res.json({ albumId: user.albumId });
  } catch (error) {
    console.error('Error fetching album ID:', error.stack || error);
    res.status(500).send('Error fetching album ID');
  }
});

export default router;
