import mongoose from 'mongoose';

const AlbumMediaSchema = new mongoose.Schema({
  mediaUrl: { type: String, required: true, unique: true }, // Use mediaUrl as unique identifier
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  albumId: { type: String, required: true },  // Keeping albumId for grouping media
  uploadedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  uploaderName: { type: String },
  guestGreetingText: { type: String },
});

const AlbumMedia = mongoose.model('AlbumMedia', AlbumMediaSchema);
export default AlbumMedia;
