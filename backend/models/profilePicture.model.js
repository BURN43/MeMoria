import mongoose from 'mongoose';

const ProfilePictureSchema = new mongoose.Schema({
  profilePicUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ProfilePicture = mongoose.model('ProfilePicture', ProfilePictureSchema);
export default ProfilePicture;
