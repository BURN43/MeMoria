import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  albumTitle: { type: String, default: '' },
  eventDate: { type: Date },  // Stores the event date
  eventTime: { type: String, default: '' }, // Add this field to store event time
  greetingText: { type: String, default: '' },
  guestInfo: { type: String, default: '' },
  GuestUploadsImage: { type: Boolean, default: false },
  GuestUploadsVideo: { type: Boolean, default: false },
  Guestcomments: { type: Boolean, default: false },

  GuestDownloadOption: { type: Boolean, default: false },
  profilePic: { type: String, default: '' }, // New field for profile picture URL

}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
