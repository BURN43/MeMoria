import fs from 'fs';
import path from 'path';
import express from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import ProfilePicture from '../models/profilePicture.model.js'; // Assuming you have a model

const router = express.Router();
router.use(fileUpload());

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'profiles');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Base URL for constructing the full profile picture URL
const baseURL = process.env.BASE_URL || 'http://localhost:5000'; // Set BASE_URL in your .env file

// Route to handle profile picture upload
router.post('/profile', async (req, res) => {
  try {
    // Check if a profile picture and userId are provided
    if (!req.files || !req.files.profilePic || !req.body.userId) {
      return res.status(400).send('No profile picture or user ID provided.');
    }

    const profilePic = req.files.profilePic;
    const userId = req.body.userId;

    // Validate file type (only allow image types)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(profilePic.mimetype)) {
      return res.status(400).send('Invalid file type. Please upload an image.');
    }

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${profilePic.name}`;
    const uploadPath = path.join(UPLOAD_DIR, uniqueFileName);

    // Find the current profile picture for the user
    const existingProfile = await ProfilePicture.findOne({ userId });

    // If an old profile picture exists, delete the file from the server
    if (existingProfile && existingProfile.profilePicUrl) {
      const oldPicPath = path.join(UPLOAD_DIR, path.basename(existingProfile.profilePicUrl));
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath); // Delete the old file
      }
    }

    // Save the new profile picture on the server
    profilePic.mv(uploadPath, async (err) => {
      if (err) {
        console.error('Error saving profile picture:', err);
        return res.status(500).send('Failed to save the profile picture.');
      }

      const profilePicUrl = `${baseURL}/uploads/profiles/${uniqueFileName}`; // Full URL

      // Save the new profile picture URL in the database
      if (existingProfile) {
        // Update the existing profile picture entry
        existingProfile.profilePicUrl = profilePicUrl;
        await existingProfile.save();
      } else {
        // Create a new profile picture entry if none exists
        const newProfile = new ProfilePicture({ userId, profilePicUrl });
        await newProfile.save();
      }

      // Return the new profile picture URL
      res.json({ profilePicUrl });
    });
  } catch (error) {
    console.error('Error during profile picture upload:', error);
    res.status(500).send('Server error during profile picture upload.');
  }
});

// Route to fetch the current profile picture by userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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
