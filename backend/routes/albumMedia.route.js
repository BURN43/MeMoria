import express from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fileUpload from 'express-fileupload';
import { User } from '../models/user.model.js';
import AlbumMedia from '../models/albumMedia.model.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import sharp from 'sharp';

const router = express.Router();
router.use(fileUpload());

// Configure the S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to upload file to S3
async function uploadToS3(file, key) {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: file.mimetype,
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Helper function to process media uploads
async function processUploadRequest(req, res, userId, albumId, challengeTitle, uploaderUsername) {
  console.log('Received files:', req.files);
  if (!req.files || !req.files.mediaFile) {
    return res.status(400).json({ error: 'No media file uploaded.' });
  }
  const mediaFile = req.files.mediaFile;
  const uniqueFileName = `${uuidv4()}_${mediaFile.name}`;
  const fileKey = `${userId}/${albumId}/${uniqueFileName}`;
  try {
    // Upload original file
    const mediaUrl = await uploadToS3(mediaFile.data, fileKey);
    let thumbnailUrl = null;
    if (mediaFile.mimetype.startsWith('image')) {
      // Generate thumbnail for images
      const thumbnailBuffer = await sharp(mediaFile.data)
        .resize(200, 200, { fit: 'cover' })
        .toBuffer();
      const thumbnailKey = `${userId}/${albumId}/thumbnails/${uniqueFileName}`;
      thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailKey);
    } else if (mediaFile.mimetype.startsWith('video')) {
      thumbnailUrl = mediaUrl;
    }
    const newMedia = await AlbumMedia.create({
      mediaUrl,
      thumbnailUrl,
      mediaType: mediaFile.mimetype.startsWith('image') ? 'image' : 'video',
      albumId,
      userId,
      challengeTitle,
      uploaderUsername
    });
    res.status(201).json({ 
      mediaUrl, 
      thumbnailUrl, 
      albumId, 
      _id: newMedia._id,
      challengeTitle,
      uploaderUsername
    });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ error: 'Failed to process upload.' });
  }
}

// Upload media endpoint with token validation or admin access
router.post('/upload-media', authMiddleware, async (req, res) => {
  try {
    let userId = req.user?._id;
    let albumId = req.user?.albumId;

    if (req.user?.role === 'admin' && req.query.albumId) {
      // For admin users, use the albumId from the query parameter
      albumId = req.query.albumId;
    } else if (!albumId && req.query.token) {
      const user = await User.findOne({ albumToken: req.query.token });
      if (!user) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
      }
      albumId = user.albumId;
      userId = user._id;
    }

    if (!albumId) {
      return res.status(403).json({ error: 'Unable to retrieve albumId.' });
    }

    console.log('Final Album ID for upload:', albumId);

    // Extract challengeTitle and uploaderUsername from the request body
    const { challengeTitle, uploaderUsername } = req.body;

    // Pass these new fields to the processUploadRequest function
    await processUploadRequest(req, res, userId, albumId, challengeTitle, uploaderUsername);
  } catch (error) {
    console.error('Server error during media upload:', error);
    res.status(500).json({ error: 'Server error during media upload.' });
  }
});

// Retrieve media by albumId endpoint with token validation or admin access
router.get('/media/:albumId', authMiddleware, async (req, res) => {
  try {
    const { albumId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { albumId };

    if (req.user.role !== 'admin') {
      const { token } = req.query;
      const user = await User.findOne({ albumToken: token, albumId });
      if (!user) {
        return res.status(403).json({ error: 'Unauthorized access.' });
      }
    }

    const [media, total] = await Promise.all([
      AlbumMedia.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('mediaUrl thumbnailUrl mediaType albumId userId challengeTitle uploaderUsername createdAt')
        .lean(),
      AlbumMedia.countDocuments(query)
    ]);

    res.json({
      media,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Error fetching media' });
  }
});

// Delete media for admins only
router.delete('/media/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete media with id:', id);

    const media = await AlbumMedia.findById(id);
    if (!media) {
      console.log('Media not found for id:', id);
      return res.status(404).json({ error: 'Media not found.' });
    }

    console.log('Media found:', media);

    const key = `${media.userId}/${media.albumId}/${media.mediaUrl.split('/').pop()}`;
    console.log('Attempting to delete S3 object with key:', key);

    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }));
      console.log('S3 object deleted successfully');
    } catch (s3Error) {
      console.error('Error deleting S3 object:', s3Error);
      // You might want to decide how to handle S3 deletion errors
      // For now, we'll continue with the database deletion
    }

    await AlbumMedia.findByIdAndDelete(id);
    console.log('Media document removed from database');

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Error deleting media', details: error.message });
  }
});

export default router;