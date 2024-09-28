import express from 'express';
import fileUpload from 'express-fileupload';
import AlbumMedia from '../models/albumMedia.model.js'; // Import the model
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator
import path from 'path';
import fs from 'fs'; // For filesystem operations
import { fileURLToPath } from 'url'; // For __dirname equivalent

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(fileUpload());

// Define the upload directory path in the root of the project
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/media');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Base URL for constructing the full media URL
const baseURL = process.env.BASE_URL || 'http://localhost:5000'; // Set BASE_URL in your .env file

// Upload media (image/video)
router.post('/upload-media', async (req, res) => {
  try {
    if (!req.files || !req.files.mediaFile) {
      return res.status(400).send('No media file uploaded.');
    }

    const mediaFile = req.files.mediaFile;
    const { albumId, userId } = req.body;

    console.log('AlbumId:', albumId, 'UserId:', userId, 'File Name:', mediaFile.name);

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}_${mediaFile.name}`;
    const uploadPath = path.join(UPLOAD_DIR, uniqueFileName);

    // Save the file to the server
    mediaFile.mv(uploadPath, async (err) => {
      if (err) {
        console.error('Error saving media file:', err); // Log the error
        return res.status(500).send('Failed to save the media file.');
      }

      // Save media metadata in MongoDB
      const mediaUrl = `${baseURL}/uploads/media/${uniqueFileName}`;
      const mediaType = mediaFile.mimetype.startsWith('image') ? 'image' : 'video';

      const newMedia = new AlbumMedia({ mediaUrl, mediaType, albumId, userId });
      await newMedia.save();

      res.send({ mediaUrl, albumId });
    });
  } catch (error) {
    console.error('Server error during media upload:', error); // Log the error
    res.status(500).send('Server error during media upload.');
  }
});

// Fetch media by albumId and userId
router.get('/:albumId/:userId', async (req, res) => {
  try {
    const { albumId, userId } = req.params;
    const media = await AlbumMedia.find({ albumId, userId });
    res.json({ media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).send('Error fetching media');
  }
});

export default router;
