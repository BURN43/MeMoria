import express from 'express';
import AlbumMedia from '../models/albumMedia.model.js';

const router = express.Router();

// Toggle like status
router.post('/like/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { userId, guestSession } = req.body;
  let identifier = userId || guestSession;

  if (!identifier) {
    return res.status(400).json({ message: 'No identifier provided.' });
  }

  try {
    const media = await AlbumMedia.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const alreadyLiked = media.likes.includes(identifier);

    if (alreadyLiked) {
      media.likes = media.likes.filter((id) => id !== identifier);
      media.likeCount = media.likes.length;
    } else {
      media.likes.push(identifier);
      media.likeCount = media.likes.length;
    }

    await media.save();
    res.json({ likeCount: media.likeCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error while toggling like.' });
  }
});

export default router;
