import express from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import ProfilePicture from '../models/profilePicture.model.js';
import { User } from '../models/user.model.js'; // Make sure to import the User model
import { authMiddleware } from '../middleware/authMiddleware.js';

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

// Route to handle profile picture upload
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.profilePic) {
      return res.status(400).json({ error: 'No profile picture provided.' });
    }

    const profilePic = req.files.profilePic;
    const userId = req.user._id; // Get userId from authenticated user

    // Validate file type (only allow image types)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(profilePic.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Please upload an image.' });
    }

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${profilePic.name}`;
    const key = `profiles/${userId}/${uniqueFileName}`;

    // Find the current profile picture for the user
    const existingProfile = await ProfilePicture.findOne({ userId });

    // If an old profile picture exists, delete it from S3
    if (existingProfile && existingProfile.profilePicUrl) {
      const oldKey = existingProfile.profilePicUrl.split('.com/')[1];
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: oldKey,
      }));
    }

    // Upload the new profile picture to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: profilePic.data,
      ContentType: profilePic.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const profilePicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Save or update the profile picture URL in the database
    if (existingProfile) {
      existingProfile.profilePicUrl = profilePicUrl;
      await existingProfile.save();
    } else {
      const newProfile = new ProfilePicture({ userId, profilePicUrl });
      await newProfile.save();
    }

    // Return the new profile picture URL
    res.json({ profilePicUrl });
  } catch (error) {
    console.error('Error during profile picture upload:', error);
    res.status(500).json({ error: 'Server error during profile picture upload.' });
  }
});

// Route to fetch the current profile picture
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let userId;
    if (req.user) {
      // For authenticated users (including admin)
      userId = req.user._id;
    } else if (req.query.token) {
      // For guest users with album token
      const user = await User.findOne({ albumToken: req.query.token });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      userId = user._id;
    } else {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const profilePicture = await ProfilePicture.findOne({ userId });

    if (!profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found.' });
    }

    res.json({ profilePicUrl: profilePicture.profilePicUrl });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;