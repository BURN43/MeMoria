import express from 'express';
import AlbumMedia from '../models/albumMedia.model.js';

const router = express.Router();

// Toggle like status
router.post('/like/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { userId, username } = req.body; // Use userId for registered users and username for guests
  const identifier = userId || username;

  if (!identifier) {
    return res.status(400).json({ message: 'Identifier (userId/username) must be provided.' });
  }

  try {
    const media = await AlbumMedia.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const likeIndex = media.likes.indexOf(identifier);

    if (likeIndex === -1) {
      // Add like for the user
      media.likes.push(identifier);
    } else {
      // Remove like for the user
      media.likes.splice(likeIndex, 1);
    }

    // Save the changes and return the updated like count
    const savedMedia = await media.save();
    res.status(200).json({ likeCount: savedMedia.likes.length });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Failed to toggle like. Please try again later.' });
  }
});

export default router;